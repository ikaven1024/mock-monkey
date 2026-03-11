import type { MockRule } from '../types';
import { MockManager } from './MockManager';
import { RequestRecorder } from './RequestRecorder';

/**
 * Request interceptor - Intercepts XHR and Fetch requests
 */
export class Interceptor {
  private xhrOpen: typeof XMLHttpRequest.prototype.open;
  private xhrSend: typeof XMLHttpRequest.prototype.send;
  private originalFetch: typeof window.fetch;

  constructor(
    private manager: MockManager,
    private recorder: RequestRecorder
  ) {
    this.xhrOpen = XMLHttpRequest.prototype.open;
    this.xhrSend = XMLHttpRequest.prototype.send;
    this.originalFetch = window.fetch.bind(window);
  }

  /**
   * Convert relative URL to full URL
   */
  private normalizeUrl(url: string): string {
    try {
      // If already a full URL, return directly
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Convert relative path to full URL
      return new URL(url, window.location.href).href;
    } catch {
      // If conversion fails, return original URL
      return url;
    }
  }

  /**
   * Start interception
   */
  start(): void {
    this.interceptXHR();
    this.interceptFetch();
    console.log('[MockMonkey] 拦截器已启动');
  }

  /**
   * Stop interception
   */
  stop(): void {
    XMLHttpRequest.prototype.open = this.xhrOpen;
    XMLHttpRequest.prototype.send = this.xhrSend;
    window.fetch = this.originalFetch;
    console.log('[MockMonkey] 拦截器已停止');
  }

  /**
   * Intercept XMLHttpRequest
   */
  private interceptXHR(): void {
    const self = this;

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      (this as unknown as Record<string, unknown>)._mockMethod = method;
      (this as unknown as Record<string, unknown>)._mockUrl = url.toString();
      (this as unknown as Record<string, unknown>)._mockRequestId = RequestRecorder.generateId();
      (this as unknown as Record<string, unknown>)._mockRequestTime = Date.now();
      return self.xhrOpen.call(this, method, url, async ?? true, username, password);
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as unknown as Record<string, unknown>;
      const rawUrl = xhr._mockUrl as string;
      const method = xhr._mockMethod as string;
      const requestId = xhr._mockRequestId as string;
      const requestTime = xhr._mockRequestTime as number;

      // Normalize URL
      const url = self.normalizeUrl(rawUrl);

      // Record request
      self.recorder.addRequest({
        id: requestId,
        method,
        url,
        body: body?.toString(),
        type: 'XHR',
        mocked: false,
        timestamp: requestTime
      });

      const rule = self.manager.findMatch(url);
      if (rule) {
        console.log(`[MockMonkey] XHR 拦截: ${method} ${url}`);
        // Update record as mocked
        self.recorder.updateRequest(requestId, {
          mocked: true,
          ruleId: rule.id,
          status: rule.options.status || 200,
          response: rule.response,
          duration: (rule.options.delay || 0)
        });
        self.mockXHR(this, rule, requestId);
        return;
      }

      // For non-mocked requests, listen for completion events
      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function (this: XMLHttpRequest, ev?: Event) {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const duration = Date.now() - requestTime;
          self.recorder.updateRequest(requestId, {
            status: xhr.status as number,
            duration
          });
        }
        if (originalOnReadyStateChange) {
          return (originalOnReadyStateChange as (this: XMLHttpRequest, ev?: Event) => unknown).call(this, ev);
        }
      };

      const originalOnLoad = xhr.onload;
      xhr.onload = function (this: XMLHttpRequest, ev?: Event) {
        const duration = Date.now() - requestTime;
        let response: unknown;
        try {
          response = JSON.parse(xhr.responseText as string);
        } catch {
          response = xhr.responseText;
        }
        self.recorder.updateRequest(requestId, {
          status: xhr.status as number,
          response,
          duration
        });
        if (originalOnLoad) {
          return (originalOnLoad as (this: XMLHttpRequest, ev?: Event) => unknown).call(this, ev);
        }
      };

      return self.xhrSend.call(this, body);
    };
  }

  /**
   * Intercept Fetch
   */
  private interceptFetch(): void {
    const self = this;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const url = self.normalizeUrl(rawUrl);
      const requestId = RequestRecorder.generateId();
      const requestTime = Date.now();
      const method = init?.method || 'GET';

      // Record request
      self.recorder.addRequest({
        id: requestId,
        method,
        url,
        body: init?.body?.toString(),
        type: 'Fetch',
        mocked: false,
        timestamp: requestTime
      });

      const rule = self.manager.findMatch(url);

      if (rule) {
        console.log(`[MockMonkey] Fetch 拦截: ${method} ${url}`);
        // Update record as mocked
        self.recorder.updateRequest(requestId, {
          mocked: true,
          ruleId: rule.id,
          status: rule.options.status || 200,
          response: rule.response,
          duration: (rule.options.delay || 0)
        });
        return self.mockFetch(rule, requestId);
      }

      // For non-mocked requests, record response
      return self.originalFetch(input, init).then((response) => {
        const duration = Date.now() - requestTime;

        // Clone response to avoid consuming original response
        const clonedResponse = response.clone();
        clonedResponse.json().catch(() => clonedResponse.text()).then((data: unknown) => {
          self.recorder.updateRequest(requestId, {
            status: response.status,
            response: data,
            duration
          });
        }).catch(() => {
          // If response body cannot be parsed, at least record status code
          self.recorder.updateRequest(requestId, {
            status: response.status,
            duration
          });
        });

        return response;
      });
    };
  }

  /**
   * Mock XHR response
   */
  private mockXHR(xhr: XMLHttpRequest, rule: MockRule, requestId: string): void {
    const delay = rule.options.delay || 0;
    const requestTime = Date.now();

    setTimeout(() => {
      const duration = Date.now() - requestTime;

      // Use Mock.js to parse template
      let mockResponse = rule.response;
      if (typeof window !== 'undefined' && (window as any).Mock) {
        try {
          const originalResponse = JSON.stringify(rule.response);
          mockResponse = (window as any).Mock.mock(rule.response);
          const mockResponseStr = JSON.stringify(mockResponse);
          if (originalResponse !== mockResponseStr) {
            console.log('[MockMonkey] Mock.js 已解析模板');
          }
        } catch (e) {
          console.warn('[MockMonkey] Mock.js 解析失败，使用原始响应:', e);
          mockResponse = rule.response;
        }
      } else {
        console.warn('[MockMonkey] Mock.js 未加载，占位符将不会被替换');
      }

      Object.defineProperty(xhr, 'readyState', {
        value: 4,
        writable: false,
        configurable: true
      });
      Object.defineProperty(xhr, 'status', {
        value: rule.options.status || 200,
        writable: false,
        configurable: true
      });

      const responseText = JSON.stringify(mockResponse);
      Object.defineProperty(xhr, 'responseText', {
        value: responseText,
        writable: false,
        configurable: true
      });
      Object.defineProperty(xhr, 'response', {
        value: responseText,
        writable: false,
        configurable: true
      });

      // Update actual duration
      this.recorder.updateRequest(requestId, { duration, response: mockResponse });

      const isSuccess = (rule.options.status || 200) >= 200 && (rule.options.status || 200) < 300;
      const eventType = isSuccess ? 'load' : 'error';

      xhr.dispatchEvent(new Event(eventType));
      xhr.dispatchEvent(new Event('loadend'));

      if (xhr.onreadystatechange) {
        xhr.onreadystatechange(new Event('readystatechange'));
      }
    }, delay);
  }

  /**
   * Mock Fetch response
   */
  private mockFetch(rule: MockRule, requestId: string): Promise<Response> {
    return new Promise((resolve) => {
      const delay = rule.options.delay || 0;
      const requestTime = Date.now();

      setTimeout(() => {
        const duration = Date.now() - requestTime;
        const headers = rule.options.headers || { 'Content-Type': 'application/json' };

        // Use Mock.js to parse template
        let mockResponse = rule.response;
        if (typeof window !== 'undefined' && (window as any).Mock) {
          try {
            const originalResponse = JSON.stringify(rule.response);
            mockResponse = (window as any).Mock.mock(rule.response);
            const mockResponseStr = JSON.stringify(mockResponse);
            if (originalResponse !== mockResponseStr) {
              console.log('[MockMonkey] Mock.js 已解析模板');
            }
          } catch (e) {
            console.warn('[MockMonkey] Mock.js 解析失败，使用原始响应:', e);
            mockResponse = rule.response;
          }
        } else {
          console.warn('[MockMonkey] Mock.js 未加载，占位符将不会被替换');
        }

        // Update actual duration
        this.recorder.updateRequest(requestId, { duration, response: mockResponse });

        resolve(
          new Response(JSON.stringify(mockResponse), {
            status: rule.options.status || 200,
            headers
          })
        );
      }, delay);
    });
  }
}
