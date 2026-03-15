import type { NetworkRequest, MockMethod, CreateMockMethodParams, MethodContext } from '../types';
import { I18n } from '../i18n';

// Re-export types for convenience
export type { MockMethod, CreateMockMethodParams, MethodContext };

/**
 * UI panel manager
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
  private buttonPosition = { x: 20, y: 20 }; // Default position (right, bottom)
  private currentRules: RuleItem[] = []; // Store current rules list for export

  // Panel drag related
  private panelElement: HTMLElement | null = null;
  private isPanelDragging = false;
  private panelHasMoved = false;
  private panelDragStartTime = 0;
  private panelDragOffset = { x: 0, y: 0 };
  private panelPosition: { left: number; top: number } | null = null;
  private editingRuleId: string | null = null; // Currently editing rule ID
  private i18n: I18n; // i18n instance

  // Search state
  private rulesSearchQuery = '';
  private requestsSearchQuery = '';

  // Methods state
  private currentMethods: MockMethod[] = [];
  private editingMethodId: string | null = null;

  constructor(
    private onAddRule: (rule: RuleFormData) => void,
    private onUpdateRule?: (id: string, rule: RuleFormData) => void,
    private onCreateFromRequest?: (request: NetworkRequest) => void,
    private onAddMethod?: (method: CreateMockMethodParams) => void,
    private onUpdateMethod?: (id: string, method: CreateMockMethodParams) => void,
    private onDeleteMethod?: (id: string) => void,
    private onToggleMethod?: (id: string) => void
  ) {
    // Initialize i18n (singleton)
    this.i18n = I18n.getInstance();
    // Load saved position from localStorage
    this.loadButtonPosition();
  }

  /**
   * Initialize panel
   */
  init(): void {
    this.container = document.createElement('div');
    this.container.id = 'mock-monkey-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add content and styles first
    this.attachStyles();
    this.createContent();
    this.bindEvents();

    // Wait for body to exist before adding to page
    this.ensureBody().then(() => {
      if (document.body && this.container) {
        document.body.appendChild(this.container);
        console.log('[MockMonkey] 面板容器已添加到页面');
      } else {
        console.error('[MockMonkey] document.body 仍然不存在');
      }
      // Create toggle button
      this.createToggleButton();
    });
  }

  /**
   * Create container
   */
  private createContainer(): void {
    // Merged into init() method
  }

  /**
   * Attach styles
   */
  private attachStyles(): void {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);
  }

  /**
   * Create panel content
   */
  private createContent(): void {
    if (!this.shadowRoot) return;

    const panel = document.createElement('div');
    panel.className = 'mm-panel';
    // Load saved panel position
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
        <div class="mm-header-actions">
          <button class="mm-lang-btn" data-action="toggle-lang" title="${this.i18n.getLanguage() === 'zh' ? 'Switch to English' : '切换中文'}">${this.i18n.getLanguage() === 'zh' ? 'EN' : '中'}</button>
          <button class="mm-close-btn" data-action="close">×</button>
        </div>
      </div>

      <div class="mm-tabs">
        <button class="mm-tab mm-tab--active" data-tab="rules">${this.i18n.t('tabs.rules')}</button>
        <button class="mm-tab" data-tab="add" data-tab-label>${this.i18n.t('tabs.add')}</button>
        <button class="mm-tab" data-tab="requests">${this.i18n.t('tabs.network')}</button>
        <button class="mm-tab" data-tab="methods">
          ${this.i18n.t('tabs.methods')}
          <span class="mm-tab-alpha">ALPHA</span>
        </button>
      </div>

      <div class="mm-content">
        <div class="mm-tab-content mm-tab-content--active" data-content="rules">
          <div class="mm-toolbar">
            <span class="mm-count">0 ${this.i18n.t('rules.count')}</span>
            <div class="mm-toolbar-actions">
              <div class="mm-search-wrapper">
                <svg class="mm-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input class="mm-search-input" type="text" data-search="rules" placeholder="${this.i18n.t('rules.searchPlaceholder')}">
              </div>
              <button class="mm-btn mm-btn--small" data-action="export">${this.i18n.t('rules.export')}</button>
              <button class="mm-btn mm-btn--small" data-action="import">${this.i18n.t('rules.import')}</button>
            </div>
          </div>
          <div class="mm-rules-list" data-rules-list></div>
        </div>

        <div class="mm-tab-content" data-content="add">
          <form class="mm-form" data-action="add-rule">
            <input type="hidden" name="editing-id" value="">
            <div class="mm-form-group">
              <label class="mm-label">${this.i18n.t('form.urlPattern')}</label>
              <input class="mm-input" name="pattern" placeholder="/api/user" required>
              <span class="mm-hint">${this.i18n.t('form.urlPatternHint')}</span>
            </div>

            <div class="mm-form-group">
              <label class="mm-label">${this.i18n.t('form.responseData')}</label>
              <textarea class="mm-textarea" name="response" rows="6" placeholder='${this.i18n.t('form.responseDataPlaceholder')}' required></textarea>
            </div>

            <div class="mm-form-row">
              <div class="mm-form-group">
                <label class="mm-label">${this.i18n.t('form.delay')}</label>
                <input class="mm-input" type="number" name="delay" value="0" min="0">
              </div>
              <div class="mm-form-group">
                <label class="mm-label">${this.i18n.t('form.status')}</label>
                <input class="mm-input" type="number" name="status" value="200" min="100" max="599">
              </div>
            </div>

            <div class="mm-form-actions">
              <button type="button" class="mm-btn" data-action="cancel-edit" style="display: none;">${this.i18n.t('form.cancelEdit')}</button>
              <button type="submit" class="mm-btn mm-btn--primary" data-submit-btn>${this.i18n.t('form.addRule')}</button>
            </div>
          </form>
        </div>

        <div class="mm-tab-content" data-content="requests">
          <div class="mm-toolbar">
            <span class="mm-count">0 ${this.i18n.t('network.count')}</span>
            <div class="mm-toolbar-actions">
              <div class="mm-search-wrapper">
                <svg class="mm-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input class="mm-search-input" type="text" data-search="requests" placeholder="${this.i18n.t('network.searchPlaceholder')}">
              </div>
              <button class="mm-btn mm-btn--small" data-action="clear-requests">${this.i18n.t('network.clear')}</button>
            </div>
          </div>
          <div class="mm-requests-list" data-requests-list></div>
        </div>

        <div class="mm-tab-content" data-content="methods">
          <div class="mm-methods-container">
            <div class="mm-methods-list-section">
              <div class="mm-toolbar">
                <span class="mm-count">0 ${this.i18n.t('methods.count')}</span>
                <button class="mm-btn mm-btn--small mm-btn--primary" data-action="add-method">${this.i18n.t('methods.add')}</button>
              </div>
              <div class="mm-methods-list" data-methods-list></div>
            </div>
            <div class="mm-method-form-section" style="display: none;">
              <form class="mm-form" data-action="method-form">
                <input type="hidden" name="editing-id" value="">

                <div class="mm-form-group">
                  <label class="mm-label">${this.i18n.t('methods.name')}</label>
                  <input class="mm-input" type="text" name="name" placeholder="${this.i18n.t('methods.namePlaceholder')}" required>
                </div>

                <div class="mm-form-group">
                  <label class="mm-label">${this.i18n.t('methods.description')}</label>
                  <input class="mm-input" type="text" name="description" placeholder="${this.i18n.t('methods.descriptionPlaceholder')}">
                </div>

                <div class="mm-form-group">
                  <label class="mm-label">${this.i18n.t('methods.code')}</label>
                  <textarea class="mm-textarea" name="code" placeholder="${this.i18n.t('methods.codePlaceholder')}" required rows="8"></textarea>
                  <details class="mm-context-help">
                    <summary class="mm-context-help-title">${this.i18n.t('methods.contextHelp')}</summary>
                    <code class="mm-code">${this.i18n.t('methods.contextUrl')}</code><br>
                    <code class="mm-code">${this.i18n.t('methods.contextMethod')}</code><br>
                    <code class="mm-code">${this.i18n.t('methods.contextBody')}</code>
                  </details>
                </div>

                <div class="mm-form-actions">
                  <button type="button" class="mm-btn" data-action="cancel-method">${this.i18n.t('methods.cancel')}</button>
                  <button type="submit" class="mm-btn mm-btn--primary" data-submit-method-btn>${this.i18n.t('methods.save')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <input type="file" class="mm-hidden" data-action="import-file" accept=".json">
    `;

    this.shadowRoot.appendChild(panel);
  }

  /**
   * Create toggle button
   */
  private createToggleButton(): void {
    this.ensureBody().then(() => {
      const btn = document.createElement('button');
      btn.className = 'mm-toggle-btn';
      btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 1100 1100" xmlns="http://www.w3.org/2000/svg"><path d="m734,63c-5.156,8.9192 -13.25,16.4694 -21,23.1304c-22.133,19.0216 -48.605,30.9516 -77,37.0796c-40.959,8.839 -82.535,6.04 -124,8.879c-32.995,2.26 -67.021,9.977 -98,21.441c-83.504,30.9 -152.371,96.289 -190.219,176.47c-9.231,19.555 -16.304,40.942 -21.13,62c-1.589,6.933 -3.039,13.985 -4.216,21c-0.512,3.05 -0.375,7.012 -2.373,9.566c-3.383,4.322 -12.27,2.14 -17.062,2.604c-13.745,1.33 -28.11,5.742 -41,10.511c-34.217,12.662 -64.4954,37.825 -85.5725,67.319c-40.9414,57.29 -47.57838,137.153 -18.1181,201c14.1931,30.76 37.1687,57.904 64.6906,77.573c22.04,15.75 48.304,28.971 75,34.423c21.891,4.471 43.785,4.004 66,4.004c-2.139,-11.52 0,-24.236 0,-36c0,-23.361 -0.587,-46.623 -0.015,-70c0.62,-25.3 0.015,-50.692 0.015,-76c0,-15.698 -0.633,-31.499 2.261,-47c6.11,-32.735 22.747,-62.021 46.739,-84.961c50.245,-48.041 131.473,-56.451 189,-16.003c22.522,15.836 40.353,38.007 51.769,62.964c6.884,15.049 13.513,33.319 14.231,50c2.557,-4.808 2.485,-10.729 3.665,-16c1.73,-7.725 4.32,-15.564 7.03,-23c8.175,-22.426 22.88,-43.679 40.305,-59.911c43.318,-40.351 109.9,-51.404 164,-26.994c21.834,9.851 40.846,25.249 55.8,43.905c7.466,9.314 14.73,19.166 19.88,30c8.515,17.914 14.26,37.222 16.15,57c1.909,19.974 0.17,40.93 0.17,61l0,152c17.434,0 35.754,0.367 53,-2.296c41.255,-6.372 82.421,-27.304 111.91,-56.793c60.88,-60.88 79.14,-161.628 35.75,-237.911c-18.16,-31.933 -44.73,-58.912 -76.66,-77.127c-24.827,-14.165 -52.586,-21.838 -81,-23.784c-9.423,-0.645 -18.644,0.718 -28,0.911c-0.885,-20.316 -7.587,-41.937 -14.309,-61c-16.902,-47.933 -43.683,-90.994 -79.691,-127c-10.652,-10.651 -21.973,-20.415 -34,-29.475c-7.012,-5.281 -13.879,-11.021 -22,-14.525c3.931,-12.292 5.677,-25.292 7.754,-38c3.375,-20.65 6.26,-41.24 8.964,-62c1.255,-9.6271 1.022,-19.5336 3.282,-29l-2,0m-350,511c1.644,8.855 1,18.023 1,27l0,44l0,139c31.683,0 64.477,-3.984 96,0l0,-210l-97,0m225,210l71,0l17,0c2.236,-0.005 5.508,0.468 7.397,-1.028c3.47,-2.748 0.941,-10.341 0.692,-13.972c-0.837,-12.224 -0.089,-24.746 -0.089,-37l0,-158l-70,0l-18,0c-2.218,0.005 -5.528,-0.478 -7.393,1.028c-2.838,2.291 -0.623,9.748 -0.608,12.972c0.061,12.666 0.001,25.334 0.001,38l0,158z" fill="#8D5524"/></svg>`;
      btn.title = 'MockMonkey';
      btn.style.cssText = `position: fixed; bottom: ${this.buttonPosition.y}px; right: ${this.buttonPosition.x}px; width: 50px; height: 50px; border-radius: 50%; background: #f5f5f5; border: none; cursor: move; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); z-index: 999998; display: flex; align-items: center; justify-content: center; padding: 9px; user-select: none;`;

      // Save button reference
      this.toggleButton = btn;

      // Bind click event
      btn.addEventListener('click', (e) => {
        // If dragging or just finished dragging, don't trigger click
        if (this.isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        console.log('[MockMonkey] 按钮被点击');
        this.toggle();
      });

      // Bind drag events
      this.bindDragEvents(btn);

      document.body!.appendChild(btn);
      console.log('[MockMonkey] 切换按钮已添加到页面');
    });
  }

  /**
   * Ensure body element exists
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
   * Bind drag events
   */
  private bindDragEvents(btn: HTMLElement): void {
    btn.addEventListener('mousedown', (e) => {
      // Only respond to left click
      if (e.button !== 0) return;

      this.dragStartTime = Date.now();
      this.hasMoved = false;
      this.isDragging = false;

      const rect = btn.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      // Add global event listeners
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);

      // Remove transition for better drag performance
      btn.style.transition = 'none';
    });
  }

  /**
   * Handle mouse move (dragging)
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.toggleButton) return;

    const btn = this.toggleButton;
    const rect = btn.getBoundingClientRect();

    // Calculate new position
    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;

    // Detect if actually moved
    const currentRight = window.innerWidth - rect.left - rect.width;
    const currentBottom = window.innerHeight - rect.top - rect.height;
    const newRight = window.innerWidth - newX - rect.width;
    const newBottom = window.innerHeight - newY - rect.height;

    if (Math.abs(newRight - currentRight) > 3 || Math.abs(newBottom - currentBottom) > 3) {
      this.hasMoved = true;
      this.isDragging = true;
    }

    // Boundary limits
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // Update position (use left/top instead of right/bottom for more intuitive dragging)
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
  };

  /**
   * Handle mouse up
   */
  private handleMouseUp = (): void => {
    if (!this.toggleButton) return;

    const btn = this.toggleButton;

    // Restore transition effect
    btn.style.transition = 'all 0.2s';

    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // Delayed reset of drag state to avoid triggering click event
    setTimeout(() => {
      this.isDragging = false;
    }, 100);

    // Save position to localStorage
    this.saveButtonPosition();
  };

  /**
   * Save button position to localStorage
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
   * Load button position from localStorage
   */
  private loadButtonPosition(): void {
    try {
      const saved = localStorage.getItem('mock-monkey-button-position');
      if (saved) {
        const position = JSON.parse(saved) as { x: number; y: number };
        // Validate position
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
   * Bind panel drag events
   */
  private bindPanelDragEvents(): void {
    if (!this.shadowRoot) return;

    const dragHandle = this.shadowRoot.querySelector('[data-drag-handle="panel"]');
    if (!dragHandle) return;

    dragHandle.addEventListener('mousedown', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      // Only respond to left click
      if (mouseEvent.button !== 0) return;

      // If clicking close button, don't trigger drag
      if ((mouseEvent.target as HTMLElement).closest('[data-action="close"]')) return;

      this.panelDragStartTime = Date.now();
      this.panelHasMoved = false;
      this.isPanelDragging = false;

      const panel = this.panelElement;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      this.panelDragOffset.x = mouseEvent.clientX - rect.left;
      this.panelDragOffset.y = mouseEvent.clientY - rect.top;

      // Add global event listeners
      document.addEventListener('mousemove', this.handlePanelMouseMove);
      document.addEventListener('mouseup', this.handlePanelMouseUp);

      // Remove transition for better drag performance
      panel.style.transition = 'none';

      // Prevent text selection
      e.preventDefault();
    });
  }

  /**
   * Handle panel mouse move (dragging)
   */
  private handlePanelMouseMove = (e: MouseEvent): void => {
    if (!this.panelElement) return;

    const panel = this.panelElement;

    // Calculate new position
    let newX = e.clientX - this.panelDragOffset.x;
    let newY = e.clientY - this.panelDragOffset.y;

    // Detect if actually moved
    const rect = panel.getBoundingClientRect();
    if (Math.abs(newX - rect.left) > 3 || Math.abs(newY - rect.top) > 3) {
      this.panelHasMoved = true;
      this.isPanelDragging = true;
    }

    // Boundary limits
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // 更新位置
    panel.style.left = `${newX}px`;
    panel.style.top = `${newY}px`;
    panel.style.transform = 'none';

    // Update saved position
    this.panelPosition = { left: newX, top: newY };
  };

  /**
   * Handle panel mouse up
   */
  private handlePanelMouseUp = (): void => {
    if (!this.panelElement) return;

    const panel = this.panelElement;

    // Restore transition effect
    panel.style.transition = '';

    // Remove global event listeners
    document.removeEventListener('mousemove', this.handlePanelMouseMove);
    document.removeEventListener('mouseup', this.handlePanelMouseUp);

    // Delayed reset of drag state
    setTimeout(() => {
      this.isPanelDragging = false;
    }, 100);

    // Save position to localStorage
    this.savePanelPosition();
  };

  /**
   * Save panel position to localStorage
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
   * Load panel position from localStorage
   */
  private loadPanelPosition(): void {
    try {
      const saved = localStorage.getItem('mock-monkey-panel-position');
      if (saved) {
        const position = JSON.parse(saved) as { left: number; top: number };
        // Validate position
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
   * Export rules
   */
  private exportRules(): void {
    try {
      // Serialize rules to importable format
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
   * Import rules
   */
  private importRules(): void {
    const fileInput = this.shadowRoot?.querySelector('[data-action="import-file"]') as HTMLInputElement;
    if (fileInput) {
      // Reset value to ensure selecting same file triggers change event
      fileInput.value = '';
      fileInput.click();
    }
  }

  /**
   * Handle import file
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
          throw new Error(this.i18n.t('form.importError'));
        }

        // Trigger import callback, let external handler process rule import
        let successCount = 0;
        importedRules.forEach((ruleData) => {
          // Parse pattern
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

        // Reset input
        input.value = '';
      } catch (e) {
        console.error('[MockMonkey] 导入规则失败:', e);
        alert('导入失败：' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Bind events
   */
  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // Close button
    this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener('click', () => this.hide());

    // Language toggle button
    this.shadowRoot.querySelector('[data-action="toggle-lang"]')?.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Tab switching
    this.shadowRoot.querySelectorAll('.mm-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) this.switchTab(tabName);
      });
    });

    // Clear network requests
    this.shadowRoot.querySelector('[data-action="clear-requests"]')?.addEventListener('click', () => {
      this.updateNetworkRequests([]);
    });

    // Export rules
    this.shadowRoot.querySelector('[data-action="export"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.exportRules();
      // Remove focus to prevent duplicate keyboard events
      (e.currentTarget as HTMLElement).blur();
    });

    // Import rules
    this.shadowRoot.querySelector('[data-action="import"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.importRules();
      (e.currentTarget as HTMLElement).blur();
    });

    // Import file selection
    this.shadowRoot.querySelector('[data-action="import-file"]')?.addEventListener('change', (e) => {
      this.handleImportFile(e);
    });

    // Add rule form
    this.shadowRoot.querySelector('[data-action="add-rule"]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddRule(e);
    });

    // Cancel edit button
    this.shadowRoot.querySelector('[data-action="cancel-edit"]')?.addEventListener('click', () => {
      this.cancelEdit();
    });

    // Search input for rules
    const rulesSearchInput = this.shadowRoot.querySelector('[data-search="rules"]') as HTMLInputElement;
    if (rulesSearchInput) {
      rulesSearchInput.addEventListener('input', (e) => {
        this.rulesSearchQuery = (e.currentTarget as HTMLInputElement).value;
        this.updateRules(this.currentRules);
      });
    }

    // Search input for network requests
    const requestsSearchInput = this.shadowRoot.querySelector('[data-search="requests"]') as HTMLInputElement;
    if (requestsSearchInput) {
      requestsSearchInput.addEventListener('input', (e) => {
        this.requestsSearchQuery = (e.currentTarget as HTMLInputElement).value;
        this.updateNetworkRequests(this.networkRequests);
      });
    }

    // Methods - Add method button
    this.shadowRoot.querySelector('[data-action="add-method"]')?.addEventListener('click', () => {
      this.showMethodForm();
    });

    // Methods - Cancel method button
    this.shadowRoot.querySelector('[data-action="cancel-method"]')?.addEventListener('click', () => {
      this.hideMethodForm();
    });

    // Methods - Form submit
    this.shadowRoot.querySelector('[data-action="method-form"]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMethodSubmit(e);
    });

    // Prevent wheel event propagation from panel to main page
    const panel = this.shadowRoot.querySelector('.mm-panel');
    if (panel) {
      panel.addEventListener('wheel', (e: Event) => {
        e.stopPropagation();
      }, { capture: true, passive: true } as AddEventListenerOptions);
    }

    // Bind panel drag events
    this.bindPanelDragEvents();
  }

  /**
   * Switch tab
   */
  private switchTab(tabName: string): void {
    if (!this.shadowRoot) return;

    // Update tab styles
    this.shadowRoot.querySelectorAll('.mm-tab').forEach((tab) => {
      const isActive = (tab as HTMLElement).dataset.tab === tabName;
      tab.classList.toggle('mm-tab--active', isActive);
    });

    // Update content display
    this.shadowRoot.querySelectorAll('.mm-tab-content').forEach((content) => {
      const isActive = (content as HTMLElement).dataset.content === tabName;
      content.classList.toggle('mm-tab-content--active', isActive);
    });
  }

  /**
   * Toggle language and update UI
   */
  private toggleLanguage(): void {
    this.i18n.toggleLanguage();
    this.updateLanguage();
  }

  /**
   * Update all UI text with current language
   */
  private updateLanguage(): void {
    if (!this.shadowRoot) return;

    // Update language button
    const langBtn = this.shadowRoot.querySelector('[data-action="toggle-lang"]') as HTMLElement;
    if (langBtn) {
      const lang = this.i18n.getLanguage();
      // Show the opposite language on button (current is zh, show EN; current is en, show 中)
      langBtn.textContent = lang === 'zh' ? 'EN' : '中';
      langBtn.title = lang === 'zh' ? 'Switch to English' : '切换中文';
    }

    // Update tab labels
    this.shadowRoot.querySelectorAll('.mm-tab').forEach((tab) => {
      const tabName = (tab as HTMLElement).dataset.tab;
      if (tabName === 'rules') {
        tab.textContent = this.i18n.t('tabs.rules');
      } else if (tabName === 'add') {
        const isEditing = this.editingRuleId !== null;
        (tab as HTMLElement).textContent = isEditing ? this.i18n.t('common.edit') : this.i18n.t('tabs.add');
      } else if (tabName === 'requests') {
        tab.textContent = this.i18n.t('tabs.network');
      } else if (tabName === 'methods') {
        // Use innerHTML to preserve ALPHA badge
        (tab as HTMLElement).innerHTML = `${this.i18n.t('tabs.methods')}<span class="mm-tab-alpha">ALPHA</span>`;
      }
    });

    // Update form labels and buttons
    const urlPatternLabel = this.shadowRoot.querySelector('.mm-form-group:first-child .mm-label') as HTMLElement;
    if (urlPatternLabel) urlPatternLabel.textContent = this.i18n.t('form.urlPattern');

    const urlPatternHint = this.shadowRoot.querySelector('.mm-form-group:first-child .mm-hint') as HTMLElement;
    if (urlPatternHint) urlPatternHint.textContent = this.i18n.t('form.urlPatternHint');

    const responseLabel = this.shadowRoot.querySelector('.mm-form-group:nth-child(2) .mm-label') as HTMLElement;
    if (responseLabel) responseLabel.textContent = this.i18n.t('form.responseData');

    const delayLabel = this.shadowRoot.querySelector('.mm-form-row .mm-form-group:first-child .mm-label') as HTMLElement;
    if (delayLabel) delayLabel.textContent = this.i18n.t('form.delay');

    const statusLabel = this.shadowRoot.querySelector('.mm-form-row .mm-form-group:last-child .mm-label') as HTMLElement;
    if (statusLabel) statusLabel.textContent = this.i18n.t('form.status');

    const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]') as HTMLElement;
    if (cancelBtn) cancelBtn.textContent = this.i18n.t('form.cancelEdit');

    const submitBtn = this.shadowRoot.querySelector('[data-submit-btn]') as HTMLElement;
    if (submitBtn) {
      submitBtn.textContent = this.editingRuleId ? this.i18n.t('form.saveRule') : this.i18n.t('form.addRule');
    }

    // Update rules page
    const exportBtn = this.shadowRoot.querySelector('[data-action="export"]') as HTMLElement;
    if (exportBtn) exportBtn.textContent = this.i18n.t('rules.export');

    const importBtn = this.shadowRoot.querySelector('[data-action="import"]') as HTMLElement;
    if (importBtn) importBtn.textContent = this.i18n.t('rules.import');

    // Update network page
    const clearRequestsBtn = this.shadowRoot.querySelector('[data-action="clear-requests"]') as HTMLElement;
    if (clearRequestsBtn) clearRequestsBtn.textContent = this.i18n.t('network.clear');

    // Update search input placeholders
    const rulesSearchInput = this.shadowRoot.querySelector('[data-search="rules"]') as HTMLInputElement;
    if (rulesSearchInput) rulesSearchInput.placeholder = this.i18n.t('rules.searchPlaceholder');

    const requestsSearchInput = this.shadowRoot.querySelector('[data-search="requests"]') as HTMLInputElement;
    if (requestsSearchInput) requestsSearchInput.placeholder = this.i18n.t('network.searchPlaceholder');

    // Update methods page
    const addMethodBtn = this.shadowRoot.querySelector('[data-action="add-method"]') as HTMLElement;
    if (addMethodBtn) addMethodBtn.textContent = this.i18n.t('methods.add');

    const submitMethodBtn = this.shadowRoot.querySelector('[data-submit-method-btn]') as HTMLElement;
    if (submitMethodBtn) {
      submitMethodBtn.textContent = this.editingMethodId ? this.i18n.t('methods.edit') : this.i18n.t('methods.add');
    }

    const cancelMethodBtn = this.shadowRoot.querySelector('[data-action="cancel-method"]') as HTMLElement;
    if (cancelMethodBtn) cancelMethodBtn.textContent = this.i18n.t('methods.cancel');

    // Update method form labels
    const methodForm = this.shadowRoot.querySelector('[data-action="method-form"]') as HTMLFormElement;
    if (methodForm) {
      const formGroups = methodForm.querySelectorAll('.mm-form-group');

      // Name label
      if (formGroups[0]) {
        const nameLabel = formGroups[0].querySelector('.mm-label') as HTMLElement;
        if (nameLabel) nameLabel.textContent = this.i18n.t('methods.name');
        const nameInput = formGroups[0].querySelector('input') as HTMLInputElement;
        if (nameInput && !this.editingMethodId) nameInput.placeholder = this.i18n.t('methods.namePlaceholder');
      }

      // Description label
      if (formGroups[1]) {
        const descLabel = formGroups[1].querySelector('.mm-label') as HTMLElement;
        if (descLabel) descLabel.textContent = this.i18n.t('methods.description');
        const descInput = formGroups[1].querySelector('input') as HTMLInputElement;
        if (descInput && !this.editingMethodId) descInput.placeholder = this.i18n.t('methods.descriptionPlaceholder');
      }

      // Code label
      if (formGroups[2]) {
        const codeLabel = formGroups[2].querySelector('.mm-label') as HTMLElement;
        if (codeLabel) codeLabel.textContent = this.i18n.t('methods.code');
        const codeInput = formGroups[2].querySelector('textarea') as HTMLTextAreaElement;
        if (codeInput && !this.editingMethodId) codeInput.placeholder = this.i18n.t('methods.codePlaceholder');

        // Context help
        const contextHelp = formGroups[2].querySelector('details.mm-context-help') as HTMLDetailsElement;
        if (contextHelp) {
          const contextTitle = contextHelp.querySelector('summary.mm-context-help-title') as HTMLElement;
          if (contextTitle) contextTitle.textContent = this.i18n.t('methods.contextHelp');
          const contextCodes = contextHelp.querySelectorAll('.mm-code') as NodeListOf<HTMLElement>;
          if (contextCodes[0]) contextCodes[0].textContent = this.i18n.t('methods.contextUrl');
          if (contextCodes[1]) contextCodes[1].textContent = this.i18n.t('methods.contextMethod');
          if (contextCodes[2]) contextCodes[2].textContent = this.i18n.t('methods.contextBody');
        }
      }
    }

    // Refresh rules list and network requests to update their content
    this.updateRules(this.currentRules);
    this.updateNetworkRequests(this.networkRequests);
    this.updateMethods(this.currentMethods);
  }

  /**
   * Handle add rule
   */
  private handleAddRule(e: Event): void {
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const pattern = formData.get('pattern') as string;
    const responseStr = formData.get('response') as string;
    const delay = parseInt(formData.get('delay') as string) || 0;
    const status = parseInt(formData.get('status') as string) || 200;
    const editingId = formData.get('editing-id') as string;

    // Parse pattern
    let parsedPattern: string | RegExp = pattern;
    if (pattern.startsWith('/')) {
      try {
        const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
        if (match) {
          parsedPattern = new RegExp(match[1], match[2]);
        }
      } catch (err) {
        alert(this.i18n.t('form.regexError'));
        return;
      }
    }

    // Parse response
    let response: unknown;
    try {
      response = JSON.parse(responseStr);
    } catch (err) {
      alert(this.i18n.t('form.jsonError'));
      return;
    }

    const ruleData = {
      pattern: parsedPattern,
      response,
      options: { delay, status }
    };

    if (editingId) {
      // Edit mode
      this.onUpdateRule?.(editingId, ruleData);
    } else {
      // Add mode
      this.onAddRule(ruleData);
    }

    this.cancelEdit();
    form.reset();
    this.switchTab('rules');
  }

  /**
   * Cancel edit mode
   */
  private cancelEdit(): void {
    this.editingRuleId = null;
    if (!this.shadowRoot) return;

    const form = this.shadowRoot.querySelector('[data-action="add-rule"]') as HTMLFormElement;
    const submitBtn = this.shadowRoot.querySelector('[data-submit-btn]') as HTMLElement;
    const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]') as HTMLElement;
    const tabLabel = this.shadowRoot.querySelector('[data-tab-label]') as HTMLElement;
    const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]') as HTMLInputElement;

    if (form) form.reset();
    if (submitBtn) submitBtn.textContent = this.i18n.t('form.addRule');
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (tabLabel) tabLabel.textContent = this.i18n.t('tabs.add');
    if (editingIdInput) editingIdInput.value = '';
  }

  /**
   * Enter edit mode
   */
  private enterEditMode(rule: RuleItem): void {
    this.editingRuleId = rule.id;
    if (!this.shadowRoot) return;

    const form = this.shadowRoot.querySelector('[data-action="add-rule"]') as HTMLFormElement;
    const submitBtn = this.shadowRoot.querySelector('[data-submit-btn]') as HTMLElement;
    const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]') as HTMLElement;
    const tabLabel = this.shadowRoot.querySelector('[data-tab-label]') as HTMLElement;
    const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]') as HTMLInputElement;

    // Fill form
    const patternInput = this.shadowRoot.querySelector('[name="pattern"]') as HTMLInputElement;
    const responseInput = this.shadowRoot.querySelector('[name="response"]') as HTMLTextAreaElement;
    const delayInput = this.shadowRoot.querySelector('[name="delay"]') as HTMLInputElement;
    const statusInput = this.shadowRoot.querySelector('[name="status"]') as HTMLInputElement;

    if (patternInput) patternInput.value = rule.patternStr;
    if (responseInput) responseInput.value = JSON.stringify(rule.response, null, 2);
    if (delayInput) delayInput.value = rule.delay.toString();
    if (statusInput) statusInput.value = rule.status.toString();
    if (editingIdInput) editingIdInput.value = rule.id;

    // Update UI state
    if (submitBtn) submitBtn.textContent = this.i18n.t('form.saveRule');
    if (cancelBtn) cancelBtn.style.display = '';
    if (tabLabel) tabLabel.textContent = this.i18n.t('common.edit');

    // Switch to form tab
    this.switchTab('add');
  }

  /**
   * Update rules list
   */
  updateRules(rules: RuleItem[]): void {
    // Save current rules for export
    this.currentRules = rules;

    if (!this.shadowRoot) return;

    const listContainer = this.shadowRoot.querySelector('[data-rules-list]');
    const countEl = this.shadowRoot.querySelector('[data-content="rules"] .mm-count');
    if (!listContainer) return;

    // Filter rules based on search query
    const filteredRules = this.filterRules(rules, this.rulesSearchQuery);

    if (countEl) {
      // Show total count and filtered count if searching
      if (this.rulesSearchQuery) {
        countEl.textContent = `${filteredRules.length}/${rules.length} ${this.i18n.t('rules.count')}`;
      } else {
        countEl.textContent = `${rules.length} ${this.i18n.t('rules.count')}`;
      }
    }

    // Show empty state based on whether we have rules and if search has results
    if (rules.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t('rules.empty')}</p>
          <p class="mm-hint">${this.i18n.t('rules.startConfig')}</p>
        </div>
      `;
      // Bind navigation event
      listContainer.querySelector('[data-action="go-to-add"]')?.addEventListener('click', () => {
        this.switchTab('add');
      });
      return;
    }

    if (filteredRules.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t('rules.noResults')}</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredRules
      .map(
        (rule) => `
      <div class="mm-rule-item ${rule.enabled ? '' : 'mm-rule-item--disabled'}">
        <div class="mm-rule-header">
          <span class="mm-rule-pattern" title="${this.escapeHtmlAttr(rule.patternStr)}">${this.escapeHtml(rule.patternStr)}</span>
          <div class="mm-rule-actions">
            <button class="mm-btn-icon" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? this.i18n.t('common.disable') : this.i18n.t('common.enable')}">
              ${rule.enabled ? '🟢' : '⚫'}
            </button>
            <button class="mm-btn-icon" data-action="edit" data-id="${rule.id}" title="${this.i18n.t('common.edit')}">✏️</button>
            <button class="mm-btn-icon" data-action="delete" data-id="${rule.id}" title="${this.i18n.t('common.delete')}">🗑️</button>
          </div>
        </div>
        <details class="mm-rule-details">
          <summary class="mm-rule-summary">${this.i18n.t('common.details')}</summary>
          <div class="mm-rule-meta">
            <span>${this.i18n.t('rules.status')}: ${rule.status}</span>
            <span>${this.i18n.t('rules.delay')}: ${rule.delay}ms</span>
          </div>
          <pre class="mm-rule-response">${this.escapeHtml(JSON.stringify(rule.response, null, 2))}</pre>
        </details>
      </div>
    `
      )
      .join('');

    // Bind rule item events
    listContainer.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) (this as any).onToggleRule(id);
      });
    });

    listContainer.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          const rule = rules.find(r => r.id === id);
          if (rule) this.enterEditMode(rule);
        }
      });
    });

    listContainer.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) (this as any).onDeleteRule(id);
      });
    });
  }

  /**
   * Update network request list
   */
  updateNetworkRequests(requests: NetworkRequest[]): void {
    this.networkRequests = requests;
    // Store requests for quick mock creation
    (this as any).requestsById = new Map(requests.map(r => [r.id, r]));
    if (!this.shadowRoot) return;

    const listContainer = this.shadowRoot.querySelector('[data-requests-list]');
    const countEl = this.shadowRoot.querySelector('[data-content="requests"] .mm-count');
    if (!listContainer) return;

    // Filter requests based on search query
    const filteredRequests = this.filterRequests(requests, this.requestsSearchQuery);

    if (countEl) {
      // Show total count and filtered count if searching
      if (this.requestsSearchQuery) {
        countEl.textContent = `${filteredRequests.length}/${requests.length} ${this.i18n.t('network.count')}`;
      } else {
        countEl.textContent = `${requests.length} ${this.i18n.t('network.count')}`;
      }
    }

    if (requests.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t('network.empty')}</p>
          <p class="mm-hint">${this.i18n.t('network.emptyHint')}</p>
        </div>
      `;
      return;
    }

    if (filteredRequests.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t('network.noResults')}</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredRequests
      .map(
        (req) => `
      <div class="mm-request-item ${req.mocked ? 'mm-request-item--mocked' : ''}" data-request-id="${req.id}">
        <div class="mm-request-header">
          <span class="mm-request-method" data-method="${req.method}">${req.method}</span>
          <span class="mm-request-url" title="${this.escapeHtmlAttr(req.url)}">${this.escapeHtml(this.truncateUrl(req.url))}</span>
          <span class="mm-request-type">${req.type}</span>
          ${req.mocked ? '<span class="mm-badge mm-badge--mocked">MOCK</span>' : ''}
        </div>
        <div class="mm-request-meta">
          <span class="mm-request-status" data-status="${req.status ? Math.floor(req.status / 100).toString() : ''}">${req.status ?? 'PENDING'}</span>
          <span class="mm-request-duration">${req.duration ? `${req.duration}ms` : '-'}</span>
          <span class="mm-request-time">${new Date(req.timestamp).toLocaleTimeString()}</span>
          <button class="mm-btn mm-btn--small mm-btn-create-mock" data-action="create-mock" data-request-id="${req.id}" title="${this.i18n.t('network.createMock')}">
            + Mock
          </button>
        </div>
        ${req.response !== undefined ? `
          <details class="mm-request-details">
            <summary class="mm-request-summary">${this.i18n.t('network.responseData')}</summary>
            <pre class="mm-request-response">${this.escapeHtml(JSON.stringify(req.response, null, 2))}</pre>
          </details>
        ` : ''}
      </div>
    `
      )
      .join('');

    // Bind create mock button events
    listContainer.querySelectorAll('[data-action="create-mock"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.requestId;
        if (id) this.handleCreateFromRequest(id);
      });
    });
  }

  /**
   * Filter rules by search query (case-insensitive)
   */
  private filterRules(rules: RuleItem[], query: string): RuleItem[] {
    if (!query.trim()) return rules;

    const lowerQuery = query.toLowerCase();
    return rules.filter(rule =>
      rule.patternStr.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter network requests by search query (case-insensitive)
   */
  private filterRequests(requests: NetworkRequest[], query: string): NetworkRequest[] {
    if (!query.trim()) return requests;

    const lowerQuery = query.toLowerCase();
    return requests.filter(req =>
      req.url.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Update methods list
   */
  updateMethods(methods: MockMethod[]): void {
    this.currentMethods = methods;
    if (!this.shadowRoot) return;

    const listContainer = this.shadowRoot.querySelector('[data-methods-list]');
    const countEl = this.shadowRoot.querySelector('[data-content="methods"] .mm-count');
    if (!listContainer) return;

    if (countEl) {
      countEl.textContent = `${methods.length} ${this.i18n.t('methods.count')}`;
    }

    if (methods.length === 0) {
      listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t('methods.empty')}</p>
          <p class="mm-hint">${this.i18n.t('methods.emptyHint')}</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = methods.map(method => `
      <div class="mm-method-item ${method.enabled ? '' : 'mm-method-item--disabled'}">
        <div class="mm-method-header">
          <div class="mm-method-name">
            <code>@${method.name}</code>
            ${!method.enabled ? `<span class="mm-badge mm-badge--disabled">${this.i18n.t('common.disable')}</span>` : ''}
          </div>
          <div class="mm-method-actions">
            <button class="mm-btn mm-btn--small" data-action="toggle-method" data-id="${method.id}">
              ${method.enabled ? this.i18n.t('common.disable') : this.i18n.t('common.enable')}
            </button>
            <button class="mm-btn mm-btn--small" data-action="edit-method" data-id="${method.id}">${this.i18n.t('common.edit')}</button>
            <button class="mm-btn mm-btn--small" data-action="delete-method" data-id="${method.id}">${this.i18n.t('common.delete')}</button>
          </div>
        </div>
        ${method.description ? `<div class="mm-method-description">${method.description}</div>` : ''}
        <details class="mm-method-details">
          <summary class="mm-request-summary">${this.i18n.t('common.details')}</summary>
          <div class="mm-method-code"><code>${this.escapeHtml(method.code)}</code></div>
        </details>
      </div>
    `).join('');

    // Bind method actions
    listContainer.querySelectorAll('[data-action="toggle-method"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id && this.onToggleMethod) {
          this.onToggleMethod(id);
        }
      });
    });

    listContainer.querySelectorAll('[data-action="edit-method"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) this.editMethod(id);
      });
    });

    listContainer.querySelectorAll('[data-action="delete-method"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id && this.onDeleteMethod) {
          if (confirm(this.i18n.t('methods.deleteConfirm'))) {
            this.onDeleteMethod(id);
          }
        }
      });
    });
  }

  /**
   * Show method form
   */
  private showMethodForm(method?: MockMethod): void {
    if (!this.shadowRoot) return;

    const listSection = this.shadowRoot.querySelector('.mm-methods-list-section') as HTMLElement;
    const formSection = this.shadowRoot.querySelector('.mm-method-form-section') as HTMLElement;
    const form = this.shadowRoot.querySelector('[data-action="method-form"]') as HTMLFormElement;
    const submitBtn = this.shadowRoot.querySelector('[data-submit-method-btn]') as HTMLElement;

    if (listSection) listSection.style.display = 'none';
    if (formSection) formSection.style.display = 'block';

    if (method) {
      this.editingMethodId = method.id;
      if (submitBtn) submitBtn.textContent = this.i18n.t('methods.edit');

      // Fill form
      const nameInput = this.shadowRoot.querySelector('[name="name"]') as HTMLInputElement;
      const descInput = this.shadowRoot.querySelector('[name="description"]') as HTMLInputElement;
      const codeInput = this.shadowRoot.querySelector('[name="code"]') as HTMLTextAreaElement;
      const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]') as HTMLInputElement;

      if (nameInput) nameInput.value = method.name;
      if (descInput) descInput.value = method.description || '';
      if (codeInput) codeInput.value = method.code;
      if (editingIdInput) editingIdInput.value = method.id;
    } else {
      // Add new method - pre-fill with selflink example
      this.editingMethodId = null;
      if (submitBtn) submitBtn.textContent = this.i18n.t('methods.add');

      const nameInput = this.shadowRoot.querySelector('[name="name"]') as HTMLInputElement;
      const descInput = this.shadowRoot.querySelector('[name="description"]') as HTMLInputElement;
      const codeInput = this.shadowRoot.querySelector('[name="code"]') as HTMLTextAreaElement;
      const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]') as HTMLInputElement;

      if (nameInput) nameInput.value = 'selflink';
      if (descInput) descInput.value = 'Return current request URL';
      if (codeInput) codeInput.value = 'return context.url;';
      if (editingIdInput) editingIdInput.value = '';
    }
  }

  /**
   * Hide method form
   */
  private hideMethodForm(): void {
    if (!this.shadowRoot) return;

    const listSection = this.shadowRoot.querySelector('.mm-methods-list-section') as HTMLElement;
    const formSection = this.shadowRoot.querySelector('.mm-method-form-section') as HTMLElement;
    const form = this.shadowRoot.querySelector('[data-action="method-form"]') as HTMLFormElement;

    if (listSection) listSection.style.display = 'block';
    if (formSection) formSection.style.display = 'none';
    if (form) form.reset();

    this.editingMethodId = null;
  }

  /**
   * Handle method form submit
   */
  private handleMethodSubmit(e: Event): void {
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const code = formData.get('code') as string;
    const editingId = formData.get('editing-id') as string;

    if (!name.trim() || !code.trim()) {
      alert('Name and code are required');
      return;
    }

    const methodData: CreateMockMethodParams = {
      name: name.trim(),
      code: code.trim(),
      description: description?.trim() || undefined
    };

    if (editingId) {
      // Update existing method
      if (this.onUpdateMethod) {
        this.onUpdateMethod(editingId, methodData);
      }
    } else {
      // Add new method
      if (this.onAddMethod) {
        this.onAddMethod(methodData);
      }
    }

    this.hideMethodForm();
  }

  /**
   * Edit method
   */
  private editMethod(id: string): void {
    const method = this.currentMethods.find(m => m.id === id);
    if (method) {
      this.showMethodForm(method);
    }
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
      // Use shadowRoot to query panel element
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
   * Create Mock rule from network request
   */
  private handleCreateFromRequest(requestId: string): void {
    const requestsById = (this as any).requestsById as Map<string, NetworkRequest>;
    const request = requestsById?.get(requestId);
    if (!request) return;

    // Trigger callback or fill form directly
    if (this.onCreateFromRequest) {
      this.onCreateFromRequest(request);
    }

    // Fill form
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

    // Switch to add rule tab
    this.switchTab('add');
  }

  /**
   * HTML escape
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * HTML attribute escape (escape double quotes)
   */
  private escapeHtmlAttr(text: string): string {
    return this.escapeHtml(text).replace(/"/g, '&quot;');
  }

  /**
   * Truncate URL, display domain + path + partial query params
   */
  private truncateUrl(url: string, maxLength = 100): string {
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.origin}${urlObj.pathname}`;

      if (urlObj.search) {
        // Keep first few query params
        const searchParams = new URLSearchParams(urlObj.search);
        const params: string[] = [];
        let currentLength = baseUrl.length + 1; // +1 for '?'

        for (const [key, value] of searchParams.entries()) {
          const paramStr = `${key}=${value}`;
          if (currentLength + paramStr.length + 1 > maxLength) {
            // Adding this param would exceed max length, stop adding
            break;
          }
          params.push(paramStr);
          currentLength += paramStr.length + 1; // +1 for '&'
        }

        const queryString = params.length > 0 ? '?' + params.join('&') : '?';
        // If there are more params, add ...
        if (params.length < Array.from(searchParams.entries()).length) {
          return baseUrl + queryString + '...';
        }
        return baseUrl + queryString;
      }

      return baseUrl;
    } catch {
      // URL parsing failed, truncate by length
      if (url.length > maxLength) {
        return url.substring(0, maxLength - 3) + '...';
      }
      return url;
    }
  }

  /**
   * Get styles
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

      .mm-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mm-lang-btn {
        background: #f5f5f5;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 45px;
        text-align: center;
      }

      .mm-lang-btn:hover {
        background: #e5e7eb;
        border-color: #9ca3af;
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

      .mm-tab-alpha {
        display: inline-block;
        margin-left: 4px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        background: #fbbf24;
        color: #92400e;
        border-radius: 4px;
        letter-spacing: 0.5px;
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

      .mm-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .mm-count {
        font-weight: 500;
        color: #666;
        white-space: nowrap;
      }

      .mm-toolbar-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
        flex: 1;
        min-width: 0;
      }

      .mm-search-wrapper {
        position: relative;
        flex: 1;
        max-width: 200px;
        min-width: 120px;
      }

      .mm-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
        z-index: 1;
      }

      .mm-search-input {
        width: 100%;
        height: 32px;
        padding: 6px 10px 6px 36px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.2s;
        box-sizing: border-box;
      }

      .mm-search-input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .mm-search-input:focus + .mm-search-icon,
      .mm-search-wrapper:focus-within .mm-search-icon {
        color: #4f46e5;
      }

      .mm-search-input::placeholder {
        color: #9ca3af;
      }

      /* Responsive: wrap toolbar on small screens */
      @media (max-width: 500px) {
        .mm-toolbar {
          flex-direction: column;
          align-items: stretch;
        }

        .mm-toolbar-actions {
          justify-content: stretch;
          flex-wrap: wrap;
        }

        .mm-search-wrapper {
          max-width: none;
        }
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
        flex: 1;
        min-width: 0;
        font-weight: 500;
        color: #4f46e5;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mm-rule-actions {
        display: flex;
        gap: 4px;
      }

      .mm-rule-details {
        margin-top: 8px;
      }

      .mm-rule-summary {
        cursor: pointer;
        font-size: 12px;
        color: #6b7280;
        user-select: none;
        padding: 4px 0;
        list-style: none;
      }

      .mm-rule-summary::-webkit-details-marker {
        display: none;
      }

      .mm-rule-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 6px;
        transition: transform 0.2s;
        font-size: 10px;
      }

      details[open] > .mm-rule-summary::before {
        transform: rotate(90deg);
      }

      .mm-rule-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        margin-top: 8px;
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
        min-width: 0;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        color: #374151;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

      /* Methods styles */
      .mm-methods-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .mm-methods-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mm-method-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.2s;
      }

      .mm-method-item:hover {
        border-color: #d1d5db;
      }

      .mm-method-item--disabled {
        opacity: 0.6;
        background: #f3f4f6;
      }

      .mm-method-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }

      .mm-method-name {
        font-weight: 600;
        font-size: 14px;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .mm-method-name code {
        background: #e5e7eb;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: #4f46e5;
      }

      .mm-method-actions {
        display: flex;
        gap: 6px;
      }

      .mm-method-description {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
      }

      .mm-method-code {
        background: #1f2937;
        color: #f9fafb;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        overflow-x: auto;
        white-space: pre-wrap;
        max-height: 150px;
        overflow-y: auto;
      }

      .mm-context-help {
        margin-top: 8px;
        padding: 8px 12px;
        background: #f0fdf4;
        border: 1px solid #86efac;
        border-radius: 6px;
      }

      .mm-context-help summary {
        font-size: 12px;
        font-weight: 500;
        color: #16a34a;
        cursor: pointer;
        user-select: none;
        list-style: none;
        padding: 4px 0;
      }

      .mm-context-help summary::-webkit-details-marker {
        display: none;
      }

      .mm-context-help summary::before {
        content: '▶';
        display: inline-block;
        font-size: 10px;
        margin-right: 6px;
        transition: transform 0.2s;
      }

      .mm-context-help[open] summary::before {
        transform: rotate(90deg);
      }

      .mm-context-help code {
        display: block;
        font-size: 11px;
        color: #374151;
        background: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .mm-method-form-section {
        background: #f9fafb;
        border-radius: 8px;
        padding: 16px;
      }
    `;
  }
}

/**
 * Rule form data
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
 * Rule list item
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
 * Rule operation callbacks
 */
export interface RuleCallbacks {
  onToggle: (id: string) => void;
  onEdit: (id: string, rule: RuleFormData) => void;
  onDelete: (id: string) => void;
}

/**
 * Method operation callbacks
 */
export interface MethodCallbacks {
  onAdd: (method: CreateMockMethodParams) => void;
  onUpdate: (id: string, method: CreateMockMethodParams) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

// Extend Panel class to support callbacks
export class PanelWithCallbacks extends Panel {
  constructor(
    onAddRule: (rule: RuleFormData) => void,
    private callbacks: RuleCallbacks,
    onCreateFromRequest?: (request: NetworkRequest) => void,
    private methodCallbacks?: MethodCallbacks
  ) {
    super(
      onAddRule,
      callbacks.onEdit,
      onCreateFromRequest,
      methodCallbacks?.onAdd,
      methodCallbacks?.onUpdate,
      methodCallbacks?.onDelete,
      methodCallbacks?.onToggle
    );
  }

  onToggleRule(id: string): void {
    this.callbacks.onToggle(id);
  }

  onEditRule(id: string, rule: RuleFormData): void {
    this.callbacks.onEdit(id, rule);
  }

  onDeleteRule(id: string): void {
    this.callbacks.onDelete(id);
  }

  updateMethods(methods: MockMethod[]): void {
    super.updateMethods(methods);
  }
}
