import type { MockRule, CreateMockRuleParams, MockRuleOptions, RouteParams } from '../types';

/**
 * Mock Manager - Manages CRUD operations for Mock rules
 */
export class MockManager {
  private rules: Map<string, MockRule> = new Map();
  private storageKey = 'mock-monkey-rules';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add Mock rule
   */
  add(params: CreateMockRuleParams): MockRule {
    // Validate pattern type
    if (typeof params.pattern !== 'string' && !(params.pattern instanceof RegExp)) {
      console.warn('[MockMonkey] Invalid pattern type. Expected string or RegExp, got:', typeof params.pattern);
      // Try to convert to string
      params.pattern = String(params.pattern);
    }

    const id = this.generateId();
    const rule: MockRule = {
      id,
      pattern: params.pattern,
      response: params.response,
      options: params.options || {},
      enabled: true,
      createdAt: Date.now()
    };

    this.rules.set(id, rule);
    this.saveToStorage();
    console.log(`[MockMonkey] Rule added: ${this.patternToString(params.pattern)}`);

    return rule;
  }

  /**
   * Update Mock rule
   */
  update(id: string, updates: Partial<Omit<MockRule, 'id' | 'createdAt'>>): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    const updated = { ...rule, ...updates };
    this.rules.set(id, updated);
    this.saveToStorage();

    return true;
  }

  /**
   * Remove Mock rule
   */
  remove(id: string): boolean {
    const result = this.rules.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Remove rule by pattern
   */
  removeByPattern(pattern: string | RegExp): boolean {
    const patternStr = this.patternToString(pattern);
    for (const [id, rule] of this.rules) {
      if (this.patternToString(rule.pattern) === patternStr) {
        return this.remove(id);
      }
    }
    return false;
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.rules.clear();
    this.saveToStorage();
  }

  /**
   * Get all rules
   */
  getAll(): MockRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get single rule
   */
  get(id: string): MockRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Convert Express-like path pattern to RegExp
   * Example: /v1/users/:id/posts/:postId -> /^\/v1\/users\/([^/]+)\/posts\/([^/]+)$/
   */
  private pathPatternToRegExp(pattern: string): RegExp {
    // Escape special regex characters except :param syntax
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Replace :param with ([^/]+) capture group
    const withParams = escaped.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)');
    return new RegExp(`^${withParams}$`);
  }

  /**
   * Check if a pattern contains route parameters (:param)
   */
  private hasRouteParams(pattern: string): boolean {
    return /:[a-zA-Z_][a-zA-Z0-9_]*/.test(pattern);
  }

  /**
   * Find matching Mock rule
   */
  findMatch(url: string): MockRule | null {
    const result = this.findMatchWithParams(url);
    return result?.rule || null;
  }

  /**
   * Find matching Mock rule with extracted route parameters
   * @returns Object containing matched rule and extracted params, or null if no match
   */
  findMatchWithParams(url: string): { rule: MockRule; params: RouteParams } | null {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      if (rule.pattern instanceof RegExp) {
        if (rule.pattern.test(url)) return { rule, params: {} };
      } else {
        const patternStr = rule.pattern as string;
        // Check if pattern contains route parameters (:param)
        if (this.hasRouteParams(patternStr)) {
          const regex = this.pathPatternToRegExp(patternStr);
          // Extract pathname from URL for route parameter matching
          const pathname = this.extractPathname(url);
          const match = pathname.match(regex);
          if (match) {
            const params = this.extractParamsFromMatch(patternStr, match);
            return { rule, params };
          }
        } else if (url.includes(patternStr)) {
          // Fallback to substring matching for backward compatibility
          return { rule, params: {} };
        }
      }
    }
    return null;
  }

  /**
   * Extract parameter names and values from route pattern and regex match
   * Example: pattern="/v1/users/:id/posts/:postId", match=["/v1/users/123/posts/456", "123", "456"]
   *          => { id: "123", postId: "456" }
   */
  private extractParamsFromMatch(pattern: string, match: RegExpMatchArray): RouteParams {
    const params: RouteParams = {};
    const paramNames: string[] = [];

    // Extract parameter names from pattern (e.g., "/users/:id/posts/:postId" => ["id", "postId"])
    const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let paramMatch;
    while ((paramMatch = paramRegex.exec(pattern)) !== null) {
      paramNames.push(paramMatch[1]);
    }

    // Match result includes the full string at index 0, followed by capture groups
    for (let i = 0; i < paramNames.length; i++) {
      if (match[i + 1] !== undefined) {
        params[paramNames[i]] = match[i + 1];
      }
    }

    return params;
  }

  /**
   * Extract pathname from URL
   */
  private extractPathname(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, return as-is
      return url;
    }
  }

  /**
   * Enable/disable rule
   */
  toggle(id: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    rule.enabled = !rule.enabled;
    this.saveToStorage();
    return rule.enabled;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert pattern to string for display
   */
  private patternToString(pattern: string | RegExp): string {
    if (pattern instanceof RegExp) {
      return pattern.toString();
    }
    if (typeof pattern === 'string') {
      return pattern;
    }
    // Fallback for unexpected types
    return String(pattern);
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.rules.entries()).map(([id, rule]) => {
        // Convert RegExp to string format for storage
        const serializableRule = { ...rule };
        if (rule.pattern instanceof RegExp) {
          (serializableRule as MockRule).pattern = rule.pattern.toString();
        }
        return [id, serializableRule];
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('[MockMonkey] Failed to save rules:', e);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored) as Array<[string, MockRule]>;
      for (const [id, rule] of data) {
        // Restore RegExp object
        if (typeof rule.pattern === 'string' && rule.pattern.startsWith('/')) {
          try {
            const match = rule.pattern.match(/^\/(.+)\/([gimuy]*)$/);
            if (match) {
              rule.pattern = new RegExp(match[1], match[2]);
            }
          } catch (e) {
            // Keep as string
          }
        }
        this.rules.set(id, rule);
      }
      console.log(`[MockMonkey] Loaded ${this.rules.size} rules`);
    } catch (e) {
      console.warn('[MockMonkey] Failed to load rules:', e);
    }
  }
}
