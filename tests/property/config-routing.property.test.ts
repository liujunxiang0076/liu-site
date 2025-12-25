import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  generators, 
  propertyTestConfig, 
  blogEditorPropertyTags,
  propertyAssertions 
} from '../utils'

// 模拟API适配器类
class GitHubAPIAdapter {
  constructor(public config: any) {}
}

class BackendAPIAdapter {
  constructor(public config: any) {}
}

// 模拟API适配器工厂函数
function createAPIAdapter(config: any) {
  if (config.deploymentMode === 'frontend-only') {
    return new GitHubAPIAdapter(config.github)
  } else if (config.deploymentMode === 'backend-enabled') {
    return new BackendAPIAdapter(config.backend)
  } else {
    // 默认返回GitHub适配器用于无效配置
    return new GitHubAPIAdapter(config.github || {})
  }
}

describe('Property Tests - Configuration Driven API Routing', () => {
  it(blogEditorPropertyTags.configDrivenRouting, () => {
    fc.assert(
      fc.property(
        generators.systemConfig(),
        (config) => {
          // 为后端模式添加backend配置
          if (config.deploymentMode === 'backend-enabled') {
            config.backend = {
              url: 'https://api.example.com',
              timeout: 5000
            }
          }
          
          const apiAdapter = createAPIAdapter(config)
          
          // 验证API路由配置
          propertyAssertions.assertAPIRouting(config, apiAdapter)
          
          // 验证适配器具有必要的方法
          expect(apiAdapter).toBeDefined()
          expect(apiAdapter.config).toBeDefined()
          
          // 根据模式验证配置
          if (config.deploymentMode === 'frontend-only') {
            expect(apiAdapter).toBeInstanceOf(GitHubAPIAdapter)
            expect(apiAdapter.config).toEqual(config.github)
          } else {
            expect(apiAdapter).toBeInstanceOf(BackendAPIAdapter)
            expect(apiAdapter.config).toEqual(config.backend)
          }
        }
      ),
      propertyTestConfig
    )
  })

  it('should handle invalid configuration gracefully', () => {
    fc.assert(
      fc.property(
        fc.record({
          deploymentMode: fc.constantFrom('invalid-mode', ''),
          github: fc.record({
            owner: fc.string({ minLength: 1, maxLength: 39 }),
            repo: fc.string({ minLength: 1, maxLength: 100 }),
            branch: fc.constantFrom('main', 'master', 'develop'),
            postsPath: fc.constantFrom('src/posts', 'posts', 'content/posts'),
            mediaPath: fc.constantFrom('public/images', 'static/images', 'assets/images')
          }),
          backend: fc.record({
            url: fc.webUrl(),
            timeout: fc.integer({ min: 1000, max: 30000 })
          })
        }),
        (invalidConfig) => {
          // 无效配置应该抛出错误或返回默认适配器
          expect(() => {
            const adapter = createAPIAdapter(invalidConfig)
            // 如果没有抛出错误，至少应该返回一个有效的适配器
            expect(adapter).toBeDefined()
          }).not.toThrow()
        }
      ),
      { ...propertyTestConfig, numRuns: 50 }
    )
  })
})
