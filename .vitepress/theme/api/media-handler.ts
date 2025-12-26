/**
 * 媒体文件处理器实现
 * 处理媒体文件的上传、管理和编辑器集成
 */

import type { 
  MediaHandler as IMediaHandler,
  APIAdapter
} from '../types/api'
import type { 
  MediaFile, 
  UploadConfig,
  UploadProgress,
  UploadResult,
  MediaQuery
} from '../types/media'
import type { EditorComponent } from '../types/editor'

export class MediaHandler implements IMediaHandler {
  public uploadConfig: UploadConfig
  
  private apiAdapter: APIAdapter
  private editorInstance?: EditorComponent
  private uploadProgressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map()

  constructor(apiAdapter: APIAdapter, uploadConfig?: Partial<UploadConfig>) {
    this.apiAdapter = apiAdapter
    this.uploadConfig = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'application/pdf'
      ],
      uploadPath: 'public/images',
      ...uploadConfig
    }
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: EditorComponent): void {
    this.editorInstance = editor
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File): Promise<MediaFile> {
    try {
      // 验证文件
      this.validateFile(file)
      
      // 生成上传ID用于进度跟踪
      const uploadId = this.generateUploadId()
      
      // 开始上传
      const result = await this.uploadWithProgress(file, uploadId)
      
      if (!result.success || !result.file) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.file
    } catch (error) {
      throw new Error(`Failupload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 带进度的文件上传
   */
  private async uploadWithProgress(file: File, uploadId: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      // 创建XMLHttpRequest以支持进度跟踪
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)

      // 进度事件
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            speed: this.calculateUploadSpeed(event.loaded, uploadId)
          }
          
          const callback = this.uploadProgressCallbacks.get(uploadId)
          if (callback) {
            callback(progress)
          }
        }
      })

      // 完成事件
      xhr.addEventListener('load', () => {
        this.uploadProgressCallbacks.delete(uploadId)
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            resolve(result)
          } catch {
            resolve({ success: true, file: this.createMediaFileFromResponse(file, xhr.responseText) })
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      // 错误事件
      xhr.addEventListener('error', () => {
        this.uploadProgressCallbacks.delete(uploadId)
        reject(new Error('Upload failed due to network error'))
      })

      // 超时事件
      xhr.addEventListener('timeout', () => {
        this.uploadProgressCallbacks.delete(uploadId)
        reject(new Error('Upload timeout'))
      })

      // 配置请求
      xhr.timeout = 60000 // 60秒超时
      
      // 发送请求 - 这里需要根据实际的API适配器类型来决定URL
      if (this.isBackendAdapter()) {
        xhr.open('POST', `${(this.apiAdapter as any).config.baseURL}/api/media/upload`)
        const authToken = (this.apiAdapter as any).authToken
        if (authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)
        }
      } else {
        // GitHub模式，使用API适配器的uploadMedia方法
        this.apiAdapter.uploadMedia(file).then(resolve).catch(reject)
        return
      }

      xhr.send(formData)
    })
  }

  /**
   * 设置上传进度回调
   */
  onUploadProgress(uploadId: string, callback: (progress: UploadProgress) => void): void {
    this.uploadProgressCallbacks.set(uploadId, callback)
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await this.apiAdapter.deleteMedia(path)
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文件列表
   */
  async listFiles(): Promise<MediaFile[]> {
    try {
      return await this.apiAdapter.listMedia()
    } catch (error) {
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 搜索媒体文件
   */
  async searchFiles(query: MediaQuery): Promise<MediaFile[]> {
    try {
      return await this.apiAdapter.listMedia(query)
    } catch (error) {
      throw new Error(`Failed to search files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 设置缩略图尺寸
        const maxSize = 200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制缩略图
        ctx?.drawImage(img, 0, 0, width, height)
        
        // 转换为Data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnailUrl)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 插入到编辑器
   */
  insertToEditor(mediaFile: MediaFile): void {
    if (!this.editorInstance) {
      console.warn('Editor instance not set')
      return
    }

    const markdownSyntax = this.generateMarkdownSyntax(mediaFile)
    this.editorInstance.insertText(markdownSyntax)
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(files: File[]): Promise<Array<{ file: File; result: MediaFile | Error }>> {
    const results: Array<{ file: File; result: MediaFile | Error }> = []
    
    // 并发上传，但限制并发数
    const concurrency = 3
    const chunks = this.chunkArray(files, concurrency)
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (file) => {
        try {
          const result = await this.uploadFile(file)
          return { file, result }
        } catch (error) {
          return { file, result: error instanceof Error ? error : new Error('Upload failed') }
        }
      })
      
      const chunkResults = await Promise.all(chunkPromises)
      results.push(...chunkResults)
    }
    
    return results
  }

  /**
   * 验证文件
   */
  private validateFile(file: File): void {
    // 检查文件大小
    if (file.size > this.uploadConfig.maxFileSize) {
      throw new Error(`File size exceeds limit of ${this.formatFileSize(this.uploadConfig.maxFileSize)}`)
    }

    // 检查文件类型
    if (!this.uploadConfig.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    // 检查文件名
    if (!file.name || file.name.length > 255) {
      throw new Error('Invalid file name')
    }
  }

  /**
   * 生成上传ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 计算上传速度
   */
  private calculateUploadSpeed(loaded: number, uploadId: string): number {
    // 简化实现，实际应该维护时间戳来计算速度
    return 0
  }

  /**
   * 检查是否为后端适配器
   */
  private isBackendAdapter(): boolean {
    return 'config' in this.apiAdapter && 'baseURL' in (this.apiAdapter as any).config
  }

  /**
   * 从响应创建MediaFile对象
   */
  private createMediaFileFromResponse(file: File, response: string): MediaFile {
    // 简化实现，实际应该解析API响应
    return {
      filename: file.name,
      originalName: file.name,
      path: `${this.uploadConfig.uploadPath}/${file.name}`,
      url: `/${this.uploadConfig.uploadPath}/${file.name}`,
      size: file.size,
      mimeType: file.type,
      extension: file.name.split('.').pop() || '',
      uploadedAt: new Date(),
      uploadedBy: 'current-user'
    }
  }

  /**
   * 生成Markdown语法
   */
  private generateMarkdownSyntax(mediaFile: MediaFile): string {
    const { filename, url, mimeType } = mediaFile
    
    if (mimeType.startsWith('image/')) {
      return `![${filename}](${url})\n`
    } else if (mimeType.startsWith('video/')) {
      return `<video controls>\n  <source src="${url}" type="${mimeType}">\n  Your browser does not support the video tag.\n</video>\n\n`
    } else if (mimeType.startsWith('audio/')) {
      return `<audio controls>\n  <source src="${url}" type="${mimeType}">\n  Your browser does not support the audio tag.\n</audio>\n\n`
    } else {
      return `[${filename}](${url})\n`
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.uploadProgressCallbacks.clear()
    this.editorInstance = undefined
  }
}

/**
 * 创建媒体处理器实例
 */
export function createMediaHandler(apiAdapter: APIAdapter, uploadConfig?: Partial<UploadConfig>): IMediaHandler {
  return new MediaHandler(apiAdapter, uploadConfig)
}
