/**
 * 本地存储和数据同步相关类型定义
 */

// 离线操作类型
export type OfflineOperationType = 'create' | 'update' | 'delete' | 'upload'

// 离线操作
export interface OfflineOperation {
  id: string
  type: OfflineOperationType
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
}

// 草稿数据
export interface DraftData {
  content: string
  frontmatter: object
  lastModified: Date
  autoSaved: boolean
}

// 媒体缓存数据
export interface MediaCacheData {
  blob: Blob
  metadata: any
  cachedAt: Date
}

// 本地存储模式
export interface LocalStorageSchema {
  // 草稿存储
  drafts: {
    key: string // 文章路径
    value: DraftData
  }
  
  // 媒体缓存
  mediaCache: {
    key: string // 文件路径
    value: MediaCacheData
  }
  
  // 用户设置
  userSettings: {
    key: 'editor-config' | 'ui-preferences' | 'auth-state'
    value: any
  }
  
  // 离线队列
  offlineQueue: {
    key: string // 操作ID
    value: OfflineOperation
  }
}

// 同步冲突
export interface SyncConflict {
  file: string
  type: 'content' | 'metadata' | 'both'
  localVersion: {
    content: string
    lastModified: Date
  }
  remoteVersion: {
    content: string
    lastModified: Date
  }
  resolution?: 'local' | 'remote' | 'merge'
}

// 同步状态
export interface SyncState {
  isOnline: boolean
  lastSync: Date | null
  pendingOperations: number
  conflicts: SyncConflict[]
  syncing: boolean
}

// IndexedDB配置
export interface IndexedDBConfig {
  dbName: string
  version: number
  stores: Array<{
    name: string
    keyPath: string
    indexes?: Array<{
      name: string
      keyPath: string
      unique?: boolean
    }>
  }>
}

// 存储管理器接口
export interface StorageManager {
  // 草稿管理
  saveDraft(path: string, data: DraftData): Promise<void>
  loadDraft(path: string): Promise<DraftData | null>
  deleteDraft(path: string): Promise<void>
  listDrafts(): Promise<Array<{ path: string; data: DraftData }>>
  
  // 离线队列管理
  addOfflineOperation(operation: OfflineOperation): Promise<void>
  getOfflineOperations(): Promise<OfflineOperation[]>
  removeOfflineOperation(id: string): Promise<void>
  clearOfflineQueue(): Promise<void>
  
  // 媒体缓存管理
  cacheMedia(path: string, data: MediaCacheData): Promise<void>
  getCachedMedia(path: string): Promise<MediaCacheData | null>
  clearMediaCache(): Promise<void>
  
  // 设置管理
  saveSetting(key: string, value: any): Promise<void>
  loadSetting(key: string): Promise<any>
  
  // 数据库管理
  clear(): Promise<void>
  export(): Promise<any>
  import(data: any): Promise<void>
}
