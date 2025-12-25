<template>
  <div class="admin-dashboard">
    <!-- 欢迎区域 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="welcome-title">
          欢迎使用博客管理系统
          <Icon name="wave" class="wave-icon" />
        </h1>
        <p class="welcome-subtitle">
          当前模式：{{ currentMode }} | 
          状态：{{ backendStatus.connected ? '已连接' : '离线模式' }}
        </p>
      </div>
      
      <!-- 快速状态卡片 -->
      <div class="status-cards">
        <div class="status-card">
          <div class="card-icon">
            <Icon name="server" />
          </div>
          <div class="card-content">
            <h3>连接状态</h3>
            <p :class="{ 'connected': backendStatus.connected, 'disconnected': !backendStatus.connected }">
              {{ backendStatus.connected ? '后端已连接' : 'GitHub模式' }}
            </p>
            <span v-if="backendStatus.connected" class="latency">
              延迟: {{ backendStatus.latency }}ms
            </span>
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon">
            <Icon name="clock" />
          </div>
          <div class="card-content">
            <h3>最后同步</h3>
            <p>{{ formatTime(backendStatus.lastCheck) }}</p>
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon">
            <Icon name="shield" />
          </div>
          <div class="card-content">
            <h3>验证状态</h3>
            <p :class="{ 'validated': validationState.isValidated, 'pending': !validationState.isValidated }">
              {{ validationState.isValidated ? '已验证' : '待验证' }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <h2 class="section-title">快速操作</h2>
      <div class="actions-grid">
        <button 
          @click="$emit('navigate', 'editor')"
          class="action-card primary"
        >
          <div class="action-icon">
            <Icon name="edit" />
          </div>
          <div class="action-content">
            <h3>新建文章</h3>
            <p>使用Monaco编辑器创建新文章</p>
          </div>
          <Icon name="arrow-right" class="action-arrow" />
        </button>
        
        <button 
          @click="$emit('navigate', 'posts')"
          class="action-card"
        >
          <div class="action-icon">
            <Icon name="article" />
          </div>
          <div class="action-content">
            <h3>文章管理</h3>
            <p>查看和编辑已发布的文章</p>
          </div>
          <Icon name="arrow-right" class="action-arrow" />
        </button>
        
        <button 
          @click="$emit('navigate', 'media')"
          class="action-card"
        >
          <div class="action-icon">
            <Icon name="image" />
          </div>
          <div class="action-content">
            <h3>媒体管理</h3>
            <p>上传和管理图片等媒体文件</p>
          </div>
          <Icon name="arrow-right" class="action-arrow" />
        </button>
        
        <button 
          @click="$emit('navigate', 'sync')"
          class="action-card"
        >
          <div class="action-icon">
            <Icon name="sync" />
          </div>
          <div class="action-content">
            <h3>同步状态</h3>
            <p>查看数据同步和备份状态</p>
          </div>
          <Icon name="arrow-right" class="action-arrow" />
        </button>
      </div>
    </div>
    
    <!-- 系统信息区域 -->
    <div class="system-info">
      <h2 class="section-title">系统信息</h2>
      <div class="info-grid">
        <div class="info-card">
          <h4>博客配置</h4>
          <div class="info-list">
            <div class="info-item">
              <span class="label">站点标题:</span>
              <span class="value">{{ siteMeta.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">站点地址:</span>
              <span class="value">{{ siteMeta.site }}</span>
            </div>
            <div class="info-item">
              <span class="label">作者:</span>
              <span class="value">{{ siteMeta.author?.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <h4>后端配置</h4>
          <div class="info-list">
            <div class="info-item">
              <span class="label">后端模式:</span>
              <span class="value">{{ backendConfig.enabled ? '启用' : '禁用' }}</span>
            </div>
            <div class="info-item">
              <span class="label">配置地址:</span>
              <span class="value">{{ backendConfig.url || '未配置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">允许地址:</span>
              <span class="value">{{ backendConfig.allowedOrigins?.length || 0 }} 个</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <h4>功能状态</h4>
          <div class="info-list">
            <div class="info-item">
              <span class="label">在线编辑:</span>
              <span class="value status" :class="{ enabled: validationState.isValidated }">
                {{ validationState.isValidated ? '可用' : '需验证' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">媒体上传:</span>
              <span class="value status" :class="{ enabled: validationState.isValidated }">
                {{ validationState.isValidated ? '可用' : '需验证' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">自动同步:</span>
              <span class="value status" :class="{ enabled: backendStatus.connected }">
                {{ backendStatus.connected ? '可用' : '离线模式' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import Icon from '../../Icon.vue'
import type { ValidationState, BackendStatus, BackendConfig } from '../../../types/admin'

// Props
interface Props {
  validationState: ValidationState
  backendStatus: BackendStatus
  routeConfig?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  navigate: [route: string]
}>()

// VitePress数据
const { theme } = useData()

// 计算属性
const siteMeta = computed(() => theme.value.siteMeta || {})
const backendConfig = computed(() => theme.value.adminBackend || {} as BackendConfig)

const currentMode = computed(() => {
  return props.backendStatus.connected ? '后端模式' : 'GitHub模式'
})

// 时间格式化
const formatTime = (date: Date | null) => {
  if (!date) return '从未'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px 0;
}

.wave-icon {
  color: var(--vp-c-brand-1);
  animation: wave 2s ease-in-out infinite;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.status-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 20px;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.card-content p {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.card-content p.connected {
  color: #10b981;
}

.card-content p.disconnected {
  color: #f59e0b;
}

.card-content p.validated {
  color: #10b981;
}

.card-content p.pending {
  color: #f59e0b;
}

.latency {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 16px 0;
}

.quick-actions {
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.action-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.action-card.primary {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.action-card.primary .action-icon {
  background: var(--vp-c-brand-1);
  color: white;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 20px;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.action-content p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.action-arrow {
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

.system-info {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-card {
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.info-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.info-item .value {
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.info-item .value.status.enabled {
  color: #10b981;
}

.info-item .value.status:not(.enabled) {
  color: #f59e0b;
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .status-cards,
  .actions-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    padding: 16px;
  }
}
</style>
