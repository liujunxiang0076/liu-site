<!-- 懒加载 -->
<template>
  <div class="lazy-image-container" :class="{ loaded: isLoaded, error: hasError }">
    <!-- 图片加载中和加载失败的占位图 -->
    <div v-if="!isLoaded" class="placeholder">
      <div v-if="!hasError" class="loading-icon">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <circle class="spinner" cx="12" cy="12" r="10" fill="none" stroke-width="2" />
        </svg>
      </div>
      <div v-else class="error-icon">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
        </svg>
      </div>
    </div>
    <!-- 实际图片 -->
    <img
      ref="imageRef"
      :src="isIntersecting ? src : ''"
      :alt="alt"
      @load="handleImageLoaded"
      @error="handleImageError"
      :class="{ 'fade-in': isLoaded }"
    >
  </div>
  <div v-if="useFriendsLink" class="hidden">
    <!-- 适配友链朋友圈 -->
    <img :data-lazy-src="useFriendsLink" class="cf-friends-avatar" alt="cover" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // 兼容友链朋友圈
  useFriendsLink: {
    type: [Boolean, String],
    default: false,
  },
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  threshold: {
    type: Number,
    default: 0.1
  }
});

const imageRef = ref(null);
const isIntersecting = ref(false);
const isLoaded = ref(false);
const hasError = ref(false);
let observer = null;

// 图片加载成功的处理函数
const handleImageLoaded = () => {
  isLoaded.value = true;
};

// 图片加载失败的处理函数
const handleImageError = () => {
  hasError.value = true;
};

// 初始化交叉观察器
const initObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // 如果浏览器不支持 IntersectionObserver，则直接显示图片
    isIntersecting.value = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      isIntersecting.value = entry.isIntersecting;
      
      // 如果图片已进入视口，则不再观察
      if (entry.isIntersecting && observer) {
        observer.unobserve(entry.target);
      }
    },
    {
      root: null,
      rootMargin: '200px', // 预加载区域
      threshold: props.threshold
    }
  );

  // 开始观察目标元素
  if (imageRef.value) {
    observer.observe(imageRef.value);
  }
};

onMounted(() => {
  initObserver();
});

onUnmounted(() => {
  // 清理观察器
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--main-card-second-background);
  border-radius: 12px;
  
  &.loaded {
    background-color: transparent;
  }
  
  &.error {
    background-color: var(--main-error-color-gray);
  }
  
  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .loading-icon {
      .spinner {
        stroke: var(--main-color);
        stroke-dasharray: 80;
        stroke-dashoffset: 60;
        animation: dash 1.5s ease-in-out infinite;
      }
      
      @keyframes dash {
        0% {
          stroke-dashoffset: 60;
          transform: rotate(0deg);
        }
        50% {
          stroke-dashoffset: 20;
          transform: rotate(180deg);
        }
        100% {
          stroke-dashoffset: 60;
          transform: rotate(360deg);
        }
      }
    }
    
    .error-icon {
      color: var(--main-error-color);
    }
  }
  
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.5s ease;
    
    &.fade-in {
      opacity: 1;
    }
  }
}
.hidden {
  display: none;
}
</style>
