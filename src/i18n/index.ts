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
  methods: MethodsTranslations;
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
  confirmDelete: string;
  export: string;
  import: string;
  drag: string;
}

export interface TabsTranslations {
  rules: string;
  add: string;
  network: string;
  methods: string;
}

export interface RulesTranslations {
  count: string;
  empty: string;
  startConfig: string;
  status: string;
  delay: string;
  search: string;
  searchPlaceholder: string;
  noResults: string;
}

export interface FormTranslations {
  urlPattern: string;
  urlPatternHint: string;
  responseData: string;
  responseDataPlaceholder: string;
  placeholderHelp: string;
  placeholderUrl: string;
  placeholderMethod: string;
  placeholderBody: string;
  placeholderParams: string;
  delay: string;
  status: string;
  addRule: string;
  saveRule: string;
  cancelEdit: string;
  importError: string;
  jsonError: string;
  regexError: string;
  helpLinkTitle: string;
}

export interface NetworkTranslations {
  count: string;
  clear: string;
  empty: string;
  emptyHint: string;
  createMock: string;
  responseData: string;
  showData: string;
  search: string;
  searchPlaceholder: string;
  noResults: string;
}

export interface MethodsTranslations {
  count: string;
  add: string;
  edit: string;
  save: string;
  cancel: string;
  empty: string;
  emptyHint: string;
  name: string;
  namePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  code: string;
  codePlaceholder: string;
  deleteConfirm: string;
  contextHelp: string;
  contextUrl: string;
  contextMethod: string;
  contextBody: string;
  contextParams: string;
  contextMock: string;
  contextSyntax: string;
  alphaWarning: string;
  helpLinkTitle: string;
  searchPlaceholder: string;
  noResults: string;
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
      details: '详情',
      confirmDelete: '确定要删除这条规则吗？',
      export: '导出',
      import: '导入',
      drag: '拖动面板'
    },
    tabs: {
      rules: '规则',
      add: '添加',
      network: '网络',
      methods: '方法'
    },
    rules: {
      count: '条规则',
      empty: '暂无 Mock 规则',
      startConfig: '点击<span class="mm-link" data-action="go-to-add">"添加规则"</span>开始配置',
      status: '状态',
      delay: '延迟',
      search: '搜索',
      searchPlaceholder: '搜索 URL 规则...',
      noResults: '未找到匹配的规则'
    },
    form: {
      urlPattern: 'URL 模式 *',
      urlPatternHint: '支持字符串或正则表达式（格式：/pattern/flags）',
      responseData: '响应数据 (JSON) *',
      responseDataPlaceholder: '{"code": 200, "data": {}}',
      placeholderHelp: '可用占位符',
      placeholderUrl: '@ctx.url - 请求 URL',
      placeholderMethod: '@ctx.method - 请求方法',
      placeholderBody: '@ctx.body - 请求体 (JSON)',
      placeholderParams: '@ctx.params - URL 路径参数',
      delay: '延迟 (ms)',
      status: '状态码',
      addRule: '添加规则',
      saveRule: '保存规则',
      cancelEdit: '取消',
      importError: '导入文件格式错误：必须是数组',
      jsonError: '响应数据 JSON 格式错误',
      regexError: '正则表达式格式错误',
      helpLinkTitle: '查看规则语法说明'
    },
    network: {
      count: '条请求',
      clear: '清空',
      empty: '暂无网络请求',
      emptyHint: '发起请求后会在此显示',
      createMock: '创建 Mock 规则',
      responseData: '响应数据',
      showData: '显示数据',
      search: '搜索',
      searchPlaceholder: '搜索 URL 请求...',
      noResults: '未找到匹配的请求'
    },
    methods: {
      count: '个方法',
      add: '添加方法',
      edit: '编辑方法',
      save: '保存方法',
      cancel: '取消',
      empty: '暂无自定义方法',
      emptyHint: '点击"添加方法"创建自定义 Mock 函数',
      name: '名称 *',
      namePlaceholder: 'getUserList',
      description: '描述',
      descriptionPlaceholder: '获取用户列表',
      code: '代码 *',
      codePlaceholder: 'return { users: [...] };',
      deleteConfirm: '确定要删除这个方法吗？',
      contextHelp: '可用变量',
      contextUrl: 'ctx.url - 请求 URL',
      contextMethod: 'ctx.method - 请求方法',
      contextBody: 'ctx.body - 请求体',
      contextParams: 'ctx.params - URL 路径参数',
      contextMock: 'ctx.Mock - Mock.js 工具 (ctx.Mock.mock, ctx.Mock.Random)',
      contextSyntax: '@ctx.xxx - 占位符语法，在响应数据中使用 @ctx.url 引用变量值',
      alphaWarning: 'Alpha 功能：自定义方法正在开发中，API 可能会变更。使用需谨慎，避免在生产环境使用。',
      helpLinkTitle: '查看高级用法说明',
      searchPlaceholder: '搜索方法名称...',
      noResults: '未找到匹配的方法'
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
      details: 'Details',
      confirmDelete: 'Are you sure you want to delete this rule?',
      export: 'Export',
      import: 'Import',
      drag: 'Drag panel'
    },
    tabs: {
      rules: 'Rules',
      add: 'Add',
      network: 'Network',
      methods: 'Methods'
    },
    rules: {
      count: 'rules',
      empty: 'No Mock rules yet',
      startConfig: 'Click <span class="mm-link" data-action="go-to-add">"Add Rule"</span> to start',
      status: 'Status',
      delay: 'Delay',
      search: 'Search',
      searchPlaceholder: 'Search URL rules...',
      noResults: 'No matching rules found'
    },
    form: {
      urlPattern: 'URL Pattern *',
      urlPatternHint: 'Support string or regex (format: /pattern/flags)',
      responseData: 'Response Data (JSON) *',
      responseDataPlaceholder: '{"code": 200, "data": {}}',
      placeholderHelp: 'Available placeholders',
      placeholderUrl: '@ctx.url - Request URL',
      placeholderMethod: '@ctx.method - Request method',
      placeholderBody: '@ctx.body - Request body (JSON)',
      placeholderParams: '@ctx.params - URL path params',
      delay: 'Delay (ms)',
      status: 'Status Code',
      addRule: 'Add Rule',
      saveRule: 'Save Rule',
      cancelEdit: 'Cancel',
      importError: 'Import file format error: must be an array',
      jsonError: 'Response data JSON format error',
      regexError: 'Regex format error',
      helpLinkTitle: 'View rule syntax documentation'
    },
    network: {
      count: 'requests',
      clear: 'Clear',
      empty: 'No network requests yet',
      emptyHint: 'Requests will appear here',
      createMock: 'Create Mock',
      responseData: 'Response Data',
      showData: 'Show Data',
      search: 'Search',
      searchPlaceholder: 'Search URL requests...',
      noResults: 'No matching requests found'
    },
    methods: {
      count: 'methods',
      add: 'Add Method',
      edit: 'Edit Method',
      save: 'Save Method',
      cancel: 'Cancel',
      empty: 'No custom methods yet',
      emptyHint: 'Click "Add Method" to create custom Mock functions',
      name: 'Name *',
      namePlaceholder: 'getUserList',
      description: 'Description',
      descriptionPlaceholder: 'Get user list',
      code: 'Code *',
      codePlaceholder: 'return { users: [...] };',
      deleteConfirm: 'Are you sure you want to delete this method?',
      contextHelp: 'Available variables',
      contextUrl: 'ctx.url - Request URL',
      contextMethod: 'ctx.method - Request method',
      contextBody: 'ctx.body - Request body',
      contextParams: 'ctx.params - URL path params',
      contextMock: 'ctx.Mock - Mock.js utilities (ctx.Mock.mock, ctx.Mock.Random)',
      contextSyntax: '@ctx.xxx - Placeholder syntax, use @ctx.url in response data to reference variable values',
      alphaWarning: 'Alpha Feature: Custom methods are under development. APIs may change. Use with caution, not recommended for production.',
      helpLinkTitle: 'View advanced usage documentation',
      searchPlaceholder: 'Search method names...',
      noResults: 'No matching methods found'
    }
  }
};

/**
 * i18n manager class (singleton)
 */
export class I18n {
  private static instance: I18n;
  private _language: Language;
  private readonly STORAGE_KEY = 'mock-monkey-language';

  private constructor() {
    // Load language from localStorage or use default
    this._language = this.loadLanguage();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
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
