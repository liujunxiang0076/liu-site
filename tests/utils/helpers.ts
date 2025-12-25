import { vi } from 'vitest'
import type { MockedFunction } from 'vitest'

// 测试工具函数
export const testHelpers = {
  // 创建模拟的fetch响应
  createMockResponse: (data: any, status: number = 200, ok: boolean = true) => {
    return Promise.resolve({
      ok,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    } as Response)
  },

  // 模拟网络延迟
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 创建模拟的GitHub API响应
  createGitHubResponse: (content: string, sha?: string) => ({
    data: {
      content: Buffer.from(content).toString('base64'),
      sha: sha || 'mock-sha-' + Math.random().toString(36).substr(2, 9),
      encoding: 'base64',
      size: content.length,
      name: 'test-file.md',
      path: 'src/posts/test-file.md'
    }
  }),

  // 创建模拟的博客配置
  createMockBlogConfig: (overrides: any = {}) => ({
    siteMeta: {
      title: 'Test Blog',
      description: 'Test Description',
      site: 'https://test.example.com',
      ...overrides.siteMeta
    },
    adminBackend: {
      enabled: true,
      url: 'http://localhost:3000',
      allowedOrigins: ['http://localhost:3000'],
      ...overrides.adminBackend
    },
    ...overrides
  }),

  // 创建模拟的文章数据
  createMockPost: (overrides: any = {}) => ({
    path: 'src/posts/test-post.md',
    filename: 'test-post.md',
    directory: 'src/posts',
    frontmatter: {
      title: 'Test Post',
      date: new Date('2024-01-01'),
      categories: ['test'],
      tags: ['testing'],
      ...overrides.frontmatter
    },
    content: 'This is test content.',
    rawContent: '---\ntitle: Test Post\n---\nThis is test content.',
    fileInfo: {
      size: 100,
      lastModified: new Date('2024-01-01'),
      sha: 'test-sha',
      encoding: 'utf-8',
      ...overrides.fileInfo
    },
    editState: {
      isDirty: false,
      lastSaved: new Date('2024-01-01'),
      autoSaveEnabled: true,
      ...overrides.editState
    },
    ...overrides
  }),

  // 创建模拟的媒体文件
  createMockMediaFile: (overrides: any = {}) => ({
    filename: 'test-image.jpg',
    originalName: 'test-image.jpg',
    path: 'public/images/test-image.jpg',
    url: 'https://example.com/images/test-image.jpg',
    size: 1024000,
    mimeType: 'image/jpeg',
    extension: 'jpg',
    uploadedAt: new Date('2024-01-01'),
    uploadedBy: 'test-user',
    imageInfo: {
      width: 1920,
      height: 1080,
      thumbnailUrl: 'https://example.com/images/test-image-thumb.jpg'
    },
    ...overrides
  }),

  // 创建模拟的用户数据
  createMockUser: (overrides: any = {}) => ({
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    githubInfo: {
      login: 'testuser',
      id: 12345,
      nodeId: 'test-node-id',
      permissions: ['read', 'write']
    },
    tokens: {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
      scope: ['repo', 'user']
    },
    permissions: {
      canWrite: true,
      canDelete: true,
      canUploadMedia: true
    },
    ...overrides
  }),

  // 模拟localStorage操作
  mockLocalStorage: () => {
    const store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
      get store() { return { ...store } }
    }
  },

  // 模拟IndexedDB操作
  mockIndexedDB: () => {
    const databases: Record<string, any> = {}
    
    return {
      open: vi.fn((name: string) => {
        if (!databases[name]) {
          databases[name] = {
            stores: {},
            createObjectStore: vi.fn((storeName: string) => {
              databases[name].stores[storeName] = {}
              return {
                add: vi.fn(),
                get: vi.fn(),
                put: vi.fn(),
                delete: vi.fn(),
                getAll: vi.fn(() => Object.values(databases[name].stores[storeName]))
              }
            })
          }
        }
        return Promise.resolve(databases[name])
      }),
      deleteDatabase: vi.fn((name: string) => {
        delete databases[name]
        return Promise.resolve()
      }),
      get databases() { return { ...databases } }
    }
  },

  // 等待异步操作完成
  waitFor: async (condition: () => boolean, timeout: number = 5000) => {
    const start = Date.now()
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
  },

  // 创建模拟的API适配器
  createMockAPIAdapter: () => ({
    getFile: vi.fn(),
    createOrUpdateFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    uploadMedia: vi.fn(),
    deleteMedia: vi.fn()
  }),

  // 创建模拟的编辑器实例
  createMockEditor: () => ({
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    insertText: vi.fn(),
    focus: vi.fn(),
    dispose: vi.fn(),
    onDidChangeModelContent: vi.fn(),
    getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
    setPosition: vi.fn(),
    getScrollTop: vi.fn(() => 0),
    setScrollTop: vi.fn()
  }),

  // 验证属性测试结果
  validatePropertyResult: (result: any, expectedProperties: string[]) => {
    expectedProperties.forEach(prop => {
      if (!(prop in result)) {
        throw new Error(`Missing required property: ${prop}`)
      }
    })
  },

  // 生成随机测试数据
  generateTestData: {
    string: (length: number = 10) => Math.random().toString(36).substring(2, length + 2),
    number: (min: number = 0, max: number = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
    boolean: () => Math.random() > 0.5,
    array: <T>(generator: () => T, length: number = 5) => Array.from({ length }, generator),
    date: (start: Date = new Date('2020-01-01'), end: Date = new Date()) => 
      new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }
}

// 属性测试辅助函数
export const propertyTestHelpers = {
  // 运行属性测试并捕获失败
  runPropertyTest: async (testFn: () => void, config: any = {}) => {
    try {
      testFn()
      return { success: true, error: null }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }
    }
  },

  // 验证不变量
  assertInvariant: (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(`Invariant violation: ${message}`)
    }
  },

  // 验证往返属性
  assertRoundTrip: <T>(original: T, transformed: T, message: string = 'Round trip failed') => {
    if (JSON.stringify(original) !== JSON.stringify(transformed)) {
      throw new Error(`${message}: ${JSON.stringify(original)} !== ${JSON.stringify(transformed)}`)
    }
  },

  // 验证幂等性
  assertIdempotent: <T>(fn: (input: T) => T, input: T, message: string = 'Idempotent property failed') => {
    const result1 = fn(input)
    const result2 = fn(result1)
    if (JSON.stringify(result1) !== JSON.stringify(result2)) {
      throw new Error(`${message}: f(x) !== f(f(x))`)
    }
  }
}

// 性能测试辅助函数
export const performanceHelpers = {
  // 测量函数执行时间
  measureTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    return { result, duration: end - start }
  },

  // 验证性能要求
  assertPerformance: (duration: number, maxDuration: number, operation: string) => {
    if (duration > maxDuration) {
      throw new Error(`Performance requirement failed: ${operation} took ${duration}ms, expected < ${maxDuration}ms`)
    }
  },

  // 内存使用监控（模拟）
  mockMemoryUsage: () => ({
    used: Math.floor(Math.random() * 100) * 1024 * 1024, // 随机内存使用量
    total: 512 * 1024 * 1024 // 512MB总内存
  })
}
