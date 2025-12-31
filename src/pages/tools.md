---
title: 实用工具
description: 收集整理的各种实用在线工具和资源
layout: page
---

<script setup>
import { ref, onMounted } from 'vue'

// 工具分类数据
const toolCategories = ref([
  {
    name: '开发工具',
    icon: 'code',
    color: '#4CAF50',
    tools: [
      {
        name: 'JSON格式化',
        description: '在线JSON格式化、压缩、验证工具',
        url: 'https://www.json.cn/',
        icon: 'json'
      },
      {
        name: 'RegEx测试',
        description: '正则表达式在线测试和学习工具',
        url: 'https://regex101.com/',
        icon: 'regex'
      },
      {
        name: 'Base64编解码',
        description: '在线Base64编码解码工具',
        url: 'https://base64.us/',
        icon: 'encode'
      },
      {
        name: 'URL编解码',
        description: 'URL编码解码工具',
        url: 'https://www.urlencoder.org/',
        icon: 'link'
      },
      {
        name: 'MD5加密',
        description: '在线MD5加密工具',
        url: 'https://www.md5hashgenerator.com/',
        icon: 'lock'
      },
      {
        name: 'UUID生成器',
        description: '在线UUID生成工具',
        url: 'https://www.uuidgenerator.net/',
        icon: 'key'
      },
      {
        name: 'Timestamp转换',
        description: '时间戳转换工具',
        url: 'https://tool.lu/timestamp/',
        icon: 'time'
      },
      {
        name: 'CSS压缩',
        description: '在线CSS代码压缩工具',
        url: 'https://cssminifier.com/',
        icon: 'css'
      }
    ]
  },
  {
    name: '设计工具',
    icon: 'palette',
    color: '#FF9800',
    tools: [
      {
        name: 'Figma',
        description: '协作式界面设计工具',
        url: 'https://www.figma.com/',
        icon: 'figma'
      },
      {
        name: 'Canva',
        description: '在线图形设计平台',
        url: 'https://www.canva.com/',
        icon: 'design'
      },
      {
        name: 'Remove.bg',
        description: '智能抠图工具',
        url: 'https://www.remove.bg/',
        icon: 'image'
      },
      {
        name: 'TinyPNG',
        description: '图片压缩工具',
        url: 'https://tinypng.com/',
        icon: 'compress'
      },
      {
        name: 'Coolors',
        description: '配色方案生成器',
        url: 'https://coolors.co/',
        icon: 'color'
      },
      {
        name: 'Unsplash',
        description: '免费高质量图片素材',
        url: 'https://unsplash.com/',
        icon: 'photo'
      }
    ]
  },
  {
    name: '效率工具',
    icon: 'zap',
    color: '#2196F3',
    tools: [
      {
        name: 'Notion',
        description: '全能笔记和协作工具',
        url: 'https://www.notion.so/',
        icon: 'notion'
      },
      {
        name: 'Excalidraw',
        description: '手绘风格的在线白板工具',
        url: 'https://excalidraw.com/',
        icon: 'draw'
      },
      {
        name: 'Temp Mail',
        description: '临时邮箱服务',
        url: 'https://temp-mail.org/',
        icon: 'mail'
      },
      {
        name: 'QR Code Generator',
        description: '二维码生成器',
        url: 'https://www.qr-code-generator.com/',
        icon: 'qrcode'
      },
      {
        name: 'File Converter',
        description: '在线文件格式转换',
        url: 'https://convertio.co/',
        icon: 'convert'
      },
      {
        name: 'Speedtest',
        description: '网络速度测试',
        url: 'https://www.speedtest.net/',
        icon: 'speed'
      }
    ]
  },
  {
    name: '学习资源',
    icon: 'book',
    color: '#9C27B0',
    tools: [
      {
        name: 'MDN Web Docs',
        description: 'Web开发权威文档',
        url: 'https://developer.mozilla.org/',
        icon: 'mdn'
      },
      {
        name: 'Can I Use',
        description: '浏览器兼容性查询',
        url: 'https://caniuse.com/',
        icon: 'browser'
      },
      {
        name: 'Stack Overflow',
        description: '程序员问答社区',
        url: 'https://stackoverflow.com/',
        icon: 'stackoverflow'
      },
      {
        name: 'GitHub',
        description: '代码托管和协作平台',
        url: 'https://github.com/',
        icon: 'github'
      },
      {
        name: 'CodePen',
        description: '前端代码演示平台',
        url: 'https://codepen.io/',
        icon: 'codepen'
      },
      {
        name: 'LeetCode',
        description: '算法练习平台',
        url: 'https://leetcode.com/',
        icon: 'leetcode'
      }
    ]
  },
  {
    name: 'AI工具',
    icon: 'robot',
    color: '#E91E63',
    tools: [
      {
        name: 'ChatGPT',
        description: 'OpenAI的对话式AI助手',
        url: 'https://chat.openai.com/',
        icon: 'chatgpt'
      },
      {
        name: 'Claude',
        description: 'Anthropic的AI助手',
        url: 'https://claude.ai/',
        icon: 'claude'
      },
      {
        name: 'Midjourney',
        description: 'AI图像生成工具',
        url: 'https://www.midjourney.com/',
        icon: 'midjourney'
      },
      {
        name: 'Stable Diffusion',
        description: '开源AI图像生成',
        url: 'https://stablediffusionweb.com/',
        icon: 'stable'
      },
      {
        name: 'DeepL',
        description: 'AI翻译工具',
        url: 'https://www.deepl.com/',
        icon: 'translate'
      },
      {
        name: 'Grammarly',
        description: 'AI语法检查工具',
        url: 'https://www.grammarly.com/',
        icon: 'grammar'
      }
    ]
  }
])

// 搜索功能
const searchQuery = ref('')
const filteredCategories = ref([])

const filterTools = () => {
  if (!searchQuery.value.trim()) {
    filteredCategories.value = toolCategories.value
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredCategories.value = toolCategories.value.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query)
    )
  })).filter(category => category.tools.length > 0)
}

onMounted(() => {
  filteredCategories.value = toolCategories.value
})
</script>

<template>
  <div class="tools-page">
    <div class="tools-header">
      <h1 class="tools-title">🛠️ 实用工具</h1>
      <p class="tools-description">精选的在线工具和资源，提升你的工作效率</p>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <input 
          v-model="searchQuery"
          @input="filterTools"
          type="text" 
          placeholder="搜索工具..." 
          class="search-input"
        />
        <i class="search-icon">🔍</i>
      </div>
    </div>

    <!-- 工具分类 -->
    <div class="tools-categories">
      <div 
        v-for="category in filteredCategories" 
        :key="category.name"
        class="category-section"
      >
        <div class="category-header">
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            {{ category.icon === 'code' ? '💻' : 
               category.icon === 'palette' ? '🎨' : 
               category.icon === 'zap' ? '⚡' : 
               category.icon === 'robot' ? '🤖' : '📚' }}
          </div>
          <h2 class="category-title">{{ category.name }}</h2>
          <span class="category-count">{{ category.tools.length }} 个工具</span>
        </div>
        
        <div class="tools-grid">
          <a 
            v-for="tool in category.tools"
            :key="tool.name"
            :href="tool.url"
            target="_blank"
            rel="noopener noreferrer"
            class="tool-card"
          >
            <div class="tool-icon">
              {{ tool.icon === 'json' ? '📄' :
                 tool.icon === 'regex' ? '🔤' :
                 tool.icon === 'encode' ? '🔐' :
                 tool.icon === 'link' ? '🔗' :
                 tool.icon === 'lock' ? '🔒' :
                 tool.icon === 'key' ? '🗝️' :
                 tool.icon === 'time' ? '⏰' :
                 tool.icon === 'css' ? '🎨' :
                 tool.icon === 'figma' ? '🎯' :
                 tool.icon === 'design' ? '✨' :
                 tool.icon === 'image' ? '🖼️' :
                 tool.icon === 'compress' ? '📦' :
                 tool.icon === 'color' ? '🌈' :
                 tool.icon === 'photo' ? '📸' :
                 tool.icon === 'notion' ? '📝' :
                 tool.icon === 'draw' ? '✏️' :
                 tool.icon === 'mail' ? '📧' :
                 tool.icon === 'qrcode' ? '📱' :
                 tool.icon === 'convert' ? '🔄' :
                 tool.icon === 'speed' ? '🚀' :
                 tool.icon === 'mdn' ? '📖' :
                 tool.icon === 'browser' ? '🌐' :
                 tool.icon === 'stackoverflow' ? '❓' :
                 tool.icon === 'github' ? '🐙' :
                 tool.icon === 'codepen' ? '✒️' :
                 tool.icon === 'leetcode' ? '🧮' :
                 tool.icon === 'chatgpt' ? '🤖' :
                 tool.icon === 'claude' ? '🧠' :
                 tool.icon === 'midjourney' ? '🎭' :
                 tool.icon === 'stable' ? '🎪' :
                 tool.icon === 'translate' ? '🌍' :
                 tool.icon === 'grammar' ? '✍️' : '🔧' }}
            </div>
            <div class="tool-content">
              <h3 class="tool-name">{{ tool.name }}</h3>
              <p class="tool-description">{{ tool.description }}</p>
            </div>
            <div class="tool-arrow">→</div>
          </a>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCategories.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>未找到相关工具</h3>
      <p>尝试使用其他关键词搜索</p>
    </div>

    <!-- 底部说明 -->
    <div class="tools-footer">
      <p>💡 如果你有好用的工具推荐，欢迎通过 <a href="/pages/about">联系方式</a> 告诉我！</p>
    </div>
  </div>
</template>

<style scoped>
.tools-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tools-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tools-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tools-description {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid var(--vp-c-border);
  border-radius: 25px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.tools-categories {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-section {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--vp-c-border);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.category-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: var(--vp-c-text-1);
}

.category-count {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin-left: auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand);
}

.tool-card:hover .tool-arrow {
  transform: translateX(4px);
}

.tool-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.tool-content {
  flex: 1;
}

.tool-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.tool-description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.4;
}

.tool-arrow {
  font-size: 1.2rem;
  color: var(--vp-c-brand);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.tools-footer {
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
}

.tools-footer a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.tools-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .tools-page {
    padding: 1rem;
  }
  
  .tools-title {
    font-size: 2rem;
  }
  
  .category-section {
    padding: 1.5rem;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .category-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .category-count {
    margin-left: 0;
    order: 3;
    flex-basis: 100%;
  }
}
</style>
