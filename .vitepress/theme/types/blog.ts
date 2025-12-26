/**
 * 博客文章相关类型定义
 */

// Frontmatter 元数据接口
export interface Frontmatter {
  title: string
  date: Date
  categories: string[]
  tags: string[]
  description?: string
  cover?: string
  draft?: boolean
  author?: string
  [key: string]: any // 允许自定义字段
}

// 文件信息接口
export interface FileInfo {
  size: number
  lastModified: Date
  sha?: string // GitHub文件SHA
  encoding: string
}

// 编辑状态接口
export interface EditState {
  isDirty: boolean
  lastSaved: Date
  autoSaveEnabled: boolean
}

// 博客文章模型
export interface BlogPost {
  // 文件路径信息
  path: string
  filename: string
  directory: string
  
  // Frontmatter元数据
  frontmatter: Frontmatter
  
  // 文章内容
  content: string
  rawContent: string // 包含frontmatter的原始内容
  
  // 文件信息
  fileInfo: FileInfo
  
  // 编辑状态
  editState: EditState
}

// 文章筛选器
export interface PostFilter {
  category?: string
  tag?: string
  author?: string
  dateRange?: {
    start: Date
    end: Date
  }
  draft?: boolean
  search?: string
}

// 文章查询参数
export interface PostQuery {
  filter?: PostFilter
  sort?: {
    field: 'date' | 'title' | 'lastModified'
    order: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
}

// 创建文章请求
export interface CreatePostRequest {
  path: string
  frontmatter: Frontmatter
  content: string
  message?: string // Git提交信息
}

// 更新文章请求
export interface UpdatePostRequest {
  frontmatter: Frontmatter
  content: string
  message?: string // Git提交信息
}
