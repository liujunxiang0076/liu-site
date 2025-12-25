/**
 * 管理后台相关类型定义
 */

// 验证状态
export interface ValidationState {
  isValidated: boolean
  backendUrl: string
  blogConfig: any
  validationError: string
}

// 后端连接状态
export interface BackendStatus {
  connected: boolean
  url: string
  latency: number
  lastCheck: Date
  blogAssociated: boolean
}

// 后端配置
export interface BackendConfig {
  enabled?: boolean
  url?: string
  allowedOrigins?: string[]
  timeout?: number
}

// 博客文章模型
export interface BlogPost {
  // 文件路径信息
  path: string
  filename: string
  directory: string
  
  // Frontmatter元数据
  frontmatter: {
    title: string
    date: Date
    categories: string[]
    tags: string[]
    description?: string
    cover?: string
    draft?: boolean
    author?: string
  }
  
  // 文章内容
  content: string
  rawContent: string // 包含frontmatter的原始内容
  
  // 文件信息
  fileInfo: {
    size: number
    lastModified: Date
    sha?: string // GitHub文件SHA
    encoding: string
  }
  
  // 编辑状态
  editState: {
    isDirty: boolean
    lastSaved: Date
    autoSaveEnabled: boolean
  }
}

// 媒体文件模型
export interface MediaFile {
  // 基本信息
  filename: string
  originalName: string
  path: string
  url: string
  
  // 文件属性
  size: number
  mimeType: string
  extension: string
  
  // 上传信息
  uploadedAt: Date
  uploadedBy: string
  
  // 图片特有属性
  imageInfo?: {
    width: number
    height: number
    thumbnailUrl?: string
  }
}

// 用户认证模型
export interface AuthUser {
  // 基本信息
  id: string
  username: string
  email?: string
  avatar?: string
  
  // GitHub信息
  githubInfo?: {
    login: string
    id: number
    nodeId: string
    permissions: string[]
  }
  
  // 认证令牌
  tokens: {
    accessToken: string
    refreshToken?: string
    expiresAt: Date
    scope: string[]
  }
  
  // 权限设置
  permissions: {
    canWrite: boolean
    canDelete: boolean
    canUploadMedia: boolean
  }
}

// 系统配置模型
export interface SystemConfig {
  // 部署模式
  deploymentMode: 'frontend-only' | 'backend-enabled'
  
  // GitHub配置
  github: {
    owner: string
    repo: string
    branch: string
    postsPath: string
    mediaPath: string
  }
  
  // 编辑器配置
  editor: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: number
    wordWrap: boolean
    minimap: boolean
    autoSave: boolean
    autoSaveInterval: number
  }
  
  // 媒体配置
  media: {
    maxFileSize: number
    allowedTypes: string[]
    enableThumbnails: boolean
    compressionQuality: number
  }
  
  // 安全配置
  security: {
    enableRateLimit: boolean
    maxRequestsPerMinute: number
    enableCORS: boolean
    allowedOrigins: string[]
  }
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

// API适配器接口
export interface APIAdapter {
  getFile(path: string): Promise<FileContent>
  createOrUpdateFile(path: string, content: string, message: string): Promise<void>
  deleteFile(path: string, message: string): Promise<void>
  listFiles(directory?: string): Promise<string[]>
}

// 文件内容
export interface FileContent {
  content: string
  sha?: string
  encoding?: string
}

// 连接测试结果
export interface ConnectionResult {
  success: boolean
  latency?: number
  version?: string
  features?: string[]
  error?: string
}

// 博客验证请求
export interface BlogValidationRequest {
  blogUrl: string
  blogTitle: string
  timestamp: number
}

// 博客验证响应
export interface BlogValidationResponse {
  valid: boolean
  associatedBlog?: string
  configMatches: boolean
  allowedFeatures?: string[]
  error?: string
}

// 验证结果
export interface ValidationResult {
  success: boolean
  blogUrl?: string
  configMatches: boolean
  error?: string
}

// 同步状态
export interface SyncStatus {
  syncing: boolean
  hasError: boolean
  lastSync: Date | null
}

// 编辑器选项
export interface EditorOptions {
  language: string
  theme: 'vs-dark' | 'vs-light'
  wordWrap: 'on' | 'off'
  minimap: { enabled: boolean }
  fontSize: number
  lineNumbers: 'on' | 'off'
}

// 文章筛选器
export interface PostFilter {
  category?: string
  tag?: string
  status?: 'draft' | 'published'
  dateRange?: {
    start: Date
    end: Date
  }
}

// 健康状态
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

// 系统信息
export interface SystemInfo {
  version: string
  nodeVersion: string
  platform: string
  uptime: number
  features: string[]
}

// 登录凭据
export interface LoginCredentials {
  username: string
  password: string
}

// 认证响应
export interface AuthResponse {
  success: boolean
  token?: string
  refreshToken?: string
  user?: AuthUser
  error?: string
}

// 离线操作
export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  retryCount: number
}

// 本地存储模式
export interface LocalStorageSchema {
  // 草稿存储
  drafts: {
    key: string // 文章路径
    value: {
      content: string
      frontmatter: object
      lastModified: Date
      autoSaved: boolean
    }
  }
  
  // 媒体缓存
  mediaCache: {
    key: string // 文件路径
    value: {
      blob: Blob
      metadata: MediaFile
      cachedAt: Date
    }
  }
  
  // 用户设置
  userSettings: {
    key: 'editor-config' | 'ui-preferences' | 'auth-state'
    value: any
  }
  
  // 离线队列
  offlineQueue: {
    key: string // 操作ID
    value: OfflineOperation
  }
}
