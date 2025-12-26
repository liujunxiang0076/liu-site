/**
 * 后端API适配器实现
 * 处理与VPS后端API的所有交互
 */

import type { 
  BackendAPIAdapter as IBackendAPIAdapter,
  BackendAPIConfig,
  FileContent,
  SystemInfo
} from '../../types/api'
import type { 
  BlogPost, 
  CreatePostRequest, 
  UpdatePostRequest, 
  PostQuery 
} from '../../types/blog'
import type { 
  MediaFile, 
  UploadResult, 
  MediaQuery 
} from '../../types/media'
import type { 
  LoginCredentials, 
  AuthResponse 
} from '../../types/auth'

export class BackendAPIAdapter implements IBackendAPIAdapter {
  public readonly config: BackendAPIConfig
  public authToken: string | null = null

  constructor(config: BackendAPIConfig) {
    this.config = config
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token: string): void {
    this.authToken = token
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.headers
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    return headers
  }

  /**
   * 发送HTTP请求
   */
  private async request<T = any>(
    method: string, 
    endpoint: string, 
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 10000)

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage: string

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text() as any
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }

  /**
   * 用户认证
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('POST', '/api/auth/login', credentials)
      
      if (response.success && response.token) {
        this.setAuthToken(response.token)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await this.request<{ token: string }>('POST', '/api/auth/refresh')
      
      if (response.token) {
        this.setAuthToken(response.token)
        return response.token
      }
      
      throw new Error('No token received')
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 验证连接
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.request('GET', '/api/health')
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<SystemInfo> {
    try {
      return await this.request<SystemInfo>('GET', '/api/info')
    } catch (error) {
      throw new Error(`Failed to get server info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文件内容
   */
  async getFile(path: string): Promise<FileContent> {
    try {
      return await this.request<FileContent>('GET', `/api/files/${encodeURIComponent(path)}`)
    } catch (error) {
      throw new Error(`Failed to get file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 创建或更新文件
   */
  async createOrUpdateFile(path: string, content: string, message: string, sha?: string): Promise<void> {
    try {
      await this.request('PUT', `/api/files/${encodeURIComponent(path)}`, {
        content,
        message,
        sha
      })
    } catch (error) {
      throw new Error(`Failed to create/update file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string, message: string, sha?: string): Promise<void> {
    try {
      await this.request('DELETE', `/api/files/${encodeURIComponent(path)}`, {
        message,
        sha
      })
    } catch (error) {
      throw new Error(`Failed to delete file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文章列表
   */
  async listPosts(query?: PostQuery): Promise<BlogPost[]> {
    try {
      const params = new URLSearchParams()
      
      if (query?.filter) {
        if (query.filter.category) params.append('category', query.filter.category)
        if (query.filter.tag) params.append('tag', query.filter.tag)
        if (query.filter.author) params.append('author', query.filter.author)
        if (query.filter.search) params.append('search', query.filter.search)
        if (query.filter.draft !== undefined) params.append('draft', query.filter.draft.toString())
      }
      
      if (query?.sort) {
        params.append('sortField', query.sort.field)
        params.append('sortOrder', query.sort.order)
      }
      
      if (query?.pagination) {
        params.append('page', query.pagination.page.toString())
        params.append('limit', query.pagination.limit.toString())
      }

      const queryString = params.toString()
      const endpoint = queryString ? `/api/posts?${queryString}` : '/api/posts'
      
      return await this.request<BlogPost[]>('GET', endpoint)
    } catch (error) {
      throw new Error(`Failed to list posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取单篇文章
   */
  async getPost(path: string): Promise<BlogPost> {
    try {
      return await this.request<BlogPost>('GET', `/api/posts/${encodeURIComponent(path)}`)
    } catch (error) {
      throw new Error(`Failed to get post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 创建文章
   */
  async createPost(request: CreatePostRequest): Promise<BlogPost> {
    try {
      return await this.request<BlogPost>('POST', '/api/posts', request)
    } catch (error) {
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新文章
   */
  async updatePost(path: string, request: UpdatePostRequest): Promise<BlogPost> {
    try {
      return await this.request<BlogPost>('PUT', `/api/posts/${encodeURIComponent(path)}`, request)
    } catch (error) {
      throw new Error(`Failed to update post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除文章
   */
  async deletePost(path: string, message?: string): Promise<void> {
    try {
      await this.request('DELETE', `/api/posts/${encodeURIComponent(path)}`, { message })
    } catch (error) {
      throw new Error(`Failed to delete post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.config.baseURL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
          ...this.config.headers
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * 获取媒体文件列表
   */
  async listMedia(query?: MediaQuery): Promise<MediaFile[]> {
    try {
      const params = new URLSearchParams()
      
      if (query?.type) params.append('type', query.type)
      if (query?.search) params.append('search', query.search)
      if (query?.pagination) {
        params.append('page', query.pagination.page.toString())
        params.append('limit', query.pagination.limit.toString())
      }

      const queryString = params.toString()
      const endpoint = queryString ? `/api/media?${queryString}` : '/api/media'
      
      return await this.request<MediaFile[]>('GET', endpoint)
    } catch (error) {
      throw new Error(`Failed to list media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除媒体文件
   */
  async deleteMedia(path: string): Promise<void> {
    try {
      await this.request('DELETE', `/api/media/${encodeURIComponent(path)}`)
    } catch (error) {
      throw new Error(`Failed to delete media ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 同步操作 - 拉取远程更改
   */
  async syncPull(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const result = await this.request('POST', '/api/sync/pull')
      return { success: true, message: result.message }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync pull failed'
      }
    }
  }

  /**
   * 同步操作 - 推送本地更改
   */
  async syncPush(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const result = await this.request('POST', '/api/sync/push')
      return { success: true, message: result.message }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync push failed'
      }
    }
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<{
    lastSync: Date | null
    pendingChanges: number
    conflicts: number
  }> {
    try {
      const result = await this.request('GET', '/api/sync/status')
      return {
        lastSync: result.lastSync ? new Date(result.lastSync) : null,
        pendingChanges: result.pendingChanges || 0,
        conflicts: result.conflicts || 0
      }
    } catch (error) {
      throw new Error(`Failed to get sync status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      await this.request('POST', '/api/auth/logout')
    } catch (error) {
      // 即使请求失败也清除本地令牌
      console.warn('Logout request failed:', error)
    } finally {
      this.authToken = null
    }
  }
}
