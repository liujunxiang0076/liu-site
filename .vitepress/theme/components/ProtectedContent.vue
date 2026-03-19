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
        <h3 class="notice-title">受保护内容</h3>
        <p class="notice-description">
          这篇文章设置了访问密码，输入正确密码后即可继续阅读。
        </p>
        <div class="notice-actions">
          <button class="unlock-btn" @click="showPasswordInput">
            <i class="iconfont icon-lock"></i>
            输入密码解锁
          </button>

          <!-- 密码提示（如果有的话） -->
          <div v-if="passwordHint" class="password-hint">
            <span class="hint-label">访问提示</span>
            <span class="hint-text">{{ passwordHint }}</span>
          </div>
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

  // 确保密码都转换为字符串进行比较
  const inputPasswordStr = String(inputPassword).trim()
  const correctPasswordStr = String(correctPassword).trim()

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
  min-height: 420px;
  padding: 40px 20px;

  .notice-card {
    background: var(--main-card-background, #ffffff);
    border: 1px solid var(--main-card-border, #e3e8f7);
    border-radius: 16px;
    padding: 34px 30px;
    text-align: center;
    max-width: 480px;
    width: 100%;
    box-shadow:
      0 16px 42px rgba(15, 23, 42, 0.08),
      0 6px 16px rgba(15, 23, 42, 0.04);
    animation: fade-up 0.45s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--main-color, #425aef);
    }
    
    .notice-icon {
      margin-bottom: 18px;

      .iconfont {
        font-size: 30px;
        color: var(--main-color, #425aef);
        background: var(--main-color-bg, #4259ef0d);
        width: 60px;
        height: 60px;
        padding: 0;
        border-radius: 16px;
        display: inline-block;
        line-height: 60px;
      }
    }

    .notice-title {
      margin: 0 0 10px 0;
      font-size: 22px;
      font-weight: 700;
      color: var(--main-font-color, #363636);
    }

    .notice-description {
      margin: 0;
      color: var(--main-font-second-color, #3c3c43cc);
      line-height: 1.65;
      font-size: 14px;
      opacity: 0.78;
    }

    .notice-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      margin-top: 22px;

      .unlock-btn {
        background: var(--main-color, #425aef);
        color: white;
        border: none;
        padding: 13px 22px;
        border-radius: 11px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: var(--main-font-family);

        &:hover {
          background: #3651e6;
          transform: translateY(-1px);
          box-shadow:
            0 10px 22px rgba(66, 90, 239, 0.18),
            0 4px 10px rgba(66, 90, 239, 0.12);
        }

        &:active {
          transform: translateY(0);
        }

        .iconfont {
          font-size: 15px;
        }
      }

      .password-hint {
        width: 100%;
        padding: 12px 14px;
        background: var(--main-card-second-background, #f7f7f9);
        border: 1px solid var(--main-card-border, #e3e8f7);
        border-radius: 10px;
        color: var(--main-font-second-color, #3c3c43cc);
        font-size: 13px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        text-align: left;

        .hint-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--main-color, #425aef);
          text-transform: uppercase;
        }

        .hint-text {
          line-height: 1.55;
          color: var(--main-font-second-color, #3c3c43cc);
        }
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

// 移动端适配
@media (max-width: 768px) {
  .password-protected-notice {
    min-height: 320px;
    padding: 24px 8px;

    .notice-card {
      padding: 26px 18px;
      border-radius: 16px;

      .notice-icon .iconfont {
        width: 58px;
        height: 58px;
        font-size: 28px;
        line-height: 58px;
        border-radius: 14px;
      }

      .notice-title {
        font-size: 20px;
        margin-bottom: 10px;
      }

      .notice-description {
        font-size: 14px;
      }

      .notice-actions {
        margin-top: 20px;
        gap: 12px;

        .unlock-btn {
          width: 100%;
          justify-content: center;
          padding: 13px 18px;
          font-size: 14px;
          border-radius: 12px;

          .iconfont {
            font-size: 15px;
          }
        }

        .password-hint {
          padding: 11px 12px;
          font-size: 12px;
        }
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
