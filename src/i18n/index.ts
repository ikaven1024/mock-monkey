/**
 * Language type definition
 */
export type Language = 'zh' | 'en';

/**
 * Translation keys structure
 */
export interface TranslationKey {
  common: CommonTranslations;
  tabs: TabsTranslations;
  rules: RulesTranslations;
  form: FormTranslations;
  network: NetworkTranslations;
}

export interface CommonTranslations {
  add: string;
  edit: string;
  delete: string;
  enable: string;
  disable: string;
  cancel: string;
  save: string;
  details: string;
}

export interface TabsTranslations {
  rules: string;
  add: string;
  network: string;
}

export interface RulesTranslations {
  count: string;
  export: string;
  import: string;
  empty: string;
  startConfig: string;
  status: string;
  delay: string;
}

export interface FormTranslations {
  urlPattern: string;
  urlPatternHint: string;
  responseData: string;
  responseDataPlaceholder: string;
  delay: string;
  status: string;
  addRule: string;
  saveRule: string;
  cancelEdit: string;
  importError: string;
  jsonError: string;
  regexError: string;
}

export interface NetworkTranslations {
  count: string;
  clear: string;
  empty: string;
  emptyHint: string;
  createMock: string;
  responseData: string;
}

/**
 * Translation texts
 */
const translations: Record<Language, TranslationKey> = {
  zh: {
    common: {
      add: '添加',
      edit: '编辑',
      delete: '删除',
      enable: '启用',
      disable: '禁用',
      cancel: '取消',
      save: '保存',
      details: '详情'
    },
    tabs: {
      rules: '规则',
      add: '添加',
      network: '网络'
    },
    rules: {
      count: '条规则',
      export: '导出',
      import: '导入',
      empty: '暂无 Mock 规则',
      startConfig: '点击<span class="mm-link" data-action="go-to-add">"添加规则"</span>开始配置',
      status: '状态',
      delay: '延迟'
    },
    form: {
      urlPattern: 'URL 模式 *',
      urlPatternHint: '支持字符串或正则表达式（格式：/pattern/flags）',
      responseData: '响应数据 (JSON) *',
      responseDataPlaceholder: '{"code": 200, "data": {}}',
      delay: '延迟 (ms)',
      status: '状态码',
      addRule: '添加规则',
      saveRule: '保存规则',
      cancelEdit: '取消',
      importError: '导入文件格式错误：必须是数组',
      jsonError: '响应数据 JSON 格式错误',
      regexError: '正则表达式格式错误'
    },
    network: {
      count: '条请求',
      clear: '清空',
      empty: '暂无网络请求',
      emptyHint: '发起请求后会在此显示',
      createMock: '创建 Mock 规则',
      responseData: '响应数据'
    }
  },
  en: {
    common: {
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      enable: 'Enable',
      disable: 'Disable',
      cancel: 'Cancel',
      save: 'Save',
      details: 'Details'
    },
    tabs: {
      rules: 'Rules',
      add: 'Add',
      network: 'Network'
    },
    rules: {
      count: 'rules',
      export: 'Export',
      import: 'Import',
      empty: 'No Mock rules yet',
      startConfig: 'Click <span class="mm-link" data-action="go-to-add">"Add Rule"</span> to start',
      status: 'Status',
      delay: 'Delay'
    },
    form: {
      urlPattern: 'URL Pattern *',
      urlPatternHint: 'Support string or regex (format: /pattern/flags)',
      responseData: 'Response Data (JSON) *',
      responseDataPlaceholder: '{"code": 200, "data": {}}',
      delay: 'Delay (ms)',
      status: 'Status Code',
      addRule: 'Add Rule',
      saveRule: 'Save Rule',
      cancelEdit: 'Cancel',
      importError: 'Import file format error: must be an array',
      jsonError: 'Response data JSON format error',
      regexError: 'Regex format error'
    },
    network: {
      count: 'requests',
      clear: 'Clear',
      empty: 'No network requests yet',
      emptyHint: 'Requests will appear here',
      createMock: 'Create Mock',
      responseData: 'Response Data'
    }
  }
};

/**
 * i18n manager class
 */
export class I18n {
  private _language: Language;
  private readonly STORAGE_KEY = 'mock-monkey-language';

  constructor() {
    // Load language from localStorage or use default
    this._language = this.loadLanguage();
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this._language;
  }

  /**
   * Set language and save to localStorage
   */
  setLanguage(lang: Language): void {
    this._language = lang;
    this.saveLanguage(lang);
  }

  /**
   * Toggle language between zh and en
   */
  toggleLanguage(): void {
    this._language = this._language === 'zh' ? 'en' : 'zh';
    this.saveLanguage(this._language);
  }

  /**
   * Get translation text by key path
   * Supports nested key path like 'common.add', 'tabs.rules'
   */
  t(key: string): string {
    const keys = key.split('.');
    let value: unknown = translations[this._language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`[MockMonkey i18n] Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Load language from localStorage
   */
  private loadLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'zh' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('[MockMonkey i18n] Failed to load language from localStorage:', e);
    }
    return 'zh'; // Default to Chinese
  }

  /**
   * Save language to localStorage
   */
  private saveLanguage(lang: Language): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.warn('[MockMonkey i18n] Failed to save language to localStorage:', e);
    }
  }
}
