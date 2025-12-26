/**
 * 存储管理器实现
 * 处理本地存储、IndexedDB和离线数据管理
 */

import type { 
  StorageManager as IStorageManager,
  DraftData,
  MediaCacheData,
  OfflineOperation,
  IndexedDBConfig
} from '../types/storage'

export class StorageManager implements IStorageManager {
  private dbName: string
  private dbVersion: number
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor(config?: Partial<IndexedDBConfig>) {
    this.dbName = config?.dbName || 'blog-editor-storage'
    this.dbVersion = config?.version || 1
  }

  /**
   * 初始化数据库
   */
  private async initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建草稿存储
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'path' })
          draftsStore.createIndex('lastModified', 'lastModified', { unique: false })
        }

        // 创建媒体缓存存储
        if (!db.objectStoreNames.contains('mediaCache')) {
          const mediaCacheStore = db.createObjectStore('mediaCache', { keyPath: 'path' })
          mediaCacheStore.createIndex('cachedAt', 'cachedAt', { unique: false })
        }

        // 创建用户设置存储
        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' })
        }

        // 创建离线队列存储
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const offlineQueueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' })
          offlineQueueStore.createIndex('timestamp', 'timestamp', { unique: false })
          offlineQueueStore.createIndex('type', 'type', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * 获取事务
   */
  private async getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): Promise<IDBTransaction> {
    await this.initDB()
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction(storeNames, mode)
  }

  /**
   * 保存草稿
   */
  async saveDraft(path: string, data: DraftData): Promise<void> {
    try {
      const transaction = await this.getTransaction('drafts', 'readwrite')
      const store = transaction.objectStore('drafts')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ path, ...data })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 加载草稿
   */
  async loadDraft(path: string): Promise<DraftData | null> {
    try {
      const transaction = await this.getTransaction('drafts', 'readonly')
      const store = transaction.objectStore('drafts')
      
      return new Promise<DraftData | null>((resolve, reject) => {
        const request = store.get(path)
        request.onsuccess = () => {
          const result = request.result
          if (result) {
            const { path: _, ...data } = result
            resolve(data as DraftData)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除草稿
   */
  async deleteDraft(path: string): Promise<void> {
    try {
      const transaction = await this.getTransaction('drafts', 'readwrite')
      const store = transaction.objectStore('drafts')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(path)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to delete draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取所有草稿
   */
  async listDrafts(): Promise<Array<{ path: string; data: DraftData }>> {
    try {
      const transaction = await this.getTransaction('drafts', 'readonly')
      const store = transaction.objectStore('drafts')
      
      return new Promise<Array<{ path: string; data: DraftData }>>((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const results = request.result.map((item: any) => {
            const { path, ...data } = item
            return { path, data: data as DraftData }
          })
          resolve(results)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to list drafts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 添加离线操作
   */
  async addOfflineOperation(operation: OfflineOperation): Promise<void> {
    try {
      const transaction = await this.getTransaction('offlineQueue', 'readwrite')
      const store = transaction.objectStore('offlineQueue')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(operation)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to add offline operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取离线操作列表
   */
  async getOfflineOperations(): Promise<OfflineOperation[]> {
    try {
      const transaction = await this.getTransaction('offlineQueue', 'readonly')
      const store = transaction.objectStore('offlineQueue')
      
      return new Promise<OfflineOperation[]>((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to get offline operations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 移除离线操作
   */
  async removeOfflineOperation(id: string): Promise<void> {
    try {
      const transaction = await this.getTransaction('offlineQueue', 'readwrite')
      const store = transaction.objectStore('offlineQueue')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to remove offline operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 清空离线队列
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      const transaction = await this.getTransaction('offlineQueue', 'readwrite')
      const store = transaction.objectStore('offlineQueue')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to clear offline queue: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 缓存媒体文件
   */
  async cacheMedia(path: string, data: MediaCacheData): Promise<void> {
    try {
      const transaction = await this.getTransaction('mediaCache', 'readwrite')
      const store = transaction.objectStore('mediaCache')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ path, ...data })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to cache media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取缓存的媒体文件
   */
  async getCachedMedia(path: string): Promise<MediaCacheData | null> {
    try {
      const transaction = await this.getTransaction('mediaCache', 'readonly')
      const store = transaction.objectStore('mediaCache')
      
      return new Promise<MediaCacheData | null>((resolve, reject) => {
        const request = store.get(path)
        request.onsuccess = () => {
          const result = request.result
          if (result) {
            const { path: _, ...data } = result
            resolve(data as MediaCacheData)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to get cached media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 清空媒体缓存
   */
  async clearMediaCache(): Promise<void> {
    try {
      const transaction = await this.getTransaction('mediaCache', 'readwrite')
      const store = transaction.objectStore('mediaCache')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to clear media cache: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 保存设置
   */
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      const transaction = await this.getTransaction('userSettings', 'readwrite')
      const store = transaction.objectStore('userSettings')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key, value })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to save setting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 加载设置
   */
  async loadSetting(key: string): Promise<any> {
    try {
      const transaction = await this.getTransaction('userSettings', 'readonly')
      const store = transaction.objectStore('userSettings')
      
      return new Promise<any>((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.value : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to load setting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      const storeNames = ['drafts', 'mediaCache', 'userSettings', 'offlineQueue']
      const transaction = await this.getTransaction(storeNames, 'readwrite')
      
      const clearPromises = storeNames.map(storeName => {
        return new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName)
          const request = store.clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      })
      
      await Promise.all(clearPromises)
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 导出数据
   */
  async export(): Promise<any> {
    try {
      const [drafts, settings, operations] = await Promise.all([
        this.listDrafts(),
        this.getAllSettings(),
        this.getOfflineOperations()
      ])
      
      return {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          drafts,
          settings,
          operations
        }
      }
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 导入数据
   */
  async import(data: any): Promise<void> {
    try {
      if (!data || !data.data) {
        throw new Error('Invalid import data format')
      }
      
      const { drafts, settings, operations } = data.data
      
      // 清空现有数据
      await this.clear()
      
      // 导入草稿
      if (drafts && Array.isArray(drafts)) {
        for (const { path, data: draftData } of drafts) {
          await this.saveDraft(path, draftData)
        }
      }
      
      // 导入设置
      if (settings && Array.isArray(settings)) {
        for (const { key, value } of settings) {
          await this.saveSetting(key, value)
        }
      }
      
      // 导入离线操作
      if (operations && Array.isArray(operations)) {
        for (const operation of operations) {
          await this.addOfflineOperation(operation)
        }
      }
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取所有设置
   */
  private async getAllSettings(): Promise<Array<{ key: string; value: any }>> {
    try {
      const transaction = await this.getTransaction('userSettings', 'readonly')
      const store = transaction.objectStore('userSettings')
      
      return new Promise<Array<{ key: string; value: any }>>((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      throw new Error(`Failed to get all settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{
    drafts: number
    mediaCache: number
    settings: number
    offlineQueue: number
    total: number
  }> {
    try {
      const [drafts, settings, operations] = await Promise.all([
        this.listDrafts(),
        this.getAllSettings(),
        this.getOfflineOperations()
      ])
      
      const usage = {
        drafts: drafts.length,
        mediaCache: 0, // 简化实现
        settings: settings.length,
        offlineQueue: operations.length,
        total: 0
      }
      
      usage.total = usage.drafts + usage.mediaCache + usage.settings + usage.offlineQueue
      
      return usage
    } catch (error) {
      throw new Error(`Failed to get storage usage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.initPromise = null
  }
}

/**
 * 创建存储管理器实例
 */
export function createStorageManager(config?: Partial<IndexedDBConfig>): IStorageManager {
  return new StorageManager(config)
}

/**
 * 全局存储管理器实例
 */
let globalStorageManager: IStorageManager | null = null

/**
 * 获取全局存储管理器
 */
export function getStorageManager(): IStorageManager {
  if (!globalStorageManager) {
    globalStorageManager = new StorageManager()
  }
  return globalStorageManager
}

/**
 * 设置全局存储管理器
 */
export function setStorageManager(manager: IStorageManager): void {
  globalStorageManager = manager
}
