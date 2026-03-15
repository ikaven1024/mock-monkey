/**
 * Panel search functionality unit tests
 * Tests for the filtering logic in Panel.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Panel } from '../src/ui/Panel';
import { I18n } from '../src/i18n';
import type { NetworkRequest } from '../src/types';

// Access private methods for testing
interface RuleItem {
  id: string;
  patternStr: string;
  pattern: RegExp;
  enabled: boolean;
}

type PanelWithPrivateAccess = {
  filterRules(rules: RuleItem[], query: string): RuleItem[];
  filterRequests(requests: NetworkRequest[], query: string): NetworkRequest[];
};

describe('Panel Search Functionality', () => {
  let panel: PanelWithPrivateAccess;

  beforeEach(() => {
    // Create Panel instance with no-op callbacks
    panel = new Panel(
      () => {},
      () => {},
      () => {}
    ) as unknown as PanelWithPrivateAccess;
  });

  describe('filterRules - empty and edge cases', () => {
    const mockRules = [
      { id: '1', patternStr: '/api/user', pattern: /\/api\/user/, enabled: true },
      { id: '2', patternStr: '/\/api\/users\/\d+/', pattern: /\/api\/users\/\d+/, enabled: true },
      { id: '3', patternStr: 'https://example.com/api/data', pattern: /https:\/\/example\.com\/api\/data/, enabled: true },
    ];

    it('should return all rules when query is empty', () => {
      const result = panel.filterRules(mockRules, '');
      expect(result).toEqual(mockRules);
    });

    it('should return all rules when query is only whitespace', () => {
      const result = panel.filterRules(mockRules, '   ');
      expect(result).toEqual(mockRules);
    });

    it('should return all rules when query is only tabs', () => {
      const result = panel.filterRules(mockRules, '\t\t');
      expect(result).toEqual(mockRules);
    });

    it('should return empty array when no rules match', () => {
      const result = panel.filterRules(mockRules, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array when rules array is empty', () => {
      const result = panel.filterRules([], 'api');
      expect(result).toEqual([]);
    });
  });

  describe('filterRules - case insensitivity', () => {
    const mockRules = [
      { id: '1', patternStr: '/API/User', pattern: /\/API\/User/, enabled: true },
      { id: '2', patternStr: '/api/data', pattern: /\/api\/data/, enabled: true },
      { id: '3', patternStr: 'HTTPS://EXAMPLE.COM/TEST', pattern: /HTTPS:\/\/EXAMPLE\.COM\/TEST/, enabled: true },
    ];

    it('should match lowercase query to uppercase pattern', () => {
      const result = panel.filterRules(mockRules, 'api');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should match uppercase query to lowercase pattern', () => {
      const result = panel.filterRules(mockRules, 'API');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should match mixed case query', () => {
      const result = panel.filterRules(mockRules, 'ApI');
      expect(result).toHaveLength(2);
    });

    it('should match URL scheme case insensitively', () => {
      const result = panel.filterRules(mockRules, 'https://');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('filterRules - partial matching', () => {
    const mockRules = [
      { id: '1', patternStr: '/api/v1/users', pattern: /\/api\/v1\/users/, enabled: true },
      { id: '2', patternStr: '/api/v2/users', pattern: /\/api\/v2\/users/, enabled: true },
      { id: '3', patternStr: '/api/v1/posts', pattern: /\/api\/v1\/posts/, enabled: true },
    ];

    it('should match by partial string', () => {
      const result = panel.filterRules(mockRules, 'v1');
      expect(result).toHaveLength(2);
      expect(result.map((r: unknown) => (r as { id: string }).id)).toEqual(['1', '3']);
    });

    it('should match by endpoint', () => {
      const result = panel.filterRules(mockRules, 'users');
      expect(result).toHaveLength(2);
      expect(result.map((r: unknown) => (r as { id: string }).id)).toEqual(['1', '2']);
    });

    it('should match by exact pattern', () => {
      const result = panel.filterRules(mockRules, '/api/v1/users');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('filterRules - special characters', () => {
    const mockRules = [
      { id: '1', patternStr: '/api/user?id=123', pattern: /\/api\/user\?id=123/, enabled: true },
      { id: '2', patternStr: '/\\/api\\/user\\/\\d+/', pattern: /\/api\/user\/\d+/, enabled: true },
      { id: '3', patternStr: '/api/data?filter[name]=test', pattern: /\/api\/data\?filter\[name\]=test/, enabled: true },
    ];

    it('should handle query parameters', () => {
      const result = panel.filterRules(mockRules, '?id=');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle regex syntax in pattern', () => {
      const result = panel.filterRules(mockRules, '\\d+');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should handle bracket notation', () => {
      const result = panel.filterRules(mockRules, '[name]');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('filterRequests - empty and edge cases', () => {
    const mockRequests: NetworkRequest[] = [
      { id: '1', url: 'https://example.com/api/user', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      { id: '2', url: 'https://example.com/api/data', method: 'POST', type: 'XHR', mocked: false, status: 201, timestamp: Date.now() },
      { id: '3', url: 'https://api.example.com/v1/test', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
    ];

    it('should return all requests when query is empty', () => {
      const result = panel.filterRequests(mockRequests, '');
      expect(result).toEqual(mockRequests);
    });

    it('should return all requests when query is only whitespace', () => {
      const result = panel.filterRequests(mockRequests, '   ');
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no requests match', () => {
      const result = panel.filterRequests(mockRequests, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array when requests array is empty', () => {
      const result = panel.filterRequests([], 'api');
      expect(result).toEqual([]);
    });
  });

  describe('filterRequests - case insensitivity', () => {
    const mockRequests: NetworkRequest[] = [
      { id: '1', url: 'https://EXAMPLE.COM/api/user', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      { id: '2', url: 'https://example.com/API/data', method: 'POST', type: 'XHR', mocked: false, status: 201, timestamp: Date.now() },
      { id: '3', url: 'HTTPS://TEST.COM/endpoint', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
    ];

    it('should match lowercase query to uppercase URL', () => {
      const result = panel.filterRequests(mockRequests, 'example.com');
      expect(result).toHaveLength(2);
    });

    it('should match uppercase query to lowercase URL', () => {
      const result = panel.filterRequests(mockRequests, 'API');
      expect(result).toHaveLength(2);
    });

    it('should match URL scheme case insensitively', () => {
      const result = panel.filterRequests(mockRequests, 'https://');
      expect(result).toHaveLength(3);
    });
  });

  describe('filterRequests - URL matching', () => {
    const mockRequests: NetworkRequest[] = [
      { id: '1', url: 'https://example.com/api/v1/users', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      { id: '2', url: 'https://example.com/api/v2/users', method: 'POST', type: 'XHR', mocked: false, status: 201, timestamp: Date.now() },
      { id: '3', url: 'https://example.com/api/v1/posts', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
    ];

    it('should match by domain', () => {
      const result = panel.filterRequests(mockRequests, 'example.com');
      expect(result).toHaveLength(3);
    });

    it('should match by path segment', () => {
      const result = panel.filterRequests(mockRequests, 'v1');
      expect(result).toHaveLength(2);
      expect(result.map((r: NetworkRequest) => r.id)).toEqual(['1', '3']);
    });

    it('should match by endpoint', () => {
      const result = panel.filterRequests(mockRequests, 'users');
      expect(result).toHaveLength(2);
      expect(result.map((r: NetworkRequest) => r.id)).toEqual(['1', '2']);
    });

    it('should match by query parameters', () => {
      const requestsWithQuery: NetworkRequest[] = [
        ...mockRequests,
        { id: '4', url: 'https://example.com/api/data?filter=active', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      ];
      const result = panel.filterRequests(requestsWithQuery, 'filter=');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });
  });

  describe('filterRequests - special characters', () => {
    const mockRequests: NetworkRequest[] = [
      { id: '1', url: 'https://example.com/api/user?id=123&name=test', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      { id: '2', url: 'https://example.com/api/data?filter[type]=user', method: 'GET', type: 'XHR', mocked: false, status: 200, timestamp: Date.now() },
      { id: '3', url: 'wss://example.com/ws', method: 'GET', type: 'XHR', mocked: false, status: 101, timestamp: Date.now() },
    ];

    it('should handle query parameters with special chars', () => {
      const result = panel.filterRequests(mockRequests, '?id=');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle bracket notation in query', () => {
      const result = panel.filterRequests(mockRequests, '[type]');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should handle different URL schemes', () => {
      const result = panel.filterRequests(mockRequests, 'wss://');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });
});
