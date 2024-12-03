import { defineConfig } from "vitepress";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import {
  getAllPosts,
  getAllType,
  getAllCategories,
  getAllArchives,
} from "./theme/utils/getPostData.mjs";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";
import { HeadConfig } from "vitepress";

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
    appearance: true,
    // Head
    head: themeConfig.inject.header as HeadConfig[],
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    // 解构主题配置
    themeConfig: {
      ...themeConfig,
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
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      },
    }
  })
);
