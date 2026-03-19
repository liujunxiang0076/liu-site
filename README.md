# liu-site

[中文说明](./README.zh-CN.md) | [English](./README.md)

A VitePress-based personal blog focused on technical writing, minimalist reading experience, and practical built-in blog features. The project includes a custom theme, article system, comments, RSS, PWA support, password-protected posts, Vercel Analytics integration, and a configurable minimal mode.

## Overview

This repository is not just content for a blog. It is a complete VitePress site with a custom theme layer under `.vitepress/theme`, designed for:

- personal blogs and knowledge bases
- technical articles with strong Markdown support
- fast deployment on Vercel
- flexible visual tuning for both regular and minimal modes

## Features

- Custom VitePress theme with dedicated views, components, and theme config
- Minimal mode with reduced visual noise and simplified layout
- Article archives, categories, tags, reading time, references, and related posts
- Password-protected articles with configurable expiration
- Comment system support via Waline, Twikoo, or Artalk
- Fancybox image preview
- RSS generation during build
- PWA support through `@vite-pwa/vitepress`
- Vercel Analytics integration for page view tracking
- Theme switching and persisted user settings via Pinia
- Desktop and mobile layouts with custom navigation and mobile drawer

## Tech Stack

- [VitePress](https://vitepress.dev/)
- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Sass](https://sass-lang.com/)
- [Waline](https://waline.js.org/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

## Project Structure

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

## Requirements

- Node.js `>= 20`
- npm `>= 10`

## Getting Started

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Build the site:

```bash
npm run docs:build
```

Preview the production build:

```bash
npm run docs:preview
```

## Configuration

Most site-level behavior is configured in these files:

- `.vitepress/config.mts`
- `.vitepress/theme/config/themeConfig.mts`
- `.vitepress/theme/MyApp.vue`

Typical customization points include:

- site metadata, navigation, and injected head tags
- minimal mode toggle
- comments and analytics
- article password behavior
- player, fancybox, RSS, and sidebar widgets
- light/dark theme variables and layout styles

## Content Authoring

Articles live in `src/posts`. Standalone pages live in `src/pages`.

Example frontmatter:

```yaml
---
title: Hello World
description: A sample post
date: 2026-03-19
categories:
  - 技术分享
tags:
  - Vue3
  - VitePress
password: 123456
passwordHint: 6-digit code
---
```

## Deployment

The project is suitable for Vercel deployment and already includes:

- RSS generation during build
- PWA configuration
- Vercel Analytics injection

Typical workflow:

```bash
npm run docs:build
vercel deploy
```

After deployment, page views can be tracked from the Vercel Analytics dashboard.

## Scripts

Defined in `package.json`:

- `npm run dev`: start VitePress dev server
- `npm run docs:build`: build the site
- `npm run docs:preview`: preview the built site

## Notes

- The current project is configured with `minimal.enable: true` by default.
- Some third-party services are optional and require your own credentials.
- If you change analytics, comments, or external APIs, review the related config before deployment.

## License

MIT
