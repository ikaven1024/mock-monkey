/**
 * Mock 规则配置选项
 */
export interface MockRuleOptions {
  /** 响应延迟（毫秒） */
  delay?: number;
  /** HTTP 状态码 */
  status?: number;
  /** 响应头 */
  headers?: Record<string, string>;
}

/**
 * Mock 规则
 */
export interface MockRule {
  /** URL 匹配模式（字符串或正则） */
  pattern: string | RegExp;
  /** 响应数据 */
  response: unknown;
  /** 配置选项 */
  options: MockRuleOptions;
  /** 规则 ID */
  id: string;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: number;
}

/**
 * Mock 规则创建参数
 */
export interface CreateMockRuleParams {
  pattern: string | RegExp;
  response: unknown;
  options?: MockRuleOptions;
}

/**
 * XHR 请求信息
 */
interface XhrRequestInfo {
  method: string;
  url: string;
  body?: string | Document | null;
}

/**
 * Fetch 请求信息
 */
interface FetchRequestInfo {
  url: string | Request;
  options?: RequestInit;
}
