<template>
  <header class="admin-header">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="header-brand">
        <img 
          v-if="siteMeta.logo" 
          :src="siteMeta.logo" 
          :alt="siteMeta.title"
          class="brand-logo"
        />
        <div class="brand-text">
          <h1 class="brand-title">{{ siteMeta.title }} 管理后台</h1>
          <span class="brand-subtitle">在线博客编辑器</span>
        </div>
      </div>
      
      <!-- 连接状态指示器 -->
      <div class="connection-status">
        <div 
          class="status-indicator"
          :class="{ 
            'connected': backendStatus.connected,
            'disconnected': !backendStatus.connected 
          }"
        >
          <div class="status-dot"></div>
          <span class="status-text">
            {{ backendStatus.connected ? '后端已连接' : '使用GitHub模式' }}
          </span>
        </div>
        
        <!-- 延迟显示 -->
        <div v-if="backendStatus.connected" class="latency">
          {{ backendStatus.latency }}ms
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="header-actions">
        <!-- 模式切换 -->
        <div class="mode-switch">
          <button 
            @click="$emit('switchMode', 'github')"
            class="mode-btn"
            :class="{ active: !backendStatus.connected }"
          >
            <Icon name="github" />
            GitHub模式
          </button>
          <button 
            @click="$emit('switchMode', 'backend')"
            class="mode-btn"
            :class="{ active: backendStatus.connected }"
          >
            <Icon name="server" />
            后端模式
          </button>
        </div>
        
        <!-- 设置按钮 -->
        <button class="settings-btn" @click="showSettings = !showSettings">
          <Icon name="settings" />
        </button>
        
        <!-- 返回博客按钮 -->
        <a :href="siteMeta.site" class="back-btn" target="_blank">
          <Icon name="external-link" />
          返回博客
        </a>
      </div>
    </div>
    
    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-content">
        <h3>系统设置</h3>
        
        <!-- 后端配置 -->
        <div class="setting-group">
          <label>后端地址</label>
          <input 
            v-model="backendUrl"
            type="url"
            placeholder="输入后端API地址"
            class="setting-input"
          />
          <button 
            @click="handleValidateBackend"
            :disabled="!backendUrl || isValidating"
            class="validate-btn"
          >
            {{ isValidating ? '验证中...' : '验证连接' }}
          </button>
        </div>
        
        <!-- 验证错误显示 -->
        <div v-if="validationState.validationError" class="error-message">
          {{ validationState.validationError }}
        </div>
        
        <!-- 允许的后端地址列表 -->
        <div class="setting-group">
          <label>允许的后端地址</label>
          <div class="allowed-urls">
            <div 
              v-for="url in allowedOrigins" 
              :key="url"
              class="url-item"
            >
              {{ url }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import Icon from '../Icon.vue'

// Props
interface Props {
  validationState: {
    isValidated: boolean
    backendUrl: string
    blogConfig: any
    validationError: string
  }
  backendStatus: {
    connected: boolean
    url: string
    latency: number
    lastCheck: Date
    blogAssociated: boolean
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  validateBackend: [url: string]
  switchMode: [mode: 'github' | 'backend']
}>()

// VitePress数据
const { theme } = useData()

// 计算属性
const siteMeta = computed(() => theme.value.siteMeta || {})
const allowedOrigins = computed(() => theme.value.adminBackend?.allowedOrigins || [])

// 响应式数据
const showSettings = ref(false)
const backendUrl = ref(props.backendStatus.url || theme.value.adminBackend?.url || '')
const isValidating = ref(false)

// 验证后端连接
const handleValidateBackend = async () => {
  if (!backendUrl.value) return
  
  isValidating.value = true
  try {
    emit('validateBackend', backendUrl.value)
  } finally {
    setTimeout(() => {
      isValidating.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.admin-header {
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.brand-subtitle {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
}

.status-indicator.connected .status-dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-indicator.disconnected .status-dot {
  background: #f59e0b;
}

.status-text {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.latency {
  font-size: 11px;
  color: var(--vp-c-text-3);
  padding: 2px 6px;
  background: var(--vp-c-bg);
  border-radius: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-switch {
  display: flex;
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: var(--vp-c-brand-1);
  color: white;
}

.mode-btn:hover:not(.active) {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.settings-btn,
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.2s ease;
}

.settings-btn:hover,
.back-btn:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
}

.settings-panel {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.settings-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-content h3 {
  margin: 0 0 20px 0;
  color: var(--vp-c-text-1);
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.setting-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
  margin-bottom: 8px;
}

.setting-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.validate-btn {
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.validate-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.validate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

.allowed-urls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.url-item {
  padding: 6px 10px;
  background: var(--vp-c-bg-alt);
  border-radius: 4px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px 15px;
  }
  
  .header-brand {
    align-self: flex-start;
  }
  
  .connection-status {
    order: 3;
    align-self: stretch;
    justify-content: center;
  }
  
  .header-actions {
    order: 2;
    align-self: stretch;
    justify-content: space-between;
  }
  
  .mode-switch {
    flex: 1;
    max-width: 200px;
  }
  
  .settings-content {
    padding: 15px;
  }
}
</style>
