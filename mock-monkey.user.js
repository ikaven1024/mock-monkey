// ==UserScript==
// @name         mock-monkey
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  浏览器本地接口 Mock 的 Tampermonkey 脚本
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  "use strict";
  class MockManager {
    constructor() {
      this.rules = /* @__PURE__ */ new Map();
      this.storageKey = "mock-monkey-rules";
      this.loadFromStorage();
    }
    /**
     * 添加 Mock 规则
     */
    add(params) {
      const id = this.generateId();
      const rule = {
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
    update(id, updates) {
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
    remove(id) {
      const result = this.rules.delete(id);
      if (result) {
        this.saveToStorage();
      }
      return result;
    }
    /**
     * 根据 pattern 移除规则
     */
    removeByPattern(pattern) {
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
    clear() {
      this.rules.clear();
      this.saveToStorage();
    }
    /**
     * 获取所有规则
     */
    getAll() {
      return Array.from(this.rules.values());
    }
    /**
     * 获取单个规则
     */
    get(id) {
      return this.rules.get(id);
    }
    /**
     * 查找匹配的 Mock 规则
     */
    findMatch(url) {
      for (const rule of this.rules.values()) {
        if (!rule.enabled) continue;
        if (rule.pattern instanceof RegExp) {
          if (rule.pattern.test(url)) return rule;
        } else if (url.includes(rule.pattern)) {
          return rule;
        }
      }
      return null;
    }
    /**
     * 启用/禁用规则
     */
    toggle(id) {
      const rule = this.rules.get(id);
      if (!rule) return false;
      rule.enabled = !rule.enabled;
      this.saveToStorage();
      return rule.enabled;
    }
    /**
     * 生成唯一 ID
     */
    generateId() {
      return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 将 pattern 转为字符串
     */
    patternToString(pattern) {
      return pattern instanceof RegExp ? pattern.toString() : pattern;
    }
    /**
     * 保存到 localStorage
     */
    saveToStorage() {
      try {
        const data = Array.from(this.rules.entries());
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn("[MockMonkey] 保存规则失败:", e);
      }
    }
    /**
     * 从 localStorage 加载
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return;
        const data = JSON.parse(stored);
        for (const [id, rule] of data) {
          if (typeof rule.pattern === "string" && rule.pattern.startsWith("/")) {
            try {
              const match = rule.pattern.match(/^\/(.+)\/([gimuy]*)$/);
              if (match) {
                rule.pattern = new RegExp(match[1], match[2]);
              }
            } catch (e) {
            }
          }
          this.rules.set(id, rule);
        }
        console.log(`[MockMonkey] 已加载 ${this.rules.size} 条规则`);
      } catch (e) {
        console.warn("[MockMonkey] 加载规则失败:", e);
      }
    }
  }
  class Interceptor {
    constructor(manager) {
      this.manager = manager;
      this.xhrOpen = XMLHttpRequest.prototype.open;
      this.xhrSend = XMLHttpRequest.prototype.send;
      this.originalFetch = window.fetch.bind(window);
    }
    /**
     * 启动拦截
     */
    start() {
      this.interceptXHR();
      this.interceptFetch();
      console.log("[MockMonkey] 拦截器已启动");
    }
    /**
     * 停止拦截
     */
    stop() {
      XMLHttpRequest.prototype.open = this.xhrOpen;
      XMLHttpRequest.prototype.send = this.xhrSend;
      window.fetch = this.originalFetch;
      console.log("[MockMonkey] 拦截器已停止");
    }
    /**
     * 拦截 XMLHttpRequest
     */
    interceptXHR() {
      const self = this;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._mockMethod = method;
        this._mockUrl = url.toString();
        return self.xhrOpen.call(this, method, url, ...args);
      };
      XMLHttpRequest.prototype.send = function(body) {
        const xhr = this;
        const url = xhr._mockUrl;
        const method = xhr._mockMethod;
        const rule = self.manager.findMatch(url);
        if (rule) {
          console.log(`[MockMonkey] XHR 拦截: ${method} ${url}`);
          self.mockXHR(this, rule);
          return;
        }
        return self.xhrSend.call(this, body);
      };
    }
    /**
     * 拦截 Fetch
     */
    interceptFetch() {
      const self = this;
      window.fetch = function(input, init) {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const rule = self.manager.findMatch(url);
        if (rule) {
          const method = init?.method || "GET";
          console.log(`[MockMonkey] Fetch 拦截: ${method} ${url}`);
          return self.mockFetch(rule);
        }
        return self.originalFetch(input, init);
      };
    }
    /**
     * 模拟 XHR 响应
     */
    mockXHR(xhr, rule) {
      const delay = rule.options.delay || 0;
      setTimeout(() => {
        Object.defineProperty(xhr, "readyState", {
          value: 4,
          writable: false,
          configurable: true
        });
        Object.defineProperty(xhr, "status", {
          value: rule.options.status || 200,
          writable: false,
          configurable: true
        });
        const responseText = JSON.stringify(rule.response);
        Object.defineProperty(xhr, "responseText", {
          value: responseText,
          writable: false,
          configurable: true
        });
        Object.defineProperty(xhr, "response", {
          value: responseText,
          writable: false,
          configurable: true
        });
        const isSuccess = (rule.options.status || 200) >= 200 && (rule.options.status || 200) < 300;
        const eventType = isSuccess ? "load" : "error";
        xhr.dispatchEvent(new Event(eventType));
        xhr.dispatchEvent(new Event("loadend"));
        if (xhr.onreadystatechange) {
          xhr.onreadystatechange();
        }
      }, delay);
    }
    /**
     * 模拟 Fetch 响应
     */
    mockFetch(rule) {
      return new Promise((resolve) => {
        const delay = rule.options.delay || 0;
        setTimeout(() => {
          const headers = rule.options.headers || { "Content-Type": "application/json" };
          resolve(
            new Response(JSON.stringify(rule.response), {
              status: rule.options.status || 200,
              headers
            })
          );
        }, delay);
      });
    }
  }
  class Panel {
    constructor(onAddRule) {
      this.onAddRule = onAddRule;
      this.container = null;
      this.shadowRoot = null;
      this.isVisible = false;
    }
    /**
     * 初始化面板
     */
    init() {
      this.container = document.createElement("div");
      this.container.id = "mock-monkey-container";
      this.shadowRoot = this.container.attachShadow({ mode: "open" });
      this.attachStyles();
      this.createContent();
      this.bindEvents();
      this.ensureBody().then(() => {
        if (document.body) {
          document.body.appendChild(this.container);
          console.log("[MockMonkey] 面板容器已添加到页面");
        } else {
          console.error("[MockMonkey] document.body 仍然不存在");
        }
        this.createToggleButton();
      });
    }
    /**
     * 创建容器
     */
    createContainer() {
    }
    /**
     * 附加样式
     */
    attachStyles() {
      if (!this.shadowRoot) return;
      const style = document.createElement("style");
      style.textContent = this.getStyles();
      this.shadowRoot.appendChild(style);
    }
    /**
     * 创建面板内容
     */
    createContent() {
      if (!this.shadowRoot) return;
      const panel = document.createElement("div");
      panel.className = "mm-panel";
      panel.innerHTML = `
      <div class="mm-header">
        <h2 class="mm-title">🐵 MockMonkey</h2>
        <button class="mm-close-btn" data-action="close">×</button>
      </div>

      <div class="mm-tabs">
        <button class="mm-tab mm-tab--active" data-tab="rules">规则列表</button>
        <button class="mm-tab" data-tab="add">添加规则</button>
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
      </div>

      <input type="file" class="mm-hidden" data-action="import-file" accept=".json">
    `;
      this.shadowRoot.appendChild(panel);
      this.bindEvents();
    }
    /**
     * 创建切换按钮
     */
    createToggleButton() {
      this.ensureBody().then(() => {
        const btn = document.createElement("button");
        btn.className = "mm-toggle-btn";
        btn.innerHTML = "🐵";
        btn.title = "MockMonkey";
        btn.style.cssText = "position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: #4f46e5; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); z-index: 999998; display: flex; align-items: center; justify-content: center;";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("[MockMonkey] 按钮被点击");
          this.toggle();
        });
        document.body.appendChild(btn);
        console.log("[MockMonkey] 切换按钮已添加到页面");
      });
    }
    /**
     * 确保 body 元素存在
     */
    ensureBody() {
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
     * 绑定事件
     */
    bindEvents() {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener("click", () => this.hide());
      this.shadowRoot.querySelectorAll(".mm-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const target = e.currentTarget;
          const tabName = target.dataset.tab;
          if (tabName) this.switchTab(tabName);
        });
      });
      this.shadowRoot.querySelector('[data-action="add-rule"]')?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddRule(e);
      });
    }
    /**
     * 切换 Tab
     */
    switchTab(tabName) {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll(".mm-tab").forEach((tab) => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle("mm-tab--active", isActive);
      });
      this.shadowRoot.querySelectorAll(".mm-tab-content").forEach((content) => {
        const isActive = content.dataset.content === tabName;
        content.classList.toggle("mm-tab-content--active", isActive);
      });
    }
    /**
     * 处理添加规则
     */
    handleAddRule(e) {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const pattern = formData.get("pattern");
      const responseStr = formData.get("response");
      const delay = parseInt(formData.get("delay")) || 0;
      const status = parseInt(formData.get("status")) || 200;
      let parsedPattern = pattern;
      if (pattern.startsWith("/")) {
        try {
          const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
          if (match) {
            parsedPattern = new RegExp(match[1], match[2]);
          }
        } catch (err) {
          alert("正则表达式格式错误");
          return;
        }
      }
      let response;
      try {
        response = JSON.parse(responseStr);
      } catch (err) {
        alert("响应数据 JSON 格式错误");
        return;
      }
      this.onAddRule({
        pattern: parsedPattern,
        response,
        options: { delay, status }
      });
      form.reset();
      this.switchTab("rules");
    }
    /**
     * 更新规则列表
     */
    updateRules(rules) {
      if (!this.shadowRoot) return;
      const listContainer = this.shadowRoot.querySelector("[data-rules-list]");
      const countEl = this.shadowRoot.querySelector(".mm-rules-count");
      if (!listContainer) return;
      if (countEl) {
        countEl.textContent = `${rules.length} 条规则`;
      }
      if (rules.length === 0) {
        listContainer.innerHTML = `
        <div class="mm-empty">
          <p>暂无 Mock 规则</p>
          <p class="mm-hint">点击"添加规则"开始配置</p>
        </div>
      `;
        return;
      }
      listContainer.innerHTML = rules.map(
        (rule) => `
      <div class="mm-rule-item ${rule.enabled ? "" : "mm-rule-item--disabled"}">
        <div class="mm-rule-header">
          <span class="mm-rule-pattern">${this.escapeHtml(rule.patternStr)}</span>
          <div class="mm-rule-actions">
            <button class="mm-btn-icon" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? "禁用" : "启用"}">
              ${rule.enabled ? "🟢" : "⚫"}
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
      ).join("");
      listContainer.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          if (id) this.onToggleRule(id);
        });
      });
      listContainer.querySelectorAll('[data-action="delete"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          if (id) this.onDeleteRule(id);
        });
      });
    }
    /**
     * 显示面板
     */
    show() {
      console.log("[MockMonkey] show() 被调用", { container: !!this.container, shadowRoot: !!this.shadowRoot });
      if (this.container) {
        this.isVisible = true;
        this.container.classList.add("mm-panel--visible");
        console.log("[MockMonkey] 已添加 mm-panel--visible 类");
        const panel = this.shadowRoot?.querySelector(".mm-panel");
        if (panel) {
          panel.style.display = "flex";
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
          console.log("[MockMonkey] 面板样式已应用");
        } else {
          console.error("[MockMonkey] 找不到 .mm-panel 元素");
        }
      }
    }
    /**
     * 隐藏面板
     */
    hide() {
      console.log("[MockMonkey] hide() 被调用");
      if (this.container) {
        this.isVisible = false;
        this.container.classList.remove("mm-panel--visible");
        const panel = this.shadowRoot?.querySelector(".mm-panel");
        if (panel) {
          panel.style.opacity = "0";
          panel.style.pointerEvents = "none";
        }
      }
    }
    /**
     * 切换显示状态
     */
    toggle() {
      console.log("[MockMonkey] toggle() 被调用", { isVisible: this.isVisible });
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
    /**
     * HTML 转义
     */
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    /**
     * 获取样式
     */
    getStyles() {
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
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
      }

      .mm-hidden {
        display: none;
      }
    `;
    }
  }
  class PanelWithCallbacks extends Panel {
    constructor(onAddRule, callbacks) {
      super(onAddRule);
      this.callbacks = callbacks;
    }
    onToggleRule(id) {
      this.callbacks.onToggle(id);
    }
    onDeleteRule(id) {
      this.callbacks.onDelete(id);
    }
  }
  class MockMonkey {
    constructor() {
      this.manager = new MockManager();
      this.interceptor = new Interceptor(this.manager);
      this.panel = new PanelWithCallbacks(
        (rule) => this.handleAddRule(rule),
        {
          onToggle: (id) => this.handleToggleRule(id),
          onDelete: (id) => this.handleDeleteRule(id)
        }
      );
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
      if (!MockMonkey.instance) {
        MockMonkey.instance = new MockMonkey();
      }
      return MockMonkey.instance;
    }
    /**
     * 启动 MockMonkey
     */
    start() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.init());
      } else {
        this.init();
      }
    }
    /**
     * 初始化
     */
    init() {
      this.interceptor.start();
      this.panel.init();
      this.updateRulesList();
      console.log("[MockMonkey] 已启动! 点击右下角 🐵 按钮打开管理面板");
    }
    /**
     * 添加规则
     */
    handleAddRule(rule) {
      this.manager.add(rule);
      this.updateRulesList();
      console.log("[MockMonkey] 规则已添加");
    }
    /**
     * 切换规则状态
     */
    handleToggleRule(id) {
      const enabled = this.manager.toggle(id);
      this.updateRulesList();
      console.log(`[MockMonkey] 规则已${enabled ? "启用" : "禁用"}`);
    }
    /**
     * 删除规则
     */
    handleDeleteRule(id) {
      if (confirm("确定要删除这条规则吗？")) {
        this.manager.remove(id);
        this.updateRulesList();
        console.log("[MockMonkey] 规则已删除");
      }
    }
    /**
     * 更新规则列表
     */
    updateRulesList() {
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
  MockMonkey.getInstance().start();
  window.mockMonkey = {
    add: (pattern, response, options) => {
      MockMonkey.getInstance()["manager"].add({ pattern, response, options });
      MockMonkey.getInstance()["updateRulesList"]();
    },
    remove: (pattern) => {
      MockMonkey.getInstance()["manager"].removeByPattern(pattern);
      MockMonkey.getInstance()["updateRulesList"]();
    },
    clear: () => {
      MockMonkey.getInstance()["manager"].clear();
      MockMonkey.getInstance()["updateRulesList"]();
    },
    list: () => {
      const manager = MockMonkey.getInstance()["manager"];
      console.log("[MockMonkey] 当前规则:");
      manager.getAll().forEach((rule) => {
        console.log(`  ${rule.enabled ? "✓" : "✗"} ${rule.pattern}`, rule);
      });
    },
    manager: MockMonkey.getInstance()["manager"]
  };
})();
