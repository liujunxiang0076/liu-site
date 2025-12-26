/**
 * 媒体文件相关类型定义
 */

// 图片信息接口
export interface ImageInfo {
  width: number
  height: number
  thumbnailUrl?: string
}

// 媒体文件模型
export interface MediaFile {
  // 基本信息
  filename: string
  originalName: string
  path: string
  url: string
  
  // 文件属性
  size: number
  mimeType: string
  extension: string
  
  // 上传信息
  uploadedAt: Date
  uploadedBy: string
  
  // 图片特有属性
  imageInfo?: ImageInfo
}

// 上传配置
export interface UploadConfig {
  maxFileSize: number
  allowedTypes: string[]
  uploadPath: string
}

// 文件上传进度
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed?: number // bytes per second
}

// 文件上传结果
export interface UploadResult {
  success: boolean
  file?: MediaFile
  error?: string
}

// 媒体库查询参数
export interface MediaQuery {
  type?: 'image' | 'video' | 'audio' | 'document'
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  pagination?: {
    page: number
    limit: number
  }
}

// 批量操作结果
export interface BatchOperationResult {
  success: number
  failed: number
  errors: Array<{
    file: string
    error: string
  }>
}
