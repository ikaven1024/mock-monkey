import { MockManager } from './core/MockManager';
import { Interceptor } from './core/Interceptor';
import { RequestRecorder } from './core/RequestRecorder';
import { PanelWithCallbacks, type RuleItem, type RuleFormData } from './ui/Panel';

/**
 * MockMonkey 主类
 */
class MockMonkey {
  private static instance: MockMonkey;

  private manager: MockManager;
  private interceptor: Interceptor;
  private panel: PanelWithCallbacks;
  private recorder: RequestRecorder;

  private constructor() {
    this.recorder = new RequestRecorder();
    this.manager = new MockManager();
    this.interceptor = new Interceptor(this.manager, this.recorder);
    this.panel = new PanelWithCallbacks(
      (rule) => this.handleAddRule(rule),
      {
        onToggle: (id) => this.handleToggleRule(id),
        onDelete: (id) => this.handleDeleteRule(id)
      }
    );

    // 订阅请求变化，更新面板
    this.recorder.subscribe((requests) => {
      this.panel.updateNetworkRequests(requests);
    });
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MockMonkey {
    if (!MockMonkey.instance) {
      MockMonkey.instance = new MockMonkey();
    }
    return MockMonkey.instance;
  }

  /**
   * 启动 MockMonkey
   */
  start(): void {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * 初始化
   */
  private init(): void {
    // 启动拦截器
    this.interceptor.start();

    // 初始化面板
    this.panel.init();

    // 初始更新规则列表
    this.updateRulesList();

    console.log('[MockMonkey] 已启动! 点击右下角 🐵 按钮打开管理面板');
  }

  /**
   * 添加规则
   */
  private handleAddRule(rule: RuleFormData): void {
    this.manager.add(rule);
    this.updateRulesList();
    console.log('[MockMonkey] 规则已添加');
  }

  /**
   * 切换规则状态
   */
  private handleToggleRule(id: string): void {
    const enabled = this.manager.toggle(id);
    this.updateRulesList();
    console.log(`[MockMonkey] 规则已${enabled ? '启用' : '禁用'}`);
  }

  /**
   * 删除规则
   */
  private handleDeleteRule(id: string): void {
    if (confirm('确定要删除这条规则吗？')) {
      this.manager.remove(id);
      this.updateRulesList();
      console.log('[MockMonkey] 规则已删除');
    }
  }

  /**
   * 更新规则列表
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

// 启动
MockMonkey.getInstance().start();

// 暴露到全局（用于控制台调试）
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
    console.log('[MockMonkey] 当前规则:');
    manager.getAll().forEach((rule) => {
      console.log(`  ${rule.enabled ? '✓' : '✗'} ${rule.pattern}`, rule);
    });
  },
  listRequests: () => {
    const recorder = MockMonkey.getInstance()['recorder'] as RequestRecorder;
    console.log('[MockMonkey] 网络请求记录:');
    recorder.getRequests().forEach((req) => {
      console.log(`  ${req.mocked ? '🟢 MOCK' : '⚪ REAL'} ${req.method} ${req.url}`, req);
    });
  },
  clearRequests: () => {
    const recorder = MockMonkey.getInstance()['recorder'] as RequestRecorder;
    recorder.clear();
    console.log('[MockMonkey] 网络请求记录已清空');
  },
  manager: MockMonkey.getInstance()['manager'] as MockManager,
  recorder: MockMonkey.getInstance()['recorder'] as RequestRecorder
};
