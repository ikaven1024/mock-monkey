import type { MockRule } from '../types';
import { MockManager } from './MockManager';

/**
 * 请求拦截器 - 拦截 XHR 和 Fetch 请求
 */
export class Interceptor {
  private xhrOpen: typeof XMLHttpRequest.prototype.open;
  private xhrSend: typeof XMLHttpRequest.prototype.send;
  private originalFetch: typeof window.fetch;

  constructor(private manager: MockManager) {
    this.xhrOpen = XMLHttpRequest.prototype.open;
    this.xhrSend = XMLHttpRequest.prototype.send;
    this.originalFetch = window.fetch.bind(window);
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
      return self.xhrOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as unknown as Record<string, unknown>;
      const url = xhr._mockUrl as string;
      const method = xhr._mockMethod as string;

      const rule = self.manager.findMatch(url);
      if (rule) {
        console.log(`[MockMonkey] XHR 拦截: ${method} ${url}`);
        self.mockXHR(this, rule);
        return;
      }

      return self.xhrSend.call(this, body);
    };
  }

  /**
   * 拦截 Fetch
   */
  private interceptFetch(): void {
    const self = this;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const rule = self.manager.findMatch(url);

      if (rule) {
        const method = init?.method || 'GET';
        console.log(`[MockMonkey] Fetch 拦截: ${method} ${url}`);
        return self.mockFetch(rule);
      }

      return self.originalFetch(input, init);
    };
  }

  /**
   * 模拟 XHR 响应
   */
  private mockXHR(xhr: XMLHttpRequest, rule: MockRule): void {
    const delay = rule.options.delay || 0;

    setTimeout(() => {
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
  private mockFetch(rule: MockRule): Promise<Response> {
    return new Promise((resolve) => {
      const delay = rule.options.delay || 0;

      setTimeout(() => {
        const headers = rule.options.headers || { 'Content-Type': 'application/json' };
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
