/**
 * Mock rule configuration options
 */
export interface MockRuleOptions {
  /** Response delay (ms) */
  delay?: number;
  /** HTTP status code */
  status?: number;
  /** Response headers */
  headers?: Record<string, string>;
}

/**
 * Mock rule
 */
export interface MockRule {
  /** URL matching pattern (string or RegExp) */
  pattern: string | RegExp;
  /** Response data */
  response: unknown;
  /** Configuration options */
  options: MockRuleOptions;
  /** Rule ID */
  id: string;
  /** Whether enabled */
  enabled: boolean;
  /** Creation time */
  createdAt: number;
}

/**
 * Mock rule creation parameters
 */
export interface CreateMockRuleParams {
  pattern: string | RegExp;
  response: unknown;
  options?: MockRuleOptions;
}

/**
 * XHR request info
 */
interface XhrRequestInfo {
  method: string;
  url: string;
  body?: string | Document | null;
}

/**
 * Fetch request info
 */
interface FetchRequestInfo {
  url: string | Request;
  options?: RequestInit;
}

/**
 * Network request record
 */
export interface NetworkRequest {
  /** Request ID */
  id: string;
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request body */
  body?: string;
  /** Request type */
  type: 'XHR' | 'Fetch';
  /** Whether mocked */
  mocked: boolean;
  /** Matched rule ID (if mocked) */
  ruleId?: string;
  /** Response status code */
  status?: number;
  /** Response data */
  response?: unknown;
  /** Request timestamp */
  timestamp: number;
  /** Request duration (ms) */
  duration?: number;
}
