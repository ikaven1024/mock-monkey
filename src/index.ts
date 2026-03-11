import { MockManager } from './core/MockManager';
import { Interceptor } from './core/Interceptor';
import { RequestRecorder } from './core/RequestRecorder';
import { PanelWithCallbacks, type RuleItem, type RuleFormData } from './ui/Panel';
import { I18n } from './i18n';

/**
 * MockMonkey main class
 */
class MockMonkey {
  private static instance: MockMonkey;

  private manager: MockManager;
  private interceptor: Interceptor;
  private panel: PanelWithCallbacks;
  private recorder: RequestRecorder;
  private i18n: I18n;

  private constructor() {
    this.recorder = new RequestRecorder();
    this.manager = new MockManager();
    this.interceptor = new Interceptor(this.manager, this.recorder);
    this.i18n = I18n.getInstance();
    this.panel = new PanelWithCallbacks(
      (rule) => this.handleAddRule(rule),
      {
        onToggle: (id) => this.handleToggleRule(id),
        onEdit: (id, rule) => this.handleEditRule(id, rule),
        onDelete: (id) => this.handleDeleteRule(id)
      }
    );

    // Subscribe to request changes, update panel
    this.recorder.subscribe((requests) => {
      this.panel.updateNetworkRequests(requests);
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MockMonkey {
    if (!MockMonkey.instance) {
      MockMonkey.instance = new MockMonkey();
    }
    return MockMonkey.instance;
  }

  /**
   * Start MockMonkey
   */
  start(): void {
    // Wait for DOM to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize
   */
  private init(): void {
    // Start interceptor
    this.interceptor.start();

    // Initialize panel
    this.panel.init();

    // Initial update of rules list
    this.updateRulesList();

    console.log('[MockMonkey] Started! Click the 🐵 button in the bottom right to open the management panel');
  }

  /**
   * Add rule
   */
  private handleAddRule(rule: RuleFormData): void {
    this.manager.add(rule);
    this.updateRulesList();
    console.log('[MockMonkey] Rule added');
  }

  /**
   * Toggle rule status
   */
  private handleToggleRule(id: string): void {
    const enabled = this.manager.toggle(id);
    this.updateRulesList();
    console.log(`[MockMonkey] Rule ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Edit rule
   */
  private handleEditRule(id: string, rule: RuleFormData): void {
    const success = this.manager.update(id, {
      pattern: rule.pattern,
      response: rule.response,
      options: rule.options
    });
    if (success) {
      this.updateRulesList();
      console.log('[MockMonkey] Rule updated');
    } else {
      console.error('[MockMonkey] Rule update failed: rule not found');
    }
  }

  /**
   * Delete rule
   */
  private handleDeleteRule(id: string): void {
    if (confirm(`[MockMonkey] ${this.i18n.t('common.confirmDelete')}`)) {
      this.manager.remove(id);
      this.updateRulesList();
      console.log('[MockMonkey] Rule deleted');
    }
  }

  /**
   * Update rules list
   */
  private updateRulesList(): void {
    const rules = this.manager.getAll().map((rule) => ({
      id: rule.id,
      patternStr: rule.pattern instanceof RegExp ? rule.pattern.toString() : rule.pattern,
      response: rule.response,
      enabled: rule.enabled,
      delay: rule.options.delay || 0,
      status: rule.options.status || 200
    }));
    this.panel.updateRules(rules);
  }
}

// Start
MockMonkey.getInstance().start();

// Expose to global (for console debugging)
declare global {
  interface Window {
    mockMonkey: {
      add: (pattern: string | RegExp, response: unknown, options?: { delay?: number; status?: number }) => void;
      remove: (pattern: string | RegExp) => void;
      clear: () => void;
      list: () => void;
      listRequests: () => void;
      clearRequests: () => void;
      manager: MockManager;
      recorder: RequestRecorder;
    };
  }
}

window.mockMonkey = {
  add: (pattern: string | RegExp, response: unknown, options?: { delay?: number; status?: number }) => {
    MockMonkey.getInstance()['manager'].add({ pattern, response, options });
    MockMonkey.getInstance()['updateRulesList']();
  },
  remove: (pattern: string | RegExp) => {
    MockMonkey.getInstance()['manager'].removeByPattern(pattern);
    MockMonkey.getInstance()['updateRulesList']();
  },
  clear: () => {
    MockMonkey.getInstance()['manager'].clear();
    MockMonkey.getInstance()['updateRulesList']();
  },
  list: () => {
    const manager = MockMonkey.getInstance()['manager'] as MockManager;
    console.log('[MockMonkey] Current rules:');
    manager.getAll().forEach((rule) => {
      console.log(`  ${rule.enabled ? '✓' : '✗'} ${rule.pattern}`, rule);
    });
  },
  listRequests: () => {
    const recorder = MockMonkey.getInstance()['recorder'] as RequestRecorder;
    console.log('[MockMonkey] Network request records:');
    recorder.getRequests().forEach((req) => {
      console.log(`  ${req.mocked ? '🟢 MOCK' : '⚪ REAL'} ${req.method} ${req.url}`, req);
    });
  },
  clearRequests: () => {
    const recorder = MockMonkey.getInstance()['recorder'] as RequestRecorder;
    recorder.clear();
    console.log('[MockMonkey] Network request records cleared');
  },
  manager: MockMonkey.getInstance()['manager'] as MockManager,
  recorder: MockMonkey.getInstance()['recorder'] as RequestRecorder
};
