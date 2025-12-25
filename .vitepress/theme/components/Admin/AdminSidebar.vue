<template>
  <aside class="admin-sidebar">
    <nav class="sidebar-nav">
      <!-- 主要功能导航 -->
      <div class="nav-section">
        <h3 class="nav-title">内容管理</h3>
        <ul class="nav-list">
          <li>
            <button 
              @click="$emit('navigate', 'dashboard')"
              class="nav-item"
              :class="{ active: currentRoute === 'dashboard' }"
            >
              <Icon name="dashboard" />
              <span>仪表板</span>
            </button>
          </li>
          <li>
            <button 
              @click="$emit('navigate', 'editor')"
              class="nav-item"
              :class="{ active: currentRoute === 'editor' }"
            >
              <Icon name="edit" />
              <span>新建文章</span>
            </button>
          </li>
          <li>
            <button 
              @click="$emit('navigate', 'posts')"
              class="nav-item"
              :class="{ active: currentRoute === 'posts' }"
            >
              <Icon name="article" />
              <span>文章管理</span>
              <span class="nav-badge">{{ postCount }}</span>
            </button>
          </li>
          <li>
            <button 
              @click="$emit('navigate', 'media')"
              class="nav-item"
              :class="{ active: currentRoute === 'media' }"
            >
              <Icon name="image" />
              <span>媒体库</span>
            </button>
          </li>
        </ul>
      </div>
      
      <!-- 系统功能导航 -->
      <div class="nav-section">
        <h3 class="nav-title">系统功能</h3>
        <ul class="nav-list">
          <li>
            <button 
              @click="$emit('navigate', 'settings')"
              class="nav-item"
              :class="{ active: currentRoute === 'settings' }"
            >
              <Icon name="settings" />
              <span>系统设置</span>
            </button>
          </li>
          <li>
            <button 
              @click="$emit('navigate', 'sync')"
              class="nav-item"
              :class="{ active: currentRoute === 'sync' }"
            >
              <Icon name="sync" />
              <span>同步状态</span>
              <div 
                class="sync-indicator"
                :class="{ 
                  'syncing': syncStatus.syncing,
                  'error': syncStatus.hasError 
                }"
              ></div>
            </button>
          </li>
        </ul>
      </div>
      
      <!-- 快捷操作 -->
      <div class="nav-section">
        <h3 class="nav-title">快捷操作</h3>
        <ul class="nav-list">
          <li>
            <button 
              @click="handleQuickAction('preview')"
              class="nav-item"
            >
              <Icon name="eye" />
              <span>预览博客</span>
              <Icon name="external-link" class="external-icon" />
            </button>
          </li>
          <li>
            <button 
              @click="handleQuickAction('github')"
              class="nav-item"
            >
              <Icon name="github" />
              <span>GitHub仓库</span>
              <Icon name="external-link" class="external-icon" />
            </button>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- 底部状态信息 -->
    <div class="sidebar-footer">
      <div class="status-info">
        <div class="status-item">
          <Icon name="clock" />
          <span>最后同步: {{ lastSyncTime }}</span>
        </div>
        <div class="status-item">
          <Icon name="wifi" />
          <span>{{ networkStatus ? '在线' : '离线' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import Icon from '../Icon.vue'

// Props
interface Props {
  currentRoute: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  navigate: [route: string]
}>()

// VitePress数据
const { theme } = useData()

// 响应式数据
const postCount = ref(0)
const networkStatus = ref(navigator.onLine)
const lastSyncTime = ref('从未')

// 同步状态
const syncStatus = ref({
  syncing: false,
  hasError: false,
  lastSync: null as Date | null
})

// 计算属性
const siteMeta = computed(() => theme.value.siteMeta || {})

// 快捷操作处理
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'preview':
      window.open(siteMeta.value.site, '_blank')
      break
    case 'github':
      if (siteMeta.value.author?.github) {
        window.open(siteMeta.value.author.github, '_blank')
      }
      break
  }
}

// 格式化时间
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

// 监听网络状态
const updateNetworkStatus = () => {
  networkStatus.value = navigator.onLine
}

// 更新同步时间
const updateSyncTime = () => {
  lastSyncTime.value = formatTime(syncStatus.value.lastSync)
}

// 组件挂载
onMounted(() => {
  // 监听网络状态变化
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  
  // 定时更新同步时间显示
  setInterval(updateSyncTime, 60000) // 每分钟更新一次
  
  // 模拟获取文章数量
  postCount.value = 12 // 这里应该从API获取实际数量
  
  // 模拟最后同步时间
  syncStatus.value.lastSync = new Date(Date.now() - 30 * 60000) // 30分钟前
  updateSyncTime()
})
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  background: var(--vp-c-bg-alt);
  border-right: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 20px 12px 20px;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.nav-item.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--vp-c-brand-1);
}

.nav-badge {
  margin-left: auto;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.nav-item.active .nav-badge {
  background: white;
  color: var(--vp-c-brand-1);
}

.sync-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  margin-left: auto;
}

.sync-indicator.syncing {
  background: var(--vp-c-brand-1);
  animation: pulse 1.5s infinite;
}

.sync-indicator.error {
  background: #ef4444;
}

.external-icon {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.6;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
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
  .admin-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
  
  .sidebar-nav {
    padding: 15px 0;
  }
  
  .nav-section {
    margin-bottom: 20px;
  }
  
  .nav-title {
    margin: 0 15px 8px 15px;
  }
  
  .nav-item {
    padding: 8px 15px;
  }
  
  .sidebar-footer {
    padding: 15px;
  }
}
</style>
