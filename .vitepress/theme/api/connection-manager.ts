/**
 * 连接管理器实现
 * 管理API连接状态和模式切换
 */

import type { 
  ConnectionManager as IConnectionManager,
  ConnectionResult,
  BackendStatus,
  APIAdapter,
  GitHubAPIConfig,
  BackendAPIConfig
} from '../types/api'
import type { AdminConfig } from '../types/admin'
import { createAPIAdapterFactory } from './adapters/adapter-factory'

export class ConnectionManager implements IConnectionManager {
  public isConnected: boolean = false
  public currentMode: 'frontend-only' | 'backend-enabled' = 'frontend-only'
  public backendUrl?: string
  
  private apiAdapter: APIAdapter | null = null
  private config: AdminConfig | null = null
  private adapterFactory = createAPIAdapterFactory()

  constructor(config?: AdminConfig) {
    if (config) {
      this.setConfig(config)
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: AdminConfig): void {
    this.config = config
    this.currentMode = config.backend.enabled ? 'backend-enabled' : 'frontend-only'
    this.backendUrl = config.backend.apiUrl
  }

  /**
   * 获取当前API适配器
   */
  getAPIAdapter(): APIAdapter | null {
    return this.apiAdapter
  }

  /**
   * 初始化连接
   */
  async initialize(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not set')
    }

    try {
      if (this.currentMode === 'backend-enabled') {
        await this.initializeBackendMode()
      } else {
        await this.initializeFrontendMode()
      }
    } catch (error) {
      console.error('Failed to initialize connection:', error)
      throw error
    }
  }

  /**
   * 初始化后端模式
   */
  private async initializeBackendMode(): Promise<void> {
    if (!this.config || !this.backendUrl) {
      throw new Error('Backend configuration missing')
    }

    const backendConfig: BackendAPIConfig = {
      baseURL: this.backendUrl,
      timeout: this.config.backend.timeout || 10000
    }

    this.apiAdapter = this.adapterFactory.createBackendAdapter(backendConfig)
    
    // 测试连接
    const connectionResult = await this.testConnection(this.backendUrl)
    if (!connectionResult.success) {
      throw new Error(`Backend connection failed: ${connectionResult.error}`)
    }

    this.isConnected = true
  }

  /**
   * 初始化前端模式
   */
  private async initializeFrontendMode(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration missing')
    }

    const githubConfig: GitHubAPIConfig = {
      token: this.config.github.token,
      repo: {
        owner: this.config.github.owner,
        repo: this.config.github.repo,
        branch: this.config.github.branch,
        postsPath: this.config.github.postsPath,
        mediaPath: this.config.github.mediaPath
      }
    }

    this.apiAdapter = this.adapterFactory.createGitHubAdapter(githubConfig)
    
    // Verify GitHub token
    if ('validateToken' in this.apiAdapter) {
      const isValid = await (this.apiAdapter as any).validateToken()
      if (!isValid) {
        throw new Error('Invalid GitHub token')
      }
    }

    this.isConnected = true
  }

  /**
   * 测试连接
   */
  async testConnection(url: string): Promise<ConnectionResult> {
    const startTime = performance.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      if (!response.ok) {
        return {
          success: false,
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const result = await response.json()
      
      return {
        success: true,
        latency,
        version: result.version || 'unknown',
        features: result.features || []
      }

    } catch (error) {
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          latency,
          error: 'Connection timeout'
        }
      }

      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  /**
   * 切换模式
   */
  async switchMode(mode: 'frontend-only' | 'backend-enabled'): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not set')
    }

    // 断开当前连接
    this.disconnect()

    // 更新模式
    this.currentMode = mode
    this.config.backend.enabled = mode === 'backend-enabled'
    this.config.github.enabled = mode === 'frontend-only'

    // 重新初始化
    await this.initialize()
  }

  /**
   * 验证后端URL
   */
  validateBackendUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && 
             urlObj.hostname.length > 0
    } catch {
      return false
    }
  }

  /**
   * 获取连接状态
   */
  async getConnectionStatus(): Promise<BackendStatus> {
    const now = new Date()
    
    if (!this.isConnected || !this.apiAdapter) {
      return {
        connected: false,
        url: this.backendUrl || '',
        latency: 0,
        lastCheck: now,
        blogAssociated: false
      }
    }

    if (this.currentMode === 'backend-enabled' && this.backendUrl) {
      const connectionResult = await this.testConnection(this.backendUrl)
      
      return {
        connected: connectionResult.success,
        url: this.backendUrl,
        latency: connectionResult.latency || 0,
        lastCheck: now,
        blogAssociated: connectionResult.success // 简化实现，实际应该检查博客关联状态
      }
    } else {
      // GitHub模式
      try {
        if ('validateToken' in this.apiAdapter) {
          const isValid = await (this.apiAdapter as any).validateToken()
          return {
            connected: isValid,
            url: 'GitHub API',
            latency: 0,
            lastCheck: now,
            blogAssociated: isValid
          }
        } else {
          return {
            connected: false,
            url: 'GitHub API',
            latency: 0,
            lastCheck: now,
            blogAssociated: false
          }
        }
      } catch {
        return {
          connected: false,
          url: 'GitHub API',
          latency: 0,
          lastCheck: now,
          blogAssociated: false
        }
      }
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isConnected = false
    this.apiAdapter = null
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    this.disconnect()
    await this.initialize()
  }

  /**
   * 获取API适配器类型
   */
  getAdapterType(): 'github' | 'backend' | null {
    if (!this.apiAdapter) return null
    return this.currentMode === 'frontend-only' ? 'github' : 'backend'
  }

  /**
   * 检查是否支持功能
   */
  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'realtime-sync':
        return this.currentMode === 'backend-enabled'
      case 'offline-editing':
        return true
      case 'media-upload':
        return true
      case 'collaboration':
        return this.currentMode === 'backend-enabled'
      default:
        return false
    }
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats(): {
    mode: string
    connected: boolean
    uptime: number
    requestCount: number
    errorCount: number
  } {
    // 简化实现，实际应该维护统计信息
    return {
      mode: this.currentMode,
      connected: this.isConnected,
      uptime: 0,
      requestCount: 0,
      errorCount: 0
    }
  }
}

/**
 * 创建连接管理器实例
 */
export function createConnectionManager(config?: AdminConfig): IConnectionManager {
  return new ConnectionManager(config)
}

/**
 * 全局连接管理器实例
 */
let globalConnectionManager: IConnectionManager | null = null

/**
 * 获取全局连接管理器
 */
export function getConnectionManager(): IConnectionManager {
  if (!globalConnectionManager) {
    globalConnectionManager = new ConnectionManager()
  }
  return globalConnectionManager
}

/**
 * 设置全局连接管理器
 */
export function setConnectionManager(manager: IConnectionManager): void {
  globalConnectionManager = manager
}
