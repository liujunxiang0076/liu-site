import * as fc from 'fast-check'

// 基础数据生成器
export const generators = {
  // URL生成器
  url: () => fc.webUrl(),
  
  // 安全的URL生成器（HTTPS）
  secureUrl: () => fc.webUrl({ validSchemes: ['https'] }),
  
  // 本地开发URL生成器
  localUrl: () => fc.constantFrom(
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000'
  ),
  
  // 博客配置生成器
  blogConfig: () => fc.record({
    siteMeta: fc.record({
      title: fc.string({ minLength: 1, maxLength: 100 }),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      site: fc.webUrl(),
      logo: fc.option(fc.string())
    }),
    adminBackend: fc.option(fc.record({
      enabled: fc.boolean(),
      url: fc.webUrl(),
      allowedOrigins: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 })
    }))
  }),
  
  // 系统配置生成器
  systemConfig: () => fc.record({
    deploymentMode: fc.constantFrom('frontend-only', 'backend-enabled'),
    github: fc.record({
      owner: fc.string({ minLength: 1, maxLength: 39 }),
      repo: fc.string({ minLength: 1, maxLength: 100 }),
      branch: fc.constantFrom('main', 'master', 'develop'),
      postsPath: fc.constantFrom('src/posts', 'posts', 'content/posts'),
      mediaPath: fc.constantFrom('public/images', 'static/images', 'assets/images')
    }),
    editor: fc.record({
      theme: fc.constantFrom('light', 'dark', 'auto'),
      fontSize: fc.integer({ min: 10, max: 24 }),
      wordWrap: fc.boolean(),
      minimap: fc.boolean(),
      autoSave: fc.boolean(),
      autoSaveInterval: fc.integer({ min: 1000, max: 30000 })
    })
  }),
  
  // Frontmatter生成器
  frontmatter: () => fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    date: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
    categories: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
    description: fc.option(fc.string({ minLength: 1, maxLength: 300 })),
    cover: fc.option(fc.webUrl()),
    draft: fc.option(fc.boolean()),
    author: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
  }),
  
  // Markdown内容生成器
  markdownContent: () => fc.string({ minLength: 10, maxLength: 10000 }),
  
  // 博客文章生成器
  blogPost: () => fc.record({
    path: fc.string({ minLength: 1, maxLength: 200 }),
    filename: fc.string({ minLength: 1, maxLength: 100 }),
    directory: fc.string({ minLength: 1, maxLength: 100 }),
    frontmatter: generators.frontmatter(),
    content: generators.markdownContent(),
    rawContent: fc.string({ minLength: 50, maxLength: 15000 }),
    fileInfo: fc.record({
      size: fc.integer({ min: 1, max: 1000000 }),
      lastModified: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
      sha: fc.option(fc.hexaString({ minLength: 40, maxLength: 40 })),
      encoding: fc.constantFrom('utf-8', 'base64')
    }),
    editState: fc.record({
      isDirty: fc.boolean(),
      lastSaved: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
      autoSaveEnabled: fc.boolean()
    })
  }),
  
  // 媒体文件生成器
  mediaFile: () => fc.record({
    filename: fc.string({ minLength: 1, maxLength: 100 }),
    originalName: fc.string({ minLength: 1, maxLength: 100 }),
    path: fc.string({ minLength: 1, maxLength: 200 }),
    url: fc.webUrl(),
    size: fc.integer({ min: 1, max: 10485760 }), // 最大10MB
    mimeType: fc.constantFrom(
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'application/pdf'
    ),
    extension: fc.constantFrom('jpg', 'png', 'gif', 'webp', 'mp4', 'pdf'),
    uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
    uploadedBy: fc.string({ minLength: 1, maxLength: 100 }),
    imageInfo: fc.option(fc.record({
      width: fc.integer({ min: 1, max: 4096 }),
      height: fc.integer({ min: 1, max: 4096 }),
      thumbnailUrl: fc.option(fc.webUrl())
    }))
  }),
  
  // 用户认证生成器
  authUser: () => fc.record({
    id: fc.uuid(),
    username: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.option(fc.emailAddress()),
    avatar: fc.option(fc.webUrl()),
    githubInfo: fc.option(fc.record({
      login: fc.string({ minLength: 1, maxLength: 39 }),
      id: fc.integer({ min: 1, max: 999999999 }),
      nodeId: fc.string({ minLength: 10, maxLength: 50 }),
      permissions: fc.array(fc.string(), { maxLength: 10 })
    })),
    tokens: fc.record({
      accessToken: fc.string({ minLength: 20, maxLength: 200 }),
      refreshToken: fc.option(fc.string({ minLength: 20, maxLength: 200 })),
      expiresAt: fc.date({ min: new Date(), max: new Date(Date.now() + 86400000) }),
      scope: fc.array(fc.string(), { maxLength: 5 })
    }),
    permissions: fc.record({
      canWrite: fc.boolean(),
      canDelete: fc.boolean(),
      canUploadMedia: fc.boolean()
    })
  }),
  
  // API错误响应生成器
  apiError: () => fc.record({
    code: fc.constantFrom(
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'VALIDATION_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'INTERNAL_ERROR'
    ),
    message: fc.string({ minLength: 1, maxLength: 200 }),
    details: fc.option(fc.anything()),
    timestamp: fc.date(),
    requestId: fc.uuid()
  }),
  
  // 网络状态生成器
  networkStatus: () => fc.record({
    online: fc.boolean(),
    effectiveType: fc.constantFrom('slow-2g', '2g', '3g', '4g'),
    downlink: fc.float({ min: 0.1, max: 100 }),
    rtt: fc.integer({ min: 50, max: 2000 })
  }),
  
  // 编辑器状态生成器
  editorState: () => fc.record({
    content: generators.markdownContent(),
    cursorPosition: fc.record({
      line: fc.integer({ min: 0, max: 1000 }),
      column: fc.integer({ min: 0, max: 200 })
    }),
    selection: fc.option(fc.record({
      startLine: fc.integer({ min: 0, max: 1000 }),
      startColumn: fc.integer({ min: 0, max: 200 }),
      endLine: fc.integer({ min: 0, max: 1000 }),
      endColumn: fc.integer({ min: 0, max: 200 })
    })),
    scrollTop: fc.integer({ min: 0, max: 10000 }),
    isDirty: fc.boolean(),
    lastChange: fc.date()
  })
}

// 约束生成器 - 生成符合特定约束的数据
export const constrainedGenerators = {
  // 有效的GitHub仓库名
  validRepoName: () => fc.string({ minLength: 1, maxLength: 100 })
    .filter(name => /^[a-zA-Z0-9._-]+$/.test(name)),
  
  // 有效的文件路径
  validFilePath: () => fc.string({ minLength: 1, maxLength: 200 })
    .filter(path => !path.includes('..') && !path.startsWith('/')),
  
  // 有效的Markdown内容（包含frontmatter）
  validMarkdownWithFrontmatter: () => fc.tuple(
    generators.frontmatter(),
    generators.markdownContent()
  ).map(([frontmatter, content]) => {
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')
    return `---\n${yamlFrontmatter}\n---\n\n${content}`
  }),
  
  // 非空字符串
  nonEmptyString: () => fc.string({ minLength: 1 }),
  
  // 有效的JWT令牌格式
  jwtToken: () => fc.tuple(
    fc.base64String(),
    fc.base64String(),
    fc.base64String()
  ).map(([header, payload, signature]) => `${header}.${payload}.${signature}`),
  
  // 有效的文件大小（不超过限制）
  validFileSize: (maxSize: number = 10485760) => fc.integer({ min: 1, max: maxSize }),
  
  // 有效的图片尺寸
  validImageDimensions: () => fc.record({
    width: fc.integer({ min: 1, max: 4096 }),
    height: fc.integer({ min: 1, max: 4096 })
  }).filter(({ width, height }) => width * height <= 16777216) // 最大16MP
}
