# Liu Theme - VitePress 博客主题

[![license](https://img.shields.io/github/license/liujunxiang0076/liu-theme)](LICENSE)
[![npm version](https://img.shields.io/npm/v/vitepress)](https://www.npmjs.com/package/vitepress)

基于 VitePress 1.x 构建的现代化博客主题，集成文章分类、Algolia搜索、PWA支持、RSS订阅等特性。

## ✨ 特性
- 📝 Markdown 增强（数学公式、属性扩展）
- 🔍 Algolia 文档搜索集成
- 📱 响应式布局
- 🎨 可定制的主题样式
- ⚡ Vite 极速构建
- 📦 PWA 离线支持

## 🚀 快速开始

### 环境要求
- Node.js >= 20
- pnpm >= 8

### 安装
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 生产构建
```bash
pnpm docs:build
```

### 本地预览
```bash
pnpm docs:preview
```

## 📂 目录结构
```
├── .vitepress/          # 主题配置
│   ├── config.mts       # 主题配置文件
│   └── theme/           # 自定义主题组件
├── src/
│   ├── posts/           # 文章目录
│   └── pages/           # 独立页面
├── public/              # 静态资源
├── package.json
└── README.md
```

## 🔧 配置指南
1. 修改 `.vitepress/config.mts` 中的站点配置
2. 在 `src/posts` 目录下添加 Markdown 格式的文章
3. 自定义主题样式请修改 `theme/style` 中的 SCSS 文件

## 🛠 技术栈
- 核心框架：[VitePress 1.6](https://vitepress.dev)
- UI框架：[Vue 3](https://vuejs.org)
- 样式预处理器：[Sass](https://sass-lang.com)
- 搜索服务：[Algolia DocSearch](https://docsearch.algolia.com)
- PWA支持：[vite-plugin-pwa](https://vite-pwa-org.netlify.app)

## 🎨 主题定制
### 修改主题变量
在 `.vitepress/theme/style/_variables.scss` 中覆盖默认值：
```scss
// 主色配置
$primary-color: #3eaf7c;
$accent-color: #4abf8a;

// 布局尺寸
$content-width: 72rem;
$sidebar-width: 18rem;
```

### 添加自定义组件
1. 在 `.vitepress/theme/components` 创建 Vue 组件
2. 在 `.vitepress/theme/index.ts` 中全局注册：
```ts
import MyComponent from './components/MyComponent.vue'

export default {
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  }
}
```

## 🔍 搜索配置
1. 申请 [Algolia DocSearch](https://docsearch.algolia.com/apply/)
2. 在 `.vitepress/config.mts` 中添加配置：
```ts
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'YOUR_INDEX_NAME'
}
```

## 🤝 贡献指南
### 提交规范
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org) 规范
- 示例：`feat: 添加暗黑模式切换组件`

### 开发流程
1. 从 `main` 分支创建特性分支
2. 提交前运行格式检查：
```bash
pnpm lint
```
3. 更新对应组件的单元测试
4. 创建 Pull Request 时需关联相关 issue

## 🚢 部署指南
### Vercel 部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo)

1. 安装 Vercel CLI：
```bash
pnpm add -g vercel
```
2. 执行部署：
```bash
vercel deploy --prod
```

## 许可证
[MIT License](LICENSE) © 2023 LiuJunxiang
