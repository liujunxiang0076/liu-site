<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="[`notification-${notification.type}`]"
          @click="$emit('dismiss', notification.id)"
        >
          <div class="notification-content">
            <Icon 
              :name="getIconName(notification.type)" 
              class="notification-icon"
            />
            <div class="notification-text">
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">
                {{ formatTime(notification.timestamp) }}
              </div>
            </div>
            <button 
              @click.stop="$emit('dismiss', notification.id)"
              class="notification-close"
            >
              <Icon name="x" />
            </button>
          </div>
          
          <!-- 进度条 -->
          <div class="notification-progress">
            <div 
              class="progress-bar"
              :style="{ animationDuration: '5s' }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Icon from '../Icon.vue'

// Props
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

interface Props {
  notifications: Notification[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  dismiss: [id: string]
}>()

// 获取图标名称
const getIconName = (type: string) => {
  const iconMap = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  }
  return iconMap[type as keyof typeof iconMap] || 'info'
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return '刚刚'
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  return timestamp.toLocaleDateString()
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notification {
  width: 360px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
  overflow: hidden;
  pointer-events: auto;
  cursor: pointer;
  position: relative;
}

.notification-success {
  border-left: 4px solid #10b981;
}

.notification-error {
  border-left: 4px solid #ef4444;
}

.notification-warning {
  border-left: 4px solid #f59e0b;
}

.notification-info {
  border-left: 4px solid #3b82f6;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.notification-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.notification-close {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.notification-progress {
  height: 2px;
  background: var(--vp-c-bg-alt);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  width: 100%;
  transform: translateX(-100%);
  animation: progress-slide 5s linear forwards;
}

.notification-success .progress-bar {
  background: #10b981;
}

.notification-error .progress-bar {
  background: #ef4444;
}

.notification-warning .progress-bar {
  background: #f59e0b;
}

.notification-info .progress-bar {
  background: #3b82f6;
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

@keyframes progress-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification {
    width: auto;
    margin-bottom: 8px;
  }
  
  .notification-content {
    padding: 12px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>
