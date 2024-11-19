// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import App from './components/BlogApp.vue'

export default {
  // 扩展另一个主题
  extends: DefaultTheme,
  Layout: App
  // Layout: () => {
  //   return h(DefaultTheme.Layout, null, {
  //     // https://vitepress.dev/guide/extending-default-theme#layout-slots
  //   })
  // },
  // enhanceApp({ app, router, siteData }) {
  //   // ...
  // }
} satisfies Theme
