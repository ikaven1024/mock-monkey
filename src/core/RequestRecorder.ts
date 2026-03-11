import type { NetworkRequest } from '../types';

/**
 * Network request recorder
 */
export class RequestRecorder {
  private requests: NetworkRequest[] = [];
  private maxRecords = 500; // Maximum 500 records
  private listeners: Set<(requests: NetworkRequest[]) => void> = new Set();

  /**
   * Add request record
   */
  addRequest(request: NetworkRequest): void {
    this.requests.unshift(request);
    // Limit record count
    if (this.requests.length > this.maxRecords) {
      this.requests = this.requests.slice(0, this.maxRecords);
    }
    this.notifyListeners();
  }

  /**
   * Update request record (for updating response info, etc.)
   */
  updateRequest(id: string, updates: Partial<NetworkRequest>): void {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.requests[index] = { ...this.requests[index], ...updates };
      this.notifyListeners();
    }
  }

  /**
   * Get all request records
   */
  getRequests(): NetworkRequest[] {
    return [...this.requests];
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.requests = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to request changes
   */
  subscribe(listener: (requests: NetworkRequest[]) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.requests]));
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
