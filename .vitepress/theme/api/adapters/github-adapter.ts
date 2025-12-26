/**
 * GitHub API适配器实现
 * 处理与GitHub API的所有交互
 */

import { Octokit } from '@octokit/rest'
import type { 
  GitHubAPIAdapter as IGitHubAPIAdapter,
  GitHubAPIConfig,
  FileContent,
  APIResponse
} from '../../types/api'
import type { 
  BlogPost, 
  CreatePostRequest, 
  UpdatePostRequest, 
  PostQuery 
} from '../../types/blog'
import type { 
  MediaFile, 
  UploadResult, 
  MediaQuery 
} from '../../types/media'

export class GitHubAPIAdapter implements IGitHubAPIAdapter {
  public readonly config: GitHubAPIConfig
  public readonly octokit: Octokit

  constructor(config: GitHubAPIConfig) {
    this.config = config
    this.octokit = new Octokit({
      auth: config.token
    })
  }

  /**
   * 获取文件内容
   */
  async getFile(path: string): Promise<FileContent> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: path,
        ref: this.config.repo.branch
      })

      if (Array.isArray(response.data) || response.data.type !== 'file') {
        throw new Error('Path does not point to a file')
      }

      return {
        content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
        sha: response.data.sha,
        encoding: response.data.encoding
      }
    } catch (error) {
      throw new Error(`Failed to get file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 创建或更新文件
   */
  async createOrUpdateFile(path: string, content: string, message: string, sha?: string): Promise<void> {
    try {
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64')
      
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: path,
        message: message,
        content: encodedContent,
        branch: this.config.repo.branch,
        sha: sha
      })
    } catch (error) {
      throw new Error(`Failed to create/update file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string, message: string, sha?: string): Promise<void> {
    try {
      // 如果没有提供sha，先获取文件信息
      if (!sha) {
        const fileInfo = await this.getFile(path)
        sha = fileInfo.sha
      }

      if (!sha) {
        throw new Error('File SHA is required for deletion')
      }

      await this.octokit.rest.repos.deleteFile({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: path,
        message: message,
        sha: sha,
        branch: this.config.repo.branch
      })
    } catch (error) {
      throw new Error(`Failed to delete file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文章列表
   */
  async listPosts(query?: PostQuery): Promise<BlogPost[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: this.config.repo.postsPath,
        ref: this.config.repo.branch
      })

      if (!Array.isArray(response.data)) {
        throw new Error('Posts path does not contain a directory')
      }

      const posts: BlogPost[] = []
      
      for (const item of response.data) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          try {
            const post = await this.getPost(item.path)
            posts.push(post)
          } catch (error) {
            console.warn(`Failed to load post ${item.path}:`, error)
          }
        }
      }

      // 应用筛选和排序
      return this.filterAndSortPosts(posts, query)
    } catch (error) {
      throw new Error(`Failed to list posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取单篇文章
   */
  async getPost(path: string): Promise<BlogPost> {
    try {
      const fileContent = await this.getFile(path)
      return this.parseMarkdownFile(path, fileContent.content, fileContent.sha)
    } catch (error) {
      throw new Error(`Failed to get post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 创建文章
   */
  async createPost(request: CreatePostRequest): Promise<BlogPost> {
    try {
      const content = this.generateMarkdownContent(request.frontmatter, request.content)
      const message = request.message || `Create post: ${request.frontmatter.title}`
      
      await this.createOrUpdateFile(request.path, content, message)
      
      return this.getPost(request.path)
    } catch (error) {
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新文章
   */
  async updatePost(path: string, request: UpdatePostRequest): Promise<BlogPost> {
    try {
      // 获取现有文件的SHA
      const existingFile = await this.getFile(path)
      
      const content = this.generateMarkdownContent(request.frontmatter, request.content)
      const message = request.message || `Update post: ${request.frontmatter.title}`
      
      await this.createOrUpdateFile(path, content, message, existingFile.sha)
      
      return this.getPost(path)
    } catch (error) {
      throw new Error(`Failed to update post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除文章
   */
  async deletePost(path: string, message?: string): Promise<void> {
    try {
      const deleteMessage = message || `Delete post: ${path}`
      await this.deleteFile(path, deleteMessage)
    } catch (error) {
      throw new Error(`Failed to delete post ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(file: File): Promise<UploadResult> {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${this.config.repo.mediaPath}/${fileName}`
      
      // 读取文件内容
      const arrayBuffer = await file.arrayBuffer()
      const content = Buffer.from(arrayBuffer).toString('base64')
      
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: filePath,
        message: `Upload media: ${fileName}`,
        content: content,
        branch: this.config.repo.branch
      })

      const mediaFile: MediaFile = {
        filename: fileName,
        originalName: file.name,
        path: filePath,
        url: `https://raw.githubusercontent.com/${this.config.repo.owner}/${this.config.repo.repo}/${this.config.repo.branch}/${filePath}`,
        size: file.size,
        mimeType: file.type,
        extension: file.name.split('.').pop() || '',
        uploadedAt: new Date(),
        uploadedBy: 'current-user' // TODO: 从认证信息获取
      }

      return {
        success: true,
        file: mediaFile
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * 获取媒体文件列表
   */
  async listMedia(query?: MediaQuery): Promise<MediaFile[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo,
        path: this.config.repo.mediaPath,
        ref: this.config.repo.branch
      })

      if (!Array.isArray(response.data)) {
        return []
      }

      const mediaFiles: MediaFile[] = response.data
        .filter(item => item.type === 'file')
        .map(item => ({
          filename: item.name,
          originalName: item.name,
          path: item.path,
          url: item.download_url || '',
          size: item.size || 0,
          mimeType: this.getMimeType(item.name),
          extension: item.name.split('.').pop() || '',
          uploadedAt: new Date(), // GitHub API doesn't provide upload date
          uploadedBy: 'unknown'
        }))

      return mediaFiles
    } catch (error) {
      throw new Error(`Failed to list media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除媒体文件
   */
  async deleteMedia(path: string): Promise<void> {
    try {
      await this.deleteFile(path, `Delete media: ${path}`)
    } catch (error) {
      throw new Error(`Failed to delete media ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取API速率限制信息
   */
  async getRateLimit(): Promise<{ remaining: number; resetAt: Date }> {
    try {
      const response = await this.octokit.rest.rateLimit.get()
      return {
        remaining: response.data.rate.remaining,
        resetAt: new Date(response.data.rate.reset * 1000)
      }
    } catch (error) {
      throw new Error(`Failed to get rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 验证令牌
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.octokit.rest.users.getAuthenticated()
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取仓库信息
   */
  async getRepositoryInfo(): Promise<{ name: string; owner: string; private: boolean }> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner: this.config.repo.owner,
        repo: this.config.repo.repo
      })

      return {
        name: response.data.name,
        owner: response.data.owner.login,
        private: response.data.private
      }
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 解析Markdown文件
   */
  private parseMarkdownFile(path: string, content: string, sha?: string): BlogPost {
    const lines = content.split('\n')
    let frontmatterEnd = -1
    let frontmatterStart = -1

    // 查找frontmatter边界
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (frontmatterStart === -1) {
          frontmatterStart = i
        } else {
          frontmatterEnd = i
          break
        }
      }
    }

    let frontmatter: any = {}
    let markdownContent = content

    if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
      const frontmatterText = lines.slice(frontmatterStart + 1, frontmatterEnd).join('\n')
      markdownContent = lines.slice(frontmatterEnd + 1).join('\n')
      
      try {
        // 简单的YAML解析（生产环境应使用专门的YAML库）
        frontmatter = this.parseSimpleYaml(frontmatterText)
      } catch (error) {
        console.warn('Failed to parse frontmatter:', error)
      }
    }

    return {
      path,
      filename: path.split('/').pop() || '',
      directory: path.split('/').slice(0, -1).join('/'),
      frontmatter: {
        title: frontmatter.title || '',
        date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
        categories: Array.isArray(frontmatter.categories) ? frontmatter.categories : [],
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        description: frontmatter.description,
        cover: frontmatter.cover,
        draft: frontmatter.draft || false,
        author: frontmatter.author,
        ...frontmatter
      },
      content: markdownContent,
      rawContent: content,
      fileInfo: {
        size: content.length,
        lastModified: new Date(),
        sha,
        encoding: 'utf-8'
      },
      editState: {
        isDirty: false,
        lastSaved: new Date(),
        autoSaveEnabled: true
      }
    }
  }

  /**
   * 生成Markdown内容
   */
  private generateMarkdownContent(frontmatter: any, content: string): string {
    const yamlContent = this.generateSimpleYaml(frontmatter)
    return `---\n${yamlContent}\n---\n\n${content}`
  }

  /**
   * 简单的YAML解析器
   */
  private parseSimpleYaml(yamlText: string): any {
    const result: any = {}
    const lines = yamlText.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue

      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      // 处理数组
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1)
        result[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''))
      }
      // 处理布尔值
      else if (value === 'true' || value === 'false') {
        result[key] = value === 'true'
      }
      // 处理字符串
      else {
        result[key] = value.replace(/^['"]|['"]$/g, '')
      }
    }

    return result
  }

  /**
   * 简单的YAML生成器
   */
  private generateSimpleYaml(obj: any): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${key}: [${value.map(item => `"${item}"`).join(', ')}]`)
      } else if (typeof value === 'boolean') {
        lines.push(`${key}: ${value}`)
      } else if (value instanceof Date) {
        lines.push(`${key}: ${value.toISOString()}`)
      } else {
        lines.push(`${key}: "${value}"`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 筛选和排序文章
   */
  private filterAndSortPosts(posts: BlogPost[], query?: PostQuery): BlogPost[] {
    let filtered = [...posts]

    // 应用筛选
    if (query?.filter) {
      const filter = query.filter
      
      if (filter.category) {
        filtered = filtered.filter(post => 
          post.frontmatter.categories.includes(filter.category!)
        )
      }
      
      if (filter.tag) {
        filtered = filtered.filter(post => 
          post.frontmatter.tags.includes(filter.tag!)
        )
      }
      
      if (filter.author) {
        filtered = filtered.filter(post => 
          post.frontmatter.author === filter.author
        )
      }
      
      if (filter.draft !== undefined) {
        filtered = filtered.filter(post => 
          post.frontmatter.draft === filter.draft
        )
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        filtered = filtered.filter(post => 
          post.frontmatter.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        )
      }
    }

    // 应用排序
    if (query?.sort) {
      const { field, order } = query.sort
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (field) {
          case 'date':
            aValue = a.frontmatter.date.getTime()
            bValue = b.frontmatter.date.getTime()
            break
          case 'title':
            aValue = a.frontmatter.title.toLowerCase()
            bValue = b.frontmatter.title.toLowerCase()
            break
          case 'lastModified':
            aValue = a.fileInfo.lastModified.getTime()
            bValue = b.fileInfo.lastModified.getTime()
            break
          default:
            return 0
        }
        
        if (order === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        }
      })
    }

    return filtered
  }

  /**
   * 获取MIME类型
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'pdf': 'application/pdf'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }
}
