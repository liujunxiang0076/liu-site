import { ref, computed } from 'vue'
import zh from './zh'

// 默认语言
const locale = ref('zh')

// 所有语言配置
const messages = {
  zh
}

// 使用i18n
export function useI18n() {
  // 获取当前语言的配置
  const localeMessages = computed(() => messages[locale.value] || messages.zh)
  
  // 翻译函数
  const t = (key) => {
    const keys = key.split('.')
    let result = localeMessages.value
    
    for (const k of keys) {
      if (!result[k]) return key
      result = result[k]
    }
    
    return result
  }
  
  // 切换语言
  const setLocale = (lang) => {
    if (messages[lang]) {
      locale.value = lang
    }
  }
  
  return {
    locale,
    t,
    setLocale
  }
} 
