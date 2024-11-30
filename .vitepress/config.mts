import { defineConfig } from "vitepress";

import { withPwa } from "@vite-pwa/vitepress";

// 获取配置
import { getThemeConfig } from "./init.mjs";

// 获取主题配置
const themeConfig = await getThemeConfig();

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    // 添加 head 配置，与其他顶级配置项平级
    head: [
      [
        "link",
        {
          rel: "stylesheet",
          href: "https://at.alicdn.com/t/c/font_4755537_0mkagigfnwl.css",
        },
      ],
    ],
    // 引入 iconfont 脚本
    // head: [
    //   ['script', { src: 'https://at.alicdn.com/t/c/font_4755537_qyoxle9ja6h.js' }]
    // ],
    title: "liu",
    description: "个人知识分享站",
    // 相对于项目根目录的 markdown 文件所在的文件夹
    srcDir: "./src",
    cleanUrls: true,

    themeConfig: {
      ...themeConfig,
      /* logo: "/logo.svg",
    siteTitle: false,

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
      { text: "Test", link: "/_posts/2024/1118" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
          { text: "Test", link: "/_posts/2024/1118" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/liujunxiang0076" },
    ],

    footer: {
      copyright: "Copyright © 2022-present liu",
    },*/
    },
  })
);
