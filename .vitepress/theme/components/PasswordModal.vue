<!-- 文章密码验证弹窗组件 -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="password-modal-overlay" @click="handleOverlayClick">
      <div class="password-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="iconfont icon-lock"></i>
            受保护内容
          </h3>
          <button class="close-btn" @click="handleCancel">
            <i class="iconfont icon-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            输入访问密码后即可查看全文内容。
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
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              type="button"
            >
              <span>{{ showPassword ? '隐藏' : '显示' }}</span>
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
  background: rgba(18, 23, 38, 0.36);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fade-in 0.3s ease-out;
}

.password-modal {
  background: var(--main-card-background, #ffffff);
  border-radius: 14px;
  box-shadow:
    0 22px 50px rgba(15, 23, 42, 0.12),
    0 8px 18px rgba(15, 23, 42, 0.06);
  width: 90%;
  max-width: 408px;
  max-height: 90vh;
  overflow: hidden;
  animation: slide-up 0.3s ease-out;
  border: 1px solid var(--main-card-border, #e3e8f7);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--main-card-border, #e3e8f7);
  background: var(--main-card-background, #ffffff);

  .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 680;
    color: var(--main-font-color, #363636);
    display: flex;
    align-items: center;
    gap: 10px;

    .iconfont {
      color: var(--main-color, #425aef);
      font-size: 16px;
    }
  }

  .close-btn {
    background: none;
    border: none;
    padding: 7px;
    cursor: pointer;
    color: var(--main-font-second-color, #3c3c43cc);
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 16px;

    &:hover {
      background: var(--main-card-second-background, #f7f7f9);
      color: var(--main-font-color, #363636);
      transform: scale(1.04);
    }
  }
}

.modal-body {
  padding: 24px;
  background: var(--main-card-background, #ffffff);

  .modal-description {
    margin: 0 0 16px 0;
    color: var(--main-font-second-color, #3c3c43cc);
    line-height: 1.65;
    font-size: 14px;
    text-align: left;
  }

  .password-input-group {
    position: relative;
    margin-bottom: 14px;

    .password-input {
      width: 100%;
      padding: 13px 64px 13px 14px;
      border: 1px solid var(--main-card-border, #e3e8f7);
      border-radius: 10px;
      font-size: 14px;
      background: var(--main-card-second-background, #f7f7f9);
      color: var(--main-font-color, #363636);
      transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
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
        box-shadow: 0 0 0 3px var(--main-color-bg, #4259ef0d);
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
      background: var(--main-card-background, #ffffff);
      border: 1px solid var(--main-card-border, #e3e8f7);
      padding: 0 10px;
      cursor: pointer;
      color: var(--main-font-second-color, #3c3c43cc);
      border-radius: 7px;
      transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
      font-size: 13px;
      min-width: 46px;
      height: 28px;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      outline: none;
      z-index: 100;
      font-family: var(--main-font-family);

      span {
        font-size: 11px;
        line-height: 1;
        display: inline-block;
        opacity: 0.78;
        font-weight: 600;
      }

      &:hover {
        background: var(--main-card-second-background, #f7f7f9);
        border-color: var(--main-color, #425aef);
        color: var(--main-color, #425aef);
      }

      &:active {
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
    font-size: 12px;
    animation: shake 0.5s ease-in-out;
    background: #fef2f2;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid rgba(239, 68, 68, 0.18);

    .iconfont {
      font-size: 14px;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  border-top: 1px solid var(--main-card-border, #e3e8f7);
  background: var(--main-card-background, #ffffff);

  .btn {
    flex: 1;
    padding: 12px 18px;
    border: 1px solid transparent;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    font-family: var(--main-font-family);

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

  .btn-cancel {
    background: var(--main-card-background, #ffffff);
    color: var(--main-font-second-color, #3c3c43cc);
    border-color: var(--main-card-border, #e3e8f7);

    &:hover {
      background: var(--main-card-second-background, #f7f7f9);
      color: var(--main-font-color, #363636);
      border-color: var(--main-color, #425aef);
      transform: translateY(-1px);
    }
  }

  .btn-confirm {
    background: var(--main-color, #425aef);
    color: white;
    border-color: transparent;

    &:hover:not(:disabled) {
      background: #3651e6;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(66, 90, 239, 0.22);
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

// 移动端适配
@media (max-width: 768px) {
  .password-modal {
    width: 95%;
    margin: 16px;
    border-radius: 16px;
  }

  .modal-header {
    padding: 18px 20px 14px;

    .modal-title {
      font-size: 17px;

      .iconfont {
        font-size: 16px;
      }
    }
  }

  .modal-body {
    padding: 20px;

    .password-input-group {
      .password-input {
        padding: 13px 56px 13px 14px;
        font-size: 16px;
      }

      .show-password-btn {
        right: 4px;
        min-width: 40px;
        height: 28px;
        padding: 0 8px;

        span {
          font-size: 11px;
        }
      }
    }
  }

  .modal-footer {
    padding: 0 20px 20px;
    flex-direction: column;
    gap: 10px;

    .btn {
      padding: 13px 18px;
      font-size: 15px;
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

</style>
