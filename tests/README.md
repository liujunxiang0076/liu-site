# 测试框架配置文档

## 概述

本项目配置了完整的测试框架，支持单元测试和属性基础测试（Property-Based Testing），用于验证在线博客编辑器的正确性。

## 技术栈

- **Vitest**: 现代化的测试运行器，基于Vite构建
- **fast-check**: 属性基础测试库，用于生成随机测试数据
- **Vue Test Utils**: Vue组件测试工具
- **jsdom**: 浏览器环境模拟

## 目录结构

```
tests/
├── admin/                    # 管理页面组件测试
├── property/                 # 属性基础测试
├── utils/                    # 测试工具和生成器
│   ├── generators.ts         # 数据生成器
│   ├── helpers.ts           # 测试辅助函数
│   ├── property-config.ts   # 属性测试配置
│   └── index.ts             # 统一导出
├── setup.ts                 # 测试环境设置
├── config-verification.test.ts  # 配置验证测试
└── README.md               # 本文档
```

## 配置文件

### vitest.config.ts

主要配置：
- 测试环境：jsdom（浏览器环境模拟）
- 超时时间：15秒（适合属性测试）
- 覆盖率阈值：80%
- 文件匹配：支持 `.test.ts` 和 `.property.test.ts`

### tests/setup.ts

全局设置：
- VitePress composables 模拟
- fetch API 模拟
- localStorage/IndexedDB 模拟
- 浏览器API模拟（ResizeObserver, IntersectionObserver）
- 属性测试配置

## 数据生成器

### 基础生成器 (generators.ts)

提供各种数据类型的生成器：

```typescript
import { generators } from '@tests/utils'

// URL生成器
const url = generators.url()
const secureUrl = generators.secureUrl()

// 博客配置生成器
const blogConfig = generators.blogConfig()

// 文章数据生成器
const blogPost = generators.blogPost()

// 媒体文件生成器
const mediaFile = generators.mediaFile()

// 用户认证生成器
const authUser = generators.authUser()
```

### 约束生成器 (constrainedGenerators)

生成符合特定约束的数据：

```typescript
import { constrainedGenerators } from '@tests/utils'

// 有效的GitHub仓库名
const repoName = constrainedGenerators.validRepoName()

// 有效的文件路径
const filePath = constrainedGenerators.validFilePath()

// 有效的JWT令牌
const jwtToken = constrainedGenerators.jwtToken()
```

## 测试辅助函数

### 模拟数据创建 (testHelpers)

```typescript
import { testHelpers } from '@tests/utils'

// 创建模拟响应
const response = testHelpers.createMockResponse({ success: true })

// 创建模拟博客配置
const config = testHelpers.createMockBlogConfig({
  siteMeta: { title: 'My Blog' }
})

// 创建模拟文章
const post = testHelpers.createMockPost({
  frontmatter: { title: 'Test Post' }
})
```

### 性能测试 (performanceHelpers)

```typescript
import { performanceHelpers } from '@tests/utils'

// 测量执行时间
const { result, duration } = await performanceHelpers.measureTime(async () => {
  return await someAsyncOperation()
})

// 验证性能要求
performanceHelpers.assertPerformance(duration, 1000, 'API call')
```

## 属性基础测试

### 配置

```typescript
import { propertyTestConfig } from '@tests/utils'

// 默认配置
const config = {
  numRuns: 100,        // 运行100次
  timeout: 10000,      // 10秒超时
  verbose: true,       // 详细输出
  endOnFailure: true   // 遇到失败时停止
}
```

### 编写属性测试

```typescript
import { describe, it, fc, generators, propertyTestConfig } from '@tests/utils'

describe('Property Tests', () => {
  it('Feature: online-blog-editor, Property 1: 配置驱动的API路由', () => {
    fc.assert(
      fc.property(
        generators.systemConfig(),
        (config) => {
          // 测试逻辑
          const adapter = createAPIAdapter(config)
          expect(adapter).toBeDefined()
        }
      ),
      propertyTestConfig
    )
  })
})
```

### 属性测试标签

每个属性测试必须使用标准标签格式：

```
Feature: {feature_name}, Property {number}: {property_text}
```

示例：
```
Feature: online-blog-editor, Property 1: 配置驱动的API路由
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行测试并监听变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npx vitest --run tests/property/config-routing.property.test.ts

# 运行属性测试（带警告标记）
npx vitest --run tests/property/ --reporter=verbose
```

### 测试类型

1. **单元测试**: 测试具体功能和边界情况
2. **属性测试**: 验证通用属性和不变量
3. **集成测试**: 测试组件间交互
4. **性能测试**: 验证性能要求

## 最佳实践

### 单元测试

- 测试具体的输入输出场景
- 验证边界条件和错误情况
- 使用描述性的测试名称
- 保持测试简单和专注

### 属性测试

- 每个属性测试至少运行100次
- 使用合适的数据生成器
- 验证不变量和通用属性
- 包含往返测试（round-trip）
- 测试幂等性（idempotence）

### 数据生成

- 使用约束生成器确保数据有效性
- 避免生成过于复杂的数据结构
- 考虑边界值和特殊情况
- 使用有意义的默认值

### 错误处理

- 测试各种错误情况
- 验证错误消息的准确性
- 确保优雅的错误恢复
- 测试网络错误和超时

## 故障排除

### 常见问题

1. **fast-check错误**: 确保生成器返回有效的Arbitrary对象
2. **超时错误**: 增加testTimeout配置或优化测试逻辑
3. **模拟失败**: 检查setup.ts中的模拟配置
4. **类型错误**: 确保导入正确的类型定义

### 调试技巧

```typescript
// 启用详细输出
fc.assert(property, { ...propertyTestConfig, verbose: true })

// 使用特定种子重现问题
fc.assert(property, { ...propertyTestConfig, seed: 12345 })

// 减少运行次数进行调试
fc.assert(property, { ...propertyTestConfig, numRuns: 10 })
```

## 扩展测试框架

### 添加新的生成器

1. 在 `tests/utils/generators.ts` 中添加生成器函数
2. 导出新的生成器
3. 在 `tests/utils/index.ts` 中重新导出
4. 编写验证测试

### 添加新的测试工具

1. 在 `tests/utils/helpers.ts` 中添加辅助函数
2. 确保函数有适当的类型定义
3. 编写使用示例和文档
4. 添加单元测试验证功能

### 配置新的测试环境

1. 更新 `vitest.config.ts` 配置
2. 在 `tests/setup.ts` 中添加必要的模拟
3. 更新类型定义和导入
4. 运行配置验证测试

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [fast-check 文档](https://fast-check.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [属性基础测试指南](https://hypothesis.works/articles/what-is-property-based-testing/)
