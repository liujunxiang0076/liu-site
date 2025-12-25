<template>
  <Teleport to="body">
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-text">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '加载中...',
  message: '请稍候，正在处理您的请求'
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--vp-c-divider);
  max-width: 320px;
  width: 90%;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 24px auto;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.4s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: var(--vp-c-brand-2);
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.8s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: var(--vp-c-brand-3);
}

.loading-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.loading-text p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-content {
    padding: 30px 20px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    margin-bottom: 20px;
  }
  
  .loading-text h3 {
    font-size: 16px;
  }
  
  .loading-text p {
    font-size: 13px;
  }
}
</style>
