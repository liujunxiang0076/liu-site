/**
 * API适配器工厂实现
 * 根据配置创建相应的API适配器
 */

import type { 
  APIAdapterFactory as IAPIAdapterFactory,
  APIAdapter,
  GitHubAPIAdapter as IGitHubAPIAdapter,
  BackendAPIAdapter as IBackendAPIAdapter,
  GitHubAPIConfig,
  BackendAPIConfig
} from '../../types/api'
import { GitHubAPIAdapter } from './github-adapter'
import { BackendAPIAdapter } from './backend-adapter'

export class APIAdapterFactory implements IAPIAdapterFactory {
  /**
   * 创建GitHub API适配器
   */
  createGitHubAdapter(config: GitHubAPIConfig): IGitHubAPIAdapter {
    return new GitHubAPIAdapter(config)
  }

  /**
   * 创建后端API适配器
   */
  createBackendAdapter(config: BackendAPIConfig): IBackendAPIAdapter {
    return new BackendAPIAdapter(config)
  }

  /**
   * 根据模式创建适配器
   */
  createAdapter(mode: 'frontend-only' | 'backend-enabled', config: any): APIAdapter {
    if (mode === 'frontend-only') {
      if (!this.isGitHubAPIConfig(config)) {
        throw new Error('Invalid GitHub API configuration')
      }
      return this.createGitHubAdapter(config)
    } else {
      if (!this.isBackendAPIConfig(config)) {
        throw new Error('Invalid Backend API configuration')
      }
      return this.createBackendAdapter(config)
    }
  }

  /**
   * 验证GitHub API配置
   */
  private isGitHubAPIConfig(config: any): config is GitHubAPIConfig {
    return (
      config &&
      typeof config.token === 'string' &&
      config.repo &&
      typeof config.repo.owner === 'string' &&
      typeof config.repo.repo === 'string' &&
      typeof config.repo.branch === 'string' &&
      typeof config.repo.postsPath === 'string' &&
      typeof config.repo.mediaPath === 'string'
    )
  }

  /**
   * 验证后端API配置
   */
  private isBackendAPIConfig(config: any): config is BackendAPIConfig {
    return (
      config &&
      typeof config.baseURL === 'string' &&
      (config.timeout === undefined || typeof config.timeout === 'number') &&
      (config.headers === undefined || typeof config.headers === 'object')
    )
  }
}

/**
 * 创建API适配器工厂实例
 */
export function createAPIAdapterFactory(): IAPIAdapterFactory {
  return new APIAdapterFactory()
}

/**
 * 便捷函数：创建GitHub适配器
 */
export function createGitHubAdapter(config: GitHubAPIConfig): IGitHubAPIAdapter {
  const factory = new APIAdapterFactory()
  return factory.createGitHubAdapter(config)
}

/**
 * 便捷函数：创建后端适配器
 */
export function createBackendAdapter(config: BackendAPIConfig): IBackendAPIAdapter {
  const factory = new APIAdapterFactory()
  return factory.createBackendAdapter(config)
}

/**
 * 便捷函数：根据模式自动创建适配器
 */
export function createAdapter(
  mode: 'frontend-only' | 'backend-enabled', 
  config: GitHubAPIConfig | BackendAPIConfig
): APIAdapter {
  const factory = new APIAdapterFactory()
  return factory.createAdapter(mode, config)
}
