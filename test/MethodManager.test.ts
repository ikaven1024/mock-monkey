/**
 * MethodManager unit tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MethodManager } from '../src/core/MethodManager';
import type { CreateMockMethodParams, MethodContext } from '../src/types';

describe('MethodManager', () => {
  let manager: MethodManager;

  beforeEach(() => {
    manager = new MethodManager();
    // Clear localStorage to avoid test interference
    localStorage.clear();
  });

  describe('add', () => {
    it('should add a method successfully', () => {
      const params: CreateMockMethodParams = {
        name: 'testMethod',
        code: 'return ctx.url',
      };

      const method = manager.add(params);

      expect(method).toBeDefined();
      expect(method.id).toBeDefined();
      expect(method.name).toBe('testMethod');
      expect(method.code).toBe('return ctx.url');
      expect(method.enabled).toBe(true);
      expect(method.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('should support description', () => {
      const params: CreateMockMethodParams = {
        name: 'withDesc',
        code: 'return {}',
        description: 'A test method',
      };

      const method = manager.add(params);

      expect(method.description).toBe('A test method');
    });

    it('should save to localStorage', () => {
      const params: CreateMockMethodParams = {
        name: 'saveTest',
        code: 'return null',
      };

      manager.add(params);

      const stored = localStorage.getItem('mock-monkey-methods');
      expect(stored).toBeDefined();
      const data = JSON.parse(stored!);
      expect(data).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('should retrieve method by ID', () => {
      const method = manager.add({
        name: 'getMethod',
        code: 'return null',
      });

      const retrieved = manager.get(method.id);
      expect(retrieved).toEqual(method);
    });

    it('should return undefined for non-existent ID', () => {
      const retrieved = manager.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getByName', () => {
    it('should retrieve enabled method by name', () => {
      manager.add({
        name: 'findByName',
        code: 'return null',
      });

      const retrieved = manager.getByName('findByName');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('findByName');
    });

    it('should not return disabled methods', () => {
      const method = manager.add({
        name: 'disabledMethod',
        code: 'return null',
      });

      manager.toggle(method.id);

      const retrieved = manager.getByName('disabledMethod');
      expect(retrieved).toBeUndefined();
    });

    it('should return undefined for non-existent name', () => {
      const retrieved = manager.getByName('nonExistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all methods', () => {
      manager.add({ name: 'method1', code: 'return 1' });
      manager.add({ name: 'method2', code: 'return 2' });
      manager.add({ name: 'method3', code: 'return 3' });

      const all = manager.getAll();
      expect(all).toHaveLength(3);
    });

    it('should return empty array when no methods', () => {
      const all = manager.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update method properties', () => {
      const method = manager.add({
        name: 'originalName',
        code: 'return null',
        description: 'original',
      });

      const updated = manager.update(method.id, {
        name: 'updatedName',
        code: 'return 42',
      });

      expect(updated).toBe(true);

      const retrieved = manager.get(method.id);
      expect(retrieved?.name).toBe('updatedName');
      expect(retrieved?.code).toBe('return 42');
      expect(retrieved?.description).toBe('original'); // unchanged
      // id and createdAt should not change
      expect(retrieved?.id).toBe(method.id);
      expect(retrieved?.createdAt).toBe(method.createdAt);
    });

    it('should update enabled status', () => {
      const method = manager.add({
        name: 'enableTest',
        code: 'return null',
      });

      manager.update(method.id, { enabled: false });

      const retrieved = manager.get(method.id);
      expect(retrieved?.enabled).toBe(false);
    });

    it('should return false for non-existent ID', () => {
      const updated = manager.update('non-existent', { enabled: false });
      expect(updated).toBe(false);
    });

    it('should persist to localStorage after update', () => {
      const method = manager.add({
        name: 'persistTest',
        code: 'return null',
      });

      manager.update(method.id, { enabled: false });

      const stored = localStorage.getItem('mock-monkey-methods');
      const data = JSON.parse(stored!);
      const [[_, updatedMethod]] = data;
      expect(updatedMethod.enabled).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove method by ID', () => {
      const method = manager.add({
        name: 'removeTest',
        code: 'return null',
      });

      const removed = manager.remove(method.id);
      expect(removed).toBe(true);
      expect(manager.get(method.id)).toBeUndefined();
    });

    it('should return false for non-existent ID', () => {
      const removed = manager.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('removeByName', () => {
    it('should remove method by name', () => {
      manager.add({
        name: 'removeByNameTest',
        code: 'return null',
      });

      const removed = manager.removeByName('removeByNameTest');
      expect(removed).toBe(true);
      expect(manager.getByName('removeByNameTest')).toBeUndefined();
    });

    it('should return false for non-existent name', () => {
      const removed = manager.removeByName('nonExistent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all methods', () => {
      manager.add({ name: 'm1', code: 'return 1' });
      manager.add({ name: 'm2', code: 'return 2' });

      manager.clear();

      expect(manager.getAll()).toHaveLength(0);
    });

    it('should persist clear to localStorage', () => {
      manager.add({ name: 'test', code: 'return null' });
      manager.clear();

      const stored = localStorage.getItem('mock-monkey-methods');
      const data = JSON.parse(stored!);
      expect(data).toHaveLength(0);
    });
  });

  describe('toggle', () => {
    it('should toggle method enabled status', () => {
      const method = manager.add({
        name: 'toggleTest',
        code: 'return null',
      });

      expect(method.enabled).toBe(true);

      const newState = manager.toggle(method.id);
      expect(newState).toBe(false);

      const retrieved = manager.get(method.id);
      expect(retrieved?.enabled).toBe(false);
    });

    it('should toggle back to enabled', () => {
      const method = manager.add({
        name: 'toggleBack',
        code: 'return null',
      });

      manager.toggle(method.id);
      manager.toggle(method.id);

      const retrieved = manager.get(method.id);
      expect(retrieved?.enabled).toBe(true);
    });

    it('should return false for non-existent ID', () => {
      const result = manager.toggle('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('setOrder', () => {
    it('should reorder methods by ID array', () => {
      const m1 = manager.add({ name: 'first', code: 'return 1' });
      const m2 = manager.add({ name: 'second', code: 'return 2' });
      const m3 = manager.add({ name: 'third', code: 'return 3' });

      // Reverse order
      manager.setOrder([m3.id, m2.id, m1.id]);

      const all = manager.getAll();
      expect(all[0].id).toBe(m3.id);
      expect(all[1].id).toBe(m2.id);
      expect(all[2].id).toBe(m1.id);
    });

    it('should handle partial ID list', () => {
      const m1 = manager.add({ name: 'm1', code: 'return 1' });
      const m2 = manager.add({ name: 'm2', code: 'return 2' });
      const m3 = manager.add({ name: 'm3', code: 'return 3' });

      // Only order first two
      manager.setOrder([m2.id, m1.id]);

      const all = manager.getAll();
      expect(all[0].id).toBe(m2.id);
      expect(all[1].id).toBe(m1.id);
      // m3 should still be included
      expect(all).toHaveLength(3);
    });

    it('should handle non-existent IDs gracefully', () => {
      const m1 = manager.add({ name: 'm1', code: 'return 1' });

      manager.setOrder(['non-existent', m1.id]);

      const all = manager.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(m1.id);
    });
  });

  describe('execute', () => {
    const mockContext: MethodContext = {
      url: 'https://example.com/api/test',
      method: 'GET',
      body: undefined,
      params: { id: '123' },
    };

    it('should execute method and return result', () => {
      manager.add({
        name: 'simple',
        code: 'return "Hello from " + ctx.method',
      });

      const result = manager.execute('simple', mockContext);
      expect(result).toBe('Hello from GET');
    });

    it('should have access to context', () => {
      manager.add({
        name: 'contextAccess',
        code: 'return ctx.url',
      });

      const result = manager.execute('contextAccess', mockContext);
      expect(result).toBe('https://example.com/api/test');
    });

    it('should have access to params', () => {
      manager.add({
        name: 'paramsAccess',
        code: 'return ctx.params.id',
      });

      const result = manager.execute('paramsAccess', mockContext);
      expect(result).toBe('123');
    });

    it('should return null for disabled method', () => {
      const method = manager.add({
        name: 'disabled',
        code: 'return "should not run"',
      });

      manager.toggle(method.id);

      const result = manager.execute('disabled', mockContext);
      expect(result).toBeNull();
    });

    it('should return null for non-existent method', () => {
      const result = manager.execute('nonExistent', mockContext);
      expect(result).toBeNull();
    });

    it('should return null on execution error', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.add({
        name: 'error',
        code: 'throw new Error("Test error")',
      });

      const result = manager.execute('error', mockContext);
      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        '[MockMonkey] Method execution failed: @error',
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });

    it('should support Mock.js in context', () => {
      manager.add({
        name: 'mockTest',
        code: 'return ctx.Mock ? "Mock available" : "No Mock"',
      });

      const contextWithMock: MethodContext = {
        ...mockContext,
        Mock: {
          mock: vi.fn(),
          Random: {},
        },
      };

      const result = manager.execute('mockTest', contextWithMock);
      expect(result).toBe('Mock available');
    });
  });

  describe('localStorage persistence', () => {
    it('should restore methods from localStorage', () => {
      const storedMethods = [
        [
          'method_test_1',
          {
            id: 'method_test_1',
            name: 'restoredMethod',
            code: 'return "restored"',
            description: 'Test method',
            enabled: true,
            createdAt: Date.now(),
          },
        ],
      ];

      localStorage.setItem('mock-monkey-methods', JSON.stringify(storedMethods));

      const newManager = new MethodManager();
      const restored = newManager.getByName('restoredMethod');

      expect(restored).toBeDefined();
      expect(restored?.name).toBe('restoredMethod');
      expect(restored?.code).toBe('return "restored"');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('mock-monkey-methods', 'invalid json');

      expect(() => new MethodManager()).not.toThrow();

      const manager = new MethodManager();
      expect(manager.getAll()).toHaveLength(0);
    });

    it('should handle empty localStorage', () => {
      localStorage.removeItem('mock-monkey-methods');

      const manager = new MethodManager();
      expect(manager.getAll()).toHaveLength(0);
    });
  });

  // Note: Alpha warning tests are omitted because they depend on static state
  // that cannot be reliably reset between test runs. The warning functionality
  // is tested indirectly through manual testing.
});
