/**
 * 管理页面相关类型定义
 */

// 管理页面路由类型
export type AdminRoute = 
  | 'dashboard' 
  | 'editor' 
  | 'posts' 
  | 'media' 
  | 'settings' 
  | 'sync'

// 验证状态接口
export interface ValidationState {
  isValidated: boolean
  backendUrl: string
  blogConfig: any
  validationError: string
}

// 后端连接状态接口
export interface BackendStatus {
  connected: boolean
  url: string
  latency: number
  lastCheck: Date
  blogAssociated: boolean
}

// 后端配置接口
export interface BackendConfig {
  enabled?: boolean
  url?: string
  allowedOrigins?: string[]
}

// 管理页面配置接口
export interface AdminConfig {
  // 后端连接配置
  backend: {
    enabled: boolean
    apiUrl: string
    timeout: number
  }
  
  // GitHub直连配置（纯前端模式）
  github: {
    enabled: boolean
    token: string
    owner: string
    repo: string
    branch: string
  }
  
  // 编辑器配置
  editor: {
    theme: 'light' | 'dark'
    autoSave: boolean
    previewSync: boolean
  }
}

// 博客验证请求接口
export interface BlogValidationRequest {
  blogUrl: string
  blogTitle: string
  timestamp: number
}

// 博客验证响应接口
export interface BlogValidationResponse {
  valid: boolean
  associatedBlog?: string
  configMatches: boolean
  allowedFeatures?: string[]
  error?: string
}

// 验证结果接口
export interface ValidationResult {
  success: boolean
  blogUrl?: string
  configMatches: boolean
  error?: string
}

// 连接结果接口
export interface ConnectionResult {
  success: boolean
  latency?: number
  version?: string
  features?: string[]
  error?: string
}

// 通知接口
export interface AdminNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

// 路由配置接口
export interface AdminRouteConfig {
  path: AdminRoute
  name: string
  icon: string
  description?: string
  requiresAuth?: boolean
  component?: any
}

// 导航菜单项接口
export interface AdminNavItem {
  route: AdminRoute
  name: string
  icon: string
  badge?: string | number
  children?: AdminNavItem[]
}
