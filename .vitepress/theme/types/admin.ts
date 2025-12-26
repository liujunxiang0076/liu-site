/**
 * 管理页面相关类型定义
 */

import type { ExtendedThemeConfig, EditorConfig } from './config'
import type { RepoConfig } from './api'
import type { BlogPost } from './blog'

// 管理页面路由类型
export type AdminRoute = 
  | 'dashboard' 
  | 'editor' 
  | 'posts' 
  | 'media' 
  | 'settings' 
  | 'sync'

// VitePress 路由配置
export interface AdminRoutes {
  '/admin': AdminDashboard           // 管理首页
  '/admin/editor': BlogEditor        // 文章编辑器
  '/admin/posts': PostManager        // 文章管理
  '/admin/media': MediaManager       // 媒体管理
  '/admin/settings': SystemSettings  // 系统设置
}

// 管理页面组件类型
export interface BlogEditor {
  // 编辑器相关功能
  loadPost(path: string): Promise<void>
  savePost(): Promise<void>
  createNewPost(): void
}

export interface PostManager {
  // 文章管理功能
  posts: BlogPost[]
  loadPosts(): Promise<void>
  deletePost(path: string): Promise<void>
}

export interface MediaManager {
  // 媒体管理功能
  uploadFile(file: File): Promise<void>
  deleteFile(path: string): Promise<void>
}

export interface SystemSettings {
  // 系统设置功能
  saveSettings(config: AdminConfig): Promise<void>
  loadSettings(): Promise<AdminConfig>
}

// /admin 主页面组件 - 需要验证后端关联
export interface AdminDashboard {
  // 验证状态
  validationState: {
    isValidated: boolean
    backendUrl: string
    blogConfig: ExtendedThemeConfig
    validationError?: string
  }
  
  // 后端连接状态
  backendStatus: {
    connected: boolean
    url: string
    latency: number
    lastCheck: Date
    blogAssociated: boolean  // 新增：博客关联状态
  }
  
  // 方法
  validateBackendAssociation(inputUrl: string): Promise<ValidationResult>
  loadBlogThemeConfig(): ExtendedThemeConfig
  switchToGitHubMode(): void
}

// 后端地址配置组件
export interface BackendConfigComponent {
  // 配置状态
  config: {
    currentMode: 'github' | 'backend'
    backendUrl: string
    connectionStatus: 'connected' | 'disconnected' | 'testing'
  }
  
  // 方法
  validateBackendUrl(url: string): boolean
  testConnection(url: string): Promise<ConnectionResult>
  saveConfiguration(config: AdminConfig): void
  loadConfiguration(): AdminConfig
}

// 验证状态接口
export interface ValidationState {
  isValidated: boolean
  backendUrl: string
  blogConfig: ExtendedThemeConfig
  validationError?: string
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
  github: RepoConfig & {
    enabled: boolean
    token: string
  }
  
  // 编辑器配置
  editor: EditorConfig
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

// 博客配置验证机制
export interface BackendValidator {
  blogConfig: ExtendedThemeConfig
  
  validateAssociation(inputUrl: string): Promise<ValidationResult>
  isUrlAllowed(url: string): boolean
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
