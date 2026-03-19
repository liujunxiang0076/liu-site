<!-- 文章列表 -->
<template>
  <div class="post-lists" :class="{ 'layout-grid': layoutType === 'twoColumns', minimal: minimalMode }" :style="gridStyle">
    <div
      v-for="(item, index) in listData"
      :key="index"
      :class="['post-item', 's-card', { hover: !minimalMode, simple, cover: showCover(item), [`cover-${layoutType}`]: showCover(item), minimal: minimalMode }]"
      :style="{ animationDelay: `${0.2 + index / 20}s` }"
      @click="toPost(item.regularPath)"
    >
      <div v-if="!simple && showCover(item)" class="post-cover">
        <img :src="getCover(item)" :alt="item.title" />
      </div>

      <div class="post-content">
        <div v-if="!simple && !minimalMode && item?.categories" class="post-category">
          <span v-for="cat in item?.categories" :key="cat" class="cat-name">
            <i class="iconfont icon-folder" />
            {{ cat }}
          </span>
          <!-- 置顶 -->
          <span v-if="item?.top" class="top">
            <i class="iconfont icon-align-top" />
            置顶
          </span>
        </div>
        <div class="post-title-wrapper">
          <h3 class="post-title">
            {{ item.title }}
            <span v-if="minimalMode && item?.top" class="mini-top">置顶</span>
            <!-- 密码保护图标 -->
            <i v-if="item?.password" class="iconfont icon-lock password-icon" title="此文章需要密码访问"></i>
          </h3>
        </div>

        <!-- 密码保护文章显示特殊提示 -->
        <div v-if="item?.password" class="post-desc-wrapper password-protected">
          <div class="password-notice">
            <i class="iconfont icon-lock"></i>
            <span class="notice-text">受保护内容</span>
            <span v-if="item?.passwordHint" class="password-hint">· 含访问提示</span>
          </div>
        </div>

        <!-- 普通文章显示描述 -->
        <div v-else-if="item?.description" class="post-desc-wrapper">
          <p class="post-desc">{{ item.description }}</p>
        </div>
        <div v-if="!simple" class="post-meta">
          <div v-if="!minimalMode && item?.tags" class="post-tags">
            <span
              v-for="tags in item?.tags"
              :key="tags"
              class="tags-name"
              @click.stop="router.go(`/src/pages/tags/${tags}`)"
            >
              <i class="iconfont icon-hashtag" />
              {{ tags }}
            </span>
          </div>
          <!-- 时间 -->
          <span class="post-time">{{ formatListDate(item?.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { useRouter } from 'vitepress';

const store = mainStore();
const router = useRouter();

const props = defineProps({
  // 列表数据
  listData: {
    type: [Array, String],
    default: () => [],
  },
  // 简洁模式
  simple: {
    type: Boolean,
    default: false,
  },
});

const { theme: themeConfig } = useData()
const minimalMode = computed(() => themeConfig.value?.minimal?.enable ?? false)

// 计算布局类型
const layoutType = computed(() => 
  themeConfig.value?.cover?.twoColumns ? 'twoColumns' : themeConfig.value?.cover?.showCover?.coverLayout ?? 'left'
)

// 计算网格样式
const gridStyle = computed(() => 
  layoutType.value === 'twoColumns' ? {
    '--grid-columns': 2,
    '--grid-gap': '1rem'
  } : {}
)

// 判断是否显示封面
const showCover = () => themeConfig.value?.cover?.showCover?.enable

// 获取封面图片 按优先级获取：cover > defaultCover > false
const getCover = ({ cover: itemCover }) => {
  const { cover } = themeConfig.value ?? {}
  if (!cover?.showCover?.enable) return false
  if (itemCover) return itemCover
  
  return Array.isArray(cover.showCover.defaultCover) 
    ? cover.showCover.defaultCover[Math.floor(Math.random() * cover.showCover.defaultCover.length)]
    : false
}

// 前往文章
const toPost = (path) => {
  // 记录滚动位置
  if (typeof window !== "undefined") {
    const scrollY = window.scrollY;
    store.lastScrollY = scrollY;
  }
  // 跳转文章
  router.go(path);
};

// 列表时间统一为绝对日期，避免混用“相对/绝对”格式
const formatListDate = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};
</script>

<style lang="scss" scoped>
.post-lists {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;

  .post-item {
    padding: 0;
    display: flex;
    margin-bottom: var(--space-4);
    animation: fade-up 0.45s backwards;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s, background-color 0.2s;
    min-height: 0;
    overflow: hidden;

    .post-cover {
      flex: 0 0 35%;
      min-height: 180px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.25s ease-out;
      }
    }

    .post-content {
      flex: 1;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: var(--space-3);
      overflow: visible;

      .post-category {
        display: flex;
        flex-wrap: wrap;
        color: var(--main-font-second-color);
        font-size: 0.78rem;
        font-weight: 500;
        gap: 0.4rem;
        .cat-name {
          display: flex;
          align-items: center;
          .iconfont {
            opacity: 0.7;
            margin-right: 4px;
            color: var(--main-font-second-color);
          }
        }
        .top {
          margin-left: auto;
          color: var(--main-color);
          .iconfont {
            opacity: 0.7;
            color: var(--main-color);
          }
        }
      }

      .post-title {
        font-size: 1.24rem;
        line-height: 1.34;
        font-weight: 760;
        margin: 0;
        transition: color 0.2s;
        white-space: normal;
        word-break: break-word;
        display: flex;
        align-items: center;

        .password-icon {
          margin-left: 6px;
          color: #f59e0b;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .mini-top {
          margin-left: 8px;
          padding: 1px 6px;
          font-size: 0.72rem;
          border: 1px solid var(--main-card-border);
          border-radius: 999px;
          color: var(--main-font-second-color);
          font-weight: 500;
        }
      }

      .post-desc {
        margin: 0;
        opacity: 0.62;
        line-height: 1.72;
        font-size: 0.93rem;
        white-space: normal;
        word-break: break-word;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }

      // 密码保护提示样式
      .post-desc-wrapper.password-protected {
        .password-notice {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--main-card-second-background);
          border: 1px solid var(--main-card-border);
          border-radius: 999px;
          margin: 0;
          width: fit-content;

          .iconfont {
            font-size: 0.8rem;
            color: var(--main-font-second-color);
            opacity: 0.72;
          }

          .notice-text {
            font-size: 0.78rem;
            color: var(--main-font-color);
            font-weight: 520;
          }

          .password-hint {
            font-size: 0.76rem;
            color: var(--main-font-second-color);
            opacity: 0.82;
          }
        }
      }

      .post-title-wrapper,
      .post-desc-wrapper {
        margin: 0;
      }

      .post-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--main-font-second-color);
        margin-top: auto;
        padding-top: var(--space-3);
        border-top: 1px solid var(--main-card-border);

        .post-tags {
          display: flex;
          flex-wrap: wrap;
          opacity: 0.75;
          margin-right: 0.8rem;
          overflow: hidden;

          .tags-name {
            display: flex;
            align-items: center;
            margin-right: 8px;
            white-space: nowrap;
            font-size: 0.8rem;
            transition: color 0.2s;
            .iconfont {
              font-weight: normal;
              opacity: 0.6;
              margin-right: 2px;
              transition: color 0.2s;
            }
            &:hover {
              color: var(--main-color);
              .iconfont {
                color: var(--main-color);
              }
            }
          }
          @media (max-width: 768px) {
            display: none;
          }
        }
        .post-time {
          opacity: 0.5;
          font-size: 0.72rem;
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
      }
    }

    &.simple {
      animation: none;
      padding: 0.5rem 1rem;
      background-color: var(--main-card-second-background);
      height: auto;
    }
    &:last-child {
      margin-bottom: 0;
    }
    &:hover {
      .post-cover img {
        transform: scale(1.02);
      }
    }
    &:active {
      transform: scale(0.995);
    }
    @media (max-width: 768px) {
      flex-direction: column;
      height: auto;
      margin-bottom: var(--space-3);

      .post-cover {
        flex: none;
        width: 100%;
        min-height: 140px;
      }
      .post-content {
        gap: 10px;
        padding: 0.9rem;
        .post-title {
          font-size: 1.08rem;
          line-height: 1.4;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .post-desc {
          font-size: 0.88rem;
          line-height: 1.65;
          -webkit-line-clamp: 2;
        }
        .post-desc-wrapper.password-protected {
          .password-notice {
            width: 100%;
            padding: 7px 10px;
            border-radius: 12px;
            flex-wrap: wrap;
          }
        }
        .post-meta {
          padding-top: 8px;
          .post-time {
            font-size: 0.7rem;
          }
        }
      }
    }

    // 封面靠左
    &.cover-left {
      flex-direction: row;
    }

    // 封面靠右
    &.cover-right {
      flex-direction: row-reverse;
    }

    // 交替布局
    &.cover-both {
      &:nth-child(odd) {
        flex-direction: row;
      }
      &:nth-child(even) {
        flex-direction: row-reverse;
      }
    }

    // 移动端垂直布局
    @media (max-width: 768px) {
      &.cover-left,
      &.cover-right,
      &.cover-both {
        flex-direction: column;
      }
    }
  }

  &.minimal {
    .post-item {
      margin-bottom: var(--space-4);
      .post-content {
        padding: var(--space-4);
      }
      .post-meta {
        border-top: none;
        padding-top: 0;
      }
    }

    @media (max-width: 768px) {
      .post-item {
        margin-bottom: var(--space-3);
        .post-content {
          padding: 0.9rem;
        }
      }
    }
  }

  // 网格布局
  &.layout-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-columns, 2), 1fr);
    gap: var(--grid-gap, 1rem);

    .post-item {
      margin: 0;
      flex-direction: column;
      min-height: 280px;

      .post-cover {
        flex: none;
        width: 100%;
        min-height: 150px;
      }

      .post-content {
        flex: 1;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .post-lists {
    .post-item {
      .post-content {
        .post-desc-wrapper.password-protected {
          .password-notice {
            background: rgba(255, 255, 255, 0.04);
          }
        }
      }
    }
  }
}
</style>
