import type { MockRule, MethodContext } from '../types';
import { MockManager } from './MockManager';
import { RequestRecorder } from './RequestRecorder';
import { MethodManager } from './MethodManager';

/**
 * Request interceptor - Intercepts XHR and Fetch requests
 */
export class Interceptor {
  private xhrOpen: typeof XMLHttpRequest.prototype.open;
  private xhrSend: typeof XMLHttpRequest.prototype.send;
  private originalFetch: typeof window.fetch;

  constructor(
    private manager: MockManager,
    private recorder: RequestRecorder,
    private methodManager: MethodManager
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

      const matchResult = self.manager.findMatchWithParams(url);
      if (matchResult) {
        console.log(`[MockMonkey] XHR 拦截: ${method} ${url}`);
        const { rule, params } = matchResult;
        // Update record as mocked
        self.recorder.updateRequest(requestId, {
          mocked: true,
          ruleId: rule.id,
          status: rule.options.status || 200,
          response: rule.response,
          duration: (rule.options.delay || 0)
        });
        self.mockXHR(this, rule, requestId, params);
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

      const matchResult = self.manager.findMatchWithParams(url);

      if (matchResult) {
        console.log(`[MockMonkey] Fetch 拦截: ${method} ${url}`);
        const { rule, params } = matchResult;
        // Update record as mocked
        self.recorder.updateRequest(requestId, {
          mocked: true,
          ruleId: rule.id,
          status: rule.options.status || 200,
          response: rule.response,
          duration: (rule.options.delay || 0)
        });
        return self.mockFetch(rule, requestId, params);
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
  private mockXHR(xhr: XMLHttpRequest, rule: MockRule, requestId: string, params: Record<string, string> = {}): void {
    const delay = rule.options.delay || 0;
    const requestTime = Date.now();

    setTimeout(() => {
      const duration = Date.now() - requestTime;

      // Get request context for custom methods
      const ctx = this.getRequestContext(xhr, params);

      // Process mock response
      let mockResponse = this.processMockResponse(rule.response, ctx);

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
  private mockFetch(rule: MockRule, requestId: string, params: Record<string, string> = {}): Promise<Response> {
    return new Promise((resolve) => {
      const delay = rule.options.delay || 0;
      const requestTime = Date.now();

      setTimeout(() => {
        const duration = Date.now() - requestTime;
        const headers = rule.options.headers || { 'Content-Type': 'application/json' };

        // Get request context from recorder
        const request = this.recorder.getRequests().find(r => r.id === requestId);
        const ctx: MethodContext = request ? {
          url: request.url,
          method: request.method,
          body: request.body,
          params,
          Mock: (typeof window !== 'undefined' && (window as any).Mock) ? {
            mock: (window as any).Mock.mock.bind((window as any).Mock),
            Random: (window as any).Mock.Random
          } : undefined
        } : { url: '', method: 'GET', params, Mock: undefined };

        // Process mock response
        let mockResponse = this.processMockResponse(rule.response, ctx);

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

  /**
   * Get request context from XHR object
   */
  private getRequestContext(xhr: XMLHttpRequest, params: Record<string, string> = {}): MethodContext {
    const xhrObj = xhr as unknown as Record<string, unknown>;
    return {
      url: xhrObj._mockUrl as string || '',
      method: xhrObj._mockMethod as string || 'GET',
      body: xhrObj._mockBody as string | undefined,
      params,
      Mock: (typeof window !== 'undefined' && (window as any).Mock) ? {
        mock: (window as any).Mock.mock.bind((window as any).Mock),
        Random: (window as any).Mock.Random
      } : undefined
    };
  }

  /**
   * Process mock response with Mock.js and custom methods
   */
  private processMockResponse(response: unknown, ctx: MethodContext): unknown {
    let processed = response;

    // First, apply Mock.js template parsing
    if (typeof window !== 'undefined' && (window as any).Mock) {
      try {
        const originalResponse = JSON.stringify(response);
        processed = (window as any).Mock.mock(response);
        const processedStr = JSON.stringify(processed);
        if (originalResponse !== processedStr) {
          console.log('[MockMonkey] Mock.js template parsed');
        }
      } catch (e) {
        console.warn('[MockMonkey] Mock.js parsing failed, using original response:', e);
        processed = response;
      }
    } else {
      console.warn('[MockMonkey] Mock.js not loaded, placeholders will not be replaced');
    }

    // Then, apply custom methods (@functionName pattern)
    processed = this.processCustomMethods(processed, ctx);

    // Finally, replace @params.xxx placeholders
    processed = this.processParams(processed, ctx);

    return processed;
  }

  /**
   * Process @params.xxx placeholders in response data
   * Replaces @params.id, @params.userId, @{params.id}, @{params.id}xxx, etc. with actual route parameter values
   */
  private processParams(data: unknown, ctx: MethodContext): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // If string, replace @params.xxx patterns
    if (typeof data === 'string') {
      // First, replace @{params.xxx} pattern (with curly braces, supports trailing text)
      // Example: @{params.id} or @{params.id}_suffix
      let result = data.replace(/@\{params\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, paramName) => {
        if (ctx.params && paramName in ctx.params) {
          return ctx.params[paramName];
        }
        // If param not found, keep original placeholder
        return match;
      });

      // Then, replace @params.xxx pattern (without curly braces, simpler form)
      // Example: @params.id (only if not already matched by the pattern above)
      result = result.replace(/@params\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, paramName) => {
        if (ctx.params && paramName in ctx.params) {
          return ctx.params[paramName];
        }
        // If param not found, keep original placeholder
        return match;
      });

      return result;
    }

    // If array, process each element
    if (Array.isArray(data)) {
      return data.map(item => this.processParams(item, ctx));
    }

    // If object, process each value
    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        result[key] = this.processParams(value, ctx);
      }
      return result;
    }

    return data;
  }

  /**
   * Process custom methods in response data
   * Supports:
   * - @functionName - Simple method reference
   * - @{...functionName} - Object embedding (value) or spreading (key)
   */
  private processCustomMethods(data: unknown, ctx: MethodContext): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // If string, check for @{...functionName} or @functionName pattern
    if (typeof data === 'string') {
      // Check for @{...functionName} pattern (object embedding)
      const spreadMatch = data.match(/^@\{\.\.\.(\w+)\}$/);
      if (spreadMatch) {
        const methodName = spreadMatch[1];
        const result = this.methodManager.execute(methodName, ctx);
        if (result !== null) {
          return result;
        }
      }
      // Check for @functionName pattern (simple reference)
      const simpleMatch = data.match(/^@(\w+)$/);
      if (simpleMatch) {
        const methodName = simpleMatch[1];
        const result = this.methodManager.execute(methodName, ctx);
        if (result !== null) {
          return result;
        }
      }
      return data;
    }

    // If array, process each element
    if (Array.isArray(data)) {
      return data.map(item => this.processCustomMethods(item, ctx));
    }

    // If object, process each value and check for @{...functionName} keys (object spread)
    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        // Check for @{...functionName} pattern in key (object spread)
        const spreadKeyMatch = key.match(/^@\{\.\.\.(\w+)\}$/);
        if (spreadKeyMatch) {
          const methodName = spreadKeyMatch[1];
          const methodResult = this.methodManager.execute(methodName, ctx);
          if (methodResult !== null && typeof methodResult === 'object' && !Array.isArray(methodResult)) {
            // Spread the returned object into result
            Object.assign(result, methodResult);
          }
        } else {
          // Recursively process nested values
          result[key] = this.processCustomMethods(value, ctx);
        }
      }
      return result;
    }

    return data;
  }
}
