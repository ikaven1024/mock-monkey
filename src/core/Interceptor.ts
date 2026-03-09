import type { MockRule } from '../types';
import { RequestRecorder } from './RequestRecorder';

/**
 * 请求拦截器 - 拦截 XHR 和 Fetch 请求
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
   * 将相对 URL 转换为完整的 URL
   */
  private normalizeUrl(url: string): string {
    try {
      // 如果已经是完整的 URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // 将相对路径转换为完整 URL
      return new URL(url, window.location.href).href;
    } catch {
      // 如果转换失败，返回原始 URL
      return url;
    }
  }

  /**
   * 启动拦截
   */
  start(): void {
    this.interceptXHR();
    this.interceptFetch();
    console.log('[MockMonkey] 拦截器已启动');
  }

  /**
   * 停止拦截
   */
  stop(): void {
    XMLHttpRequest.prototype.open = this.xhrOpen;
    XMLHttpRequest.prototype.send = this.xhrSend;
    window.fetch = this.originalFetch;
    console.log('[MockMonkey] 拦截器已停止');
  }

  /**
   * 拦截 XMLHttpRequest
   */
  private interceptXHR(): void {
    const self = this;

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: unknown[]) {
      (this as unknown as Record<string, unknown>)._mockMethod = method;
      (this as unknown as Record<string, unknown>)._mockUrl = url.toString();
      (this as unknown as Record<string, unknown>)._mockRequestId = RequestRecorder.generateId();
      (this as unknown as Record<string, unknown>)._mockRequestTime = Date.now();
      return self.xhrOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as unknown as Record<string, unknown>;
      const rawUrl = xhr._mockUrl as string;
      const method = xhr._mockMethod as string;
      const requestId = xhr._mockRequestId as string;
      const requestTime = xhr._mockRequestTime as number;

      // 标准化 URL
      const url = self.normalizeUrl(rawUrl);

      // 记录请求
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
        // 更新记录为被 mock
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

      // 未被 mock 的请求，监听完成事件
      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function (this: XMLHttpRequest, ...args) {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const duration = Date.now() - requestTime;
          self.recorder.updateRequest(requestId, {
            status: xhr.status,
            duration
          });
        }
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.call(this, ...args);
        }
      };

      const originalOnLoad = xhr.onload;
      xhr.onload = function (this: XMLHttpRequest, ...args) {
        const duration = Date.now() - requestTime;
        let response: unknown;
        try {
          response = JSON.parse(xhr.responseText);
        } catch {
          response = xhr.responseText;
        }
        self.recorder.updateRequest(requestId, {
          status: xhr.status,
          response,
          duration
        });
        if (originalOnLoad) {
          return originalOnLoad.call(this, ...args);
        }
      };

      return self.xhrSend.call(this, body);
    };
  }

  /**
   * 拦截 Fetch
   */
  private interceptFetch(): void {
    const self = this;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const url = self.normalizeUrl(rawUrl);
      const requestId = RequestRecorder.generateId();
      const requestTime = Date.now();
      const method = init?.method || 'GET';

      // 记录请求
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
        // 更新记录为被 mock
        self.recorder.updateRequest(requestId, {
          mocked: true,
          ruleId: rule.id,
          status: rule.options.status || 200,
          response: rule.response,
          duration: (rule.options.delay || 0)
        });
        return self.mockFetch(rule, requestId);
      }

      // 未被 mock 的请求，记录响应
      return self.originalFetch(input, init).then((response) => {
        const duration = Date.now() - requestTime;

        // 克隆响应以避免消耗原始响应
        const clonedResponse = response.clone();
        clonedResponse.json().catch(() => clonedResponse.text()).then((data: unknown) => {
          self.recorder.updateRequest(requestId, {
            status: response.status,
            response: data,
            duration
          });
        }).catch(() => {
          // 如果无法解析响应体，至少记录状态码
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
   * 模拟 XHR 响应
   */
  private mockXHR(xhr: XMLHttpRequest, rule: MockRule, requestId: string): void {
    const delay = rule.options.delay || 0;
    const requestTime = Date.now();

    setTimeout(() => {
      const duration = Date.now() - requestTime;
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

      const responseText = JSON.stringify(rule.response);
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

      // 更新实际耗时
      self.recorder.updateRequest(requestId, { duration });

      const isSuccess = (rule.options.status || 200) >= 200 && (rule.options.status || 200) < 300;
      const eventType = isSuccess ? 'load' : 'error';

      xhr.dispatchEvent(new Event(eventType));
      xhr.dispatchEvent(new Event('loadend'));

      if (xhr.onreadystatechange) {
        xhr.onreadystatechange();
      }
    }, delay);
  }

  /**
   * 模拟 Fetch 响应
   */
  private mockFetch(rule: MockRule, requestId: string): Promise<Response> {
    return new Promise((resolve) => {
      const delay = rule.options.delay || 0;
      const requestTime = Date.now();

      setTimeout(() => {
        const duration = Date.now() - requestTime;
        const headers = rule.options.headers || { 'Content-Type': 'application/json' };

        // 更新实际耗时
        this.recorder.updateRequest(requestId, { duration });

        resolve(
          new Response(JSON.stringify(rule.response), {
            status: rule.options.status || 200,
            headers
          })
        );
      }, delay);
    });
  }
}
