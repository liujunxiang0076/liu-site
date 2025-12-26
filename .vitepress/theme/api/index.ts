/**
 * API模块统一导出
 */

// 适配器实现
export { GitHubAPIAdapter } from './adapters/github-adapter'
export { BackendAPIAdapter } from './adapters/backend-adapter'
export { 
  APIAdapterFactory,
  createAPIAdapterFactory,
  createGitHubAdapter,
  createBackendAdapter,
  createAdapter
} from './adapters/adapter-factory'

// 连接管理
export { 
  ConnectionManager,
  createConnectionManager,
  getConnectionManager,
  setConnectionManager
} from './connection-manager'

// 文章管理
export { 
  PostManager,
  createPostManager
} from './post-manager'

// 媒体处理
export { 
  MediaHandler,
  createMediaHandler
} from './media-handler'

// 便捷函数：创建完整的API服务
export function createAPIServices(config: {
  mode: 'frontend-only' | 'backend-enabled'
  github?: any
  backend?: any
}) {
  const factory = new APIAdapterFactory()
  
  let adapter
  if (config.mode === 'frontend-only') {
    adapter = factory.createGitHubAdapter(config.github)
  } else {
    adapter = factory.createBackendAdapter(config.backend)
  }
  
  const connectionManager = new ConnectionManager()
  const postManager = new PostManager(adapter)
  const mediaHandler = new MediaHandler(adapter)
  
  return {
    adapter,
    connectionManager,
    postManager,
    mediaHandler
  }
}
