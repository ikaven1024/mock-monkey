/**
 * RequestRecorder 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestRecorder } from '../src/core/RequestRecorder';
import type { NetworkRequest } from '../src/types';

describe('RequestRecorder', () => {
  let recorder: RequestRecorder;

  beforeEach(() => {
    recorder = new RequestRecorder();
  });

  describe('addRequest', () => {
    it('应该成功添加请求记录', () => {
      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);

      const requests = recorder.getRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual(request);
    });

    it('应该将新请求添加到列表开头', () => {
      const request1: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/first',
        type: 'XHR',
        mocked: false,
        timestamp: 1000,
      };
      const request2: NetworkRequest = {
        id: 'req_2',
        method: 'POST',
        url: 'https://example.com/api/second',
        type: 'Fetch',
        mocked: false,
        timestamp: 2000,
      };

      recorder.addRequest(request1);
      recorder.addRequest(request2);

      const requests = recorder.getRequests();
      expect(requests[0].id).toBe('req_2');
      expect(requests[1].id).toBe('req_1');
    });

    it('应该通知监听器', () => {
      const listener = vi.fn();
      recorder.subscribe(listener);

      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);

      expect(listener).toHaveBeenCalledWith([request]);
    });
  });

  describe('updateRequest', () => {
    it('应该能更新现有请求', () => {
      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);

      recorder.updateRequest('req_1', {
        mocked: true,
        status: 200,
        response: { data: 'mocked' },
      });

      const requests = recorder.getRequests();
      expect(requests[0].mocked).toBe(true);
      expect(requests[0].status).toBe(200);
      expect(requests[0].response).toEqual({ data: 'mocked' });
    });

    it('更新不存在的请求不应报错', () => {
      expect(() => {
        recorder.updateRequest('non-existent', { status: 404 });
      }).not.toThrow();
    });

    it('更新应该通知监听器', () => {
      const listener = vi.fn();
      recorder.subscribe(listener);

      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);
      listener.mockClear();

      recorder.updateRequest('req_1', { status: 200 });

      expect(listener).toHaveBeenCalled();
    });

    it('更新应保留原始数据', () => {
      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);

      recorder.updateRequest('req_1', { status: 200 });

      const updated = recorder.getRequests()[0];
      expect(updated.method).toBe('GET');
      expect(updated.url).toBe('https://example.com/api/test');
      expect(updated.status).toBe(200);
    });
  });

  describe('getRequests', () => {
    it('应该返回所有请求', () => {
      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/1',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });
      recorder.addRequest({
        id: 'req_2',
        method: 'POST',
        url: 'https://example.com/2',
        type: 'Fetch',
        mocked: false,
        timestamp: Date.now(),
      });

      const requests = recorder.getRequests();
      expect(requests).toHaveLength(2);
    });

    it('空记录时应返回空数组', () => {
      const requests = recorder.getRequests();
      expect(requests).toEqual([]);
    });

    it('应该返回请求的副本，防止外部修改', () => {
      const request: NetworkRequest = {
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      };

      recorder.addRequest(request);
      const requests = recorder.getRequests();

      // 修改返回的数组不应影响内部数据
      requests.push({} as NetworkRequest);
      expect(recorder.getRequests()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('应该清空所有记录', () => {
      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/1',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });
      recorder.addRequest({
        id: 'req_2',
        method: 'POST',
        url: 'https://example.com/2',
        type: 'Fetch',
        mocked: false,
        timestamp: Date.now(),
      });

      recorder.clear();

      expect(recorder.getRequests()).toHaveLength(0);
    });

    it('清空应该通知监听器', () => {
      const listener = vi.fn();
      recorder.subscribe(listener);

      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/1',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });

      listener.mockClear();
      recorder.clear();

      expect(listener).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribe', () => {
    it('应该能订阅请求变化', () => {
      const listener = vi.fn();
      const unsubscribe = recorder.subscribe(listener);

      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('应该返回取消订阅函数', () => {
      const listener = vi.fn();
      const unsubscribe = recorder.subscribe(listener);

      unsubscribe();

      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it('应该支持多个监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      recorder.subscribe(listener1);
      recorder.subscribe(listener2);

      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('取消订阅一个监听器不应影响其他监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = recorder.subscribe(listener1);
      recorder.subscribe(listener2);

      unsubscribe1();

      recorder.addRequest({
        id: 'req_1',
        method: 'GET',
        url: 'https://example.com/api/test',
        type: 'XHR',
        mocked: false,
        timestamp: Date.now(),
      });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('记录限制', () => {
    it('应该限制最大记录数量为 500', () => {
      // 添加 600 条记录
      for (let i = 0; i < 600; i++) {
        recorder.addRequest({
          id: `req_${i}`,
          method: 'GET',
          url: `https://example.com/api/${i}`,
          type: 'XHR',
          mocked: false,
          timestamp: Date.now(),
        });
      }

      const requests = recorder.getRequests();
      expect(requests.length).toBe(500);
    });

    it('超出限制时应该删除最旧的记录', () => {
      // 先添加 10 条
      for (let i = 0; i < 10; i++) {
        recorder.addRequest({
          id: `req_${i}`,
          method: 'GET',
          url: `https://example.com/api/${i}`,
          type: 'XHR',
          mocked: false,
          timestamp: Date.now(),
        });
      }

      // 设置 maxRecords 为 5（通过重新创建实例模拟）
      const limitedRecorder = new RequestRecorder();
      // 修改私有属性（仅用于测试）
      (limitedRecorder as any).maxRecords = 5;

      // 添加更多记录
      for (let i = 10; i < 20; i++) {
        limitedRecorder.addRequest({
          id: `req_${i}`,
          method: 'GET',
          url: `https://example.com/api/${i}`,
          type: 'XHR',
          mocked: false,
          timestamp: Date.now(),
        });
      }

      const requests = limitedRecorder.getRequests();
      expect(requests.length).toBe(5);
      // 最新添加的应该在最前面
      expect(requests[0].id).toBe('req_19');
    });
  });

  describe('generateId', () => {
    it('应该生成唯一的 ID', () => {
      const id1 = RequestRecorder.generateId();
      const id2 = RequestRecorder.generateId();

      expect(id1).not.toBe(id2);
    });

    it('生成的 ID 应该以 req_ 开头', () => {
      const id = RequestRecorder.generateId();
      expect(id).toMatch(/^req_/);
    });
  });
});
