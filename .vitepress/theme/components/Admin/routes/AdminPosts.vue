<template>
  <div class="admin-posts">
    <div class="posts-placeholder">
      <Icon name="article" class="placeholder-icon" />
      <h2>文章管理</h2>
      <p>文章列表和管理功能将在后续任务中实现</p>
      <div class="feature-list">
        <div class="feature-item">
          <Icon name="check" />
          <span>文章列表展示</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>搜索和筛选</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>批量操作</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>状态管理</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../../Icon.vue'

// Props
interface Props {
  validationState: any
  backendStatus: any
  routeConfig?: any
}

const props = defineProps<Props>()
</script>

<style scoped>
.admin-posts {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.posts-placeholder {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--vp-c-brand-1);
  margin-bottom: 20px;
}

.posts-placeholder h2 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.posts-placeholder p {
  margin: 0 0 24px 0;
  color: var(--vp-c-text-2);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
}

.feature-item .icon {
  color: #10b981;
}
</style>
