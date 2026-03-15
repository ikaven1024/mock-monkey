/**
 * MockManager 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockManager } from '../src/core/MockManager';
import type { MockRule, CreateMockRuleParams } from '../src/types';

describe('MockManager', () => {
  let manager: MockManager;

  beforeEach(() => {
    manager = new MockManager();
    // 清空 localStorage 避免测试间干扰
    localStorage.clear();
  });

  describe('add', () => {
    it('应该成功添加一条规则', () => {
      const params: CreateMockRuleParams = {
        pattern: '/api/user',
        response: { name: 'test' },
      };

      const rule = manager.add(params);

      expect(rule).toBeDefined();
      expect(rule.id).toBeDefined();
      expect(rule.pattern).toBe('/api/user');
      expect(rule.response).toEqual({ name: 'test' });
      expect(rule.enabled).toBe(true);
      expect(rule.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('应该支持正则表达式模式', () => {
      const params: CreateMockRuleParams = {
        pattern: /\/api\/user\/\d+/,
        response: { id: 1 },
      };

      const rule = manager.add(params);

      expect(rule.pattern).toBeInstanceOf(RegExp);
    });

    it('应该支持配置选项', () => {
      const params: CreateMockRuleParams = {
        pattern: '/api/slow',
        response: { data: 'slow' },
        options: {
          delay: 1000,
          status: 201,
          headers: { 'X-Custom': 'value' },
        },
      };

      const rule = manager.add(params);

      expect(rule.options.delay).toBe(1000);
      expect(rule.options.status).toBe(201);
      expect(rule.options.headers).toEqual({ 'X-Custom': 'value' });
    });

    it('应该将规则保存到 localStorage', () => {
      const params: CreateMockRuleParams = {
        pattern: '/api/test',
        response: { test: true },
      };

      manager.add(params);

      const stored = localStorage.getItem('mock-monkey-rules');
      expect(stored).toBeDefined();
      const data = JSON.parse(stored!);
      expect(data).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('应该能获取已添加的规则', () => {
      const rule = manager.add({
        pattern: '/api/get',
        response: { value: 1 },
      });

      const retrieved = manager.get(rule.id);
      expect(retrieved).toEqual(rule);
    });

    it('获取不存在的规则应返回 undefined', () => {
      const retrieved = manager.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('应该返回所有规则', () => {
      manager.add({ pattern: '/api/1', response: {} });
      manager.add({ pattern: '/api/2', response: {} });
      manager.add({ pattern: '/api/3', response: {} });

      const all = manager.getAll();
      expect(all).toHaveLength(3);
    });

    it('空列表时应返回空数组', () => {
      const all = manager.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('应该能更新规则', () => {
      const rule = manager.add({
        pattern: '/api/original',
        response: { old: true },
      });

      const updated = manager.update(rule.id, {
        enabled: false,
        response: { new: true },
      });

      expect(updated).toBe(true);

      const retrieved = manager.get(rule.id);
      expect(retrieved?.enabled).toBe(false);
      expect(retrieved?.response).toEqual({ new: true });
      // id 和 createdAt 不应改变
      expect(retrieved?.id).toBe(rule.id);
      expect(retrieved?.createdAt).toBe(rule.createdAt);
    });

    it('更新不存在的规则应返回 false', () => {
      const updated = manager.update('non-existent', { enabled: false });
      expect(updated).toBe(false);
    });

    it('更新后应保存到 localStorage', () => {
      const rule = manager.add({
        pattern: '/api/test',
        response: {},
      });

      manager.update(rule.id, { enabled: false });

      const stored = localStorage.getItem('mock-monkey-rules');
      const data = JSON.parse(stored!);
      const [[_, updatedRule]] = data;
      expect(updatedRule.enabled).toBe(false);
    });
  });

  describe('remove', () => {
    it('应该能删除规则', () => {
      const rule = manager.add({
        pattern: '/api/remove',
        response: {},
      });

      const removed = manager.remove(rule.id);
      expect(removed).toBe(true);
      expect(manager.get(rule.id)).toBeUndefined();
    });

    it('删除不存在的规则应返回 false', () => {
      const removed = manager.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('removeByPattern', () => {
    it('应该能通过模式字符串删除规则', () => {
      manager.add({
        pattern: '/api/by-pattern',
        response: {},
      });

      const removed = manager.removeByPattern('/api/by-pattern');
      expect(removed).toBe(true);
      expect(manager.getAll()).toHaveLength(0);
    });

    it('应该能通过正则表达式删除规则', () => {
      const pattern = /\/api\/\d+/;
      manager.add({
        pattern,
        response: {},
      });

      const removed = manager.removeByPattern(pattern);
      expect(removed).toBe(true);
      expect(manager.getAll()).toHaveLength(0);
    });

    it('删除不存在的模式应返回 false', () => {
      const removed = manager.removeByPattern('/non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('应该清空所有规则', () => {
      manager.add({ pattern: '/api/1', response: {} });
      manager.add({ pattern: '/api/2', response: {} });

      manager.clear();

      expect(manager.getAll()).toHaveLength(0);
    });

    it('清空后应同步到 localStorage', () => {
      manager.add({ pattern: '/api/test', response: {} });
      manager.clear();

      const stored = localStorage.getItem('mock-monkey-rules');
      const data = JSON.parse(stored!);
      expect(data).toHaveLength(0);
    });
  });

  describe('toggle', () => {
    it('应该能切换规则的启用状态', () => {
      const rule = manager.add({
        pattern: '/api/toggle',
        response: {},
      });

      expect(rule.enabled).toBe(true);

      const newState = manager.toggle(rule.id);
      expect(newState).toBe(false);

      const retrieved = manager.get(rule.id);
      expect(retrieved?.enabled).toBe(false);
    });

    it('切换不存在的规则应返回 false', () => {
      const result = manager.toggle('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('findMatchWithParams', () => {
    it('应该返回匹配的规则和空参数（字符串模式）', () => {
      manager.add({
        pattern: '/api/user',
        response: { matched: true },
      });

      const result = manager.findMatchWithParams('https://example.com/api/user');
      expect(result).toBeDefined();
      expect(result?.rule.response).toEqual({ matched: true });
      expect(result?.params).toEqual({});
    });

    it('应该返回匹配的规则和空参数（正则表达式模式）', () => {
      manager.add({
        pattern: /\/api\/users\/\d+/,
        response: { id: 123 },
      });

      const result = manager.findMatchWithParams('https://example.com/api/users/456');
      expect(result).toBeDefined();
      expect(result?.rule.response).toEqual({ id: 123 });
      expect(result?.params).toEqual({});
    });

    it('应该解析单参数路由 /v1/users/:id', () => {
      manager.add({
        pattern: '/v1/users/:id',
        response: { user: 'matched' },
      });

      const result = manager.findMatchWithParams('https://example.com/v1/users/123');
      expect(result).toBeDefined();
      expect(result?.params).toEqual({ id: '123' });
    });

    it('应该解析多参数路由 /v1/users/:userId/posts/:postId', () => {
      manager.add({
        pattern: '/v1/users/:userId/posts/:postId',
        response: { post: 'matched' },
      });

      const result = manager.findMatchWithParams('https://example.com/v1/users/123/posts/456');
      expect(result).toBeDefined();
      expect(result?.params).toEqual({ userId: '123', postId: '456' });
    });

    it('应该解析带查询字符串的路由参数', () => {
      manager.add({
        pattern: '/api/items/:itemId',
        response: { item: 'matched' },
      });

      const result = manager.findMatchWithParams('https://example.com/api/items/abc123?query=test');
      expect(result).toBeDefined();
      expect(result?.params).toEqual({ itemId: 'abc123' });
    });

    it('不应该匹配不完整的路由参数', () => {
      manager.add({
        pattern: '/v1/users/:id/posts/:postId',
        response: {},
      });

      const result = manager.findMatchWithParams('https://example.com/v1/users/123/posts');
      expect(result).toBeNull();
    });

    it('没有匹配时应返回 null', () => {
      const result = manager.findMatchWithParams('https://example.com/api/not-found');
      expect(result).toBeNull();
    });
  });

  describe('findMatch', () => {
    it('应该能匹配字符串模式', () => {
      manager.add({
        pattern: '/api/user',
        response: { matched: true },
      });

      const match = manager.findMatch('https://example.com/api/user');
      expect(match).toBeDefined();
      expect(match?.response).toEqual({ matched: true });
    });

    it('应该能匹配正则表达式模式', () => {
      manager.add({
        pattern: /\/api\/users\/\d+/,
        response: { id: 123 },
      });

      const match = manager.findMatch('https://example.com/api/users/456');
      expect(match).toBeDefined();
      expect(match?.response).toEqual({ id: 123 });
    });

    it('不应该匹配禁用的规则', () => {
      const rule = manager.add({
        pattern: '/api/disabled',
        response: {},
      });

      manager.toggle(rule.id);

      const match = manager.findMatch('https://example.com/api/disabled');
      expect(match).toBeNull();
    });

    it('应该返回第一个匹配的规则', () => {
      manager.add({
        pattern: '/api',
        response: { first: true },
      });
      manager.add({
        pattern: '/api/specific',
        response: { second: true },
      });

      const match = manager.findMatch('https://example.com/api/specific');
      // 应该匹配第一个添加的规则
      expect(match?.response).toEqual({ first: true });
    });

    it('没有匹配时应返回 null', () => {
      const match = manager.findMatch('https://example.com/api/not-found');
      expect(match).toBeNull();
    });

    describe('路由参数匹配', () => {
      it('应该匹配单参数路由 /v1/users/:id', () => {
        manager.add({
          pattern: '/v1/users/:id',
          response: { user: 'matched' },
        });

        const match = manager.findMatch('https://example.com/v1/users/123');
        expect(match).toBeDefined();
        expect(match?.response).toEqual({ user: 'matched' });
      });

      it('应该匹配多参数路由 /v1/users/:userId/posts/:postId', () => {
        manager.add({
          pattern: '/v1/users/:userId/posts/:postId',
          response: { post: 'matched' },
        });

        const match = manager.findMatch('https://example.com/v1/users/123/posts/456');
        expect(match).toBeDefined();
        expect(match?.response).toEqual({ post: 'matched' });
      });

      it('不应该匹配不完整的路由参数', () => {
        manager.add({
          pattern: '/v1/users/:id/posts/:postId',
          response: {},
        });

        // 缺少第二个参数
        const match = manager.findMatch('https://example.com/v1/users/123/posts');
        expect(match).toBeNull();
      });

      it('应该匹配带查询字符串的路由参数', () => {
        manager.add({
          pattern: '/api/items/:itemId',
          response: { item: 'matched' },
        });

        const match = manager.findMatch('https://example.com/api/items/abc123?query=test');
        expect(match).toBeDefined();
      });

      it('应该正确转义路由中的特殊字符', () => {
        manager.add({
          pattern: '/api.v1/users/:id',
          response: { user: 'matched' },
        });

        const match = manager.findMatch('https://example.com/api.v1/users/123');
        expect(match).toBeDefined();
      });

      it('应该匹配路由参数与普通字符串混合的模式', () => {
        manager.add({
          pattern: '/api/users/:id/profile',
          response: { profile: 'matched' },
        });

        const match = manager.findMatch('https://example.com/api/users/123/profile');
        expect(match).toBeDefined();
      });
    });
  });

  describe('localStorage 持久化', () => {
    it('应该从 localStorage 恢复规则', () => {
      const rule: MockRule = {
        id: 'rule_test',
        pattern: '/api/restored',
        response: { restored: true },
        options: {},
        enabled: true,
        createdAt: Date.now(),
      };

      localStorage.setItem('mock-monkey-rules', JSON.stringify([[rule.id, rule]]));

      const newManager = new MockManager();
      const restored = newManager.get('rule_test');

      expect(restored).toBeDefined();
      expect(restored?.pattern).toBe('/api/restored');
    });

    it('应该能恢复 RegExp 模式', () => {
      const rule: MockRule = {
        id: 'rule_regex',
        pattern: '/\\/api\\/users\\/\\d+/',
        response: {},
        options: {},
        enabled: true,
        createdAt: Date.now(),
      };

      localStorage.setItem('mock-monkey-rules', JSON.stringify([[rule.id, rule]]));

      const newManager = new MockManager();
      const restored = newManager.get('rule_regex');

      expect(restored?.pattern).toBeInstanceOf(RegExp);
    });

    it('损坏的 localStorage 数据不应影响初始化', () => {
      localStorage.setItem('mock-monkey-rules', 'invalid json');

      expect(() => new MockManager()).not.toThrow();
    });
  });
});
