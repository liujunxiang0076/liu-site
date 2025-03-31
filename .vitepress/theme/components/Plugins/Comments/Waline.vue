<template>
  <div v-if="effectiveServerURL">
    <div ref="commentRef" id="comment-dom" :class="['comment-content', 'waline', { fill }]" />
    <div v-if="errorMessage" class="waline-error">
      <p>{{ errorMessage }}</p>
      <button v-if="retryable" class="retry-button" @click="retryWaline">重试</button>
    </div>
  </div>
  <div v-else class="waline-error">
    <p>Waline评论系统未配置，请在主题配置中设置serverURL</p>
  </div>
</template>

<script>
// 普通script用于导出props定义
export default {
  props: {
    serverURL: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: null
    },
    comment: {
      type: Boolean,
      default: true
    },
    pageview: {
      type: Boolean,
      default: true
    },
    locale: {
      type: Object,
      default: () => ({
        placeholder: '请留下您的评论~'
      })
    },
    fill: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useData } from 'vitepress'

const props = defineProps({
  serverURL: String,
  path: String,
  comment: Boolean,
  pageview: Boolean,
  locale: Object,
  fill: Boolean
})

const route = useRoute()
const { theme } = useData()
const errorMessage = ref('')
const retryable = ref(false)

// 从配置中获取waline设置
const walineConfig = computed(() => {
  try {
    return theme.value.comment?.waline || {}
  } catch (e) {
    console.error('Error accessing theme.value.comment.waline:', e)
    return {}
  }
})

// 计算最终使用的配置值
const effectiveServerURL = computed(() => props.serverURL || walineConfig.value.serverURL || '')
const effectivePath = computed(() => props.path || route.path)
const effectiveComment = computed(() => props.comment !== false && walineConfig.value.comment !== false)
const effectivePageview = computed(() => props.pageview !== false && walineConfig.value.pageview !== false)
const effectiveLocale = computed(() => {
  const defaultLocale = { placeholder: '请留下您的评论~' }
  return props.locale || walineConfig.value.locale || defaultLocale
})

const commentRef = ref(null)
const walineInstance = ref(null)

// 拦截Fetch请求以捕获特定错误
const originalFetch = window.fetch
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(response => {
      // 检查是否访问Waline API
      if (args[0] && typeof args[0] === 'string' && args[0].includes(effectiveServerURL.value)) {
        if (response.status === 500) {
          errorMessage.value = '评论服务器内部错误 (500)，请稍后再试'
          retryable.value = true
          console.error('Waline server error:', response)
        } else if (response.status === 401) {
          errorMessage.value = '评论服务未授权 (401)，请检查服务配置'
          retryable.value = false
          console.error('Waline unauthorized error:', response)
        }
      }
      return response
    })
    .catch(error => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes(effectiveServerURL.value)) {
        errorMessage.value = `评论加载失败: ${error.message}`
        retryable.value = true
        console.error('Waline fetch error:', error)
      }
      throw error
    })
}

const retryWaline = () => {
  errorMessage.value = ''
  updateWaline()
}

const updateWaline = async () => {
  // 重置错误信息
  errorMessage.value = ''
  
  if (walineInstance.value) {
    walineInstance.value.update()
    return
  }

  // 检查serverURL是否设置
  if (!effectiveServerURL.value) {
    console.warn('Waline serverURL is not set')
    return
  }

  try {
    // 动态导入CSS和客户端库
    await import('@waline/client/style')
    const { init } = await import('@waline/client')
    
    walineInstance.value = init({
      el: commentRef.value,
      serverURL: effectiveServerURL.value,
      path: effectivePath.value,
      comment: effectiveComment.value,
      pageview: effectivePageview.value,
      locale: effectiveLocale.value,
      dark: 'html.dark',
      // 添加错误处理回调
      errorHandler: (err) => {
        console.error('Waline error:', err)
        
        // 处理不同类型的错误
        if (err.message && err.message.includes('Unauthorized')) {
          errorMessage.value = '评论服务未授权，请检查服务配置'
          retryable.value = false
        } else if (err.status === 500 || (err.message && err.message.includes('500'))) {
          errorMessage.value = '评论服务器内部错误，请稍后再试'
          retryable.value = true
        } else {
          errorMessage.value = `评论加载失败: ${err.message || '未知错误'}`
          retryable.value = true
        }
      }
    })
  } catch (error) {
    console.error('Failed to initialize Waline:', error)
    errorMessage.value = `评论系统初始化失败: ${error.message || '未知错误'}`
    retryable.value = true
  }
}

onMounted(() => {
  // 延迟加载以确保DOM已准备好
  setTimeout(() => {
    updateWaline()
  }, 100)
})

onBeforeUnmount(() => {
  // 恢复原始fetch方法
  if (window.fetch !== originalFetch) {
    window.fetch = originalFetch
  }
  
  if (walineInstance.value) {
    walineInstance.value.destroy()
  }
})
</script>

<style>
.comment-content {
  margin: 2rem 0;
}
.waline-error {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}
.retry-button {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  cursor: pointer;
}
.retry-button:hover {
  background-color: #e0e0e0;
}
</style>
