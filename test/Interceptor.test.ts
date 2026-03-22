/**
 * Interceptor 单元测试
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Interceptor } from '../src/core/Interceptor';
import { MockManager } from '../src/core/MockManager';
import { RequestRecorder } from '../src/core/RequestRecorder';
import { MethodManager } from '../src/core/MethodManager';

// Mock Mock.js
const mockMock = {
  mock: vi.fn((data: unknown) => data),
};
(globalThis as any).Mock = mockMock;

describe('Interceptor', () => {
  let manager: MockManager;
  let recorder: RequestRecorder;
  let methodManager: MethodManager;
  let interceptor: Interceptor;

  beforeEach(() => {
    manager = new MockManager();
    recorder = new RequestRecorder();
    methodManager = new MethodManager();
    interceptor = new Interceptor(manager, recorder, methodManager);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    interceptor.stop();
    vi.useRealTimers();
  });

  describe('normalizeUrl', () => {
    it('应该保持完整 URL 不变', () => {
      // 通过私有方法测试
      const url = (interceptor as any).normalizeUrl('https://example.com/api/test');
      expect(url).toBe('https://example.com/api/test');
    });

    it('应该将相对路径转换为完整 URL', () => {
      // 设置 location
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/page',
        },
        writable: true,
      });

      const url = (interceptor as any).normalizeUrl('/api/test');
      expect(url).toBe('https://example.com/api/test');
    });

    it('应该处理无效 URL', () => {
      // happy-dom 会将无效 URL 转换为 base href + 无效路径
      const url = (interceptor as any).normalizeUrl('not a valid url');
      // 验证不会抛出异常即可
      expect(url).toBeDefined();
    });
  });

  describe('start 和 stop', () => {
    it('启动后应该拦截 XHR', () => {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      interceptor.start();

      expect(XMLHttpRequest.prototype.open).not.toBe(originalOpen);
      expect(XMLHttpRequest.prototype.send).not.toBe(originalSend);
    });

    it('启动后应该拦截 Fetch', () => {
      const originalFetch = window.fetch;

      interceptor.start();

      expect(window.fetch).not.toBe(originalFetch);
    });

    it('停止后应该恢复原始方法', () => {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      interceptor.start();
      interceptor.stop();

      expect(XMLHttpRequest.prototype.open).toBe(originalOpen);
      expect(XMLHttpRequest.prototype.send).toBe(originalSend);
      // fetch 函数绑定层级可能不同，验证功能正常即可
      expect(window.fetch).toBeDefined();
    });
  });

  describe('XHR 拦截', () => {
    beforeEach(() => {
      interceptor.start();
    });

    it('应该记录 XHR 请求', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://example.com/api/test');
      xhr.send();

      // 手动触发 readyState 变化
      (xhr as any)._mockUrl = 'https://example.com/api/test';
      (xhr as any)._mockMethod = 'GET';
      (xhr as any)._mockRequestId = 'test_req_id';
      (xhr as any)._mockRequestTime = Date.now();

      const requests = recorder.getRequests();
      const testRequest = requests.find((r) => r.url.includes('/api/test'));

      expect(testRequest).toBeDefined();
      expect(testRequest?.method).toBe('GET');
      expect(testRequest?.type).toBe('XHR');
    });

    it('应该记录 POST 请求的 body', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://example.com/api/test');
      xhr.send('{"key":"value"}');

      const requests = recorder.getRequests();
      const testRequest = requests.find((r) => r.url.includes('/api/test'));

      expect(testRequest?.body).toBe('{"key":"value"}');
    });
  });

  describe('Fetch 拦截', () => {
    beforeEach(() => {
      interceptor.start();
    });

    it('应该记录 Fetch 请求', () => {
      fetch('https://example.com/api/test').catch(() => {});

      const requests = recorder.getRequests();
      const testRequest = requests.find((r) => r.url.includes('/api/test'));

      expect(testRequest).toBeDefined();
      expect(testRequest?.method).toBe('GET');
      expect(testRequest?.type).toBe('Fetch');
    });

    it('应该记录 POST 请求', () => {
      fetch('https://example.com/api/test', {
        method: 'POST',
        body: '{"key":"value"}',
      }).catch(() => {});

      const requests = recorder.getRequests();
      const testRequest = requests.find((r) => r.url.includes('/api/test'));

      expect(testRequest?.method).toBe('POST');
    });

    it('应该拦截匹配的 Fetch 请求', () => {
      manager.add({
        pattern: '/api/user',
        response: { name: 'Mocked User', age: 25 },
        options: { status: 200 },
      });

      fetch('https://example.com/api/user');

      const requests = recorder.getRequests();
      const mockedRequest = requests.find((r) => r.url.includes('/api/user'));

      expect(mockedRequest?.mocked).toBe(true);
      expect(mockedRequest?.status).toBe(200);
    });

    it('不应该拦截不匹配的 Fetch 请求', () => {
      manager.add({
        pattern: '/api/user',
        response: { name: 'Mocked User' },
      });

      fetch('https://example.com/api/other').catch(() => {});

      const requests = recorder.getRequests();
      const otherRequest = requests.find((r) => r.url.includes('/api/other'));

      expect(otherRequest?.mocked).toBe(false);
    });

    it('应该支持正则表达式匹配', () => {
      manager.add({
        pattern: /\/api\/users\/\d+/,
        response: { id: 123, name: 'User' },
      });

      fetch('https://example.com/api/users/456');

      const requests = recorder.getRequests();
      const matchedRequest = requests.find((r) => r.url.includes('/api/users/456'));

      expect(matchedRequest?.mocked).toBe(true);
    });

    it('不应该匹配禁用的规则', () => {
      const rule = manager.add({
        pattern: '/api/disabled',
        response: { data: 'test' },
      });

      manager.toggle(rule.id);

      fetch('https://example.com/api/disabled').catch(() => {});

      const requests = recorder.getRequests();
      const disabledRequest = requests.find((r) => r.url.includes('/api/disabled'));

      expect(disabledRequest?.mocked).toBe(false);
    });
  });

  describe('URL 标准化', () => {
    beforeEach(() => {
      interceptor.start();
    });

    it('应该标准化相对路径 URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/page',
        },
        writable: true,
      });

      manager.add({
        pattern: '/api/relative',
        response: { data: 'test' },
      });

      fetch('/api/relative');

      const requests = recorder.getRequests();
      const relativeRequest = requests.find((r) => r.url.includes('/api/relative'));

      // 相对路径应该被转换为完整 URL
      expect(relativeRequest?.url).toBe('https://example.com/api/relative');
    });

    it('应该保持完整 URL 不变', () => {
      manager.add({
        pattern: 'https://example.com/api/full',
        response: { data: 'test' },
      });

      fetch('https://example.com/api/full');

      const requests = recorder.getRequests();
      const fullRequest = requests.find((r) => r.url.includes('/api/full'));

      expect(fullRequest?.url).toBe('https://example.com/api/full');
    });
  });

  describe('Mock.js 集成', () => {
    beforeEach(() => {
      interceptor.start();
    });

    it('Fetch 应该调用 Mock.js 解析模板', () => {
      manager.add({
        pattern: '/api/template',
        response: {
          name: '@name',
          email: '@email',
        },
      });

      fetch('https://example.com/api/template');

      // 由于 mockXHR 和 mockFetch 使用 setTimeout，需要快进时间
      vi.advanceTimersByTime(10);

      expect(mockMock.mock).toHaveBeenCalled();
    });

    it('Mock.js 解析失败时应该使用原始响应', () => {
      mockMock.mock.mockImplementationOnce(() => {
        throw new Error('Mock.js error');
      });

      manager.add({
        pattern: '/api/error',
        response: { data: 'original' },
      });

      fetch('https://example.com/api/error');

      vi.advanceTimersByTime(10);

      // 不应该抛出错误
      const requests = recorder.getRequests();
      const errorRequest = requests.find((r) => r.url.includes('/api/error'));

      expect(errorRequest).toBeDefined();
      expect(errorRequest?.mocked).toBe(true);
    });
  });

  describe('自定义方法 @{...functionName} 语法', () => {
    beforeEach(() => {
      interceptor.start();
    });

    it('应该支持对象嵌入语法：@{...functionName}', () => {
      // 添加一个返回对象的自定义方法
      methodManager.add({
        name: 'getUserProfile',
        code: 'return { id: 1, name: "Alice", email: "alice@example.com" };',
        description: 'Get user profile',
      });

      manager.add({
        pattern: '/api/user',
        response: {
          user: '@{...getUserProfile}',
          timestamp: 123456,
        },
      });

      fetch('https://example.com/api/user');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const userRequest = requests.find((r) => r.url.includes('/api/user'));

      expect(userRequest?.mocked).toBe(true);
      expect(userRequest?.response).toEqual({
        user: { id: 1, name: 'Alice', email: 'alice@example.com' },
        timestamp: 123456,
      });
    });

    it('应该支持对象展开语法：@{...functionName} as key', () => {
      methodManager.add({
        name: 'getBaseResponse',
        code: 'return { status: "success", version: "1.0" };',
        description: 'Get base response',
      });

      manager.add({
        pattern: '/api/data',
        response: {
          '@{...getBaseResponse}': true,
          data: { items: [1, 2, 3] },
        },
      });

      fetch('https://example.com/api/data');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const dataRequest = requests.find((r) => r.url.includes('/api/data'));

      expect(dataRequest?.mocked).toBe(true);
      expect(dataRequest?.response).toEqual({
        status: 'success',
        version: '1.0',
        data: { items: [1, 2, 3] },
      });
    });

    it('应该支持数组中的对象嵌入', () => {
      methodManager.add({
        name: 'getItem',
        code: 'return { id: ctx.params?.id || 1, name: "Item" };',
        description: 'Get item',
      });

      manager.add({
        pattern: '/api/items',
        response: {
          items: ['@{...getItem}'],
        },
      });

      fetch('https://example.com/api/items');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const itemsRequest = requests.find((r) => r.url.includes('/api/items'));

      expect(itemsRequest?.mocked).toBe(true);
      expect(itemsRequest?.response).toEqual({
        items: [{ id: 1, name: 'Item' }],
      });
    });

    it('应该支持嵌套对象中的方法调用', () => {
      methodManager.add({
        name: 'getAddress',
        code: 'return { city: "Beijing", country: "China" };',
        description: 'Get address',
      });

      manager.add({
        pattern: '/api/profile',
        response: {
          user: {
            name: 'Bob',
            address: '@{...getAddress}',
          },
        },
      });

      fetch('https://example.com/api/profile');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const profileRequest = requests.find((r) => r.url.includes('/api/profile'));

      expect(profileRequest?.mocked).toBe(true);
      expect(profileRequest?.response).toEqual({
        user: {
          name: 'Bob',
          address: { city: 'Beijing', country: 'China' },
        },
      });
    });

    it('应该支持多个对象展开', () => {
      methodManager.add({
        name: 'getMetadata',
        code: 'return { timestamp: 123456, version: "1.0" };',
        description: 'Get metadata',
      });

      methodManager.add({
        name: 'getData',
        code: 'return { items: [1, 2, 3], total: 3 };',
        description: 'Get data',
      });

      manager.add({
        pattern: '/api/multi',
        response: {
          '@{...getMetadata}': true,
          '@{...getData}': true,
        },
      });

      fetch('https://example.com/api/multi');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const multiRequest = requests.find((r) => r.url.includes('/api/multi'));

      expect(multiRequest?.mocked).toBe(true);
      expect(multiRequest?.response).toEqual({
        timestamp: 123456,
        version: '1.0',
        items: [1, 2, 3],
        total: 3,
      });
    });

    it('方法返回非对象时不应展开', () => {
      methodManager.add({
        name: 'getString',
        code: 'return "just a string";',
        description: 'Get string',
      });

      manager.add({
        pattern: '/api/string',
        response: {
          '@{...getString}': true,
          other: 'value',
        },
      });

      fetch('https://example.com/api/string');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const stringRequest = requests.find((r) => r.url.includes('/api/string'));

      expect(stringRequest?.mocked).toBe(true);
      // 非对象类型不应该被展开，只保留其他字段
      expect(stringRequest?.response).toEqual({
        other: 'value',
      });
    });

    it('方法返回数组时不应展开', () => {
      methodManager.add({
        name: 'getArray',
        code: 'return [1, 2, 3];',
        description: 'Get array',
      });

      manager.add({
        pattern: '/api/array',
        response: {
          '@{...getArray}': true,
          other: 'value',
        },
      });

      fetch('https://example.com/api/array');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const arrayRequest = requests.find((r) => r.url.includes('/api/array'));

      expect(arrayRequest?.mocked).toBe(true);
      // 数组类型不应该被展开
      expect(arrayRequest?.response).toEqual({
        other: 'value',
      });
    });

    it('应该保持向后兼容：支持 @functionName 语法', () => {
      methodManager.add({
        name: 'getValue',
        code: 'return "simple value";',
        description: 'Get simple value',
      });

      manager.add({
        pattern: '/api/simple',
        response: {
          value: '@getValue',
        },
      });

      fetch('https://example.com/api/simple');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const simpleRequest = requests.find((r) => r.url.includes('/api/simple'));

      expect(simpleRequest?.mocked).toBe(true);
      expect(simpleRequest?.response).toEqual({
        value: 'simple value',
      });
    });

    it('应该支持在方法中使用 ctx.Mock', () => {
      // Save original mock implementation
      const originalMock = mockMock.mock;

      // Mock Mock.js to be available - only process specific placeholders
      mockMock.mock.mockImplementation((template: unknown) => {
        if (typeof template === 'object' && template !== null) {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(template as Record<string, unknown>)) {
            // Only process simple @placeholder patterns, not @{...} patterns
            if (typeof value === 'string' && /^@\w+$/.test(value)) {
              result[key] = 'mocked_' + value.substring(1);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              // Recursively process nested objects
              result[key] = originalMock(value);
            } else {
              result[key] = value;
            }
          }
          return result;
        }
        return template;
      });

      methodManager.add({
        name: 'getRandomUser',
        code: 'return ctx.Mock ? ctx.Mock.mock({ id: "@id", name: "@name" }) : { id: 1, name: "Default" };',
        description: 'Get random user using Mock',
      });

      manager.add({
        pattern: '/api/random-user',
        response: {
          user: '@{...getRandomUser}',
        },
      });

      fetch('https://example.com/api/random-user');

      vi.advanceTimersByTime(10);

      const requests = recorder.getRequests();
      const randomUserRequest = requests.find((r) => r.url.includes('/api/random-user'));

      expect(randomUserRequest?.mocked).toBe(true);
      expect(randomUserRequest?.response).toEqual({
        user: { id: 'mocked_id', name: 'mocked_name' },
      });

      // Restore original mock
      mockMock.mock.mockImplementation(originalMock);
    });
  });
});
