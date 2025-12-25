import { vi } from 'vitest'
import * as fc from 'fast-check'

// Property-based testing configuration
export const propertyTestConfig = {
  numRuns: 100, // 每个属性测试运行100次
  timeout: 10000, // 10秒超时
  seed: Date.now(), // 使用时间戳作为随机种子
  verbose: true, // 详细输出
  endOnFailure: true // 遇到失败时停止
}

// Mock VitePress useData composable
vi.mock('vitepress', () => ({
  useData: () => ({
    theme: {
      value: {
        siteMeta: {
          title: 'Test Blog',
          description: 'Test Description',
          site: 'https://test.example.com',
          logo: '/test-logo.png'
        },
        adminBackend: {
          enabled: true,
          url: 'http://localhost:3000',
          allowedOrigins: [
            'http://localhost:3000',
            'https://api.test.com'
          ]
        }
      }
    },
    frontmatter: {
      value: {}
    },
    page: {
      value: {
        isNotFound: false
      }
    }
  }),
  useRoute: () => ({
    path: '/admin'
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})

// Mock IndexedDB for offline storage tests
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  readyState: 'done'
}

const mockIDBDatabase = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => mockIDBRequest),
      get: vi.fn(() => mockIDBRequest),
      put: vi.fn(() => mockIDBRequest),
      delete: vi.fn(() => mockIDBRequest),
      getAll: vi.fn(() => mockIDBRequest)
    }))
  }))
}

Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(() => ({
      ...mockIDBRequest,
      result: mockIDBDatabase
    })),
    deleteDatabase: vi.fn(() => mockIDBRequest)
  }
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock performance API for performance tests
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn()
  }
})

// Mock ResizeObserver for editor tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
