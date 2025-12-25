import * as fc from 'fast-check'

// 属性基础测试全局配置
export const propertyTestConfig = {
  // 基础配置
  numRuns: 100, // 每个属性测试运行100次
  timeout: 10000, // 10秒超时
  seed: Date.now(), // 使用时间戳作为随机种子
  verbose: true, // 详细输出
  endOnFailure: true, // 遇到失败时停止
  
  // 性能测试配置
  performance: {
    numRuns: 50, // 性能测试运行次数较少
    timeout: 15000, // 性能测试超时时间更长
  },
  
  // 集成测试配置
  integration: {
    numRuns: 20, // 集成测试运行次数更少
    timeout: 20000, // 集成测试超时时间最长
  }
}

// 属性测试标签生成器
export const createPropertyTag = (featureName: string, propertyNumber: number, propertyText: string) => {
  return `Feature: ${featureName}, Property ${propertyNumber}: ${propertyText}`
}

// 在线博客编辑器的属性测试标签
export const blogEditorPropertyTags = {
  configDrivenRouting: createPropertyTag('online-blog-editor', 1, '配置驱动的API路由'),
  authFlowIntegrity: createPropertyTag('online-blog-editor', 2, '认证流程完整性'),
  envConfigConsistency: createPropertyTag('online-blog-editor', 3, '环境变量配置一致性'),
  errorHandlingCompleteness: createPropertyTag('online-blog-editor', 4, '错误处理和监控完整性'),
  editorFunctionality: createPropertyTag('online-blog-editor', 5, '编辑器功能完整性'),
  localStorageConsistency: createPropertyTag('online-blog-editor', 6, '本地存储一致性'),
  realtimePreviewSync: createPropertyTag('online-blog-editor', 7, '实时预览同步'),
  mediaManagementIntegrity: createPropertyTag('online-blog-editor', 8, '媒体文件管理完整性'),
  publishingFlowIntegrity: createPropertyTag('online-blog-editor', 9, '文章发布流程完整性'),
  postManagementFunctionality: createPropertyTag('online-blog-editor', 10, '文章管理功能完整性'),
  offlineSyncConsistency: createPropertyTag('online-blog-editor', 11, '离线支持和同步一致性'),
  uiResponsiveness: createPropertyTag('online-blog-editor', 12, '用户界面响应性'),
  securityAccessControl: createPropertyTag('online-blog-editor', 13, '安全访问控制'),
  performanceOptimization: createPropertyTag('online-blog-editor', 14, '性能优化机制')
}

// 属性测试断言辅助函数
export const propertyAssertions = {
  // 验证API路由配置
  assertAPIRouting: (config: any, adapter: any) => {
    if (config.deploymentMode === 'frontend-only') {
      if (adapter.constructor.name !== 'GitHubAPIAdapter') {
        throw new Error(`Expected GitHubAPIAdapter for frontend-only mode, got ${adapter.constructor.name}`)
      }
    } else if (config.deploymentMode === 'backend-enabled') {
      if (adapter.constructor.name !== 'BackendAPIAdapter') {
        throw new Error(`Expected BackendAPIAdapter for backend-enabled mode, got ${adapter.constructor.name}`)
      }
    }
  },

  // 验证认证流程
  assertAuthFlow: (authResult: any, mode: 'github' | 'jwt') => {
    if (!authResult.token) {
      throw new Error('Authentication must return a valid token')
    }
    if (!authResult.expiresAt || authResult.expiresAt <= new Date()) {
      throw new Error('Authentication token must have a valid expiration date')
    }
    if (mode === 'github' && !authResult.githubInfo) {
      throw new Error('GitHub authentication must include GitHub user info')
    }
  },

  // 验证本地存储一致性
  assertLocalStorageConsistency: (original: any, retrieved: any) => {
    if (JSON.stringify(original) !== JSON.stringify(retrieved)) {
      throw new Error(`Local storage inconsistency: stored ${JSON.stringify(original)}, retrieved ${JSON.stringify(retrieved)}`)
    }
  },

  // 验证编辑器功能
  assertEditorFunctionality: (editor: any, content: string) => {
    if (typeof editor.setValue !== 'function') {
      throw new Error('Editor must have setValue method')
    }
    if (typeof editor.getValue !== 'function') {
      throw new Error('Editor must have getValue method')
    }
    
    editor.setValue(content)
    const retrievedContent = editor.getValue()
    
    if (retrievedContent !== content) {
      throw new Error(`Editor content mismatch: set "${content}", got "${retrievedContent}"`)
    }
  },

  // 验证预览同步
  assertPreviewSync: (editorContent: string, previewHTML: string) => {
    if (!previewHTML || previewHTML.trim() === '') {
      throw new Error('Preview must generate non-empty HTML from editor content')
    }
    
    // 基本的Markdown渲染验证
    if (editorContent.includes('#') && !previewHTML.includes('<h')) {
      throw new Error('Preview must render Markdown headers as HTML headers')
    }
    
    if (editorContent.includes('**') && !previewHTML.includes('<strong>')) {
      throw new Error('Preview must render Markdown bold text as HTML strong tags')
    }
  },

  // 验证媒体文件管理
  assertMediaManagement: (uploadResult: any, file: any) => {
    if (!uploadResult.url) {
      throw new Error('Media upload must return a valid URL')
    }
    if (!uploadResult.filename) {
      throw new Error('Media upload must return a filename')
    }
    if (uploadResult.size !== file.size) {
      throw new Error(`Media file size mismatch: expected ${file.size}, got ${uploadResult.size}`)
    }
  },

  // 验证文章发布流程
  assertPublishingFlow: (publishResult: any, post: any) => {
    if (!publishResult.success) {
      throw new Error(`Publishing failed: ${publishResult.error}`)
    }
    if (!publishResult.path) {
      throw new Error('Publishing must return the file path')
    }
    if (publishResult.operation !== 'create' && publishResult.operation !== 'update') {
      throw new Error(`Invalid publishing operation: ${publishResult.operation}`)
    }
  },

  // 验证离线同步
  assertOfflineSync: (offlineOperations: any[], syncResult: any) => {
    if (syncResult.processed !== offlineOperations.length) {
      throw new Error(`Sync mismatch: expected ${offlineOperations.length} operations, processed ${syncResult.processed}`)
    }
    if (syncResult.failed > 0 && !syncResult.conflicts) {
      throw new Error('Failed sync operations must be reported as conflicts')
    }
  },

  // 验证性能要求
  assertPerformance: (duration: number, maxDuration: number, operation: string) => {
    if (duration > maxDuration) {
      throw new Error(`Performance requirement failed: ${operation} took ${duration}ms, expected < ${maxDuration}ms`)
    }
  },

  // 验证安全访问控制
  assertSecurityControl: (accessResult: any, user: any, resource: string) => {
    if (!user.permissions) {
      throw new Error('User must have permissions defined')
    }
    
    const hasPermission = user.permissions[resource] === true
    const accessGranted = accessResult.allowed === true
    
    if (hasPermission !== accessGranted) {
      throw new Error(`Security control failed: user permission ${hasPermission}, access granted ${accessGranted}`)
    }
  }
}

// 错误分类器 - 用于属性测试失败分析
export const errorClassifier = {
  classifyError: (error: Error): 'implementation' | 'specification' | 'test' => {
    const message = error.message.toLowerCase()
    
    // 实现错误
    if (message.includes('undefined') || message.includes('null') || message.includes('not a function')) {
      return 'implementation'
    }
    
    // 规范错误
    if (message.includes('requirement') || message.includes('specification') || message.includes('invariant')) {
      return 'specification'
    }
    
    // 测试错误
    return 'test'
  },

  suggestFix: (error: Error, classification: string): string => {
    switch (classification) {
      case 'implementation':
        return '检查实现代码，确保所有方法和属性都已正确定义'
      case 'specification':
        return '检查需求规范，可能需要调整验收标准或设计文档'
      case 'test':
        return '检查测试代码，确保测试逻辑正确且生成器产生有效数据'
      default:
        return '检查错误详情并相应调整代码或测试'
    }
  }
}

// 测试数据验证器
export const dataValidators = {
  // 验证URL格式
  isValidURL: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // 验证Markdown内容
  isValidMarkdown: (content: string): boolean => {
    return typeof content === 'string' && content.length > 0
  },

  // 验证Frontmatter格式
  isValidFrontmatter: (frontmatter: any): boolean => {
    return (
      typeof frontmatter === 'object' &&
      frontmatter !== null &&
      typeof frontmatter.title === 'string' &&
      frontmatter.title.length > 0
    )
  },

  // 验证文件路径
  isValidFilePath: (path: string): boolean => {
    return (
      typeof path === 'string' &&
      path.length > 0 &&
      !path.includes('..') &&
      !path.startsWith('/')
    )
  },

  // 验证JWT令牌格式
  isValidJWT: (token: string): boolean => {
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  }
}
