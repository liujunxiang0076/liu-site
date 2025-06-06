<!-- 文章密码验证弹窗组件 -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="password-modal-overlay" @click="handleOverlayClick">
      <div class="password-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="iconfont icon-lock"></i>
            文章已加密
          </h3>
          <button class="close-btn" @click="handleCancel">
            <i class="iconfont icon-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            此文章需要密码才能访问，请输入正确的密码
          </p>
          
          <div class="password-input-group">
            <input
              ref="passwordInput"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="config.placeholder || '请输入文章访问密码'"
              class="password-input"
              @keyup.enter="handleConfirm"
              @input="clearError"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            />
            <button
              class="show-password-btn"
              @click="togglePasswordVisibility"
              title=""
              data-tooltip=""
              aria-label=""
            >
              <span>{{ showPassword ? '👁️' : '🙈' }}</span>
            </button>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            <i class="iconfont icon-close"></i>
            {{ errorMessage }}
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="handleCancel">
            {{ config.cancelText || '取消' }}
          </button>
          <button 
            class="btn btn-confirm" 
            @click="handleConfirm"
            :disabled="!password.trim()"
          >
            {{ config.confirmText || '确认' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

// 组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// 组件事件
const emit = defineEmits(['confirm', 'cancel'])

// 响应式数据
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const passwordInput = ref(null)

// 监听弹窗显示状态
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    // 弹窗显示时清空输入和错误信息
    password.value = ''
    errorMessage.value = ''
    showPassword.value = false
    
    // 等待DOM更新后聚焦输入框
    await nextTick()
    passwordInput.value?.focus()
  }
})

// 切换密码显示/隐藏
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  // 切换后重新聚焦输入框，保持光标位置
  nextTick(() => {
    const input = passwordInput.value
    if (input) {
      const cursorPosition = input.selectionStart
      input.focus()
      input.setSelectionRange(cursorPosition, cursorPosition)
    }
  })
}

// 清除错误信息
const clearError = () => {
  errorMessage.value = ''
}

// 显示错误信息
const showError = (message) => {
  errorMessage.value = message || props.config.errorMessage || '密码错误，请重新输入'
}

// 处理确认按钮点击
const handleConfirm = () => {
  const inputPassword = password.value.trim()
  if (!inputPassword) {
    showError('请输入密码')
    return
  }
  
  emit('confirm', inputPassword)
}

// 处理取消按钮点击
const handleCancel = () => {
  emit('cancel')
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  // 点击遮罩层也触发取消
  handleCancel()
}

// 暴露方法给父组件
defineExpose({
  showError,
  clearError
})
</script>

<style lang="scss" scoped>
.password-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fade-in 0.3s ease-out;
}

.password-modal {
  background: var(--main-card-background, #ffffff);
  border-radius: 16px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08);
  width: 90%;
  max-width: 440px;
  max-height: 90vh;
  overflow: hidden;
  animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--main-card-border, #e3e8f7);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--main-card-border, #e3e8f7);
  background: linear-gradient(135deg, var(--main-card-background, #ffffff) 0%, var(--main-card-second-background, #f7f7f9) 100%);

  .modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--main-font-color, #363636);
    display: flex;
    align-items: center;
    gap: 12px;

    .iconfont {
      color: var(--main-color, #425aef);
      font-size: 22px;
      background: var(--main-color-bg, #4259ef0d);
      padding: 8px;
      border-radius: 8px;
    }
  }

  .close-btn {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: var(--main-font-second-color, #3c3c43cc);
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 16px;

    &:hover {
      background: var(--main-card-second-background, #f7f7f9);
      color: var(--main-font-color, #363636);
      transform: scale(1.1);
    }
  }
}

.modal-body {
  padding: 28px;
  background: var(--main-card-background, #ffffff);

  .modal-description {
    margin: 0 0 24px 0;
    color: var(--main-font-second-color, #3c3c43cc);
    line-height: 1.6;
    font-size: 15px;
    text-align: center;
  }

  .password-input-group {
    position: relative;
    margin-bottom: 20px;

    .password-input {
      width: 100%;
      padding: 16px 52px 16px 20px;
      border: 2px solid var(--main-card-border, #e3e8f7);
      border-radius: 12px;
      font-size: 16px;
      background: var(--main-card-second-background, #f7f7f9);
      color: var(--main-font-color, #363636);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--main-font-family);

      /* 禁用拼写检查和自动完成 */
      -webkit-text-decoration-skip: none;
      text-decoration: none;

      /* 禁用浏览器原生的密码显示按钮 */
      &::-ms-reveal,
      &::-ms-clear {
        display: none !important;
      }

      &::-webkit-credentials-auto-fill-button,
      &::-webkit-strong-password-auto-fill-button {
        display: none !important;
      }

      /* 移除浏览器默认样式 */
      &::-webkit-input-placeholder { color: var(--main-font-second-color, #3c3c43cc); opacity: 0.8; }
      &::-moz-placeholder { color: var(--main-font-second-color, #3c3c43cc); opacity: 0.8; }
      &:-ms-input-placeholder { color: var(--main-font-second-color, #3c3c43cc); opacity: 0.8; }
      &:-moz-placeholder { color: var(--main-font-second-color, #3c3c43cc); opacity: 0.8; }

      &:focus {
        outline: none;
        border-color: var(--main-color, #425aef);
        background: var(--main-card-background, #ffffff);
        box-shadow:
          0 0 0 4px var(--main-color-bg, #4259ef0d),
          0 4px 12px rgba(66, 90, 239, 0.15);
        transform: translateY(-1px);
      }

      &::placeholder {
        color: var(--main-font-second-color, #3c3c43cc);
        opacity: 0.8;
      }
    }

    .show-password-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: var(--main-font-second-color, #3c3c43cc);
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 16px;
      width: 36px;
      height: 36px;
      display: flex !important;
      align-items: center;
      justify-content: center;
      outline: none;
      z-index: 100;

      /* 确保按钮可见 */
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;

      /* 重置所有可能的样式冲突 */
      box-shadow: none;
      text-decoration: none;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;

      /* 强制禁用所有可能的 tooltip */
      &::before,
      &::after {
        display: none !important;
        content: none !important;
      }

      span {
        font-size: 18px;
        line-height: 1;
        display: block;
        opacity: 0.7;
        transition: all 0.3s ease;
      }

      &:hover {
        background: var(--main-card-second-background, #f7f7f9);
        transform: translateY(-50%) scale(1.1);

        span {
          opacity: 1;
          transform: scale(1.1);
        }

        /* 禁用 hover 状态下的 tooltip */
        &::before,
        &::after {
          display: none !important;
          content: none !important;
        }
      }

      &:active {
        transform: translateY(-50%) scale(0.95);
        background: var(--main-card-border, #e3e8f7);
      }

      &:focus {
        outline: none;
        background: var(--main-card-second-background, #f7f7f9);
        box-shadow: 0 0 0 2px var(--main-color-bg, #4259ef0d);
      }
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ef4444;
    font-size: 14px;
    animation: shake 0.5s ease-in-out;
    background: #fef2f2;
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid #ef4444;

    .iconfont {
      font-size: 16px;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 16px;
  padding: 24px 28px 28px;
  border-top: 1px solid var(--main-card-border, #e3e8f7);
  background: var(--main-card-second-background, #f7f7f9);

  .btn {
    flex: 1;
    padding: 14px 24px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: var(--main-font-family);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }

    &.btn-cancel {
      background: var(--main-card-background, #ffffff);
      color: var(--main-font-second-color, #3c3c43cc);
      border: 2px solid var(--main-card-border, #e3e8f7);

      &:hover {
        background: var(--main-card-second-background, #f7f7f9);
        color: var(--main-font-color, #363636);
        border-color: var(--main-color, #425aef);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    &.btn-confirm {
      background: linear-gradient(135deg, var(--main-color, #425aef) 0%, #5b6ef5 100%);
      color: white;
      border: 2px solid transparent;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #3651e6 0%, #4f62f2 100%);
        transform: translateY(-2px);
        box-shadow:
          0 8px 25px rgba(66, 90, 239, 0.3),
          0 4px 12px rgba(66, 90, 239, 0.2);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;

        &:hover {
          transform: none;
          box-shadow: none;
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

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

// 添加一个脉冲动画用于按钮
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 90, 239, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 90, 239, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 90, 239, 0);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .password-modal {
    width: 95%;
    margin: 16px;
    border-radius: 20px;
  }

  .modal-header {
    padding: 20px 24px 16px;

    .modal-title {
      font-size: 18px;

      .iconfont {
        font-size: 20px;
        padding: 6px;
      }
    }
  }

  .modal-body {
    padding: 24px;

    .password-input-group {
      .password-input {
        padding: 14px 40px 14px 18px;
        font-size: 16px;
      }

      .show-password-btn {
        right: 4px;
        width: 28px;
        height: 28px;
        padding: 4px;

        .iconfont {
          font-size: 14px;
        }
      }
    }
  }

  .modal-footer {
    padding: 20px 24px 24px;
    flex-direction: column;
    gap: 12px;

    .btn {
      padding: 14px 20px;
      font-size: 16px;
    }
  }
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .password-modal {
    box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.4),
      0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
  }
}

/* 全局禁用密码模态框中的所有 tooltip */
.password-modal-overlay {
  /* 禁用所有可能的 tooltip 组件 */
  .tooltip,
  .el-tooltip,
  .ant-tooltip,
  .v-tooltip,
  [data-tooltip],
  [title]:not([title=""]) {
    pointer-events: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    display: none !important;
  }

  /* 禁用浏览器原生 tooltip */
  * {
    &::before,
    &::after {
      content: none !important;
      display: none !important;
    }
  }
}
</style>
