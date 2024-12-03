import { defineConfig } from 'vitepress';

import { withPwa } from '@vite-pwa/vitepress';

// 获取配置
import { getThemeConfig } from './init.mjs';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import path from 'path';
// 获取主题配置
const themeConfig = await getThemeConfig();

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    // appearance: "dark",
    // Head
    head: themeConfig.inject.header,
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },

    themeConfig: {
      ...themeConfig
    },
    // vite
    vite: {
      plugins: [
        // 自动导入
        AutoImport({
          imports: ['vue', 'vitepress'],
          dts: '.vitepress/auto-imports.d.ts'
        }),
        Components({
          dirs: ['.vitepress/theme/components', '.vitepress/theme/views'],
          extensions: ['vue', 'md'],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: '.vitepress/components.d.ts'
        })
      ],
      resolve: {
        // 配置路径别名
        alias: {
          // eslint-disable-next-line no-undef
          '@': path.resolve(__dirname, './theme')
        }
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"],
          },
        },
      },
      // 服务器
      // server: {
      //   port: 9877,
      // },
      // 构建
      // build: {
      //   minify: "terser",
      //   terserOptions: {
      //     compress: {
      //       pure_funcs: ["console.log"],
      //     },
      //   },
      // },
    }
  })
);
