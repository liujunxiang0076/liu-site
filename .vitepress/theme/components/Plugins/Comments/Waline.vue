<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vitepress'
import { useData } from 'vitepress'

const { theme } = useData()
const walineConfig = theme.value.comment.waline || {}

const props = defineProps({
  serverURL: {
    type: String,
    default: () => walineConfig.serverURL || ''
  },
  path: {
    type: String,
    default: null
  },
  comment: {
    type: Boolean,
    default: () => walineConfig.comment !== false
  },
  pageview: {
    type: Boolean,
    default: () => walineConfig.pageview !== false
  },
  locale: {
    type: Object,
    default: () => walineConfig.locale || {
      placeholder: '请留下您的评论~'
    }
  }
})

const walineRef = ref(null)
const walineInstance = ref(null)
const route = useRoute()

const updateWaline = async () => {
  if (walineInstance.value) {
    walineInstance.value.update()
    return
  }

  // 检查serverURL是否设置
  if (!props.serverURL) {
    console.warn('Waline serverURL is not set')
    return
  }

  const { init } = await import('@waline/client')
  
  walineInstance.value = init({
    el: walineRef.value,
    serverURL: props.serverURL,
    path: props.path || route.path,
    comment: props.comment,
    pageview: props.pageview,
    locale: props.locale,
    dark: 'html.dark'
  })
}

onMounted(() => {
  // 动态导入 Waline 样式
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/@waline/client@v2/dist/waline.css'
  document.head.appendChild(link)

  updateWaline()
})

onBeforeUnmount(() => {
  if (walineInstance.value) {
    walineInstance.value.destroy()
  }
})
</script>

<template>
  <div v-if="serverURL" class="waline-comment-container">
    <div ref="walineRef" />
  </div>
  <div v-else class="waline-error">
    <p>Waline评论系统未配置，请在主题配置中设置serverURL</p>
  </div>
</template>

<style>
.waline-comment-container {
  margin: 2rem 0;
}
.waline-error {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}
</style>
