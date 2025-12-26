/**
 * 文章管理器实现
 * 处理文章的CRUD操作和状态管理
 */

import type { 
  PostManager as IPostManager,
  APIAdapter
} from '../types/api'
import type { 
  BlogPost, 
  Frontmatter,
  PostFilter,
  CreatePostRequest,
  UpdatePostRequest
} from '../types/blog'
import type { StorageManager } from '../types/storage'

export class PostManager implements IPostManager {
  public currentPost: BlogPost | null = null
  public postList: BlogPost[] = []
  public isDirty: boolean = false
  
  public apiAdapter: APIAdapter
  private storageManager?: StorageManager
  private autoSaveTimer?: number
  private autoSaveInterval: number = 30000 // 30秒

  constructor(apiAdapter: APIAdapter, storageManager?: StorageManager) {
    this.apiAdapter = apiAdapter
    this.storageManager = storageManager
  }

  /**
   * 设置存储管理器
   */
  setStorageManager(storageManager: StorageManager): void {
    this.storageManager = storageManager
  }

  /**
   * 创建新文章
   */
  async createPost(frontmatter: Frontmatter): Promise<BlogPost> {
    try {
      // 生成文件路径
      const path = this.generatePostPath(frontmatter)
      
      const request: CreatePostRequest = {
        path,
        frontmatter,
        content: '',
        message: `Create post: ${frontmatter.title}`
      }

      const post = await this.apiAdapter.createPost(request)
      
      // 更新本地状态
      this.currentPost = post
      this.postList.unshift(post)
      this.isDirty = false
      
      // 保存到本地存储
      if (this.storageManager) {
        await this.storageManager.saveDraft(post.path, {
          content: post.content,
          frontmatter: post.frontmatter,
          lastModified: new Date(),
          autoSaved: false
        })
      }

      return post
    } catch (error) {
      throw new Error(`iled to create post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 加载文章
   */
  async loadPost(path: string): Promise<BlogPost> {
    try {
      // 保存当前文章（如果有修改）
      if (this.currentPost && this.isDirty) {
        await this.saveCurrentPost()
      }

      // 从API加载文章
      const post = await this.apiAdapter.getPost(path)
      
      // 检查本地是否有草稿
      if (this.storageManager) {
        const draft = await this.storageManager.loadDraft(path)
        if (draft && draft.lastModified > post.fileInfo.lastModified) {
          // 本地草稿更新，询问用户是否使用
          post.content = draft.content
          post.frontmatter = { ...post.frontmatter, ...draft.frontmatter }
          post.editState.isDirty = true
        }
      }

      // 更新当前文章
      this.currentPost = post
      this.isDirty = post.editState.isDirty
      
      // 启动自动保存
      this.startAutoSave()

      return post
    } catch (error) {
      throw new Error(`Failed to load post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 保存文章
   */
  async savePost(post: BlogPost): Promise<void> {
    try {
      const request: UpdatePostRequest = {
        frontmatter: post.frontmatter,
        content: post.content,
        message: `Update post: ${post.frontmatter.title}`
      }

      await this.apiAdapter.updatePost(post.path, request)
      
      // 更新状态
      post.editState.isDirty = false
      post.editState.lastSaved = new Date()
      this.isDirty = false
      
      // 清除本地草稿
      if (this.storageManager) {
        await this.storageManager.deleteDraft(post.path)
      }

      // 更新列表中的文章
      const index = this.postList.findIndex(p => p.path === post.path)
      if (index !== -1) {
        this.postList[index] = post
      }
    } catch (error) {
      throw new Error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 发布文章
   */
  async publishPost(post: BlogPost): Promise<void> {
    try {
      // 设置为非草稿状态
      post.frontmatter.draft = false
      
      await this.savePost(post)
    } catch (error) {
      throw new Error(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除文章
   */
  async deletePost(path: string): Promise<void> {
    try {
      await this.apiAdapter.deletePost(path, `Delete post: ${path}`)
      
      // 从列表中移除
      this.postList = this.postList.filter(p => p.path !== path)
      
      // 如果是当前文章，清除状态
      if (this.currentPost && this.currentPost.path === path) {
        this.currentPost = null
        this.isDirty = false
        this.stopAutoSave()
      }
      
      // 清除本地草稿
      if (this.storageManager) {
        await this.storageManager.deleteDraft(path)
      }
    } catch (error) {
      throw new Error(`Failed to delete post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文章列表
   */
  async listPosts(filter?: PostFilter): Promise<BlogPost[]> {
    try {
      const query = filter ? { filter } : undefined
      const posts = await this.apiAdapter.listPosts(query)
      
      this.postList = posts
      return posts
    } catch (error) {
      throw new Error(`Failed to list posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 搜索文章
   */
  async searchPosts(query: string): Promise<BlogPost[]> {
    try {
      const filter: PostFilter = { search: query }
      return await this.listPosts(filter)
    } catch (error) {
      throw new Error(`Failed to search posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新当前文章内容
   */
  updateCurrentPostContent(content: string): void {
    if (!this.currentPost) return
    
    this.currentPost.content = content
    this.currentPost.editState.isDirty = true
    this.isDirty = true
    
    // 保存草稿到本地存储
    this.saveDraftToLocal()
  }

  /**
   * 更新当前文章Frontmatter
   */
  updateCurrentPostFrontmatter(frontmatter: Partial<Frontmatter>): void {
    if (!this.currentPost) return
    
    this.currentPost.frontmatter = { ...this.currentPost.frontmatter, ...frontmatter }
    this.currentPost.editState.isDirty = true
    this.isDirty = true
    
    // 保存草稿到本地存储
    this.saveDraftToLocal()
  }

  /**
   * 保存当前文章
   */
  async saveCurrentPost(): Promise<void> {
    if (!this.currentPost || !this.isDirty) return
    
    await this.savePost(this.currentPost)
  }

  /**
   * 获取文章统计信息
   */
  getPostStats(): {
    total: number
    published: number
    drafts: number
    categories: string[]
    tags: string[]
  } {
    const stats = {
      total: this.postList.length,
      published: 0,
      drafts: 0,
      categories: new Set<string>(),
      tags: new Set<string>()
    }

    for (const post of this.postList) {
      if (post.frontmatter.draft) {
        stats.drafts++
      } else {
        stats.published++
      }
      
      post.frontmatter.categories.forEach(cat => stats.categories.add(cat))
      post.frontmatter.tags.forEach(tag => stats.tags.add(tag))
    }

    return {
      ...stats,
      categories: Array.from(stats.categories),
      tags: Array.from(stats.tags)
    }
  }

  /**
   * 生成文章路径
   */
  private generatePostPath(frontmatter: Frontmatter): string {
    const date = frontmatter.date || new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // 生成URL友好的文件名
    const slug = frontmatter.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    return `src/posts/${year}/${month}_${day}_${slug}.md`
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    this.stopAutoSave()
    
    this.autoSaveTimer = window.setInterval(() => {
      if (this.isDirty && this.currentPost) {
        this.saveDraftToLocal()
      }
    }, this.autoSaveInterval)
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
  }

  /**
   * 保存草稿到本地存储
   */
  private async saveDraftToLocal(): Promise<void> {
    if (!this.currentPost || !this.storageManager) return
    
    try {
      await this.storageManager.saveDraft(this.currentPost.path, {
        content: this.currentPost.content,
        frontmatter: this.currentPost.frontmatter,
        lastModified: new Date(),
        autoSaved: true
      })
    } catch (error) {
      console.warn('Failed to save draft to local storage:', error)
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stopAutoSave()
    this.currentPost = null
    this.postList = []
    this.isDirty = false
  }
}

/**
 * 创建文章管理器实例
 */
export function createPostManager(apiAdapter: APIAdapter, storageManager?: StorageManager): IPostManager {
  return new PostManager(apiAdapter, storageManager)
}
