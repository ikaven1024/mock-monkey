import type { NetworkRequest } from '../types';

/**
 * 网络请求记录器
 */
export class RequestRecorder {
  private requests: NetworkRequest[] = [];
  private maxRecords = 500; // 最多保存 500 条记录
  private listeners: Set<(requests: NetworkRequest[]) => void> = new Set();

  /**
   * 添加请求记录
   */
  addRequest(request: NetworkRequest): void {
    this.requests.unshift(request);
    // 限制记录数量
    if (this.requests.length > this.maxRecords) {
      this.requests = this.requests.slice(0, this.maxRecords);
    }
    this.notifyListeners();
  }

  /**
   * 更新请求记录（用于更新响应等信息）
   */
  updateRequest(id: string, updates: Partial<NetworkRequest>): void {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.requests[index] = { ...this.requests[index], ...updates };
      this.notifyListeners();
    }
  }

  /**
   * 获取所有请求记录
   */
  getRequests(): NetworkRequest[] {
    return this.requests;
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.requests = [];
    this.notifyListeners();
  }

  /**
   * 订阅请求变化
   */
  subscribe(listener: (requests: NetworkRequest[]) => void): () => void {
    this.listeners.add(listener);
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.requests]));
  }

  /**
   * 生成唯一 ID
   */
  static generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
