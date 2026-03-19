# liu-site

[中文说明](./README.zh-CN.md) | [English](./README.md)

这是一个基于 VitePress 搭建的个人博客项目，重点面向技术写作、知识沉淀和简约阅读体验。仓库内不仅包含文章内容，还包含一套完整的自定义主题系统，内置文章归档、分类标签、评论、RSS、PWA、文章密码保护、Vercel Analytics 统计以及极简模式等能力。

## 项目定位

这个仓库更接近“可直接部署的博客站点”，而不只是一个单纯的内容目录，适合用于：

- 个人博客
- 技术专栏
- 知识库
- 基于 VitePress 的二次定制主题项目

## 核心特性

- 自定义 VitePress 主题，包含视图层、组件层、主题配置层
- 极简模式，可统一收敛高干扰视觉与交互
- 文章归档、分类、标签、阅读时间、参考资料、相关文章
- 文章密码保护，并支持有效期配置
- 评论系统支持 Waline、Twikoo、Artalk
- Fancybox 图片预览
- 构建阶段自动生成 RSS
- 基于 `@vite-pwa/vitepress` 的 PWA 支持
- 基于 Vercel Analytics 的访问统计
- 主题切换与 Pinia 持久化设置
- 自定义导航、移动端抽屉菜单与响应式布局

## 技术栈

- [VitePress](https://vitepress.dev/)
- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Sass](https://sass-lang.com/)
- [Waline](https://waline.js.org/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

## 目录结构

```text
.
├── .vitepress
│   ├── config.mts
│   ├── init.mts
│   └── theme
│       ├── components
│       ├── config
│       ├── store
│       ├── style
│       ├── utils
│       └── views
├── public
├── src
│   ├── page
│   ├── pages
│   └── posts
├── package.json
├── README.md
└── README.zh-CN.md
```

## 环境要求

- Node.js `>= 20`
- npm `>= 10`

## 快速开始

安装依赖：

```bash
npm install
```

启动本地开发：

```bash
npm run dev
```

构建站点：

```bash
npm run docs:build
```

本地预览构建结果：

```bash
npm run docs:preview
```

## 主要配置入口

项目的大部分行为都集中在以下文件中：

- `.vitepress/config.mts`
- `.vitepress/theme/config/themeConfig.mts`
- `.vitepress/theme/MyApp.vue`

常见可配置项包括：

- 站点信息、导航结构、头部注入资源
- 极简模式开关
- 评论系统与访问统计
- 文章密码保护
- 音乐播放器、图片灯箱、RSS、侧边栏组件
- 深浅主题变量与布局样式

## 内容写作

文章放在 `src/posts`，独立页面放在 `src/pages`。

Frontmatter 示例：

```yaml
---
title: Hello World
description: 一篇示例文章
date: 2026-03-19
categories:
  - 技术分享
tags:
  - Vue3
  - VitePress
password: 123456
passwordHint: 6位数字
---
```

## 部署说明

这个项目适合直接部署到 Vercel，并且已经内置：

- 构建时生成 RSS
- PWA 配置
- Vercel Analytics 访问统计

常见部署流程：

```bash
npm run docs:build
vercel deploy
```

部署完成并有访问后，可以在 Vercel Analytics 面板中查看页面浏览数据。

## 可用脚本

定义见 `package.json`：

- `npm run dev`：启动 VitePress 本地开发服务
- `npm run docs:build`：构建站点
- `npm run docs:preview`：预览构建结果

## 说明

- 当前项目默认启用了 `minimal.enable: true`
- 部分第三方服务为可选能力，需要你自行提供对应配置或密钥
- 如果修改评论、统计或外部 API，请在部署前同步检查相关配置

## License

MIT
