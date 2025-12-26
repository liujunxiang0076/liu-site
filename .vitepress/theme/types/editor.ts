/**
 * 编辑器相关类型定义
 */

// Monaco Editor配置
export interface MonacoEditorOptions {
  language: string
  theme: 'vs-dark' | 'vs-light' | 'hc-black'
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded'
  minimap: { enabled: boolean }
  fontSize: number
  lineNumbers: 'on' | 'off' | 'relative' | 'interval'
  scrollBeyondLastLine: boolean
  automaticLayout: boolean
  readOnly: boolean
}

// 编辑器组件接口
export interface EditorComponent {
  // 编辑器实例
  monacoInstance: any // monaco.editor.IStandaloneCodeEditor
  
  // 编辑器配置
  editorOptions: MonacoEditorOptions
  
  // 方法
  setValue(content: string): void
  getValue(): string
  insertText(text: string): void
  focus(): void
  dispose(): void
  updateOptions(options: Partial<MonacoEditorOptions>): void
}

// 预览引擎配置
export interface PreviewRenderOptions {
  html: boolean
  breaks: boolean
  linkify: boolean
  typographer: boolean
  highlight?: (code: string, lang: string) => string
}

// 预览引擎接口
export interface PreviewEngine {
  // 渲染配置
  renderOptions: PreviewRenderOptions
  
  // 方法
  render(markdown: string): string
  renderInline(markdown: string): string
  updateContent(content: string): void
  scrollSync(editorScrollTop: number): void
}

// 编辑器状态
export interface EditorState {
  // 内容状态
  content: string
  originalContent: string
  isDirty: boolean
  
  // 光标位置
  cursorPosition: {
    line: number
    column: number
  }
  
  // 选择范围
  selection?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
  
  // 滚动位置
  scrollTop: number
  
  // 编辑历史
  canUndo: boolean
  canRedo: boolean
}

// 自动保存配置
export interface AutoSaveConfig {
  enabled: boolean
  interval: number // 毫秒
  onBlur: boolean
  onWindowClose: boolean
}

// 键盘快捷键配置
export interface KeyboardShortcuts {
  save: string
  undo: string
  redo: string
  find: string
  replace: string
  togglePreview: string
  insertImage: string
  insertLink: string
  bold: string
  italic: string
  code: string
}

// 编辑器事件
export interface EditorEvents {
  onContentChange: (content: string) => void
  onCursorPositionChange: (position: { line: number; column: number }) => void
  onSelectionChange: (selection: any) => void
  onSave: (content: string) => void
  onFocus: () => void
  onBlur: () => void
}

// Markdown工具栏按钮
export interface ToolbarButton {
  id: string
  icon: string
  title: string
  action: () => void
  shortcut?: string
  separator?: boolean
}

// 编辑器插件接口
export interface EditorPlugin {
  name: string
  version: string
  install: (editor: EditorComponent) => void
  uninstall: (editor: EditorComponent) => void
}

// 编辑器扩展接口
export interface EditorExtension {
  id: string
  name: string
  description?: string
  enabled: boolean
  config?: any
  
  // 生命周期方法
  onInstall?: (editor: EditorComponent) => void
  onUninstall?: (editor: EditorComponent) => void
  onActivate?: (editor: EditorComponent) => void
  onDeactivate?: (editor: EditorComponent) => void
}

// 编辑器主题配置
export interface EditorThemeConfig {
  name: string
  displayName: string
  colors: {
    background: string
    foreground: string
    selection: string
    lineHighlight: string
    cursor: string
  }
  syntax: {
    keyword: string
    string: string
    comment: string
    number: string
    operator: string
  }
}
