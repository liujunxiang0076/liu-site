<template>
  <div class="backend-config">
    <div class="config-header">
      <h3>后端服务配置</h3>
      <p>配置VPS后端服务连接设置</p>
    </div>
    
    <div class="config-form">
      <!-- 后端地址配置 -->
      <div class="form-group">
        <label for="backend-url">后端服务地址</label>
        <input
          id="backend-url"
          v-model="config.url"
          type="url"
          placeholder="https://api.yourdomain.com"
          class="form-input"
        />
      </div>
      
      <!-- 连接超时配置 -->
      <div class="form-group">
        <label for="timeout">连接超时 (秒)</label>
        <input
          id="timeout"
          v-model.number="config.timeout"
          type="number"
          min="5"
          max="60"
          class="form-input"
        />
      </div>
      
      <!-- 启用状态 -->
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="config.enabled"
            type="checkbox"
            class="form-checkbox"
          />
          <span class="checkbox-text">启用后端模式</span>
        </label>
      </div>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <button @click="testConnection" class="test-btn" :disabled="!config.url">
          测试连接
        </button>
        <button @click="saveConfig" class="save-btn">
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 配置数据
const config = reactive({
  url: '',
  timeout: 30,
  enabled: false
})

// 测试连接
const testConnection = async () => {
  // 实现连接测试逻辑
  console.log('Testing connection to:', config.url)
}

// 保存配置
const saveConfig = () => {
  // 实现配置保存逻辑
  console.log('Saving config:', config)
}
</script>

<style scoped>
.backend-config {
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.config-header {
  padding: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.config-header h3 {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.config-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.config-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  margin: 0;
}

.checkbox-text {
  color: var(--vp-c-text-1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.test-btn,
.save-btn {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.test-btn {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.test-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-alt);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.save-btn:hover {
  background: var(--vp-c-brand-2);
}
</style>
