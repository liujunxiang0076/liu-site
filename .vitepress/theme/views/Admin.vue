<template>
  <div class="admin-layout">
    <!-- 管理页面头部 -->
    <AdminHeader 
      :validation-state="validationState"
      :backend-status="backendStatus"
      @validate-backend="handleValidateBackend"
      @switch-mode="handleSwitchMode"
    />
    
    <!-- 主要内容区域 -->
    <div class="admin-main">
      <!-- 侧边栏导航 -->
      <AdminSidebar 
        v-if="validationState.isValidated"
        :current-route="currentRoute"
        @navigate="handleNavigate"
      />
      
      <!-- 内容区域 -->
      <div class="admin-content">
        <!-- 验证状态显示 -->
        <AdminValidation 
          v-if="!validationState.isValidated"
          :validation-state="validationState"
          :backend-config="backendConfig"
          @validate="handleValidateBackend"
          @configure="handleConfigure"
        />
        
        <!-- 管理功能区域 -->
        <div v-else class="admin-dashboard">
          <!-- 路由内容将在这里渲染 -->
          <router-view v-if="false" />
          
          <!-- 临时仪表板内容 -->
          <div class="dashboard-welcome">
            <h2>欢迎使用博客管理系统</h2>
            <p>后端连接状态：{{ backendStatus.connected ? '已连接' : '未连接' }}</p>
            <p>当前模式：{{ currentMode }}</p>
            
            <div class="quick-actions">
              <button @click="handleNavigate('editor')" class="action-btn">
                <Icon name="edit" />
                新建文章
              </button>
              <button @click="handleNavigate('posts')" class="action-btn">
                <Icon name="article" />
                文章管理
              </button>
              <button @click="handleNavigate('media')" class="action-btn">
                <Icon name="image" />
                媒体管理
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 通知组件 -->
    <AdminNotification 
      :notifications="notifications"
      @dismiss="dismissNotification"
    />
    
    <!-- 加载状态 -->
    <AdminLoading v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import AdminHeader from '../components/Admin/AdminHeader.vue'
import AdminSidebar from '../components/Admin/AdminSidebar.vue'
import AdminValidation from '../components/Admin/AdminValidation.vue'
import AdminNotification from '../components/Admin/AdminNotification.vue'
import AdminLoading from '../components/Admin/AdminLoading.vue'
import Icon from '../components/Icon.vue'

// VitePress 数据
const { theme } = useData()

// 验证状态
const validationState = reactive({
  isValidated: false,
  backendUrl: '',
  blogConfig: null as any,
  validationError: ''
})

// 后端连接状态
const backendStatus = reactive({
  connected: false,
  url: '',
  latency: 0,
  lastCheck: new Date(),
  blogAssociated: false
})

// 后端配置
const backendConfig = computed(() => theme.value.adminBackend || {})

// 当前路由
const currentRoute = ref('dashboard')

// 当前模式
const currentMode = ref<'github' | 'backend'>('github')

// 通知列表
const notifications = ref<Array<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}>>([])

// 加载状态
const isLoading = ref(false)

// 验证后端关联
const handleValidateBackend = async (inputUrl: string) => {
  isLoading.value = true
  validationState.validationError = ''
  
  try {
    // 检查输入URL是否在允许列表中
    const allowedUrls = backendConfig.value.allowedOrigins || []
    const configUrl = backendConfig.value.url
    
    if (!allowedUrls.includes(inputUrl) && inputUrl !== configUrl) {
      throw new Error('输入的后端地址不在博客配置的允许列表中')
    }
    
    // 向后端发送验证请求
    const response = await fetch(`${inputUrl}/api/validate-blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blogUrl: theme.value.siteMeta.site,
        blogTitle: theme.value.siteMeta.title,
        timestamp: Date.now()
      })
    })
    
    if (!response.ok) {
      throw new Error(`验证请求失败: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.valid && result.configMatches) {
      // 验证成功
      validationState.isValidated = true
      validationState.backendUrl = inputUrl
      validationState.blogConfig = theme.value
      
      backendStatus.connected = true
      backendStatus.url = inputUrl
      backendStatus.blogAssociated = true
      backendStatus.lastCheck = new Date()
      
      currentMode.value = 'backend'
      
      addNotification('success', '后端验证成功，已切换到后端模式')
    } else {
      throw new Error(result.error || '后端验证失败')
    }
  } catch (error) {
    console.error('Backend validation failed:', error)
    validationState.validationError = error instanceof Error ? error.message : '验证失败'
    addNotification('error', validationState.validationError)
  } finally {
    isLoading.value = false
  }
}

// 切换模式
const handleSwitchMode = (mode: 'github' | 'backend') => {
  if (mode === 'github') {
    // 切换到GitHub直连模式
    validationState.isValidated = true
    backendStatus.connected = false
    currentMode.value = 'github'
    addNotification('info', '已切换到GitHub直连模式')
  } else {
    // 切换到后端模式需要验证
    validationState.isValidated = false
    backendStatus.connected = false
    currentMode.value = 'backend'
  }
}

// 配置后端
const handleConfigure = () => {
  addNotification('info', '请在博客配置中设置adminBackend选项')
}

// 导航处理
const handleNavigate = (route: string) => {
  currentRoute.value = route
  addNotification('info', `导航到: ${route}`)
}

// 添加通知
const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  const notification = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: new Date()
  }
  notifications.value.push(notification)
  
  // 自动移除通知
  setTimeout(() => {
    dismissNotification(notification.id)
  }, 5000)
}

// 移除通知
const dismissNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 组件挂载时的初始化
onMounted(() => {
  // 检查是否有保存的验证状态
  const savedState = localStorage.getItem('admin-validation-state')
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState)
      if (parsed.isValidated && parsed.backendUrl) {
        // 尝试重新验证
        handleValidateBackend(parsed.backendUrl)
      }
    } catch (error) {
      console.error('Failed to restore validation state:', error)
    }
  }
  
  // 默认使用GitHub模式
  if (!validationState.isValidated) {
    handleSwitchMode('github')
  }
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.admin-main {
  display: flex;
  min-height: calc(100vh - 60px);
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-welcome {
  text-align: center;
  padding: 40px 20px;
}

.dashboard-welcome h2 {
  margin-bottom: 20px;
  color: var(--vp-c-brand-1);
}

.dashboard-welcome p {
  margin-bottom: 10px;
  color: var(--vp-c-text-2);
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-main {
    flex-direction: column;
  }
  
  .admin-content {
    padding: 15px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 200px;
    justify-content: center;
  }
}
</style>
