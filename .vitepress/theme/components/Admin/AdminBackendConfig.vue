<template>
  <div class="admin-backend-config">
    <!-- 配置状态显示 -->
    <div class="config-status">
      <div class="status-header">
        <Icon name="server" class="status-icon" />
        <div class="status-info">
          <h3>后端配置状态</h3>
          <p :class="configStatusClass">{{ configStatusText }}</p>
        </div>
      </div>
      
      <!-- 配置详情 -->
      <div v-if="backendConfig.enabled" class="config-details">
        <div class="config-item">
          <span class="label">配置状态:</span>
          <span class="value" :class="{ enabled: backendConfig.enabled }">
            {{ backendConfig.enabled ? '已启用' : '已禁用' }}
          </span>
        </div>
        <div class="config-item">
          <span class="label">默认地址:</span>
          <span class="value">{{ backendConfig.url || '未配置' }}</span>
        </div>
        <div class="config-item">
          <span class="label">允许地址:</span>
          <span class="value">{{ allowedOriginsCount }} 个</span>
        </div>
      </div>
    </div>
    
    <!-- 后端地址输入和验证 -->
    <div class="backend-input-section">
      <h4>后端服务连接</h4>
      <p class="section-description">
        输入VPS后端服务地址以启用完整的管理功能
      </p>
      
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="inputUrl"
            type="url"
            placeholder="https://api.yourdomain.com"
            class="url-input"
            :class="{ 
              error: validationError,
              success: validationSuccess 
            }"
            @keyup.enter="handleValidate"
            @input="clearValidationState"
          />
          <button 
            @click="handleValidate"
            :disabled="!inputUrl || isValidating"
            class="validate-btn"
            :class="{ loading: isValidating }"
          >
            <Icon v-if="isValidating" name="loading" class="spinning" />
            <Icon v-else-if="validationSuccess" name="check" />
            <Icon v-else name="server" />
            {{ validateButtonText }}
          </button>
        </div>
        
        <!-- 验证结果显示 -->
        <div v-if="validationError" class="validation-message error">
          <Icon name="alert-circle" />
          <span>{{ validationError }}</span>
        </div>
        
        <div v-if="validationSuccess" class="validation-message success">
          <Icon name="check-circle" />
          <span>{{ validationSuccess }}</span>
        </div>
      </div>
    </div>
    
    <!-- 允许的后端地址列表 -->
    <div v-if="backendConfig.allowedOrigins?.length" class="allowed-origins">
      <h4>允许的后端地址</h4>
      <p class="section-description">
        点击地址可快速选择，只有这些地址可以连接到此博客
      </p>
      
      <div class="origins-list">
        <div 
          v-for="(origin, index) in backendConfig.allowedOrigins" 
          :key="index"
          class="origin-item"
          :class="{ active: inputUrl === origin }"
          @click="selectOrigin(origin)"
        >
          <div class="origin-info">
            <Icon name="server" />
            <span class="origin-url">{{ origin }}</span>
          </div>
          <div class="origin-actions">
            <button 
              @click.stop="copyToClipboard(origin)"
              class="copy-btn"
              title="复制地址"
            >
              <Icon name="copy" />
            </button>
            <Icon 
              v-if="inputUrl === origin" 
              name="check" 
              class="selected-icon" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- GitHub模式选项 -->
    <div class="github-mode-section">
      <div class="mode-card">
        <div class="mode-header">
          <Icon name="github" class="mode-icon" />
          <div class="mode-info">
            <h4>GitHub直连模式</h4>
            <p>无需后端服务，直接连接GitHub API进行文章管理</p>
          </div>
        </div>
        
        <div class="mode-features">
          <div class="feature-item">
            <Icon name="check" />
            <span>直接GitHub API操作</span>
          </div>
          <div class="feature-item">
            <Icon name="check" />
            <span>无需服务器部署</span>
          </div>
          <div class="feature-item">
            <Icon name="check" />
            <span>OAuth安全认证</span>
          </div>
        </div>
        
        <button @click="handleUseGitHubMode" class="github-mode-btn">
          <Icon name="github" />
          使用GitHub模式
          <Icon name="arrow-right" />
        </button>
      </div>
    </div>
    
    <!-- 配置帮助 -->
    <div class="config-help">
      <button 
        @click="showHelp = !showHelp" 
        class="help-toggle"
      >
        <Icon name="help-circle" />
        配置说明
        <Icon :name="showHelp ? 'chevron-up' : 'chevron-down'" />
      </button>
      
      <div v-if="showHelp" class="help-content">
        <div class="help-section">
          <h5>如何配置后端服务：</h5>
          <ol>
            <li>在博客配置文件 <code>.vitepress/theme/config/themeConfig.mjs</code> 中添加配置</li>
            <li>设置 <code>adminBackend.enabled: true</code> 启用后端模式</li>
            <li>配置 <code>adminBackend.allowedOrigins</code> 允许的后端地址列表</li>
            <li>部署VPS后端服务并配置相应的环境变量</li>
          </ol>
        </div>
        
        <div class="help-section">
          <h5>配置示例：</h5>
          <pre class="config-example"><code>adminBackend: {
  enabled: true,
  url: 'https://api.yourdomain.com',
  allowedOrigins: [
    'https://api.yourdomain.com',
    'https://backup-api.yourdomain.com',
    'http://localhost:3000'  // 开发环境
  ]
}</code></pre>
        </div>
        
        <div class="help-section">
          <h5>安全说明：</h5>
          <ul>
            <li>只有在 <code>allowedOrigins</code> 列表中的地址才能连接</li>
            <li>后端服务需要验证博客URL和标题匹配</li>
            <li>建议使用HTTPS协议确保数据传输安全</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useData } from 'vitepress'
import Icon from '../Icon.vue'
import type { BackendConfig, ValidationResult } from '../../types/admin'

// Props
interface Props {
  backendConfig: BackendConfig
  validationState: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  validate: [url: string]
  useGitHubMode: []
  configUpdate: [config: BackendConfig]
}>()

// VitePress数据
const { theme } = useData()

// 响应式数据
const inputUrl = ref('')
const isValidating = ref(false)
const validationError = ref('')
const validationSuccess = ref('')
const showHelp = ref(false)

// 计算属性
const siteMeta = computed(() => theme.value.siteMeta || {})

const configStatusClass = computed(() => ({
  'status-enabled': props.backendConfig.enabled,
  'status-disabled': !props.backendConfig.enabled
}))

const configStatusText = computed(() => {
  if (!props.backendConfig.enabled) {
    return '后端模式未启用'
  }
  if (!props.backendConfig.allowedOrigins?.length) {
    return '未配置允许的后端地址'
  }
  return '配置正常，可以连接后端服务'
})

const allowedOriginsCount = computed(() => {
  return props.backendConfig.allowedOrigins?.length || 0
})

const validateButtonText = computed(() => {
  if (isValidating.value) return '验证中...'
  if (validationSuccess.value) return '已验证'
  return '验证连接'
})

// 方法
const handleValidate = async () => {
  if (!inputUrl.value) return
  
  clearValidationState()
  isValidating.value = true
  
  try {
    // 检查URL是否在允许列表中
    if (!isUrlAllowed(inputUrl.value)) {
      throw new Error('输入的后端地址不在博客配置的允许列表中')
    }
    
    // 发送验证请求
    emit('validate', inputUrl.value)
    
    // 模拟验证成功（实际验证在父组件中处理）
    setTimeout(() => {
      if (!validationError.value) {
        validationSuccess.value = '后端验证成功'
      }
      isValidating.value = false
    }, 1000)
    
  } catch (error) {
    validationError.value = error instanceof Error ? error.message : '验证失败'
    isValidating.value = false
  }
}

const isUrlAllowed = (url: string): boolean => {
  const allowedUrls = props.backendConfig.allowedOrigins || []
  const configUrl = props.backendConfig.url
  
  return allowedUrls.includes(url) || url === configUrl
}

const selectOrigin = (origin: string) => {
  inputUrl.value = origin
  clearValidationState()
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // 可以添加复制成功的提示
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const handleUseGitHubMode = () => {
  emit('useGitHubMode')
}

const clearValidationState = () => {
  validationError.value = ''
  validationSuccess.value = ''
}

// 监听验证状态变化
watch(() => props.validationState.validationError, (error) => {
  if (error) {
    validationError.value = error
    validationSuccess.value = ''
    isValidating.value = false
  }
})

watch(() => props.validationState.isValidated, (isValidated) => {
  if (isValidated) {
    validationSuccess.value = '后端验证成功'
    validationError.value = ''
    isValidating.value = false
  }
})

// 监听后端状态变化
watch(() => props.validationState, (state) => {
  // 如果验证失败，清除成功状态
  if (state.validationError) {
    validationSuccess.value = ''
  }
}, { deep: true })

// 初始化
if (props.backendConfig.url) {
  inputUrl.value = props.backendConfig.url
}
</script>

<style scoped>
.admin-backend-config {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.config-status {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.status-icon {
  font-size: 24px;
  color: var(--vp-c-brand-1);
}

.status-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: var(--vp-c-text-1);
}

.status-info p {
  margin: 0;
  font-size: 14px;
}

.status-info p.status-enabled {
  color: #10b981;
}

.status-info p.status-disabled {
  color: #f59e0b;
}

.config-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-item .label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.config-item .value {
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.config-item .value.enabled {
  color: #10b981;
}

.backend-input-section,
.allowed-origins,
.github-mode-section {
  margin-bottom: 24px;
}

.backend-input-section h4,
.allowed-origins h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--vp-c-text-1);
}

.section-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: all 0.2s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.url-input.error {
  border-color: #ef4444;
}

.url-input.success {
  border-color: #10b981;
}

.validate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.validate-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.validate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.validate-btn.loading {
  background: var(--vp-c-text-3);
}

.spinning {
  animation: spin 1s linear infinite;
}

.validation-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.validation-message.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.validation-message.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.origins-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.origin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.origin-item:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.origin-item.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.origin-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.origin-url {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.origin-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.selected-icon {
  color: var(--vp-c-brand-1);
}

.github-mode-section {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mode-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mode-icon {
  font-size: 24px;
  color: var(--vp-c-text-1);
}

.mode-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--vp-c-text-1);
}

.mode-info p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.mode-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.feature-item .icon {
  color: #10b981;
}

.github-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
}

.github-mode-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.config-help {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
}

.help-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.help-toggle:hover {
  color: var(--vp-c-text-1);
}

.help-content {
  margin-top: 16px;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.help-section {
  margin-bottom: 20px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.help-section code {
  background: var(--vp-c-bg);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.config-example {
  background: var(--vp-c-bg);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0 0 0;
}

.config-example code {
  background: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-backend-config {
    padding: 16px;
  }
  
  .input-wrapper {
    flex-direction: column;
  }
  
  .validate-btn {
    justify-content: center;
  }
  
  .origin-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .origin-actions {
    align-self: flex-end;
  }
}
</style>
