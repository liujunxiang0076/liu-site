# Liu Theme - VitePress Blog Theme

[中文版](README.zh-CN.md) | [English](README.md)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/liujunxiang0076/liu-theme/ci.yml?logo=github)](https://github.com/liujunxiang0076/liu-theme/actions)
[![npm downloads](https://img.shields.io/npm/dm/vitepress?logo=npm)](https://www.npmjs.com/package/vitepress)

## 🚀 Project Background
An open-source theme specifically designed for technical blogs, leveraging VitePress's rapid build capabilities and Vue 3's component-based development model to deliver an elegant reading experience with high customizability.

## 🎯 Design Goals
- Minimalist visual design
- Out-of-the-box blog features
- Comprehensive extensibility
- Continuous and stable version maintenance

[![license](https://img.shields.io/github/license/liujunxiang0076/liu-theme)](LICENSE)
[![npm version](https://img.shields.io/npm/v/vitepress)](https://www.npmjs.com/package/vitepress)

Modern blog theme built on VitePress 1.x with integrated features including article categorization, Algolia search, PWA support, and RSS subscription.

## ✨ Core Features

### 🖌 Content Creation
- Enhanced Markdown (flowcharts, equations, custom containers)
- Automatic article categorization
- Update time tracking
- **Article password protection** (individual article access control)

### 🎛 System Features
- Multilingual support (Chinese/English toggle)
- Automatic RSS generation
- Progressive Web App (PWA)
- Page analytics integration
- **Comment system** (Artalk, Twikoo, Waline)
- **Music player** (Netease, Tencent, Kugou, playlist/album/song)
- **Image lightbox** (Fancybox integration)
- **External link redirect** (with class exclusion)
- **Reward/Donation** (WeChat, Alipay QR code)
- **Weather widget** (QWeather API)
- **Countdown widget**
- **Site data/statistics** (51la, Baidu, CNZZ)
- **Friend links** (dynamic, circle of friends)

### ⚙ Development Experience
- Hot Module Replacement (HMR)
- Auto-registered components
- TypeScript support
- Visual theme debugger
- 📝 Enhanced Markdown (math equations, attribute extensions)
- 🔍 Algolia DocSearch integration
- 📱 Responsive layout
- 🎨 Customizable theme styles
- ⚡ Vite rapid build
- 📦 PWA offline support

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 8

### Installation
```bash
pnpm install
```

### Development Mode
```bash
pnpm dev
```

### Production Build
```bash
pnpm docs:build
```

### Local Preview
```bash
pnpm docs:preview
```

## 📂 Directory Structure
```
├── .vitepress/          # Theme configuration
│   ├── config.mts       # Theme config file
│   └── theme/           # Custom theme components
├── src/
│   ├── posts/           # Articles directory
│   └── pages/           # Standalone pages
├── public/              # Static resources
├── package.json
└── README.md
```

## 🛠 Advanced Configuration

### Theme Customization
```scss
// .vitepress/theme/style/_override.scss
$theme-colors: (
  light: (
    primary: #3eaf7c,
    code-bg: #f8f8f8
  ),
  dark: (
    primary: #4abf8a,
    code-bg: #2d2d2d
  )
);
```

### Extending Blog Features

#### Article Password Protection
Protect specific articles with passwords. Add to article frontmatter:
```yaml
---
title: Your Article Title
password: 123456
passwordHint: Password is 6 digits
---
```

Configuration in `.vitepress/theme/config/themeConfig.mts`:
```ts
articlePassword: {
  enable: true,
  expireHours: 24,
  placeholder: 'Enter article access password',
  errorMessage: 'Incorrect password, please try again',
  confirmText: 'Confirm',
  cancelText: 'Cancel'
}
```

#### Comment System
Supports Artalk, Twikoo, Waline. Example (Waline):
```ts
comment: {
  enable: true,
  type: 'waline',
  waline: {
    serverURL: 'https://waline.liujunxiang0076.site/',
    comment: true,
    pageview: true,
    locale: { placeholder: 'Leave a comment?' },
    meta: ['nick'],
    noCopyright: true,
    reaction: true
  }
}
```

#### Music Player
```ts
music: {
  enable: true,
  url: 'https://api.injahow.cn/meting/',
  id: 9379831714,
  server: 'netease', // netease / tencent / kugou
  type: 'playlist'   // playlist / album / song
}
```

#### Image Lightbox
```ts
fancybox: {
  enable: true,
  js: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js',
  css: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css'
}
```

#### External Link Redirect
```ts
jumpRedirect: {
  enable: true,
  exclude: ['cf-friends-link', 'upyun', ...]
}
```

#### Reward/Donation
```ts
rewardData: {
  enable: true,
  wechat: 'WeChat QR code image url',
  alipay: 'Alipay QR code image url'
}
```

#### Weather Widget
```ts
aside: {
  weather: {
    enable: true,
    type: 'qweather',
    params: {
      location: '',
      days: '3',
      isFree: true,
      unit: 'm',
      lang: 'zh'
    }
  }
}
```

#### Countdown Widget
```ts
aside: {
  countDown: {
    enable: true,
    data: {
      name: 'Event',
      date: 'YYYY-MM-DD'
    }
  }
}
```

#### Site Statistics
```ts
tongji: {
  '51la': '',
  // Baidu and CNZZ in thirdParty
}
thirdParty: {
  qweather: { key: '...' },
  baiduTongji: { id: '' },
  cnzz: { id: '' }
}
```

#### Friend Links
```ts
friends: {
  circleOfFriends: '',
  dynamicLink: {
    server: '',
    app_token: '',
    table_id: ''
  }
}
```

## 🛠 Tech Stack
- Core Framework: [VitePress 1.6](https://vitepress.dev)
- UI Framework: [Vue 3](https://vuejs.org)
- CSS Preprocessor: [Sass](https://sass-lang.com)
- Search Service: [Algolia DocSearch](https://docsearch.algolia.com)
- PWA Support: [vite-plugin-pwa](https://vite-pwa-org.netlify.app)

## 🎨 Theme Customization

### Modifying Theme Variables
Override default values in `.vitepress/theme/style/_variables.scss`:
```scss
// Primary colors
$primary-color: #3eaf7c;
$accent-color: #4abf8a;

// Layout dimensions
$content-width: 72rem;
$sidebar-width: 18rem;
```

### Adding Custom Components
1. Create Vue components in `.vitepress/theme/components`
2. Register globally in `.vitepress/theme/index.ts`:
```ts
import MyComponent from './components/MyComponent.vue'

export default {
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  }
}
```

## 🔍 Search Configuration
1. Apply for [Algolia DocSearch](https://docsearch.algolia.com/apply/)
2. Add configuration in `.vitepress/config.mts`:
```ts
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'YOUR_INDEX_NAME'
}
```

## 🤝 Contributing

### Development Workflow
```mermaid
graph LR
A[Fork Repository] --> B[Create Feature Branch]
B --> C[Develop Feature]
C --> D[Write Tests]
D --> E[Commit Changes]
E --> F[Create PR]
```

### Quality Assurance
- Pass ESLint checks before committing
- Include Vitest unit tests for components
- Update Storybook for layout changes
- Maintain CHANGELOG.md for significant changes

### Commit Convention
- Follow [Conventional Commits](https://www.conventionalcommits.org)
- Example: `feat: add dark mode toggle component`

### Development Process
1. Create feature branch from `main`
2. Run lint checks:
```bash
pnpm lint
```
3. Update relevant unit tests
4. Reference related issues in PR

## 🚢 Deployment Guide
### Vercel Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo)

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```
2. Deploy:
```bash
vercel deploy
```
