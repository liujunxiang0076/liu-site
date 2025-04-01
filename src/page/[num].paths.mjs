import { getAllPosts } from "../../.vitepress/theme/utils/getPostData.mjs";
import { getThemeConfig } from "../../.vitepress/init.mjs";
// import { getThemeConfig } from "../.vitepress/init.mjs";

const postData = await getAllPosts();
const themeConfig = await getThemeConfig();

// 每页文章数
const postsPerPage = themeConfig.postSize;

// 计算总页数
const totalPages = Math.ceil(postData.length / postsPerPage);

// 文章分页动态路由
export default {
  paths() {
    const pages = [];
    // 生成每一页的路由参数
    for (let pageNum = 2; pageNum <= totalPages; pageNum += 1) {
      pages.push({ params: { num: pageNum.toString() } });
    }
    console.info("文章分页动态路由：", pages);
    
    // 如果没有生成页面路由，可能是因为文章数量不足，输出一些调试信息
    if (pages.length === 0) {
      console.info("未生成文章分页，文章总数：", postData.length);
      console.info("每页文章数：", postsPerPage);
      console.info("计算的总页数：", totalPages);
    }
    
    return pages;
  },
};
