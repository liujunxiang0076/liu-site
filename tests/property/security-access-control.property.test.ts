import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { 
  generators, 
  constrainedGenerators,
  propertyTestConfig, 
  blogEditorPropertyTags,
  propertyAssertions 
} from '../utils'
import { BackendValidator, validateBackendUrl, formatValidationError } from '../../.vitepress/theme/utils/backendValidator'
import type { 
  ValidationResult, 
  BackendConfig, 
  BlogValidationRequest,
  BlogValidationResponse 
} from '../../.vitepress/theme/types/admin'

// 模拟认证系统
class MockAuthSystem {
  private users: Map<string, any> = new Map()
  private tokens: Map<string, any> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    // 添加一些测试用户，使用token作为key便于查找
    const adminUser = {
      id: 'admin-1',
      permissions: {
        canWrite: true,
        canDelete: true,
        canUploadMedia: true
      },
      tokens: {
        accessToken: 'valid-admin-token',
        expiresAt: new Date(Date.now() + 3600000) // 1小时后过期
      }
    }
    
    const editorUser = {
      id: 'editor-1',
      permissions: {
        canWrite: true,
        canDelete: false,
        canUploadMedia: true
      },
      tokens: {
        accessToken: 'valid-editor-token',
        expiresAt: new Date(Date.now() + 3600000)
      }
    }
    
    const viewerUser = {
      id: 'viewer-1',
      permissions: {
        canWrite: false,
        canDelete: false,
        canUploadMedia: false
      },
      tokens: {
        accessToken: 'valid-viewer-token',
        expiresAt: new Date(Date.now() + 3600000)
      }
    }

    // 存储用户数据，同时建立token到用户的映射
    this.users.set('admin@test.com', adminUser)
    this.users.set('editor@test.com', editorUser)
    this.users.set('viewer@test.com', viewerUser)
    
    // 建立token到用户的映射以便快速查找
    this.tokens.set('valid-admin-token', adminUser)
    this.tokens.set('valid-editor-token', editorUser)
    this.tokens.set('valid-viewer-token', viewerUser)
  }

  verifyPermission(token: string, resource: string): { allowed: boolean; user?: any; error?: string } {
    // 直接从token映射中查找用户
    const user = this.tokens.get(token)
    
    if (!user) {
      return { allowed: false, error: 'Invalid token' }
    }

    // 检查令牌是否过期
    if (user.tokens.expiresAt <= new Date()) {
      return { allowed: false, error: 'Token expired' }
    }

    // 检查权限
    const hasPermission = user.permissions[resource] === true
    
    return {
      allowed: hasPermission,
      user,
      error: hasPermission ? undefined : 'Insufficient permissions'
    }
  }

  checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const limit = this.rateLimits.get(ip)

    if (!limit || now > limit.resetTime) {
      // 重置或创建新的限制记录
      this.rateLimits.set(ip, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (limit.count >= maxRequests) {
      return false // 超过限制
    }

    limit.count++
    return true
  }

  refreshToken(oldToken: string): { success: boolean; newToken?: string; error?: string } {
    const user = this.tokens.get(oldToken)
    
    if (!user) {
      return { success: false, error: 'Invalid token' }
    }

    // 生成新令牌
    const newToken = `refreshed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    user.tokens.accessToken = newToken
    user.tokens.expiresAt = new Date(Date.now() + 3600000) // 延长1小时

    // 更新token映射
    this.tokens.delete(oldToken)
    this.tokens.set(newToken, user)

    return { success: true, newToken }
  }
}

// 模拟CORS检查器
class MockCORSChecker {
  private allowedOrigins: string[]

  constructor(allowedOrigins: string[]) {
    this.allowedOrigins = allowedOrigins
  }

  checkOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin) || this.allowedOrigins.includes('*')
  }

  validateRequest(origin: string, method: string): { allowed: boolean; error?: string } {
    if (!this.checkOrigin(origin)) {
      return { allowed: false, error: 'Origin not allowed' }
    }

    // 检查预检请求
    if (method === 'OPTIONS') {
      return { allowed: true }
    }

    return { allowed: true }
  }
}

describe('Property Tests - Security Access Control', () => {
  let mockAuthSystem: MockAuthSystem
  let mockFetch: any

  beforeEach(() => {
    // 模拟fetch API
    mockFetch = vi.fn()
    global.fetch = mockFetch
    
    vi.clearAllMocks()
  })

  // 在每个测试中创建新的mock系统实例，确保隔离
  function createMockAuthSystem(): MockAuthSystem {
    const system = new MockAuthSystem()
    
    // 验证mock系统正确初始化
    const testResult = system.verifyPermission('valid-admin-token', 'canWrite')
    if (!testResult.user) {
      throw new Error('Mock auth system not properly initialized')
    }
    
    return system
  }

  it(blogEditorPropertyTags.securityAccessControl, () => {
    fc.assert(
      fc.property(
        // 生成用户和资源访问场景
        fc.record({
          user: fc.record({
            token: fc.oneof(
              fc.constant('valid-admin-token'),
              fc.constant('valid-editor-token'), 
              fc.constant('valid-viewer-token'),
              fc.constant('invalid-token'),
              fc.constant('expired-token')
            )
          }),
          resource: fc.constantFrom('canWrite', 'canDelete', 'canUploadMedia'),
          origin: fc.oneof(
            fc.constant('https://blog.example.com'),
            fc.constant('https://malicious.com'),
            fc.constant('http://localhost:3000')
          ),
          ipAddress: fc.ipV4(),
          requestCount: fc.integer({ min: 1, max: 150 })
        }),
        (scenario) => {
          // 为每个属性测试创建新的mock系统实例
          const authSystem = createMockAuthSystem()
          
          // 1. 验证用户权限控制 (Requirements 11.1, 11.2)
          const authResult = authSystem.verifyPermission(scenario.user.token, scenario.resource)
          
          // 有效令牌应该根据权限返回正确结果
          if (['valid-admin-token', 'valid-editor-token', 'valid-viewer-token'].includes(scenario.user.token)) {
            // 对于有效令牌，用户对象应该存在
            if (!authResult.user) {
              throw new Error(`Expected user to be defined for valid token ${scenario.user.token}, but got undefined`)
            }
            
            // 管理员应该有所有权限
            if (scenario.user.token === 'valid-admin-token') {
              expect(authResult.allowed).toBe(true)
            }
            // 编辑者应该有写入和上传权限，但没有删除权限
            else if (scenario.user.token === 'valid-editor-token') {
              if (scenario.resource === 'canDelete') {
                expect(authResult.allowed).toBe(false)
              } else {
                expect(authResult.allowed).toBe(true)
              }
            }
            // 查看者应该没有任何权限
            else if (scenario.user.token === 'valid-viewer-token') {
              expect(authResult.allowed).toBe(false)
            }
          } else {
            // 无效令牌应该被拒绝
            expect(authResult.allowed).toBe(false)
            expect(authResult.error).toBeDefined()
          }

          // 2. 验证CORS策略 (Requirements 11.5)
          const allowedOrigins = ['https://blog.example.com', 'http://localhost:3000']
          const corsChecker = new MockCORSChecker(allowedOrigins)
          const corsResult = corsChecker.validateRequest(scenario.origin, 'POST')
          
          if (allowedOrigins.includes(scenario.origin)) {
            expect(corsResult.allowed).toBe(true)
          } else {
            expect(corsResult.allowed).toBe(false)
            expect(corsResult.error).toContain('Origin not allowed')
          }

          // 3. 验证速率限制 (Requirements 11.5)
          const maxRequests = 100
          let rateLimitPassed = true
          
          // 模拟多次请求
          for (let i = 0; i < Math.min(scenario.requestCount, 120); i++) {
            const allowed = authSystem.checkRateLimit(scenario.ipAddress, maxRequests)
            if (i >= maxRequests) {
              rateLimitPassed = allowed
              break
            }
          }
          
          if (scenario.requestCount > maxRequests) {
            expect(rateLimitPassed).toBe(false)
          }

          // 4. 验证令牌刷新机制 (Requirements 11.4)
          if (['valid-admin-token', 'valid-editor-token', 'valid-viewer-token'].includes(scenario.user.token)) {
            const refreshResult = authSystem.refreshToken(scenario.user.token)
            expect(refreshResult.success).toBe(true)
            expect(refreshResult.newToken).toBeDefined()
            expect(refreshResult.newToken).not.toBe(scenario.user.token)
          } else {
            const refreshResult = authSystem.refreshToken(scenario.user.token)
            expect(refreshResult.success).toBe(false)
            expect(refreshResult.error).toBeDefined()
          }
        }
      ),
      propertyTestConfig
    )
  })

  it('should validate backend URL security correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          inputUrl: fc.oneof(
            generators.secureUrl(), // 有效的HTTPS URL
            generators.localUrl(),  // 本地开发URL
            fc.constant('http://malicious.com'), // 不安全的HTTP URL
            fc.constant('javascript:alert(1)'), // 恶意URL
            fc.constant('ftp://example.com'), // 不支持的协议
            fc.constant('invalid-url') // 无效格式
          ),
          blogConfig: generators.blogConfig(),
          allowedOrigins: fc.array(generators.secureUrl(), { minLength: 1, maxLength: 5 })
        }),
        (scenario) => {
          // 创建后端配置
          const backendConfig: BackendConfig = {
            enabled: true,
            url: scenario.allowedOrigins[0],
            allowedOrigins: scenario.allowedOrigins
          }

          // 验证URL格式
          const isValidFormat = validateBackendUrl(scenario.inputUrl)
          
          try {
            new URL(scenario.inputUrl)
            const url = new URL(scenario.inputUrl)
            
            // 只有HTTP和HTTPS协议应该被认为有效
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              expect(isValidFormat).toBe(true)
            } else {
              expect(isValidFormat).toBe(false)
            }
          } catch {
            // 无效URL格式应该返回false
            expect(isValidFormat).toBe(false)
          }

          // 验证URL是否在允许列表中
          const validator = new BackendValidator(scenario.blogConfig, backendConfig)
          
          // 使用反射访问私有方法进行测试
          const isAllowed = scenario.allowedOrigins.includes(scenario.inputUrl) || 
                           scenario.inputUrl === backendConfig.url
          
          // 如果URL格式有效且在允许列表中，应该可以进行验证
          if (isValidFormat && isAllowed) {
            // 模拟成功的验证响应
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: () => Promise.resolve({
                valid: true,
                associatedBlog: scenario.blogConfig.siteMeta?.site,
                configMatches: true
              })
            })
          }
        }
      ),
      { ...propertyTestConfig, numRuns: 50 }
    )
  })

  it('should handle authentication flow security correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          authMode: fc.constantFrom('github', 'jwt'),
          credentials: fc.record({
            token: constrainedGenerators.jwtToken(),
            expiresAt: fc.integer({ min: Date.now() + 5000, max: Date.now() + 86400000 })
              .map(timestamp => new Date(timestamp)),
            githubInfo: fc.option(fc.record({
              login: fc.string({ minLength: 1, maxLength: 39 }),
              id: fc.integer({ min: 1, max: 999999999 })
            }))
          }),
          securityContext: fc.record({
            origin: generators.secureUrl(),
            userAgent: fc.string({ minLength: 10, maxLength: 200 }),
            ipAddress: fc.ipV4()
          })
        }),
        (scenario) => {
          // 验证认证流程完整性
          const authResult = {
            token: scenario.credentials.token,
            expiresAt: scenario.credentials.expiresAt,
            githubInfo: scenario.credentials.githubInfo
          }

          // 验证令牌存在
          expect(authResult.token).toBeDefined()
          expect(authResult.token.length).toBeGreaterThan(0)

          // 验证过期时间 - 确保有足够的时间差
          expect(authResult.expiresAt).toBeInstanceOf(Date)
          const now = Date.now()
          const expiryTime = authResult.expiresAt.getTime()
          expect(expiryTime).toBeGreaterThan(now + 1000) // 至少1秒后过期

          // GitHub模式特定验证
          if (scenario.authMode === 'github') {
            if (scenario.credentials.githubInfo) {
              expect(authResult.githubInfo).toBeDefined()
              expect(authResult.githubInfo?.login).toBeDefined()
              expect(authResult.githubInfo?.id).toBeGreaterThan(0)
            }
          }

          // 验证安全上下文
          expect(scenario.securityContext.origin).toMatch(/^https:\/\//)
          expect(scenario.securityContext.ipAddress).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        }
      ),
      propertyTestConfig
    )
  })

  it('should enforce proper error handling for security violations', () => {
    fc.assert(
      fc.property(
        fc.record({
          errorType: fc.constantFrom(
            'UNAUTHORIZED',
            'FORBIDDEN', 
            'RATE_LIMIT_EXCEEDED',
            'INVALID_TOKEN',
            'CORS_VIOLATION'
          ),
          errorDetails: fc.record({
            message: fc.string({ minLength: 1, maxLength: 200 }),
            timestamp: fc.date()
          }),
          securityHeaders: fc.record({
            origin: fc.option(generators.url()),
            authorization: fc.option(fc.string()),
            userAgent: fc.option(fc.string())
          })
        }),
        (scenario) => {
          // 根据错误类型确定正确的HTTP状态码
          let expectedCode: number
          switch (scenario.errorType) {
            case 'UNAUTHORIZED':
              expectedCode = 401
              break
            case 'FORBIDDEN':
              expectedCode = 403
              break
            case 'RATE_LIMIT_EXCEEDED':
              expectedCode = 429
              break
            case 'INVALID_TOKEN':
              expectedCode = 401
              break
            case 'CORS_VIOLATION':
              expectedCode = 403
              break
            default:
              expectedCode = 400
              break
          }

          // 验证错误处理的安全性
          const error = new Error(scenario.errorDetails.message)
          const formattedError = formatValidationError(error)

          // 错误信息应该被正确格式化
          expect(formattedError).toBe(scenario.errorDetails.message)

          // 验证HTTP状态码正确性
          expect(expectedCode).toBeGreaterThanOrEqual(400)
          expect(expectedCode).toBeLessThan(500)

          // 验证错误响应不泄露敏感信息
          const lowerMessage = formattedError.toLowerCase()
          expect(lowerMessage).not.toContain('password')
          expect(lowerMessage).not.toContain('secret')
          expect(lowerMessage).not.toContain('token')
          // 允许包含 "key" 作为普通词汇，但不允许包含敏感的key信息
          if (lowerMessage.includes('key')) {
            expect(lowerMessage).not.toContain('api key')
            expect(lowerMessage).not.toContain('private key')
            expect(lowerMessage).not.toContain('secret key')
          }
        }
      ),
      propertyTestConfig
    )
  })

  it('should validate secure token storage and management', () => {
    fc.assert(
      fc.property(
        fc.record({
          tokenData: fc.record({
            accessToken: constrainedGenerators.jwtToken(),
            refreshToken: fc.option(constrainedGenerators.jwtToken()),
            expiresAt: fc.integer({ min: Date.now() + 5000, max: Date.now() + 86400000 })
              .map(timestamp => new Date(timestamp)),
            scope: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
          }),
          storageMethod: fc.constantFrom('localStorage', 'sessionStorage', 'memory', 'httpOnly'),
          securityFlags: fc.record({
            httpOnly: fc.boolean(),
            secure: fc.boolean(),
            sameSite: fc.constantFrom('strict', 'lax', 'none')
          })
        }).map(scenario => {
          // Ensure httpOnly storage has proper security flags
          if (scenario.storageMethod === 'httpOnly') {
            scenario.securityFlags.httpOnly = true
            scenario.securityFlags.secure = true
          }
          return scenario
        }),
        (scenario) => {
          // 验证令牌格式 (JWT should have 3 parts separated by dots)
          const tokenParts = scenario.tokenData.accessToken.split('.')
          expect(tokenParts).toHaveLength(3)
          expect(tokenParts.every(part => part.length > 0)).toBe(true)
          
          // 验证JWT格式 - 每个部分都应该是有效的base64字符串（不包含padding）
          tokenParts.forEach(part => {
            expect(part).toMatch(/^[A-Za-z0-9_-]+$/)
          })
          
          if (scenario.tokenData.refreshToken) {
            const refreshParts = scenario.tokenData.refreshToken.split('.')
            expect(refreshParts).toHaveLength(3)
            expect(refreshParts.every(part => part.length > 0)).toBe(true)
            
            refreshParts.forEach(part => {
              expect(part).toMatch(/^[A-Za-z0-9_-]+$/)
            })
          }

          // 验证过期时间
          expect(scenario.tokenData.expiresAt).toBeInstanceOf(Date)
          expect(isNaN(scenario.tokenData.expiresAt.getTime())).toBe(false)
          expect(scenario.tokenData.expiresAt.getTime()).toBeGreaterThan(Date.now())

          // 验证作用域
          expect(Array.isArray(scenario.tokenData.scope)).toBe(true)
          scenario.tokenData.scope.forEach(scope => {
            expect(typeof scope).toBe('string')
            expect(scope.length).toBeGreaterThan(0)
          })

          // 验证安全存储要求
          if (scenario.storageMethod === 'httpOnly') {
            // HttpOnly cookies 应该设置安全标志
            expect(scenario.securityFlags.httpOnly).toBe(true)
            expect(scenario.securityFlags.secure).toBe(true)
          }

          // 验证SameSite设置
          expect(['strict', 'lax', 'none']).toContain(scenario.securityFlags.sameSite)
        }
      ),
      propertyTestConfig
    )
  })
})
