<!-- 密码保护的文章内容包装组件 -->
<template>
  <div class="protected-content">
    <!-- 密码验证弹窗 -->
    <PasswordModal
      ref="passwordModal"
      :visible="showPasswordModal"
      :config="passwordConfig"
      @confirm="handlePasswordConfirm"
      @cancel="handlePasswordCancel"
    />
    
    <!-- 文章内容 -->
    <div v-if="isContentVisible" class="content-wrapper">
      <slot />
    </div>
    
    <!-- 密码保护提示 -->
    <div v-else class="password-protected-notice">
      <div class="notice-card">
        <div class="notice-icon">
          <i class="iconfont icon-lock"></i>
        </div>
        <h3 class="notice-title">文章已加密</h3>
        <p class="notice-description">
          此文章需要密码才能访问，请点击下方按钮输入密码
        </p>
        <button class="unlock-btn" @click="showPasswordInput">
          <i class="iconfont icon-lock"></i>
          输入密码解锁
        </button>

        <!-- 密码提示（如果有的话） -->
        <div v-if="passwordHint" class="password-hint">
          <i class="iconfont icon-style"></i>
          <span>提示：{{ passwordHint }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import { mainStore } from '@/store'
import PasswordModal from './PasswordModal.vue'

// 组件属性
const props = defineProps({
  // 文章数据
  postData: {
    type: Object,
    required: true
  }
})

// VitePress 数据
const { theme } = useData()

// Pinia store
const store = mainStore()

// 组件引用
const passwordModal = ref(null)

// 响应式数据
const showPasswordModal = ref(false)

// 计算属性
const passwordConfig = computed(() => theme.value.articlePassword || {})

const isPasswordProtected = computed(() => {
  return !!(props.postData?.password)
})

const isContentVisible = computed(() => {
  if (!isPasswordProtected.value) return true
  return store.isArticlePasswordValid(props.postData.id)
})

const passwordHint = computed(() => {
  // 可以从文章的 frontmatter 中获取密码提示
  return props.postData?.passwordHint || ''
})

// 方法
const showPasswordInput = () => {
  showPasswordModal.value = true
}

const handlePasswordConfirm = (inputPassword) => {
  const correctPassword = props.postData.password
  const expireHours = passwordConfig.value.expireHours || 24

  // 调试信息
  console.log('密码验证调试信息:')
  console.log('输入的密码:', inputPassword, '类型:', typeof inputPassword)
  console.log('正确的密码:', correctPassword, '类型:', typeof correctPassword)
  console.log('文章数据:', props.postData)

  // 确保密码都转换为字符串进行比较
  const inputPasswordStr = String(inputPassword).trim()
  const correctPasswordStr = String(correctPassword).trim()

  console.log('转换后比较:', inputPasswordStr, '===', correctPasswordStr, '结果:', inputPasswordStr === correctPasswordStr)

  // 验证密码
  const isValid = store.verifyArticlePassword(
    props.postData.id,
    inputPasswordStr,
    correctPasswordStr,
    expireHours
  )

  if (isValid) {
    // 密码正确，关闭弹窗
    showPasswordModal.value = false

    // 显示成功提示
    if (typeof $message !== 'undefined') {
      $message.success('密码验证成功！', {
        duration: 2000
      })
    }
  } else {
    // 密码错误，显示错误信息
    passwordModal.value?.showError()
  }
}

const handlePasswordCancel = () => {
  showPasswordModal.value = false
}

// 组件挂载时检查密码状态
onMounted(() => {
  // 清理过期的密码验证状态
  store.clearExpiredPasswords()
  
  // 如果文章需要密码且未验证，自动显示密码输入框
  if (isPasswordProtected.value && !isContentVisible.value) {
    // 延迟一点显示，让页面先渲染
    setTimeout(() => {
      showPasswordInput()
    }, 300)
  }
})
</script>

<style lang="scss" scoped>
.protected-content {
  width: 100%;
}

.content-wrapper {
  animation: fade-in 0.5s ease-out;
}

.password-protected-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: 60px 20px;

  .notice-card {
    background: var(--main-card-background, #ffffff);
    border: 2px solid var(--main-card-border, #e3e8f7);
    border-radius: 24px;
    padding: 48px 40px;
    text-align: center;
    max-width: 520px;
    width: 100%;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.04);
    animation: fade-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--main-color, #425aef), #5b6ef5, var(--main-color, #425aef));
      background-size: 200% 100%;
      animation: gradient-flow 3s ease-in-out infinite;
    }
    
    .notice-icon {
      margin-bottom: 28px;
      position: relative;

      .iconfont {
        font-size: 64px;
        color: var(--main-color, #425aef);
        background: var(--main-color-bg, #4259ef0d);
        padding: 20px;
        border-radius: 20px;
        display: inline-block;
        animation: float 3s ease-in-out infinite;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          border: 2px solid var(--main-color, #425aef);
          border-radius: 24px;
          opacity: 0.3;
          animation: pulse-ring 2s ease-in-out infinite;
        }
      }
    }

    .notice-title {
      margin: 0 0 20px 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--main-font-color, #363636);
      background: linear-gradient(135deg, var(--main-color, #425aef), #5b6ef5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .notice-description {
      margin: 0 0 36px 0;
      color: var(--main-font-second-color, #3c3c43cc);
      line-height: 1.7;
      font-size: 16px;
      opacity: 0.9;
    }
    
    .unlock-btn {
      background: linear-gradient(135deg, var(--main-color, #425aef) 0%, #5b6ef5 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 12px;
      position: relative;
      overflow: hidden;
      font-family: var(--main-font-family);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
      }

      &:hover {
        background: linear-gradient(135deg, #3651e6 0%, #4f62f2 100%);
        transform: translateY(-3px) scale(1.02);
        box-shadow:
          0 12px 40px rgba(66, 90, 239, 0.3),
          0 6px 20px rgba(66, 90, 239, 0.2);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(-1px) scale(1.01);
      }

      .iconfont {
        font-size: 20px;
        animation: lock-wiggle 2s ease-in-out infinite;
      }
    }
    
    .password-hint {
      margin-top: 28px;
      padding: 16px 20px;
      background: var(--main-color-bg, #4259ef0d);
      border: 1px solid var(--main-card-border, #e3e8f7);
      border-radius: 12px;
      color: var(--main-font-second-color, #3c3c43cc);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--main-color, #425aef);
        border-radius: 2px;
      }

      .iconfont {
        color: var(--main-color, #425aef);
        font-size: 16px;
        animation: info-pulse 2s ease-in-out infinite;
      }
    }
  }
}

// 动画效果
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

@keyframes lock-wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-2deg);
  }
  75% {
    transform: rotate(2deg);
  }
}

@keyframes info-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes gradient-flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .password-protected-notice {
    min-height: 400px;
    padding: 40px 16px;

    .notice-card {
      padding: 36px 28px;
      border-radius: 20px;

      .notice-icon .iconfont {
        font-size: 56px;
        padding: 16px;
        border-radius: 16px;
      }

      .notice-title {
        font-size: 24px;
        margin-bottom: 16px;
      }

      .notice-description {
        font-size: 15px;
        margin-bottom: 32px;
      }

      .unlock-btn {
        padding: 14px 28px;
        font-size: 15px;
        border-radius: 12px;
        gap: 10px;

        .iconfont {
          font-size: 18px;
        }
      }

      .password-hint {
        margin-top: 24px;
        padding: 14px 18px;
        font-size: 13px;
      }
    }
  }
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .password-protected-notice .notice-card {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
</style>
