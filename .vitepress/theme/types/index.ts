/**
 * 类型定义统一导出
 */

// 管理页面类型
export type {
  AdminRoute,
  AdminRoutes,
  BlogEditor,
  PostManager as AdminPostManager,
  MediaManager,
  SystemSettings,
  AdminDashboard,
  BackendConfigComponent,
  BackendValidator,
  ConnectionManager as AdminConnectionManager,
  ValidationState,
  BackendStatus,
  BackendConfig,
  AdminConfig,
  BlogValidationRequest,
  BlogValidationResponse,
  ValidationResult as AdminValidationResult,
  ConnectionResult,
  AdminNotification,
  AdminRouteConfig,
  AdminNavItem
} from './admin'

// 博客文章类型
export * from './blog'

// 媒体文件类型
export * from './media'

// 用户认证类型
export * from './auth'

// API接口类型
export type {
  APIAdapter,
  GitHubAPIAdapter,
  BackendAPIAdapter,
  APIAdapterFactory,
  APIAdapterFactoryImpl,
  FileContent,
  GitHubAPIConfig,
  BackendAPIConfig,
  RepoConfig,
  APIResponse,
  PaginatedResponse,
  HealthStatus,
  SystemInfo,
  SyncResult,
  SyncStatus,
  APIError,
  FileOperationError,
  NetworkErrorHandler,
  NetworkErrorHandlerImpl,
  APIErrorHandler,
  BatchOperationManager,
  PostManager,
  MediaHandler,
  ConnectionManager,
  ConnectionResult as APIConnectionResult,
  BackendStatus as APIBackendStatus
} from './api'

// VPS后端API类型
export * from './backend-api'

// 系统配置类型
export type {
  DeploymentMode,
  EditorTheme,
  EditorConfig,
  MediaConfig,
  SecurityConfig,
  SystemConfig,
  ExtendedThemeConfig,
  VPSBackendConfig,
  EnvironmentConfig,
  ConfigValidationResult,
  RuntimeConfig,
  ConfigManager
} from './config'

// 本地存储类型
export type {
  OfflineOperationType,
  DraftData,
  MediaCacheData,
  LocalStorageSchema,
  SyncConflict,
  SyncState,
  IndexedDBConfig,
  StorageManager
} from './storage'

// 编辑器类型
export * from './editor'

// 通用工具类型
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 异步操作状态
export interface AsyncState<T = any> {
  loading: boolean
  data: T | null
  error: string | null
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// 排序参数
export interface SortParams<T = string> {
  field: T
  order: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams {
  query: string
  fields?: string[]
  caseSensitive?: boolean
}

// 时间范围
export interface DateRange {
  start: Date
  end: Date
}

// 操作结果
export interface OperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 批量操作结果
export interface BatchResult<T = any> {
  success: number
  failed: number
  total: number
  results: Array<OperationResult<T>>
}

// 事件处理器类型
export type EventHandler<T = any> = (event: T) => void | Promise<void>

// 组件属性类型
export interface ComponentProps {
  [key: string]: any
}

// 路由参数类型
export interface RouteParams {
  [key: string]: string | string[]
}

// 查询参数类型
export interface QueryParams {
  [key: string]: string | string[] | undefined
}

// 验证规则类型
export interface ValidationRule<T = any> {
  field: keyof T
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

// 验证结果类型
export interface ValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    code?: string
  }>
}

// 表单字段类型
export interface FormField<T = any> {
  name: keyof T
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  value: any
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  validation?: ValidationRule<T>[]
  disabled?: boolean
  required?: boolean
}

// 模态框配置类型
export interface ModalConfig {
  title: string
  content?: string
  width?: string | number
  height?: string | number
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  zIndex?: number
}

// 通知配置类型
export interface NotificationConfig {
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  showProgress?: boolean
}

// 加载状态类型
export interface LoadingState {
  loading: boolean
  text?: string
  tip?: string
  delay?: number
  size?: 'small' | 'default' | 'large'
}

// 主题配置类型
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: number
  fontSize: number
  fontFamily: string
}

// 国际化配置类型
export interface I18nConfig {
  locale: string
  fallbackLocale: string
  messages: Record<string, Record<string, string>>
}

// 性能监控类型
export interface PerformanceMetrics {
  // 编辑器性能
  editorInitTime: number
  renderTime: number
  saveTime: number
  
  // 网络性能
  apiLatency: number
  uploadSpeed: number
  downloadSpeed: number
  
  // 内存使用
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
}

// 调试信息类型
export interface DebugInfo {
  version: string
  buildTime: Date
  environment: string
  userAgent: string
  features: string[]
  config: Partial<any> // Use any to avoid circular dependency
  performance: PerformanceMetrics
}

// 系统状态类型
export interface SystemStatus {
  online: boolean
  authenticated: boolean
  connected: boolean
  syncing: boolean
  errors: string[]
  warnings: string[]
}

// 功能标志类型
export interface FeatureFlags {
  enableOfflineMode: boolean
  enableRealTimeSync: boolean
  enableAdvancedEditor: boolean
  enableMediaOptimization: boolean
  enablePerformanceMonitoring: boolean
  enableDebugMode: boolean
}
