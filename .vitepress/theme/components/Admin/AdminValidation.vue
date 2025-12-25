<template>
  <div class="admin-validation">
    <div class="validation-container">
      <!-- 验证状态卡片 -->
      <div class="validation-card">
        <div class="card-header">
          <Icon name="shield" class="header-icon" />
          <h2>后端服务验证</h2>
          <p>请验证后端服务连接以使用完整的管理功能</p>
        </div>
        
        <div class="card-content">
          <!-- 后端地址输入 -->
          <div class="input-group">
            <label for="backend-url">后端服务地址</label>
            <div class="input-wrapper">
              <input
                id="backend-url"
                v-model="backendUrl"
                type="url"
                placeholder="https://api.yourdomain.com"
                class="url-input"
                :class="{ error: validationState.validationError }"
                @keyup.enter="handleValidate"
              />
              <button 
                @click="handleValidate"
                :disabled="!backendUrl || isValidating"
                class="validate-btn"
              >
                <Icon v-if="isValidating" name="loading" class="spinning" />
                <Icon v-else name="check" />
                {{ isValidating ? '验证中...' : '验证' }}
              </button>
            </div>
          </div>
          
          <!-- 错误信息显示 -->
          <div v-if="validationState.validationError" class="error-message">
            <Icon name="alert-circle" />
            <span>{{ validationState.validationError }}</span>
          </div>
          
          <!-- 允许的后端地址提示 -->
          <div v-if="backendConfig?.allowedOrigins?.length" class="allowed-urls">
            <h4>允许的后端地址：</h4>
            <div class="url-list">
              <div 
                v-for="url in backendConfig.allowedOrigins" 
                :key="url"
                class="url-item"
                @click="selectUrl(url)"
              >
                <Icon name="server" />
                <span>{{ url }}</span>
                <Icon name="copy" class="copy-icon" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <!-- GitHub模式选项 -->
          <div class="github-option">
            <button @click="handleUseGitHub" class="github-btn">
              <Icon name="github" />
              <div class="btn-content">
                <span class="btn-title">使用GitHub直连模式</span>
                <span class="btn-subtitle">无需后端服务，直接连接GitHub API</span>
              </div>
              <Icon name="arrow-right" />
            </button>
          </div>
          
          <!-- 配置说明 -->
          <div class="config-help">
            <button @click="showConfigHelp = !showConfigHelp" class="help-toggle">
              <Icon name="help-circle" />
              配置说明
              <Icon :name="showConfigHelp ? 'chevron-up' : 'chevron-down'" />
            </button>
            
            <div v-if="showConfigHelp" class="help-content">
              <h5>如何配置后端服务：</h5>
              <ol>
                <li>在博客配置文件中添加 <code>adminBackend</code> 配置</li>
                <li>设置允许的后端地址列表 <code>allowedOrigins</code></li>
                <li>部署VPS后端服务并配置相应的环境变量</li>
                <li>确保后端服务与博客配置匹配</li>
              </ol>
              
              <div class="config-example">
                <h6>配置示例：</h6>
                <pre><code>themeConfig: {
  adminBackend: {
    enabled: true,
    url: "https://api.yourdomain.com",
    allowedOrigins: [
      "https://api.yourdomain.com",
      "http://localhost:3000"
    ]
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 功能预览卡片 -->
      <div class="features-card">
        <h3>管理功能预览</h3>
        <div class="features-grid">
          <div class="feature-item">
            <Icon name="edit" />
            <h4>在线编辑</h4>
            <p>Monaco编辑器，支持Markdown语法高亮和实时预览</p>
          </div>
          <div class="feature-item">
            <Icon name="image" />
            <h4>媒体管理</h4>
            <p>拖拽上传图片，自动生成缩略图和Markdown语法</p>
          </div>
          <div class="feature-item">
            <Icon name="sync" />
            <h4>自动同步</h4>
            <p>离线编辑支持，网络恢复后自动同步到GitHub</p>
          </div>
          <div class="feature-item">
            <Icon name="shield" />
            <h4>安全认证</h4>
            <p>支持GitHub OAuth和JWT认证，确保内容安全</p>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  backendConfig: {
    enabled?: boolean
    url?: string
    allowedOrigins?: string[]
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  validate: [url: string]
  configure: []
}>()

// VitePress数据
const { theme } = useData()

// 响应式数据
const backendUrl = ref(props.backendConfig?.url || '')
const isValidating = ref(false)
const showConfigHelp = ref(false)

// 计算属性
const siteMeta = computed(() => theme.value.siteMeta || {})

// 验证后端连接
const handleValidate = async () => {
  if (!backendUrl.value) return
  
  isValidating.value = true
  
  try {
    emit('validate', backendUrl.value)
  } finally {
    // 延迟重置状态，给用户反馈时间
    setTimeout(() => {
      isValidating.value = false
    }, 1000)
  }
}

// 选择URL
const selectUrl = (url: string) => {
  backendUrl.value = url
  
  // 复制到剪贴板
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      // 可以添加复制成功的提示
    })
  }
}

// 使用GitHub模式
const handleUseGitHub = () => {
  // 触发父组件切换到GitHub模式
  window.dispatchEvent(new CustomEvent('admin:switch-mode', { 
    detail: { mode: 'github' } 
  }))
}
</script>

<style scoped>
.admin-validation {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--vp-c-bg) 0%, var(--vp-c-bg-alt) 100%);
  padding: 40px 20px;
}

.validation-container {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 30px;
}

.validation-card,
.features-card {
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-icon {
  font-size: 48px;
  color: var(--vp-c-brand-1);
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--vp-c-text-1);
}

.card-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

.card-content {
  padding: 30px;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--vp-c-text-1);
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

.spinning {
  animation: spin 1s linear infinite;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 24px;
}

.allowed-urls {
  margin-bottom: 24px;
}

.allowed-urls h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.url-item:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.url-item span {
  flex: 1;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.copy-icon {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.url-item:hover .copy-icon {
  opacity: 1;
}

.card-footer {
  padding: 30px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.github-option {
  margin-bottom: 24px;
}

.github-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 20px;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.github-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.btn-content {
  flex: 1;
  text-align: left;
}

.btn-title {
  display: block;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.btn-subtitle {
  display: block;
  font-size: 13px;
  color: var(--vp-c-text-2);
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
  padding: 16px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.help-content h5,
.help-content h6 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.help-content ol {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 4px;
  color: var(--vp-c-text-2);
}

.help-content code {
  background: var(--vp-c-bg-alt);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.config-example {
  margin-top: 16px;
}

.config-example pre {
  background: var(--vp-c-bg-alt);
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
}

.features-card {
  padding: 30px;
}

.features-card h3 {
  margin: 0 0 24px 0;
  text-align: center;
  color: var(--vp-c-text-1);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.feature-item h4 {
  margin: 12px 0 8px 0;
  color: var(--vp-c-text-1);
}

.feature-item p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-validation {
    padding: 20px 15px;
  }
  
  .validation-container {
    gap: 20px;
  }
  
  .card-header,
  .card-content,
  .card-footer {
    padding: 20px;
  }
  
  .input-wrapper {
    flex-direction: column;
  }
  
  .validate-btn {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
