<!-- 文章列表 -->
<template>
  <div class="post-lists" :class="{ 'layout-grid': layoutType === 'twoColumns' }" :style="gridStyle">
    <div
      v-for="(item, index) in listData"
      :key="index"
      :class="['post-item', 's-card', 'hover', { simple, cover: showCover(item), [`cover-${layoutType}`]: showCover(item) }]"
      :style="{ animationDelay: `${0.2 + index / 20}s` }"
      @click="toPost(item.regularPath)"
    >
      <div v-if="!simple && showCover(item)" class="post-cover">
        <img :src="getCover(item)" :alt="item.title" />
      </div>

      <div class="post-content">
        <div v-if="!simple && item?.categories" class="post-category">
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
            <!-- 密码保护图标 -->
            <i v-if="item?.password" class="iconfont icon-lock password-icon" title="此文章需要密码访问"></i>
          </h3>
        </div>

        <!-- 密码保护文章显示特殊提示 -->
        <div v-if="item?.password" class="post-desc-wrapper password-protected">
          <div class="password-notice">
            <i class="iconfont icon-lock"></i>
            <span class="notice-text">此文章已加密，需要密码才能访问</span>
            <span v-if="item?.passwordHint" class="password-hint">提示：{{ item.passwordHint }}</span>
          </div>
        </div>

        <!-- 普通文章显示描述 -->
        <div v-else-if="item?.description" class="post-desc-wrapper">
          <p class="post-desc">{{ item.description }}</p>
        </div>
        <div v-if="!simple" class="post-meta">
          <div v-if="item?.tags" class="post-tags">
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
          <span class="post-time">{{ formatTimestamp(item?.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { formatTimestamp } from "@/utils/helper";
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
</script>

<style lang="scss" scoped>
.post-lists {
  .post-item {
    padding: 0;
    display: flex;
    margin-bottom: 1rem;
    animation: fade-up 0.45s backwards;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
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
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      overflow: visible;

      .post-category {
        display: flex;
        flex-wrap: wrap;
        color: var(--main-font-second-color);
        font-size: 0.82rem;
        gap: 0.5rem;
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
        font-size: 1.15rem;
        line-height: 1.45;
        font-weight: 600;
        margin: 0.6rem 0 0.5rem;
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
      }

      .post-desc {
        margin: 0.2rem 0 0.85rem;
        opacity: 0.86;
        line-height: 1.65;
        white-space: normal;
        word-break: break-word;
        display: block;
      }

      // 密码保护提示样式
      .post-desc-wrapper.password-protected {
        .password-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.85rem 0.75rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 8px;
          margin: 0.25rem 0 0.85rem;

          .iconfont {
            font-size: 1rem;
            color: #d97706;
            margin-bottom: 6px;
          }

          .notice-text {
            font-size: 0.82rem;
            color: #92400e;
            font-weight: 500;
            text-align: center;
            margin-bottom: 4px;
          }

          .password-hint {
            font-size: 0.76rem;
            color: #a16207;
            opacity: 0.8;
            text-align: center;
            font-style: italic;
          }
        }
      }
      .post-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--main-font-second-color);
        margin-top: auto;
        padding-top: 0.25rem;
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
          opacity: 0.72;
          font-size: 0.78rem;
          white-space: nowrap;
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
        transform: scale(1.03);
      }
      .post-content {
        .post-title {
          color: var(--main-color);
        }
      }
    }
    &:active {
      transform: scale(0.995);
    }
    @media (max-width: 768px) {
      flex-direction: column;
      height: auto;

      .post-cover {
        flex: none;
        width: 100%;
        min-height: 160px;
      }
      .post-content {
        padding: 0.9rem 1rem;
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
            background: linear-gradient(135deg, #451a03 0%, #78350f 100%);
            border-color: #d97706;

            .iconfont {
              color: #f59e0b;
            }

            .notice-text {
              color: #fbbf24;
            }

            .password-hint {
              color: #fcd34d;
            }
          }
        }
      }
    }
  }
}
</style>
