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
          @use-github-mode="() => handleSwitchMode('github')"
        />
        
        <!-- 管理功能区域 -->
        <div v-else class="admin-content-area">
          <!-- 使用AdminRouter组件处理路由 -->
          <AdminRouter 
            :current-route="currentRoute"
            :validation-state="validationState"
            :backend-status="backendStatus"
            @navigate="handleNavigate"
            @route-change="handleRouteChange"
          />
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
import AdminRouter from '../components/Admin/AdminRouter.vue'
import Icon from '../components/Icon.vue'
import { createBackendValidator, formatValidationError } from '../utils/backendValidator'
import type { AdminRoute } from '../types/admin'

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
const currentRoute = ref<AdminRoute>('dashboard')

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
    // 创建后端验证器
    const validator = createBackendValidator(theme.value, backendConfig.value)
    
    // 执行验证
    const result = await validator.validateAssociation(inputUrl)
    
    if (result.success && result.configMatches) {
      // 验证成功
      validationState.isValidated = true
      validationState.backendUrl = inputUrl
      validationState.blogConfig = theme.value
      
      backendStatus.connected = true
      backendStatus.url = inputUrl
      backendStatus.blogAssociated = true
      backendStatus.lastCheck = new Date()
      
      // 测试连接获取延迟
      const connectionTest = await validator.testConnection(inputUrl)
      if (connectionTest.success && connectionTest.latency) {
        backendStatus.latency = connectionTest.latency
      }
      
      currentMode.value = 'backend'
      
      // 保存验证状态到本地存储
      localStorage.setItem('admin-validation-state', JSON.stringify({
        isValidated: true,
        backendUrl: inputUrl,
        timestamp: Date.now()
      }))
      
      addNotification('success', '后端验证成功，已切换到后端模式')
    } else {
      // 验证失败
      throw new Error(result.error || '后端验证失败')
    }
  } catch (error) {
    console.error('Backend validation failed:', error)
    validationState.validationError = formatValidationError(error)
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
const handleNavigate = (route: AdminRoute) => {
  currentRoute.value = route
  addNotification('info', `导航到: ${route}`)
}

// 路由变化处理
const handleRouteChange = (newRoute: AdminRoute, previousRoute: AdminRoute) => {
  console.log(`Route changed from ${previousRoute} to ${newRoute}`)
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
      const now = Date.now()
      const stateAge = now - (parsed.timestamp || 0)
      
      // 验证状态有效期为24小时
      if (parsed.isValidated && parsed.backendUrl && stateAge < 24 * 60 * 60 * 1000) {
        // 尝试重新验证
        handleValidateBackend(parsed.backendUrl)
      } else {
        // 清除过期状态
        localStorage.removeItem('admin-validation-state')
      }
    } catch (error) {
      console.error('Failed to restore validation state:', error)
      localStorage.removeItem('admin-validation-state')
    }
  }
  
  // 默认使用GitHub模式
  if (!validationState.isValidated) {
    handleSwitchMode('github')
  }
  
  // 监听网络状态变化
  window.addEventListener('online', handleNetworkStatusChange)
  window.addEventListener('offline', handleNetworkStatusChange)
  
  // 监听自定义事件
  window.addEventListener('admin:switch-mode', handleCustomSwitchMode)
})

// 网络状态变化处理
const handleNetworkStatusChange = () => {
  const isOnline = navigator.onLine
  
  if (isOnline && backendStatus.connected) {
    // 网络恢复且有后端连接，重新验证
    if (validationState.backendUrl) {
      handleValidateBackend(validationState.backendUrl)
    }
  } else if (!isOnline) {
    // 网络断开
    addNotification('warning', '网络连接已断开，已切换到离线模式')
  }
}

// 自定义模式切换事件处理
const handleCustomSwitchMode = (event: any) => {
  const mode = event.detail?.mode
  if (mode === 'github' || mode === 'backend') {
    handleSwitchMode(mode)
  }
}
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

.admin-content-area {
  flex: 1;
  overflow-y: auto;
  background: var(--vp-c-bg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-main {
    flex-direction: column;
  }
  
  .admin-content-area {
    padding: 0;
  }
}
</style>
