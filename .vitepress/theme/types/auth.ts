/**
 * 用户认证相关类型定义
 */

// GitHub用户信息
export interface GitHubInfo {
  login: string
  id: number
  nodeId: string
  permissions: string[]
}

// 认证令牌
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  scope: string[]
}

// 用户权限
export interface UserPermissions {
  canWrite: boolean
  canDelete: boolean
  canUploadMedia: boolean
}

// 用户认证模型
export interface AuthUser {
  // 基本信息
  id: string
  username: string
  email?: string
  avatar?: string
  
  // GitHub信息
  githubInfo?: GitHubInfo
  
  // 认证令牌
  tokens: AuthTokens
  
  // 权限设置
  permissions: UserPermissions
}

// 登录凭据
export interface LoginCredentials {
  username: string
  password: string
}

// 认证响应
export interface AuthResponse {
  success: boolean
  user?: AuthUser
  token?: string
  refreshToken?: string
  expiresIn?: number
  error?: string
}

// JWT载荷
export interface JWTPayload {
  userId: string
  username: string
  permissions: UserPermissions
  iat: number
  exp: number
}

// OAuth配置
export interface OAuthConfig {
  clientId: string
  clientSecret?: string
  redirectUri: string
  scope: string[]
}

// GitHub OAuth配置
export interface GitHubOAuthConfig extends OAuthConfig {
  authUrl: string
  tokenUrl: string
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
  error: string | null
}
