// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

// 导入icon组件
import Icon from "./components/Icon.vue";
import App from "./MyApp.vue";
// 全局样式
import "./style/main.scss";
import { createPinia } from "pinia";
import { routeChange } from "./utils/initTools.mjs";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default {
  // 扩展另一个主题
  // extends: DefaultTheme,
  Layout: () => {
    // return h(DefaultTheme.Layout, null, {
    //   // https://vitepress.dev/guide/extending-default-theme#layout-slots
    // })
    return h(App);
  },
  /* 
  
   增强 Vue 应用实例
   @optional
  
  */
  enhanceApp({ app, router, siteData }) {
    // 注册组件
    app.component("Icon", Icon);

    // 挂载
    app.use(pinia);
    // app.use(InstantSearch);
    // app.component("LazyLoader", LazyLoader);
    // 插件
    // enhanceAppWithTabs(app);
    // 路由守卫
    router.onBeforeRouteChange = (to) => {
      routeChange("before", to);
    };
    router.onAfterRouteChange = (to) => {
      routeChange("after", to);
    };
  },
} satisfies Theme;
