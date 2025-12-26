/**
 * API适配器和接口类型定义
 */

import type { BlogPost, CreatePostRequest, UpdatePostRequest, PostQuery } from './blog'
import type { MediaFile, UploadResult, MediaQuery } from './media'
import type { AuthUser, LoginCredentials, AuthResponse } from './auth'
import type { BatchResult } from './index'

// 文件内容接口
export interface FileContent {
  content: string
  sha?: string
  encoding?: string
}

// API适配器基础接口
export interface APIAdapter {
  // 文件操作
  getFile(path: string): Promise<FileContent>
  createOrUpdateFile(path: string, content: string, message: string, sha?: string): Promise<void>
  deleteFile(path: string, message: string, sha?: string): Promise<void>
  
  // 文章管理
  listPosts(query?: PostQuery): Promise<BlogPost[]>
  getPost(path: string): Promise<BlogPost>
  createPost(request: CreatePostRequest): Promise<BlogPost>
  updatePost(path: string, request: UpdatePostRequest): Promise<BlogPost>
  deletePost(path: string, message?: string): Promise<void>
  
  // 媒体文件
  uploadMedia(file: File): Promise<UploadResult>
  listMedia(query?: MediaQuery): Promise<MediaFile[]>
  deleteMedia(path: string): Promise<void>
}

// GitHub仓库配置
export interface RepoConfig {
  owner: string
  repo: string
  branch: string
  postsPath: string
  mediaPath: string
}

// GitHub API适配器配置
export interface GitHubAPIConfig {
  token: string
  repo: RepoConfig
}

// 后端API适配器配置
export interface BackendAPIConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
}

// GitHub API适配器接口
export interface GitHubAPIAdapter extends APIAdapter {
  readonly config: GitHubAPIConfig
  readonly octokit: any // Octokit instance
  
  // GitHub特有方法
  getRateLimit(): Promise<{ remaining: number; resetAt: Date }>
  validateToken(): Promise<boolean>
  getRepositoryInfo(): Promise<{ name: string; owner: string; private: boolean }>
}

// 后端API适配器接口
export interface BackendAPIAdapter extends APIAdapter {
  readonly config: BackendAPIConfig
  readonly authToken: string | null
  
  // 后端特有方法
  authenticate(credentials: LoginCredentials): Promise<AuthResponse>
  refreshToken(): Promise<string>
  validateConnection(): Promise<boolean>
  getServerInfo(): Promise<SystemInfo>
}

// 后端API适配器配置
export interface BackendAPIConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
}

// API响应基础接口
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

// 分页响应接口
export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 健康检查响应
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  memory: {
    used: number
    total: number
  }
  github?: {
    connected: boolean
    rateLimit: {
      remaining: number
      resetAt: Date
    }
  }
}

// 系统信息响应
export interface SystemInfo {
  version: string
  environment: string
  features: string[]
  config: {
    maxFileSize: number
    allowedTypes: string[]
    supportedFormats: string[]
  }
}

// 同步结果
export interface SyncResult {
  success: boolean
  filesChanged: number
  conflicts: Array<{
    file: string
    type: 'content' | 'metadata'
    resolution: 'local' | 'remote' | 'manual'
  }>
  error?: string
}

// 同步状态
export interface SyncStatus {
  lastSync: Date
  status: 'synced' | 'pending' | 'conflict' | 'error'
  pendingChanges: number
  conflicts: number
}

// 错误响应接口
export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: Date
  requestId: string
}

// 文件操作错误
export interface FileOperationError {
  type: 'FILE_SIZE_ERROR' | 'FILE_FORMAT_ERROR' | 'UPLOAD_ERROR' | 'PERMISSION_ERROR'
  message: string
  recoverable: boolean
  suggestions?: string[]
}

// 网络错误处理器接口
export interface NetworkErrorHandler {
  detectNetworkStatus(): boolean
  retryWithBackoff(operation: () => Promise<any>, maxRetries: number): Promise<any>
  queueOfflineOperation(operation: OfflineOperation): void
  processOfflineQueue(): Promise<void>
}

// 离线操作接口 (从storage导入)
export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'upload'
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
}

// API适配器工厂接口
export interface APIAdapterFactory {
  createGitHubAdapter(config: GitHubAPIConfig): GitHubAPIAdapter
  createBackendAdapter(config: BackendAPIConfig): BackendAPIAdapter
  createAdapter(mode: 'frontend-only' | 'backend-enabled', config: any): APIAdapter
}

// 文章管理器接口
export interface PostManager {
  // 当前文章状态
  currentPost: BlogPost | null
  postList: BlogPost[]
  isDirty: boolean
  
  // API适配器
  apiAdapter: APIAdapter
  
  // 方法
  createPost(frontmatter: any): Promise<BlogPost>
  loadPost(path: string): Promise<BlogPost>
  savePost(post: BlogPost): Promise<void>
  publishPost(post: BlogPost): Promise<void>
  deletePost(path: string): Promise<void>
  listPosts(filter?: any): Promise<BlogPost[]>
  searchPosts(query: string): Promise<BlogPost[]>
}

// 媒体处理器接口
export interface MediaHandler {
  // 上传配置
  uploadConfig: {
    maxFileSize: number
    allowedTypes: string[]
    uploadPath: string
  }
  
  // 方法
  uploadFile(file: File): Promise<MediaFile>
  deleteFile(path: string): Promise<void>
  listFiles(): Promise<MediaFile[]>
  generateThumbnail(file: File): Promise<string>
  insertToEditor(mediaFile: MediaFile): void
}

// 连接管理器接口
export interface ConnectionManager {
  // 连接状态
  isConnected: boolean
  currentMode: 'frontend-only' | 'backend-enabled'
  backendUrl?: string
  
  // 方法
  testConnection(url: string): Promise<ConnectionResult>
  switchMode(mode: 'frontend-only' | 'backend-enabled'): Promise<void>
  validateBackendUrl(url: string): boolean
  getConnectionStatus(): Promise<BackendStatus>
}

// 连接结果接口 (从admin导入但在这里重新定义以避免循环依赖)
export interface ConnectionResult {
  success: boolean
  latency?: number
  version?: string
  features?: string[]
  error?: string
}

// 后端状态接口 (从admin导入但在这里重新定义以避免循环依赖)
export interface BackendStatus {
  connected: boolean
  url: string
  latency: number
  lastCheck: Date
  blogAssociated: boolean
}

// API适配器工厂实现接口
export interface APIAdapterFactoryImpl extends APIAdapterFactory {
  // 配置管理
  setDefaultConfig(config: Partial<GitHubAPIConfig & BackendAPIConfig>): void
  getActiveAdapter(): APIAdapter | null
  
  // 适配器缓存
  clearCache(): void
  getCachedAdapter(mode: string): APIAdapter | null
}

// 错误处理相关接口
export interface APIErrorHandler {
  handleGitHubAPIError(error: any): APIError
  handleBackendAPIError(error: any): APIError
  handleNetworkError(error: any): APIError
}

export interface NetworkErrorHandlerImpl extends NetworkErrorHandler {
  // 网络状态管理
  isOnline: boolean
  onlineStatusChanged: (callback: (isOnline: boolean) => void) => void
  
  // 重试配置
  retryConfig: {
    maxRetries: number
    baseDelay: number
    maxDelay: number
  }
}

// 批量操作接口
export interface BatchOperationManager {
  // 批量文章操作
  batchCreatePosts(posts: CreatePostRequest[]): Promise<BatchResult<BlogPost>>
  batchUpdatePosts(updates: Array<{ path: string; request: UpdatePostRequest }>): Promise<BatchResult<BlogPost>>
  batchDeletePosts(paths: string[]): Promise<BatchResult<void>>
  
  // 批量媒体操作
  batchUploadMedia(files: File[]): Promise<BatchResult<MediaFile>>
  batchDeleteMedia(paths: string[]): Promise<BatchResult<void>>
}
