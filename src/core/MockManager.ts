import type { MockRule, CreateMockRuleParams, MockRuleOptions } from '../types';

/**
 * Mock 管理器 - 管理 Mock 规则的增删改查
 */
export class MockManager {
  private rules: Map<string, MockRule> = new Map();
  private storageKey = 'mock-monkey-rules';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 添加 Mock 规则
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
    console.log(`[MockMonkey] 规则已添加: ${this.patternToString(params.pattern)}`);

    return rule;
  }

  /**
   * 更新 Mock 规则
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
   * 移除 Mock 规则
   */
  remove(id: string): boolean {
    const result = this.rules.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * 根据 pattern 移除规则
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
   * 清空所有规则
   */
  clear(): void {
    this.rules.clear();
    this.saveToStorage();
  }

  /**
   * 获取所有规则
   */
  getAll(): MockRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取单个规则
   */
  get(id: string): MockRule | undefined {
    return this.rules.get(id);
  }

  /**
   * 查找匹配的 Mock 规则
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
   * 启用/禁用规则
   */
  toggle(id: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    rule.enabled = !rule.enabled;
    this.saveToStorage();
    return rule.enabled;
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 将 pattern 转为字符串
   */
  private patternToString(pattern: string | RegExp): string {
    return pattern instanceof RegExp ? pattern.toString() : pattern;
  }

  /**
   * 保存到 localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.rules.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('[MockMonkey] 保存规则失败:', e);
    }
  }

  /**
   * 从 localStorage 加载
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored) as Array<[string, MockRule]>;
      for (const [id, rule] of data) {
        // 恢复 RegExp 对象
        if (typeof rule.pattern === 'string' && rule.pattern.startsWith('/')) {
          try {
            const match = rule.pattern.match(/^\/(.+)\/([gimuy]*)$/);
            if (match) {
              rule.pattern = new RegExp(match[1], match[2]);
            }
          } catch (e) {
            // 保持字符串
          }
        }
        this.rules.set(id, rule);
      }
      console.log(`[MockMonkey] 已加载 ${this.rules.size} 条规则`);
    } catch (e) {
      console.warn('[MockMonkey] 加载规则失败:', e);
    }
  }
}
