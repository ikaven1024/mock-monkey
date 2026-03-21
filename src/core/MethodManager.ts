import type { MockMethod, CreateMockMethodParams, MethodContext } from '../types';

// Re-export types for convenience
export type { MockMethod, CreateMockMethodParams, MethodContext };

/**
 * Method Manager - Manages custom Mock methods
 */
export class MethodManager {
  private methods: Map<string, MockMethod> = new Map();
  private storageKey = 'mock-monkey-methods';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add custom method
   */
  add(params: CreateMockMethodParams): MockMethod {
    const id = this.generateId();
    const method: MockMethod = {
      id,
      name: params.name,
      code: params.code,
      description: params.description,
      enabled: true,
      createdAt: Date.now()
    };

    this.methods.set(id, method);
    this.saveToStorage();
    console.log(`[MockMonkey] Method added: @${params.name}`);

    return method;
  }

  /**
   * Update custom method
   */
  update(id: string, updates: Partial<Omit<MockMethod, 'id' | 'createdAt'>>): boolean {
    const method = this.methods.get(id);
    if (!method) return false;

    const updated = { ...method, ...updates };
    this.methods.set(id, updated);
    this.saveToStorage();

    return true;
  }

  /**
   * Remove custom method
   */
  remove(id: string): boolean {
    const method = this.methods.get(id);
    if (!method) return false;

    const result = this.methods.delete(id);
    if (result) {
      this.saveToStorage();
      console.log(`[MockMonkey] Method removed: @${method.name}`);
    }
    return result;
  }

  /**
   * Remove method by name
   */
  removeByName(name: string): boolean {
    for (const [id, method] of this.methods) {
      if (method.name === name) {
        return this.remove(id);
      }
    }
    return false;
  }

  /**
   * Clear all methods
   */
  clear(): void {
    this.methods.clear();
    this.saveToStorage();
  }

  /**
   * Get all methods
   */
  getAll(): MockMethod[] {
    return Array.from(this.methods.values());
  }

  /**
   * Get single method by ID
   */
  get(id: string): MockMethod | undefined {
    return this.methods.get(id);
  }

  /**
   * Get method by name
   */
  getByName(name: string): MockMethod | undefined {
    for (const method of this.methods.values()) {
      if (method.name === name && method.enabled) {
        return method;
      }
    }
    return undefined;
  }

  /**
   * Enable/disable method
   */
  toggle(id: string): boolean {
    const method = this.methods.get(id);
    if (!method) return false;

    method.enabled = !method.enabled;
    this.saveToStorage();
    return method.enabled;
  }

  /**
   * Reorder methods by ID array
   */
  setOrder(ids: string[]): void {
    const newMap = new Map<string, MockMethod>();
    for (const id of ids) {
      const method = this.methods.get(id);
      if (method) {
        newMap.set(id, method);
      }
    }
    // Add any remaining methods (in case of data inconsistency)
    for (const [id, method] of this.methods) {
      if (!newMap.has(id)) {
        newMap.set(id, method);
      }
    }
    this.methods = newMap;
    this.saveToStorage();
  }

  /**
   * Execute custom method
   */
  execute(name: string, ctx: MethodContext): unknown {
    // Log alpha warning on first use
    MethodManager.logAlphaWarning();

    const method = this.getByName(name);
    if (!method) {
      console.warn(`[MockMonkey] Method not found or disabled: @${name}`);
      return null;
    }

    try {
      // Create function from code with context parameter
      const fn = new Function('ctx', method.code);
      const result = fn(ctx);

      console.log(`[MockMonkey] Executed method: @${name}`);
      return result;
    } catch (e) {
      console.error(`[MockMonkey] Method execution failed: @${name}`, e);
      return null;
    }
  }

  /**
   * Log alpha warning (called on first use)
   */
  private static alphaWarned = false;

  private static logAlphaWarning(): void {
    if (!MethodManager.alphaWarned) {
      console.warn('[MockMonkey] Alpha Feature: Custom methods are under development. APIs may change.');
      MethodManager.alphaWarned = true;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.methods.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('[MockMonkey] Failed to save methods:', e);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored) as Array<[string, MockMethod]>;
      for (const [id, method] of data) {
        this.methods.set(id, method);
      }
      console.log(`[MockMonkey] Loaded ${this.methods.size} custom methods`);
    } catch (e) {
      console.warn('[MockMonkey] Failed to load methods:', e);
    }
  }
}
