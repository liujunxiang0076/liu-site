// VitePress 配置文件

// 核心依赖导入
import { defineConfig, HeadConfig } from "vitepress";
import path from "path";

// 插件导入
import { withPwa } from "@vite-pwa/vitepress";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

// 自定义工具和配置导入
import {
  getAllPosts,
  getAllType,
  getAllCategories,
  getAllArchives,
} from "./theme/utils/getPostData.mjs";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";

// 加载全局数据
const postData = await getAllPosts();
const themeConfig = await getThemeConfig();

// VitePress主配置
export default withPwa(
  defineConfig({
    // 站点基本信息
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    cleanUrls: true,
    lastUpdated: true,
    appearance: true,
    
    // 头部标签
    head: themeConfig.inject.header as HeadConfig[],
    
    // 站点地图
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    
    // 主题配置，使用类型断言
    themeConfig: {
      ...themeConfig,
      // 使用类型断言处理自定义属性
      postData,
      tagsData: getAllType(postData),
      categoriesData: getAllCategories(postData),
      archivesData: getAllArchives(postData),
    } as any, // 使用类型断言绕过类型检查
    
    // Markdown配置
    markdown: {
      math: true,
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true,
      },
      config: (md) => markdownConfig(md, themeConfig),
    },
    
    // 构建排除的文件
    srcExclude: ["**/README.md", "**/TODO.md"],
    
    // 页面数据转换：添加规范链接
    transformPageData: async (pageData) => {
      // 生成规范URL，移除.md后缀和index.md
      const canonicalUrl = `${themeConfig.siteMeta.site}/${pageData.relativePath}`
        .replace(/index\.md$/, "")
        .replace(/\.md$/, "");
      
      // 初始化头部标签数组（如果不存在）
      pageData.frontmatter.head ??= [];
      
      // 添加规范链接标签
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    
    // HTML转换：处理跳转重定向
    transformHtml(html: string, id: string, ctx: any) {
      try {
        const result = jumpRedirect(html, themeConfig);
        // 确保返回字符串，否则返回原始HTML
        return typeof result === 'string' ? result : html;
      } catch (error) {
        console.error('HTML转换失败:', error);
        return html; // 出错时返回原始HTML
      }
    },
    
    // 构建结束钩子：生成RSS
    buildEnd: async (config) => {
      try {
        await createRssFile(config, themeConfig);
        console.log('RSS文件生成成功');
      } catch (error) {
        console.error('RSS文件生成失败:', error);
      }
    },
    
    // 直接内联Vite配置
    vite: {
      plugins: [
        // 自动导入Vue组件和API
        AutoImport({
          imports: ['vue', 'vitepress'],
          dts: '.vitepress/auto-imports.d.ts'
        }),
        // 自动注册Vue组件
        Components({
          dirs: ['.vitepress/theme/components', '.vitepress/theme/views'],
          extensions: ['vue', 'md'],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: '.vitepress/components.d.ts'
        }),
        // 添加Vue插件配置
        {
          name: 'vitepress-custom-elements',
          transform(code, id) {
            if (id.includes('vue&type=template')) {
              // 标记ReadingTime为自定义元素，避免组件解析错误
              return code.replace(/ReadingTime/g, 'reading-time');
            }
          }
        }
      ],
      resolve: {
        // 路径别名
        alias: {
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
      // 开发服务器配置
      server: {
        port: 2912,
      },
      // 构建优化
      build: {
        chunkSizeWarningLimit: 1600,
        minify: "terser",
        terserOptions: {
          compress: {
            // 移除生产环境中的console.log
            pure_funcs: ["console.log"],
          },
        },
      }
    },
    
    // Vue配置（正确位置）
    vue: {
      template: {
        compilerOptions: {
          // 将ReadingTime标记为自定义元素，避免组件解析错误
          isCustomElement: (tag) => tag === 'ReadingTime'
        }
      }
    },
    
    // PWA配置
    pwa: {
      registerType: "autoUpdate",
      selfDestroying: true,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // 资源缓存策略
        runtimeCaching: [
          {
            // 字体和样式资源缓存
            urlPattern: /(.*?)\.(woff2|woff|ttf|css)/,
            handler: "CacheFirst",
            options: { cacheName: "file-cache" },
          },
          {
            // 图片资源缓存
            urlPattern: /(.*?)\.(ico|webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: { cacheName: "image-cache" },
          },
          {
            // 第三方资源缓存
            urlPattern: /^https:\/\/cdn2\.codesign\.qq\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "iconfont-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 2, // 2天
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // 缓存文件模式
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,woff2,ttf}"],
        // 排除的导航路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/],
      },
      // 应用清单
      manifest: {
        name: themeConfig.siteMeta.title,
        short_name: themeConfig.siteMeta.title,
        description: themeConfig.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef",
        icons: [
          {
            src: "/images/logo/favicon-32x32.webp",
            sizes: "32x32",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-96x96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    },
  })
);
