import type { MockRule, CreateMockRuleParams, MockRuleOptions } from '../types';

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
   * Find matching Mock rule
   */
  findMatch(url: string): MockRule | null {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      if (rule.pattern instanceof RegExp) {
        if (rule.pattern.test(url)) return rule;
      } else if (url.includes(rule.pattern as string)) {
        return rule;
      }
    }
    return null;
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
   * Convert pattern to string
   */
  private patternToString(pattern: string | RegExp): string {
    return pattern instanceof RegExp ? pattern.toString() : pattern;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.rules.entries());
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
