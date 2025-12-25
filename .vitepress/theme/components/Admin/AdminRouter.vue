<template>
  <div class="admin-router">
    <!-- 动态渲染当前路由组件 -->
    <component 
      :is="currentComponent" 
      v-bind="componentProps"
      @navigate="handleNavigate"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { AdminRoute, AdminRouteConfig } from '../../types/admin'

// 懒加载管理页面组件
const AdminDashboard = defineAsyncComponent(() => import('./routes/AdminDashboard.vue'))
const AdminEditor = defineAsyncComponent(() => import('./routes/AdminEditor.vue'))
const AdminPosts = defineAsyncComponent(() => import('./routes/AdminPosts.vue'))
const AdminMedia = defineAsyncComponent(() => import('./routes/AdminMedia.vue'))
const AdminSettings = defineAsyncComponent(() => import('./routes/AdminSettings.vue'))
const AdminSync = defineAsyncComponent(() => import('./routes/AdminSync.vue'))

// Props
interface Props {
  currentRoute: AdminRoute
  validationState: any
  backendStatus: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  navigate: [route: AdminRoute]
  routeChange: [route: AdminRoute, previousRoute: AdminRoute]
}>()

// 路由配置
const routeConfigs: Record<AdminRoute, AdminRouteConfig> = {
  dashboard: {
    path: 'dashboard',
    name: '仪表板',
    icon: 'dashboard',
    description: '管理系统概览',
    component: AdminDashboard
  },
  editor: {
    path: 'editor',
    name: '文章编辑器',
    icon: 'edit',
    description: '创建和编辑文章',
    requiresAuth: true,
    component: AdminEditor
  },
  posts: {
    path: 'posts',
    name: '文章管理',
    icon: 'article',
    description: '管理所有文章',
    requiresAuth: true,
    component: AdminPosts
  },
  media: {
    path: 'media',
    name: '媒体库',
    icon: 'image',
    description: '管理媒体文件',
    requiresAuth: true,
    component: AdminMedia
  },
  settings: {
    path: 'settings',
    name: '系统设置',
    icon: 'settings',
    description: '系统配置管理',
    component: AdminSettings
  },
  sync: {
    path: 'sync',
    name: '同步状态',
    icon: 'sync',
    description: '数据同步管理',
    requiresAuth: true,
    component: AdminSync
  }
}

// 当前路由组件
const currentComponent = computed(() => {
  const config = routeConfigs[props.currentRoute]
  return config?.component || AdminDashboard
})

// 组件属性
const componentProps = computed(() => ({
  validationState: props.validationState,
  backendStatus: props.backendStatus,
  routeConfig: routeConfigs[props.currentRoute]
}))

// 上一个路由
const previousRoute = ref<AdminRoute>('dashboard')

// 导航处理
const handleNavigate = (route: AdminRoute) => {
  // 检查权限
  const config = routeConfigs[route]
  if (config?.requiresAuth && !props.validationState.isValidated) {
    // 需要认证但未验证，显示提示
    console.warn(`Route ${route} requires authentication`)
    return
  }
  
  const prev = props.currentRoute
  previousRoute.value = prev
  
  emit('navigate', route)
  emit('routeChange', route, prev)
}

// 更新处理
const handleUpdate = (data: any) => {
  // 处理子组件的更新事件
  console.log('Route component update:', data)
}

// 监听路由变化
watch(() => props.currentRoute, (newRoute, oldRoute) => {
  if (oldRoute) {
    previousRoute.value = oldRoute
  }
  
  // 更新浏览器历史记录（可选）
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('route', newRoute)
    window.history.replaceState({}, '', url.toString())
  }
}, { immediate: true })

// 组件挂载时恢复路由状态
onMounted(() => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    const savedRoute = url.searchParams.get('route') as AdminRoute
    
    if (savedRoute && routeConfigs[savedRoute]) {
      handleNavigate(savedRoute)
    }
  }
})

// 导出路由配置供其他组件使用
defineExpose({
  routeConfigs,
  currentRoute: computed(() => props.currentRoute),
  navigate: handleNavigate
})
</script>

<script lang="ts">
import { defineAsyncComponent } from 'vue'

export default {
  name: 'AdminRouter'
}
</script>

<style scoped>
.admin-router {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 路由切换动画 */
.admin-router :deep(.route-enter-active),
.admin-router :deep(.route-leave-active) {
  transition: all 0.3s ease;
}

.admin-router :deep(.route-enter-from) {
  opacity: 0;
  transform: translateX(20px);
}

.admin-router :deep(.route-leave-to) {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
