/**
 * VPS后端API接口类型定义
 */

import type { 
  BlogPost, 
  CreatePostRequest, 
  UpdatePostRequest, 
  PostQuery 
} from './blog'
import type { 
  MediaFile, 
  UploadResult, 
  MediaQuery 
} from './media'
import type { 
  LoginCredentials, 
  AuthResponse 
} from './auth'
import type { 
  BlogValidationRequest, 
  BlogValidationResponse 
} from './admin'
import type { 
  HealthStatus, 
  SystemInfo, 
  SyncResult, 
  SyncStatus 
} from './api'

// VPS后端API路由接口
export interface VPSBackendAPI {
  // 博客关联验证
  'POST /api/validate-blog': (request: BlogValidationRequest) => Promise<BlogValidationResponse>
  
  // 系统状态
  'GET /api/health': () => Promise<HealthStatus>
  'GET /api/info': () => Promise<SystemInfo>
  
  // 认证（需要先通过博客验证）
  'POST /api/auth/login': (credentials: LoginCredentials) => Promise<AuthResponse>
  'POST /api/auth/refresh': (token: string) => Promise<AuthResponse>
  'POST /api/auth/logout': () => Promise<void>
  
  // 文章管理（需要认证）
  'GET /api/posts': (query?: PostQuery) => Promise<BlogPost[]>
  'GET /api/posts/:path': (path: string) => Promise<BlogPost>
  'POST /api/posts': (post: CreatePostRequest) => Promise<BlogPost>
  'PUT /api/posts/:path': (path: string, post: UpdatePostRequest) => Promise<BlogPost>
  'DELETE /api/posts/:path': (path: string) => Promise<void>
  
  // 媒体文件（需要认证）
  'POST /api/media/upload': (file: FormData) => Promise<UploadResult>
  'GET /api/media': (query?: MediaQuery) => Promise<MediaFile[]>
  'DELETE /api/media/:path': (path: string) => Promise<void>
  
  // GitHub同步（需要认证）
  'POST /api/sync/pull': () => Promise<SyncResult>
  'POST /api/sync/push': () => Promise<SyncResult>
  'GET /api/sync/status': () => Promise<SyncStatus>
}

// API端点类型
export type APIEndpoint = keyof VPSBackendAPI

// HTTP方法类型
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API路由定义
export interface APIRoute {
  method: HTTPMethod
  path: string
  handler: (...args: any[]) => Promise<any>
  middleware?: string[]
  auth?: boolean
  validation?: any
}

// 中间件类型
export interface Middleware {
  name: string
  handler: (req: any, res: any, next: any) => void | Promise<void>
}

// 请求上下文
export interface RequestContext {
  user?: any
  blogConfig?: any
  permissions?: string[]
  requestId: string
  timestamp: Date
}

// API响应包装器
export interface APIResponseWrapper<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    requestId: string
    timestamp: Date
    version: string
  }
}

// 批量API操作
export interface BatchAPIRequest<T = any> {
  operations: Array<{
    id: string
    method: HTTPMethod
    path: string
    data?: T
  }>
}

export interface BatchAPIResponse<T = any> {
  results: Array<{
    id: string
    success: boolean
    data?: T
    error?: string
  }>
  summary: {
    total: number
    success: number
    failed: number
  }
}

// WebSocket事件类型
export interface WebSocketEvent {
  type: 'sync' | 'notification' | 'status' | 'error'
  data: any
  timestamp: Date
}

// 实时通知
export interface RealtimeNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}
