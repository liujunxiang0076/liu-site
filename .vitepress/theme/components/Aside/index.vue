<template>
  <aside class="main-aside">
    <!-- 欢迎 -->
    <Hello v-if="theme.aside.hello.enable && !isPostPage" class="weidgets" />
    <div class="sticky">
      <!-- 目录 -->
      <Toc v-if="theme.aside.toc.enable && showToc" class="weidgets" />
      <!-- 倒计时 -->
      <Countdown class="weidgets" />
      <!-- 天气 -->
      <Weather v-if="theme.aside.weather && theme.aside.weather.enable" class="weidgets" />
      <!-- 标签 -->
      <Tags v-if="theme.aside.tags.enable" class="weidgets" />
      <!-- 站点数据 -->
      <SiteData v-if="theme.aside.siteData.enable" class="weidgets" />
    </div>
  </aside>
</template>

<script setup>
// 组件
import Weather from './Widgets/Weather.vue'

// 主题
const { theme } = useData();
// 路由
const route = useRoute();
// 是否为文章页
const isPostPage = computed(() => {
  const routePath = decodeURIComponent(route.path);
  return routePath.includes('/posts/');
});
// 定义属性
const props = defineProps({
  // 显示目录
  showToc: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.main-aside {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.3s backwards;
  .weidgets {
    padding: 18px;
    margin-bottom: 1rem;
    :deep(.title) {
      margin-bottom: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      opacity: 0.75;
      .iconfont {
        opacity: 0.6;
        margin-right: 6px;
      }
      .title-name {
        opacity: 0.8;
      }
    }
  }
  .sticky {
    position: sticky;
    top: calc(60px + 1rem);
    .weidgets {
      animation: fade-up 0.6s 0.4s backwards;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
