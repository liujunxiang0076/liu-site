<template>
  <div class="admin-media">
    <div class="media-placeholder">
      <Icon name="image" class="placeholder-icon" />
      <h2>媒体库</h2>
      <p>媒体文件管理功能将在后续任务中实现</p>
      <div class="feature-list">
        <div class="feature-item">
          <Icon name="check" />
          <span>拖拽上传</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>缩略图生成</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>文件管理</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>Markdown插入</span>
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
.admin-media {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.media-placeholder {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--vp-c-brand-1);
  margin-bottom: 20px;
}

.media-placeholder h2 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.media-placeholder p {
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
