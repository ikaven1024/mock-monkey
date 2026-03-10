import type { NetworkRequest } from '../types';

/**
 * UI 面板管理器
 */
export class Panel {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private isVisible = false;
  private networkRequests: NetworkRequest[] = [];
  private toggleButton: HTMLElement | null = null;
  private isDragging = false;
  private hasMoved = false;
  private dragStartTime = 0;
  private dragOffset = { x: 0, y: 0 };
  private buttonPosition = { x: 20, y: 20 }; // 默认位置 (right, bottom)
  private currentRules: RuleItem[] = []; // 存储当前规则列表用于导出

  // 面板拖动相关
  private panelElement: HTMLElement | null = null;
  private isPanelDragging = false;
  private panelHasMoved = false;
  private panelDragStartTime = 0;
  private panelDragOffset = { x: 0, y: 0 };
  private panelPosition: { left: number; top: number } | null = null;

  constructor(
    private onAddRule: (rule: RuleFormData) => void,
    private onCreateFromRequest?: (request: NetworkRequest) => void
  ) {
    // 从 localStorage 加载保存的位置
    this.loadButtonPosition();
  }

  /**
   * 初始化面板
   */
  init(): void {
    this.container = document.createElement('div');
    this.container.id = 'mock-monkey-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // 先添加内容和样式
    this.attachStyles();
    this.createContent();
    this.bindEvents();

    // 等待 body 存在后添加到页面
    this.ensureBody().then(() => {
      if (document.body) {
        document.body.appendChild(this.container);
        console.log('[MockMonkey] 面板容器已添加到页面');
      } else {
        console.error('[MockMonkey] document.body 仍然不存在');
      }
      // 创建切换按钮
      this.createToggleButton();
    });
  }

  /**
   * 创建容器
   */
  private createContainer(): void {
    // 已合并到 init() 方法中
  }

  /**
   * 附加样式
   */
  private attachStyles(): void {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);
  }

  /**
   * 创建面板内容
   */
  private createContent(): void {
    if (!this.shadowRoot) return;

    const panel = document.createElement('div');
    panel.className = 'mm-panel';
    // 加载保存的面板位置
    this.loadPanelPosition();
    if (this.panelPosition) {
      panel.style.left = `${this.panelPosition.left}px`;
      panel.style.top = `${this.panelPosition.top}px`;
      panel.style.transform = 'none';
    }
    this.panelElement = panel;

    panel.innerHTML = `
      <div class="mm-header" data-drag-handle="panel">
        <h2 class="mm-title">MockMonkey</h2>
        <button class="mm-close-btn" data-action="close">×</button>
      </div>

      <div class="mm-tabs">
        <button class="mm-tab mm-tab--active" data-tab="rules">规则列表</button>
        <button class="mm-tab" data-tab="add">添加规则</button>
        <button class="mm-tab" data-tab="requests">网络请求</button>
      </div>

      <div class="mm-content">
        <div class="mm-tab-content mm-tab-content--active" data-content="rules">
          <div class="mm-rules-header">
            <span class="mm-rules-count">0 条规则</span>
            <button class="mm-btn mm-btn--small" data-action="export">导出</button>
            <button class="mm-btn mm-btn--small" data-action="import">导入</button>
          </div>
          <div class="mm-rules-list" data-rules-list></div>
        </div>

        <div class="mm-tab-content" data-content="add">
          <form class="mm-form" data-action="add-rule">
            <div class="mm-form-group">
              <label class="mm-label">URL 模式 *</label>
              <input class="mm-input" name="pattern" placeholder="/api/user" required>
              <span class="mm-hint">支持字符串或正则表达式（格式：/pattern/flags）</span>
            </div>

            <div class="mm-form-group">
              <label class="mm-label">响应数据 (JSON) *</label>
              <textarea class="mm-textarea" name="response" rows="6" placeholder='{"code": 200, "data": {}}' required></textarea>
            </div>

            <div class="mm-form-row">
              <div class="mm-form-group">
                <label class="mm-label">延迟 (ms)</label>
                <input class="mm-input" type="number" name="delay" value="0" min="0">
              </div>
              <div class="mm-form-group">
                <label class="mm-label">状态码</label>
                <input class="mm-input" type="number" name="status" value="200" min="100" max="599">
              </div>
            </div>

            <div class="mm-form-actions">
              <button type="submit" class="mm-btn mm-btn--primary">添加规则</button>
            </div>
          </form>
        </div>

        <div class="mm-tab-content" data-content="requests">
          <div class="mm-rules-header">
            <span class="mm-rules-count">0 条请求</span>
            <button class="mm-btn mm-btn--small" data-action="clear-requests">清空</button>
          </div>
          <div class="mm-requests-list" data-requests-list></div>
        </div>
      </div>

      <input type="file" class="mm-hidden" data-action="import-file" accept=".json">
    `;

    this.shadowRoot.appendChild(panel);
  }

  /**
   * 创建切换按钮
   */
  private createToggleButton(): void {
    this.ensureBody().then(() => {
      const btn = document.createElement('button');
      btn.className = 'mm-toggle-btn';
      btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 1100 1100" xmlns="http://www.w3.org/2000/svg"><path d="m734,63c-5.156,8.9192 -13.25,16.4694 -21,23.1304c-22.133,19.0216 -48.605,30.9516 -77,37.0796c-40.959,8.839 -82.535,6.04 -124,8.879c-32.995,2.26 -67.021,9.977 -98,21.441c-83.504,30.9 -152.371,96.289 -190.219,176.47c-9.231,19.555 -16.304,40.942 -21.13,62c-1.589,6.933 -3.039,13.985 -4.216,21c-0.512,3.05 -0.375,7.012 -2.373,9.566c-3.383,4.322 -12.27,2.14 -17.062,2.604c-13.745,1.33 -28.11,5.742 -41,10.511c-34.217,12.662 -64.4954,37.825 -85.5725,67.319c-40.9414,57.29 -47.57838,137.153 -18.1181,201c14.1931,30.76 37.1687,57.904 64.6906,77.573c22.04,15.75 48.304,28.971 75,34.423c21.891,4.471 43.785,4.004 66,4.004c-2.139,-11.52 0,-24.236 0,-36c0,-23.361 -0.587,-46.623 -0.015,-70c0.62,-25.3 0.015,-50.692 0.015,-76c0,-15.698 -0.633,-31.499 2.261,-47c6.11,-32.735 22.747,-62.021 46.739,-84.961c50.245,-48.041 131.473,-56.451 189,-16.003c22.522,15.836 40.353,38.007 51.769,62.964c6.884,15.049 13.513,33.319 14.231,50c2.557,-4.808 2.485,-10.729 3.665,-16c1.73,-7.725 4.32,-15.564 7.03,-23c8.175,-22.426 22.88,-43.679 40.305,-59.911c43.318,-40.351 109.9,-51.404 164,-26.994c21.834,9.851 40.846,25.249 55.8,43.905c7.466,9.314 14.73,19.166 19.88,30c8.515,17.914 14.26,37.222 16.15,57c1.909,19.974 0.17,40.93 0.17,61l0,152c17.434,0 35.754,0.367 53,-2.296c41.255,-6.372 82.421,-27.304 111.91,-56.793c60.88,-60.88 79.14,-161.628 35.75,-237.911c-18.16,-31.933 -44.73,-58.912 -76.66,-77.127c-24.827,-14.165 -52.586,-21.838 -81,-23.784c-9.423,-0.645 -18.644,0.718 -28,0.911c-0.885,-20.316 -7.587,-41.937 -14.309,-61c-16.902,-47.933 -43.683,-90.994 -79.691,-127c-10.652,-10.651 -21.973,-20.415 -34,-29.475c-7.012,-5.281 -13.879,-11.021 -22,-14.525c3.931,-12.292 5.677,-25.292 7.754,-38c3.375,-20.65 6.26,-41.24 8.964,-62c1.255,-9.6271 1.022,-19.5336 3.282,-29l-2,0m-350,511c1.644,8.855 1,18.023 1,27l0,44l0,139c31.683,0 64.477,-3.984 96,0l0,-210l-97,0m225,210l71,0l17,0c2.236,-0.005 5.508,0.468 7.397,-1.028c3.47,-2.748 0.941,-10.341 0.692,-13.972c-0.837,-12.224 -0.089,-24.746 -0.089,-37l0,-158l-70,0l-18,0c-2.218,0.005 -5.528,-0.478 -7.393,1.028c-2.838,2.291 -0.623,9.748 -0.608,12.972c0.061,12.666 0.001,25.334 0.001,38l0,158z" fill="#6b0202"/></svg>`;
      btn.title = 'MockMonkey';
      btn.style.cssText = `position: fixed; bottom: ${this.buttonPosition.y}px; right: ${this.buttonPosition.x}px; width: 50px; height: 50px; border-radius: 50%; background: #f5f5f5; border: none; cursor: move; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); z-index: 999998; display: flex; align-items: center; justify-content: center; padding: 9px; user-select: none;`;

      // 保存按钮引用
      this.toggleButton = btn;

      // 绑定点击事件
      btn.addEventListener('click', (e) => {
        // 如果正在拖动或刚结束拖动，不触发点击
        if (this.isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        console.log('[MockMonkey] 按钮被点击');
        this.toggle();
      });

      // 绑定拖动事件
      this.bindDragEvents(btn);

      document.body!.appendChild(btn);
      console.log('[MockMonkey] 切换按钮已添加到页面');
    });
  }

  /**
   * 确保 body 元素存在
   */
  private ensureBody(): Promise<void> {
    return new Promise((resolve) => {
      if (document.body) {
        resolve();
      } else {
        const checkBody = () => {
          if (document.body) {
            resolve();
          } else {
            setTimeout(checkBody, 10);
          }
        };
        checkBody();
      }
    });
  }

  /**
   * 绑定拖动事件
   */
  private bindDragEvents(btn: HTMLElement): void {
    btn.addEventListener('mousedown', (e) => {
      // 只响应左键
      if (e.button !== 0) return;

      this.dragStartTime = Date.now();
      this.hasMoved = false;
      this.isDragging = false;

      const rect = btn.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      // 添加全局事件监听
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);

      // 移除过渡效果以提高拖动性能
      btn.style.transition = 'none';
    });
  }

  /**
   * 处理鼠标移动（拖动）
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.toggleButton) return;

    const btn = this.toggleButton;
    const rect = btn.getBoundingClientRect();

    // 计算新位置
    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;

    // 检测是否真正移动了
    const currentRight = window.innerWidth - rect.left - rect.width;
    const currentBottom = window.innerHeight - rect.top - rect.height;
    const newRight = window.innerWidth - newX - rect.width;
    const newBottom = window.innerHeight - newY - rect.height;

    if (Math.abs(newRight - currentRight) > 3 || Math.abs(newBottom - currentBottom) > 3) {
      this.hasMoved = true;
      this.isDragging = true;
    }

    // 边界限制
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // 更新位置（使用 left/top 而不是 right/bottom 以便更直观的拖动）
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
  };

  /**
   * 处理鼠标松开
   */
  private handleMouseUp = (): void => {
    if (!this.toggleButton) return;

    const btn = this.toggleButton;

    // 恢复过渡效果
    btn.style.transition = 'all 0.2s';

    // 移除全局事件监听
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // 延迟重置拖动状态，避免触发点击事件
    setTimeout(() => {
      this.isDragging = false;
    }, 100);

    // 保存位置到 localStorage
    this.saveButtonPosition();
  };

  /**
   * 保存按钮位置到 localStorage
   */
  private saveButtonPosition(): void {
    if (!this.toggleButton) return;

    const rect = this.toggleButton.getBoundingClientRect();
    const right = window.innerWidth - rect.left - rect.width;
    const bottom = window.innerHeight - rect.top - rect.height;

    this.buttonPosition = { x: Math.round(right), y: Math.round(bottom) };

    try {
      localStorage.setItem('mock-monkey-button-position', JSON.stringify(this.buttonPosition));
      console.log('[MockMonkey] 按钮位置已保存:', this.buttonPosition);
    } catch (e) {
      console.warn('[MockMonkey] 保存按钮位置失败:', e);
    }
  }

  /**
   * 从 localStorage 加载按钮位置
   */
  private loadButtonPosition(): void {
    try {
      const saved = localStorage.getItem('mock-monkey-button-position');
      if (saved) {
        const position = JSON.parse(saved) as { x: number; y: number };
        // 验证位置有效性
        if (
          typeof position.x === 'number' &&
          typeof position.y === 'number' &&
          position.x >= 0 &&
          position.y >= 0
        ) {
          this.buttonPosition = position;
          console.log('[MockMonkey] 按钮位置已加载:', this.buttonPosition);
        }
      }
    } catch (e) {
      console.warn('[MockMonkey] 加载按钮位置失败:', e);
    }
  }

  /**
   * 绑定面板拖动事件
   */
  private bindPanelDragEvents(): void {
    if (!this.shadowRoot) return;

    const dragHandle = this.shadowRoot.querySelector('[data-drag-handle="panel"]');
    if (!dragHandle) return;

    dragHandle.addEventListener('mousedown', (e) => {
      // 只响应左键
      if (e.button !== 0) return;

      // 如果点击的是关闭按钮，不触发拖动
      if ((e.target as HTMLElement).closest('[data-action="close"]')) return;

      this.panelDragStartTime = Date.now();
      this.panelHasMoved = false;
      this.isPanelDragging = false;

      const panel = this.panelElement;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      this.panelDragOffset.x = e.clientX - rect.left;
      this.panelDragOffset.y = e.clientY - rect.top;

      // 添加全局事件监听
      document.addEventListener('mousemove', this.handlePanelMouseMove);
      document.addEventListener('mouseup', this.handlePanelMouseUp);

      // 移除过渡效果以提高拖动性能
      panel.style.transition = 'none';

      // 阻止文本选择
      e.preventDefault();
    });
  }

  /**
   * 处理面板鼠标移动（拖动）
   */
  private handlePanelMouseMove = (e: MouseEvent): void => {
    if (!this.panelElement) return;

    const panel = this.panelElement;

    // 计算新位置
    let newX = e.clientX - this.panelDragOffset.x;
    let newY = e.clientY - this.panelDragOffset.y;

    // 检测是否真正移动了
    const rect = panel.getBoundingClientRect();
    if (Math.abs(newX - rect.left) > 3 || Math.abs(newY - rect.top) > 3) {
      this.panelHasMoved = true;
      this.isPanelDragging = true;
    }

    // 边界限制
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // 更新位置
    panel.style.left = `${newX}px`;
    panel.style.top = `${newY}px`;
    panel.style.transform = 'none';

    // 更新保存的位置
    this.panelPosition = { left: newX, top: newY };
  };

  /**
   * 处理面板鼠标松开
   */
  private handlePanelMouseUp = (): void => {
    if (!this.panelElement) return;

    const panel = this.panelElement;

    // 恢复过渡效果
    panel.style.transition = '';

    // 移除全局事件监听
    document.removeEventListener('mousemove', this.handlePanelMouseMove);
    document.removeEventListener('mouseup', this.handlePanelMouseUp);

    // 延迟重置拖动状态
    setTimeout(() => {
      this.isPanelDragging = false;
    }, 100);

    // 保存位置到 localStorage
    this.savePanelPosition();
  };

  /**
   * 保存面板位置到 localStorage
   */
  private savePanelPosition(): void {
    if (!this.panelPosition) return;

    try {
      localStorage.setItem('mock-monkey-panel-position', JSON.stringify(this.panelPosition));
      console.log('[MockMonkey] 面板位置已保存:', this.panelPosition);
    } catch (e) {
      console.warn('[MockMonkey] 保存面板位置失败:', e);
    }
  }

  /**
   * 从 localStorage 加载面板位置
   */
  private loadPanelPosition(): void {
    try {
      const saved = localStorage.getItem('mock-monkey-panel-position');
      if (saved) {
        const position = JSON.parse(saved) as { left: number; top: number };
        // 验证位置有效性
        if (
          typeof position.left === 'number' &&
          typeof position.top === 'number' &&
          position.left >= 0 &&
          position.top >= 0
        ) {
          this.panelPosition = position;
          console.log('[MockMonkey] 面板位置已加载:', this.panelPosition);
        }
      }
    } catch (e) {
      console.warn('[MockMonkey] 加载面板位置失败:', e);
    }
  }

  /**
   * 导出规则
   */
  private exportRules(): void {
    try {
      // 将规则序列化为可导入的格式
      const exportData = this.currentRules.map((rule) => ({
        pattern: rule.patternStr,
        response: rule.response,
        enabled: rule.enabled,
        delay: rule.delay,
        status: rule.status
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mock-monkey-rules-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('[MockMonkey] 规则导出成功:', exportData.length, '条');
    } catch (e) {
      console.error('[MockMonkey] 导出规则失败:', e);
    }
  }

  /**
   * 导入规则
   */
  private importRules(): void {
    const fileInput = this.shadowRoot?.querySelector('[data-action="import-file"]') as HTMLInputElement;
    if (fileInput) {
      // 重置 value，确保选择相同文件时也能触发 change 事件
      fileInput.value = '';
      fileInput.click();
    }
  }

  /**
   * 处理导入文件
   */
  private handleImportFile(e: Event): void {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedRules = JSON.parse(content) as Array<{
          pattern: string;
          response: unknown;
          enabled?: boolean;
          delay?: number;
          status?: number;
        }>;

        if (!Array.isArray(importedRules)) {
          throw new Error('导入文件格式错误：必须是数组');
        }

        // 触发导入回调，让外部处理规则导入
        let successCount = 0;
        importedRules.forEach((ruleData) => {
          // 解析 pattern
          let parsedPattern: string | RegExp = ruleData.pattern;
          if (ruleData.pattern.startsWith('/')) {
            try {
              const match = ruleData.pattern.match(/^\/(.+)\/([gimuy]*)$/);
              if (match) {
                parsedPattern = new RegExp(match[1], match[2]);
              }
            } catch (err) {
              console.warn('[MockMonkey] 跳过无效规则:', ruleData.pattern);
              return;
            }
          }

          this.onAddRule({
            pattern: parsedPattern,
            response: ruleData.response,
            options: {
              delay: ruleData.delay ?? 0,
              status: ruleData.status ?? 200
            }
          });
          successCount++;
        });

        console.log(`[MockMonkey] 成功导入 ${successCount} 条规则`);

        // 重置 input
        input.value = '';
      } catch (e) {
        console.error('[MockMonkey] 导入规则失败:', e);
        alert('导入失败：' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // 关闭按钮
    this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener('click', () => this.hide());

    // Tab 切换
    this.shadowRoot.querySelectorAll('.mm-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) this.switchTab(tabName);
      });
    });

    // 清空网络请求
    this.shadowRoot.querySelector('[data-action="clear-requests"]')?.addEventListener('click', () => {
      this.updateNetworkRequests([]);
    });

    // 导出规则
    this.shadowRoot.querySelector('[data-action="export"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.exportRules();
      // 移除焦点，防止键盘事件重复触发
      (e.currentTarget as HTMLElement).blur();
    });

    // 导入规则
    this.shadowRoot.querySelector('[data-action="import"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.importRules();
      (e.currentTarget as HTMLElement).blur();
    });

    // 导入文件选择
    this.shadowRoot.querySelector('[data-action="import-file"]')?.addEventListener('change', (e) => {
      this.handleImportFile(e);
    });

    // 添加规则表单
    this.shadowRoot.querySelector('[data-action="add-rule"]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddRule(e);
    });

    // 阻止面板内的滚轮事件传播到主页面
    const panel = this.shadowRoot.querySelector('.mm-panel');
    if (panel) {
      panel.addEventListener('wheel', (e: WheelEvent) => {
        e.stopPropagation();
      }, { capture: true, passive: true });
    }

    // 绑定面板拖动事件
    this.bindPanelDragEvents();
  }

  /**
   * 切换 Tab
   */
  private switchTab(tabName: string): void {
    if (!this.shadowRoot) return;

    // 更新 tab 样式
    this.shadowRoot.querySelectorAll('.mm-tab').forEach((tab) => {
      const isActive = (tab as HTMLElement).dataset.tab === tabName;
      tab.classList.toggle('mm-tab--active', isActive);
    });

    // 更新内容显示
    this.shadowRoot.querySelectorAll('.mm-tab-content').forEach((content) => {
      const isActive = (content as HTMLElement).dataset.content === tabName;
      content.classList.toggle('mm-tab-content--active', isActive);
    });
  }

  /**
   * 处理添加规则
   */
  private handleAddRule(e: Event): void {
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const pattern = formData.get('pattern') as string;
    const responseStr = formData.get('response') as string;
    const delay = parseInt(formData.get('delay') as string) || 0;
    const status = parseInt(formData.get('status') as string) || 200;

    // 解析 pattern
    let parsedPattern: string | RegExp = pattern;
    if (pattern.startsWith('/')) {
      try {
        const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
        if (match) {
          parsedPattern = new RegExp(match[1], match[2]);
        }
      } catch (err) {
        alert('正则表达式格式错误');
        return;
      }
    }

    // 解析响应
    let response: unknown;
    try {
      response = JSON.parse(responseStr);
    } catch (err) {
      alert('响应数据 JSON 格式错误');
      return;
    }

    this.onAddRule({
      pattern: parsedPattern,
      response,
      options: { delay, status }
    });

    form.reset();
    this.switchTab('rules');
  }

  /**
   * 更新规则列表
   */
  updateRules(rules: RuleItem[]): void {
    // 保存当前规则用于导出
    this.currentRules = rules;

    if (!this.shadowRoot) return;

    const listContainer = this.shadowRoot.querySelector('[data-rules-list]');
    const countEl = this.shadowRoot.querySelector('.mm-rules-count');
    if (!listContainer) return;

    if (countEl) {
      countEl.textContent = `${rules.length} 条规则`;
    }

    if (rules.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>暂无 Mock 规则</p>
          <p class="mm-hint">点击<span class="mm-link" data-action="go-to-add">"添加规则"</span>开始配置</p>
        </div>
      `;
      // 绑定跳转事件
      listContainer.querySelector('[data-action="go-to-add"]')?.addEventListener('click', () => {
        this.switchTab('add');
      });
      return;
    }

    listContainer.innerHTML = rules
      .map(
        (rule) => `
      <div class="mm-rule-item ${rule.enabled ? '' : 'mm-rule-item--disabled'}">
        <div class="mm-rule-header">
          <span class="mm-rule-pattern">${this.escapeHtml(rule.patternStr)}</span>
          <div class="mm-rule-actions">
            <button class="mm-btn-icon" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? '禁用' : '启用'}">
              ${rule.enabled ? '🟢' : '⚫'}
            </button>
            <button class="mm-btn-icon" data-action="delete" data-id="${rule.id}" title="删除">🗑️</button>
          </div>
        </div>
        <div class="mm-rule-meta">
          <span>状态: ${rule.status}</span>
          <span>延迟: ${rule.delay}ms</span>
        </div>
        <pre class="mm-rule-response">${this.escapeHtml(JSON.stringify(rule.response, null, 2))}</pre>
      </div>
    `
      )
      .join('');

    // 绑定规则项事件
    listContainer.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) this.onToggleRule(id);
      });
    });

    listContainer.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) this.onDeleteRule(id);
      });
    });
  }

  /**
   * 更新网络请求列表
   */
  updateNetworkRequests(requests: NetworkRequest[]): void {
    this.networkRequests = requests;
    // 存储请求用于快速创建 mock
    (this as any).requestsById = new Map(requests.map(r => [r.id, r]));
    if (!this.shadowRoot) return;

    const listContainer = this.shadowRoot.querySelector('[data-requests-list]');
    const countEl = this.shadowRoot.querySelector('[data-content="requests"] .mm-rules-count');
    if (!listContainer) return;

    if (countEl) {
      countEl.textContent = `${requests.length} 条请求`;
    }

    if (requests.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>暂无网络请求</p>
          <p class="mm-hint">发起请求后会在此显示</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = requests
      .map(
        (req) => `
      <div class="mm-request-item ${req.mocked ? 'mm-request-item--mocked' : ''}" data-request-id="${req.id}">
        <div class="mm-request-header">
          <span class="mm-request-method" data-method="${req.method}">${req.method}</span>
          <span class="mm-request-url">${this.escapeHtml(req.url)}</span>
          <span class="mm-request-type">${req.type}</span>
          ${req.mocked ? '<span class="mm-badge mm-badge--mocked">MOCK</span>' : ''}
        </div>
        <div class="mm-request-meta">
          <span class="mm-request-status" data-status="${req.status ? Math.floor(req.status / 100).toString() : ''}">${req.status ?? 'PENDING'}</span>
          <span class="mm-request-duration">${req.duration ? `${req.duration}ms` : '-'}</span>
          <span class="mm-request-time">${new Date(req.timestamp).toLocaleTimeString()}</span>
          <button class="mm-btn mm-btn--small mm-btn-create-mock" data-action="create-mock" data-request-id="${req.id}" title="创建 Mock 规则">
            + Mock
          </button>
        </div>
        ${req.response !== undefined ? `
          <details class="mm-request-details">
            <summary class="mm-request-summary">响应数据</summary>
            <pre class="mm-request-response">${this.escapeHtml(JSON.stringify(req.response, null, 2))}</pre>
          </details>
        ` : ''}
      </div>
    `
      )
      .join('');

    // 绑定创建 mock 按钮事件
    listContainer.querySelectorAll('[data-action="create-mock"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.requestId;
        if (id) this.handleCreateFromRequest(id);
      });
    });
  }

  /**
   * 显示面板
   */
  show(): void {
    console.log('[MockMonkey] show() 被调用', { container: !!this.container, shadowRoot: !!this.shadowRoot });
    if (this.container) {
      this.isVisible = true;
      this.container.classList.add('mm-panel--visible');
      console.log('[MockMonkey] 已添加 mm-panel--visible 类');
      // 使用 shadowRoot 查询面板元素
      const panel = this.shadowRoot?.querySelector('.mm-panel') as HTMLElement;
      if (panel) {
        panel.style.display = 'flex';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        console.log('[MockMonkey] 面板样式已应用');
      } else {
        console.error('[MockMonkey] 找不到 .mm-panel 元素');
      }
    }
  }

  /**
   * 隐藏面板
   */
  hide(): void {
    console.log('[MockMonkey] hide() 被调用');
    if (this.container) {
      this.isVisible = false;
      this.container.classList.remove('mm-panel--visible');
      const panel = this.shadowRoot?.querySelector('.mm-panel') as HTMLElement;
      if (panel) {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
      }
    }
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    console.log('[MockMonkey] toggle() 被调用', { isVisible: this.isVisible });
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 从网络请求创建 Mock 规则
   */
  private handleCreateFromRequest(requestId: string): void {
    const requestsById = (this as any).requestsById as Map<string, NetworkRequest>;
    const request = requestsById?.get(requestId);
    if (!request) return;

    // 触发回调或直接填充表单
    if (this.onCreateFromRequest) {
      this.onCreateFromRequest(request);
    }

    // 填充表单
    if (!this.shadowRoot) return;
    const patternInput = this.shadowRoot.querySelector('[name="pattern"]') as HTMLInputElement;
    const responseInput = this.shadowRoot.querySelector('[name="response"]') as HTMLTextAreaElement;
    const statusInput = this.shadowRoot.querySelector('[name="status"]') as HTMLInputElement;

    if (patternInput) {
      patternInput.value = request.url;
    }
    if (responseInput && request.response !== undefined) {
      responseInput.value = JSON.stringify(request.response, null, 2);
    }
    if (statusInput && request.status) {
      statusInput.value = request.status.toString();
    }

    // 切换到添加规则 tab
    this.switchTab('add');
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 获取样式
   */
  private getStyles(): string {
    return `
      :host {
        all: initial;
      }

      .mm-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 90vw;
        max-height: 80vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #333;
        z-index: 999999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }

      .mm-panel--visible {
        opacity: 1;
        pointer-events: auto;
      }

      .mm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        cursor: move;
        user-select: none;
      }

      .mm-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .mm-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mm-close-btn:hover {
        background: #f5f5f5;
      }

      .mm-tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
      }

      .mm-tab {
        flex: 1;
        padding: 12px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s;
      }

      .mm-tab:hover {
        color: #333;
        background: #fafafa;
      }

      .mm-tab--active {
        color: #4f46e5;
        border-bottom-color: #4f46e5;
      }

      .mm-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .mm-tab-content {
        display: none;
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        overscroll-behavior: contain;
      }

      .mm-tab-content--active {
        display: block;
      }

      .mm-rules-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .mm-rules-count {
        font-weight: 500;
        color: #666;
      }

      .mm-rules-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mm-empty {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }

      .mm-rule-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.2s;
      }

      .mm-rule-item:hover {
        border-color: #d1d5db;
      }

      .mm-rule-item--disabled {
        opacity: 0.6;
      }

      .mm-rule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .mm-rule-pattern {
        font-weight: 500;
        color: #4f46e5;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }

      .mm-rule-actions {
        display: flex;
        gap: 4px;
      }

      .mm-rule-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
      }

      .mm-rule-response {
        margin: 0;
        padding: 8px 12px;
        background: #fff;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #374151;
        overflow-x: auto;
        max-height: 150px;
        overflow-y: auto;
      }

      .mm-form-group {
        margin-bottom: 16px;
      }

      .mm-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
      }

      .mm-input,
      .mm-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      .mm-input:focus,
      .mm-textarea:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .mm-textarea {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        resize: vertical;
      }

      .mm-hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #6b7280;
      }

      .mm-link {
        color: #4f46e5;
        cursor: pointer;
        text-decoration: underline;
      }

      .mm-link:hover {
        color: #4338ca;
      }

      .mm-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .mm-form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }

      .mm-btn {
        padding: 10px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mm-btn:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .mm-btn--primary {
        background: #4f46e5;
        color: #fff;
        border-color: #4f46e5;
      }

      .mm-btn--primary:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .mm-btn--small {
        padding: 6px 12px;
        font-size: 12px;
      }

      .mm-btn-create-mock {
        margin-left: auto;
        padding: 4px 10px;
        font-size: 11px;
        background: #4f46e5;
        color: #fff;
        border-color: #4f46e5;
        white-space: nowrap;
      }

      .mm-btn-create-mock:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .mm-btn-icon {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .mm-btn-icon:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.05);
      }

      .mm-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #4f46e5;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        z-index: 999998;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .mm-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .mm-requests-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .mm-request-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        transition: all 0.2s;
      }

      .mm-request-item:hover {
        border-color: #d1d5db;
      }

      .mm-request-item--mocked {
        background: #f0fdf4;
        border-color: #86efac;
      }

      .mm-request-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        flex-wrap: wrap;
      }

      .mm-request-method {
        font-weight: 600;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e5e7eb;
        color: #374151;
        min-width: 45px;
        text-align: center;
      }

      .mm-request-method[data-method="GET"] {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .mm-request-method[data-method="POST"] {
        background: #dcfce7;
        color: #16a34a;
      }

      .mm-request-method[data-method="PUT"] {
        background: #fef3c7;
        color: #d97706;
      }

      .mm-request-method[data-method="DELETE"] {
        background: #fee2e2;
        color: #dc2626;
      }

      .mm-request-url {
        flex: 1;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        word-break: break-all;
        color: #374151;
      }

      .mm-request-type {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e5e7eb;
        color: #6b7280;
        font-weight: 500;
      }

      .mm-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }

      .mm-badge--mocked {
        background: #22c55e;
        color: #fff;
      }

      .mm-request-meta {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: #6b7280;
      }

      .mm-request-status {
        font-weight: 500;
      }

      .mm-request-status[data-status="2"] {
        color: #16a34a;
      }

      .mm-request-status[data-status="3"] {
        color: #d97706;
      }

      .mm-request-status[data-status="4"],
      .mm-request-status[data-status="5"] {
        color: #dc2626;
      }

      .mm-request-duration {
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .mm-request-details {
        margin-top: 8px;
      }

      .mm-request-summary {
        cursor: pointer;
        font-size: 11px;
        color: #6b7280;
        user-select: none;
        padding: 4px 0;
      }

      .mm-request-summary:hover {
        color: #374151;
      }

      .mm-request-response {
        margin: 4px 0 0 0;
        padding: 8px 12px;
        background: #fff;
        border-radius: 4px;
        font-size: 11px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #374151;
        overflow-x: auto;
        max-height: 200px;
        overflow-y: auto;
      }

      .mm-hidden {
        display: none;
      }
    `;
  }
}

/**
 * 规则表单数据
 */
export interface RuleFormData {
  pattern: string | RegExp;
  response: unknown;
  options: {
    delay: number;
    status: number;
  };
}

/**
 * 规则列表项
 */
export interface RuleItem {
  id: string;
  patternStr: string;
  response: unknown;
  enabled: boolean;
  delay: number;
  status: number;
}

/**
 * 规则操作回调
 */
export interface RuleCallbacks {
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// 扩展 Panel 类以支持回调
export class PanelWithCallbacks extends Panel {
  constructor(
    onAddRule: (rule: RuleFormData) => void,
    private callbacks: RuleCallbacks,
    onCreateFromRequest?: (request: NetworkRequest) => void
  ) {
    super(onAddRule, onCreateFromRequest);
  }

  onToggleRule(id: string): void {
    this.callbacks.onToggle(id);
  }

  onDeleteRule(id: string): void {
    this.callbacks.onDelete(id);
  }
}
