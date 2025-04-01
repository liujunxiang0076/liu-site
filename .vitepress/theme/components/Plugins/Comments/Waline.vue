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
    },
    dark: {
      type: [String, Boolean],
      default: undefined
    },
    commentSorting: {
      type: String,
      default: 'latest'
    },
    meta: {
      type: Array,
      default: () => ['nick', 'mail', 'link']
    },
    noCopyright: {
      type: Boolean,
      default: false
    },
    reaction: {
      type: [Boolean, Array],
      default: false
    },
    requiredMeta: {
      type: Array,
      default: () => []
    },
    emoji: {
      type: [Array, Boolean],
      default: undefined
    },
    lang: {
      type: String,
      default: ''
    },
    login: {
      type: String,
      default: 'enable'
    },
    wordLimit: {
      type: [Number, Array],
      default: 0
    },
    pageSize: {
      type: Number,
      default: 10
    },
    imageUploader: {
      type: [Function, Boolean],
      default: undefined
    },
    highlighter: {
      type: [Function, Boolean],
      default: undefined
    },
    texRenderer: {
      type: [Function, Boolean],
      default: undefined
    },
    search: {
      type: [Object, Boolean],
      default: undefined
    },
    recaptchaV3Key: {
      type: String,
      default: undefined
    },
    turnstileKey: {
      type: String,
      default: undefined
    }
  }
}
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useData } from 'vitepress'

// 定义props
const props = defineProps({
  // Waline的服务端地址
  serverURL: String,
  // 路径
  path: String,
  // 多语言
  lang: String,
  // 表情
  emoji: [Array, Boolean],
  // 暗黑模式适配
  dark: [String, Boolean],
  // 评论排序
  commentSorting: String,
  // 评论者信息
  meta: Array,
  // 是否禁用版权
  noCopyright: Boolean,
  // 是否禁用评论表情
  reaction: [Boolean, Array],
  // 评论
  comment: Boolean,
  // 页面浏览
  pageview: Boolean,
  // 语言
  locale: Object,
  // 填充
  fill: Boolean,
  // 设置必填项，默认匿名
  requiredMeta: Array,
  // 登录模式
  login: String,
  // 字数限制
  wordLimit: [Number, Array],
  // 分页大小
  pageSize: Number,
  // 图片上传
  imageUploader: [Function, Boolean],
  // 代码高亮
  highlighter: [Function, Boolean],
  // TEX渲染
  texRenderer: [Function, Boolean],
  // 搜索功能
  search: [Object, Boolean],
  // Google验证码
  recaptchaV3Key: String,
  // Cloudflare验证码
  turnstileKey: String
})

// 获取路由
const route = useRoute()
// 获取主题
const { theme } = useData()
// 错误信息
const errorMessage = ref('')
// 重试按钮
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
// 计算最终使用的路径
const effectivePath = computed(() => props.path || route.path)
// 计算最终使用的评论
const effectiveComment = computed(() => props.comment !== false && walineConfig.value.comment !== false)
// 计算最终使用的页面浏览
const effectivePageview = computed(() => props.pageview !== false && walineConfig.value.pageview !== false)
// 计算最终使用的语言
const effectiveLocale = computed(() => {
  const defaultLocale = { placeholder: '请留下您的评论~' }
  return props.locale || walineConfig.value.locale || defaultLocale
})

// 评论DOM
const commentRef = ref(null)
// waline实例
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

// 重试waline
const retryWaline = () => {
  errorMessage.value = ''
  updateWaline()
}

const updateWaline = async () => {
  // 重置错误信息
  errorMessage.value = ''
  // 如果waline实例存在，则更新
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
    // 初始化waline实例
    const initOptions = {
      el: commentRef.value,
      serverURL: effectiveServerURL.value,
      path: effectivePath.value,
      comment: effectiveComment.value,
      pageview: effectivePageview.value,
      locale: effectiveLocale.value,
      dark: props.dark || 'html.dark',
      commentSorting: props.commentSorting,
      meta: props.meta,
      requiredMeta: props.requiredMeta,
      reaction: props.reaction,
      emoji: props.emoji,
      lang: props.lang,
      copyright: !props.noCopyright,
      login: props.login,
      wordLimit: props.wordLimit,
      pageSize: props.pageSize,
      search: props.search,
      recaptchaV3Key: props.recaptchaV3Key,
      turnstileKey: props.turnstileKey,
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
    }

    // 只在值为函数类型时添加相关属性
    if (typeof props.imageUploader === 'function') {
      initOptions.imageUploader = props.imageUploader
    }
    if (typeof props.highlighter === 'function') {
      initOptions.highlighter = props.highlighter
    }
    if (typeof props.texRenderer === 'function') {
      initOptions.texRenderer = props.texRenderer
    }

    walineInstance.value = init(initOptions)
  } catch (error) {
    console.error('Failed to initialize Waline:', error)
    errorMessage.value = `评论系统初始化失败: ${error.message || '未知错误'}`
    retryable.value = true
  }
}

// 挂载时更新评论
onMounted(() => {
  // 延迟加载以确保DOM已准备好
  setTimeout(() => {
    updateWaline()
  }, 100)
})

// 卸载时恢复原始fetch方法并销毁waline实例
onBeforeUnmount(() => {
  // 恢复原始fetch方法
  if (window.fetch !== originalFetch) {
    window.fetch = originalFetch
  }
  // 销毁waline实例
  if (walineInstance.value) {
    walineInstance.value.destroy()
  }
})
</script>

<style>
/* 评论内容 */
.comment-content {
  margin: 2rem 0 0 0;
}
/* 评论错误 */
.waline-error {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}
/* 重试按钮 */
.retry-button {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  cursor: pointer;
}
/* 重试按钮hover */
.retry-button:hover {
  background-color: #e0e0e0;
}

/* 隐藏评论点赞 */
.wl-reaction {
  display: none;
}

/* 隐藏评论版权 */
.wl-power {
  display: none;
}

</style>
