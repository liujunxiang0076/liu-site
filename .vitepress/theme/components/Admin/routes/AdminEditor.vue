<template>
  <div class="admin-editor">
    <div class="editor-placeholder">
      <Icon name="edit" class="placeholder-icon" />
      <h2>文章编辑器</h2>
      <p>Monaco编辑器组件将在后续任务中实现</p>
      <div class="feature-list">
        <div class="feature-item">
          <Icon name="check" />
          <span>Markdown语法高亮</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>实时预览</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>Frontmatter编辑</span>
        </div>
        <div class="feature-item">
          <Icon name="check" />
          <span>自动保存</span>
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
.admin-editor {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.editor-placeholder {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--vp-c-brand-1);
  margin-bottom: 20px;
}

.editor-placeholder h2 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.editor-placeholder p {
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
