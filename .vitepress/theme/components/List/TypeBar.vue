<!-- 分类导航条 -->
<template>
  <div v-if="type === 'categories'" :class="['type-bar', 's-card', 'hover', { minimal: minimalMode }]">
    <div class="all-type">
      <a href="/" :class="['type-item', { choose: !currentTypeName }]">首页</a>
      <a
        v-for="(_, key, index) in theme.categoriesData"
        :key="index"
        :href="`/src/pages/categories/${key}`"
        :class="['type-item', { choose: currentTypeName === key }]"
      >
        {{ key }}
      </a>
    </div>
    <a href="/src/pages/categories" class="more-type" title="查看全部分类">
      <i class="iconfont icon-arrow-right" />
      <span v-if="!minimalMode">更多</span>
    </a>
  </div>
  <div v-else-if="type === 'tags'" :class="['type-bar', 's-card', 'hover', { minimal: minimalMode }]">
    <div class="all-type">
      <a href="/" :class="['type-item', { choose: !currentTypeName }]">首页</a>
      <a
        v-for="(item, key, index) in theme.tagsData"
        :key="index"
        :href="`/src/pages/tags/${key}`"
        :class="['type-item', { choose: currentTypeName === key }]"
      >
        {{ key }}
        <span class="num">{{ item.count }}</span>
      </a>
    </div>
    <a href="/src/pages/tags" class="more-type" title="查看全部标签">
      <i class="iconfont icon-arrow-right" />
      <span v-if="!minimalMode">更多</span>
    </a>
  </div>
</template>

<script setup>
const { theme, params } = useData();
const minimalMode = computed(() => theme.value?.minimal?.enable ?? false);
const props = defineProps({
  // 显示类别
  type: {
    type: String,
    default: "categories",
  },
});
onMounted(() => {
  
  
});
// 获取当前路由路径
const currentTypeName = computed(() => {
  return params.value?.name || null;
});
</script>

<style lang="scss" scoped>
.type-bar {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.55rem;
  font-weight: 600;
  animation: fade-up 0.6s 0.3s backwards;
  .all-type {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 12px;
    overflow: hidden;
    mask: linear-gradient(
      90deg,
      #fff 0,
      #fff 90%,
      hsla(0, 0%, 100%, 0.6) 95%,
      hsla(0, 0%, 100%, 0) 100%
    );
    .type-item {
      display: flex;
      align-items: center;
      padding: 0.1rem 0.45rem;
      margin-right: 4px;
      font-weight: 600;
      border-radius: 8px;
      white-space: nowrap;
      height: 28px;
      cursor: pointer;
      .num {
        margin-left: 4px;
        font-weight: normal;
        padding: 2px 6px;
        font-size: 0.75rem;
        color: var(--main-font-color);
        background-color: var(--main-card-border);
        border-radius: 8px;
      }
      &.choose {
        color: var(--main-card-background);
        background-color: var(--main-color);
        .num {
          color: var(--main-color);
        }
      }
      &.hidden {
        display: none;
      }
      &:hover {
        color: var(--main-card-background);
        background-color: var(--main-color);
      }
    }
  }
  .more-type {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    margin-right: 0;
    margin-left: 4px;
    .iconfont {
      font-size: 0.82rem;
      margin-right: 6px;
    }
    &:hover {
      .iconfont {
        color: var(--main-color);
      }
    }
  }

  &.minimal {
    margin-left: auto;
    margin-right: auto;
    width: min(100%, 860px);
    padding: 0.34rem 0.44rem;
    border-radius: 10px;

    .all-type {
      margin-right: 8px;
      mask: none;
      .type-item {
        height: 24px;
        padding: 0 0.38rem;
        margin-right: 4px;
        font-size: 0.82rem;
        font-weight: 460;

        &.choose {
          color: var(--main-color);
          background-color: var(--main-color-bg);
        }
        &:hover {
          color: var(--main-color);
          background-color: var(--main-color-bg);
        }
      }
    }

    .more-type {
      margin-right: 0;
      margin-left: 0;
      .iconfont {
        margin-right: 0;
        font-size: 0.72rem;
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 0.6rem;
    padding: 0.35rem 0.4rem;
    border-radius: 8px;

    .all-type {
      margin-right: 0;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      mask: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .type-item {
        flex: 0 0 auto;
        height: 26px;
        font-size: 0.8rem;
      }
    }

    .more-type {
      display: none;
    }
  }
}
</style>
