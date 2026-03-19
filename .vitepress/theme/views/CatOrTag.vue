<!-- 分类 -->
<template>
  <div class="cat-or-tag">
    <div class="title">
      <span class="eyebrow">{{ type === "categories" ? "分类索引" : "标签索引" }}</span>
      <h1 class="title-name">{{ type === "categories" ? "全部分类" : "全部标签" }}</h1>
      <span v-if="type === 'categories'" class="title-num">
        共有 {{ Object.keys(theme.categoriesData)?.length || 0 }} 个分类
      </span>
      <span v-else class="title-num">
        共有 {{ Object.keys(theme.tagsData)?.length || 0 }} 个标签
      </span>
    </div>
    <div v-if="type === 'categories'" class="type-lists">
      <a
        v-for="(item, key, index) in theme.categoriesData"
        :key="index"
        :href="`/src/pages/categories/${key}`"
        class="type-item s-card hover"
      >
        <div class="type-main">
          <i class="iconfont icon-folder" />
          <div class="type-copy">
            <span class="name">{{ key }}</span>
            <span class="desc">收录 {{ item.count }} 篇文章</span>
          </div>
        </div>
        <span class="num">{{ item.count }}</span>
      </a>
    </div>
    <div v-else class="type-lists">
      <a
        v-for="(item, key, index) in theme.tagsData"
        :key="index"
        :href="`/src/pages/tags/${key}`"
        class="type-item s-card hover"
      >
        <div class="type-main">
          <i class="iconfont icon-hashtag" />
          <div class="type-copy">
            <span class="name">{{ key }}</span>
            <span class="desc">关联 {{ item.count }} 篇内容</span>
          </div>
        </div>
        <span class="num">{{ item.count }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
const { theme } = useData();
const props = defineProps({
  // 页面类型
  type: {
    type: String,
    default: "categories",
  },
});
</script>

<style lang="scss" scoped>
.cat-or-tag {
  width: min(100%, 860px);
  min-height: 400px;
  margin: 0 auto;
  .title {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    .eyebrow {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--main-color);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .title-name {
      font-size: 1.9rem;
      line-height: 1.2;
      margin: 0;
    }
    .title-num {
      margin-top: 0.55rem;
      font-size: 0.95rem;
      opacity: 0.58;
    }
  }
  .type-lists {
    padding: 0 0 2.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.9rem;
    .type-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1rem 0.95rem;
      min-height: 96px;
      .type-main {
        display: flex;
        align-items: center;
        min-width: 0;
      }
      .type-copy {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.3;
        transition: color 0.3s;
        word-break: break-word;
      }
      .desc {
        margin-top: 0.28rem;
        font-size: 0.8rem;
        color: var(--main-font-second-color);
        transition: color 0.3s;
      }
      .iconfont {
        margin-right: 12px;
        font-size: 1rem;
        opacity: 0.72;
        transition: color 0.3s;
      }
      .num {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.32rem 0.55rem;
        margin-left: 0.85rem;
        min-width: 2.2rem;
        border-radius: 999px;
        color: var(--main-font-second-color);
        background-color: var(--main-card-second-background);
      }
      &:hover {
        .name,
        .iconfont,
        .desc {
          color: var(--main-color);
        }
      }
    }
  }

  @media (max-width: 768px) {
    .title {
      margin-bottom: 1rem;
      .title-name {
        font-size: 1.55rem;
      }
      .title-num {
        font-size: 0.88rem;
      }
    }

    .type-lists {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      padding-bottom: 1.5rem;

      .type-item {
        min-height: 84px;
        padding: 0.9rem;

        .name {
          font-size: 0.96rem;
        }

        .desc {
          font-size: 0.76rem;
        }
      }
    }
  }
}
</style>
