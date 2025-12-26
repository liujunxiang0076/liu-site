/**
 * 系统配置相关类型定义
 */

import type { RepoConfig } from './api'

// 部署模式
export type DeploymentMode = 'frontend-only' | 'backend-enabled'

// 编辑器主题
export type EditorTheme = 'light' | 'dark' | 'auto'

// 编辑器配置
export interface EditorConfig {
  theme: EditorTheme
  fontSize: number
  wordWrap: boolean
  minimap: boolean
  autoSave: boolean
  autoSaveInterval: number
  previewSync: boolean
}

// 媒体配置
export interface MediaConfig {
  maxFileSize: number
  allowedTypes: string[]
  enableThumbnails: boolean
  compressionQuality: number
  uploadPath: string
}

// 安全配置
export interface SecurityConfig {
  enableRateLimit: boolean
  maxRequestsPerMinute: number
  enableCORS: boolean
  allowedOrigins: string[]
}

// 系统配置模型
export interface SystemConfig {
  // 部署模式
  deploymentMode: DeploymentMode
  
  // GitHub配置
  github: RepoConfig
  
  // 编辑器配置
  editor: EditorConfig
  
  // 媒体配置
  media: MediaConfig
  
  // 安全配置
  security: SecurityConfig
}

// VitePress主题配置扩展
export interface ExtendedThemeConfig {
  // 现有配置
  siteMeta: {
    title: string
    description: string
    site: string
  }
  
  // 新增：后端服务配置
  adminBackend?: {
    url: string
    enabled: boolean
    allowedOrigins?: string[]
  }
}

// VPS后端配置
export interface VPSBackendConfig {
  // 服务配置
  server: {
    port: number
    host: string
    cors: {
      origin: string[]
      credentials: boolean
    }
  }
  
  // 关联博客配置
  associatedBlog: {
    url: string
    title: string
    allowedOrigins: string[]
  }
  
  // GitHub配置
  github: RepoConfig & {
    token: string
  }
  
  // 认证配置
  auth: {
    jwtSecret: string
    tokenExpiry: string
    adminUsers: string[]
  }
  
  // 存储配置
  storage: {
    type: 'github' | 'local'
    localPath?: string
  }
}

// 环境变量配置
export interface EnvironmentConfig {
  // 服务配置
  PORT: number
  HOST: string
  NODE_ENV: 'development' | 'production' | 'test'
  
  // 博客关联
  ASSOCIATED_BLOG_URL: string
  ASSOCIATED_BLOG_TITLE: string
  ALLOWED_ORIGINS: string
  
  // GitHub配置
  GITHUB_TOKEN: string
  GITHUB_OWNER: string
  GITHUB_REPO: string
  GITHUB_BRANCH: string
  GITHUB_POSTS_PATH: string
  GITHUB_MEDIA_PATH: string
  
  // 认证配置
  JWT_SECRET: string
  JWT_EXPIRY: string
  ADMIN_USERS: string
  
  // CORS配置
  CORS_ORIGINS: string
}

// 配置验证结果
export interface ConfigValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
  }>
  warnings: Array<{
    field: string
    message: string
  }>
}

// 运行时配置接口
export interface RuntimeConfig {
  // 当前运行模式
  mode: DeploymentMode
  
  // 活动配置
  activeConfig: SystemConfig
  
  // 配置来源
  configSource: 'file' | 'environment' | 'runtime'
  
  // 配置更新方法
  updateConfig(newConfig: Partial<SystemConfig>): Promise<void>
  validateConfig(config: SystemConfig): ConfigValidationResult
  resetToDefaults(): void
}

// 配置管理器接口
export interface ConfigManager {
  // 配置加载和保存
  loadConfig(): Promise<SystemConfig>
  saveConfig(config: SystemConfig): Promise<void>
  
  // 配置验证
  validateConfig(config: SystemConfig): ConfigValidationResult
  
  // 配置监听
  onConfigChange(callback: (config: SystemConfig) => void): void
  
  // 默认配置
  getDefaultConfig(): SystemConfig
}
