/**
 * 后端验证服务
 * 处理博客与后端的关联验证流程
 */

import type { 
  BlogValidationRequest, 
  BlogValidationResponse, 
  ValidationResult,
  BackendConfig 
} from '../types/admin'

export class BackendValidator {
  private blogConfig: any
  private backendConfig: BackendConfig

  constructor(blogConfig: any, backendConfig: BackendConfig) {
    this.blogConfig = blogConfig
    this.backendConfig = backendConfig
  }

  /**
   * 验证后端关联
   * @param inputUrl 输入的后端URL
   * @returns 验证结果
   */
  async validateAssociation(inputUrl: string): Promise<ValidationResult> {
    try {
      // 1. 检查输入URL是否在允许列表中
      if (!this.isUrlAllowed(inputUrl)) {
        return {
          success: false,
          configMatches: false,
          error: '输入的后端地址不在博客配置的允许列表中'
        }
      }

      // 2. 检查URL格式
      if (!this.isValidUrl(inputUrl)) {
        return {
          success: false,
          configMatches: false,
          error: '请输入有效的URL地址'
        }
      }

      // 3. 向后端发送验证请求
      const validationRequest: BlogValidationRequest = {
        blogUrl: this.blogConfig.siteMeta?.site || '',
        blogTitle: this.blogConfig.siteMeta?.title || '',
        timestamp: Date.now()
      }

      const response = await this.sendValidationRequest(inputUrl, validationRequest)
      
      if (!response.valid) {
        return {
          success: false,
          configMatches: response.configMatches,
          error: response.error || '后端验证失败'
        }
      }

      // 4. 验证成功
      return {
        success: true,
        blogUrl: response.associatedBlog,
        configMatches: response.configMatches,
        error: undefined
      }

    } catch (error) {
      console.error('Backend validation error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          configMatches: false,
          error: '无法连接到后端服务，请检查网络连接和服务器状态'
        }
      }

      return {
        success: false,
        configMatches: false,
        error: error instanceof Error ? error.message : '验证过程中发生未知错误'
      }
    }
  }

  /**
   * 检查URL是否在允许列表中
   * @param url 要检查的URL
   * @returns 是否允许
   */
  private isUrlAllowed(url: string): boolean {
    const allowedUrls = this.backendConfig.allowedOrigins || []
    const configUrl = this.backendConfig.url

    return allowedUrls.includes(url) || url === configUrl
  }

  /**
   * 验证URL格式
   * @param url 要验证的URL
   * @returns 是否有效
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * 发送验证请求到后端
   * @param backendUrl 后端URL
   * @param request 验证请求数据
   * @returns 验证响应
   */
  private async sendValidationRequest(
    backendUrl: string, 
    request: BlogValidationRequest
  ): Promise<BlogValidationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {
      const response = await fetch(`${backendUrl}/api/validate-blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // 处理HTTP错误状态
        switch (response.status) {
          case 400:
            throw new Error('请求参数错误，请检查博客配置')
          case 401:
            throw new Error('未授权访问，请检查后端配置')
          case 403:
            throw new Error('访问被拒绝，此博客未被授权连接到该后端')
          case 404:
            throw new Error('后端服务不存在或验证接口未找到')
          case 500:
            throw new Error('后端服务内部错误')
          case 503:
            throw new Error('后端服务暂时不可用')
          default:
            throw new Error(`后端服务响应错误 (${response.status})`)
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('后端服务返回了无效的响应格式')
      }

      const result = await response.json()
      
      // 验证响应数据结构
      if (typeof result.valid !== 'boolean') {
        throw new Error('后端服务返回了无效的验证结果')
      }

      return result

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试')
      }
      
      throw error
    }
  }

  /**
   * 测试后端连接
   * @param backendUrl 后端URL
   * @returns 连接测试结果
   */
  async testConnection(backendUrl: string): Promise<{
    success: boolean
    latency?: number
    version?: string
    error?: string
  }> {
    const startTime = performance.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch(`${backendUrl}/api/health`, {
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
          error: `连接测试失败 (${response.status})`
        }
      }

      const result = await response.json()
      
      return {
        success: true,
        latency,
        version: result.version || 'unknown'
      }

    } catch (error) {
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          latency,
          error: '连接超时'
        }
      }

      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : '连接失败'
      }
    }
  }

  /**
   * 获取后端服务信息
   * @param backendUrl 后端URL
   * @returns 服务信息
   */
  async getServerInfo(backendUrl: string): Promise<{
    success: boolean
    info?: {
      version: string
      features: string[]
      uptime: number
    }
    error?: string
  }> {
    try {
      const response = await fetch(`${backendUrl}/api/info`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          success: false,
          error: `获取服务信息失败 (${response.status})`
        }
      }

      const info = await response.json()
      
      return {
        success: true,
        info: {
          version: info.version || 'unknown',
          features: info.features || [],
          uptime: info.uptime || 0
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取服务信息失败'
      }
    }
  }
}

/**
 * 创建后端验证器实例
 * @param blogConfig 博客配置
 * @param backendConfig 后端配置
 * @returns 验证器实例
 */
export function createBackendValidator(blogConfig: any, backendConfig: BackendConfig): BackendValidator {
  return new BackendValidator(blogConfig, backendConfig)
}

/**
 * 验证后端URL格式
 * @param url URL字符串
 * @returns 是否有效
 */
export function validateBackendUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && 
           urlObj.hostname.length > 0
  } catch {
    return false
  }
}

/**
 * 格式化验证错误信息
 * @param error 错误对象
 * @returns 格式化的错误信息
 */
export function formatValidationError(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '验证过程中发生未知错误'
}
