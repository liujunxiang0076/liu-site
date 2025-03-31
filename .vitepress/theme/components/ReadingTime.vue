<!-- 阅读时间统计组件 -->
<template>
  <span v-if="readingTimeInMinutes > 0" class="meta time-read">
    <i class="iconfont icon-read"></i>
    {{ readingTimeInMinutes }} 分钟阅读
    <span v-if="showDetails" class="details">
      ({{ wordCount }} 字)
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';

const props = defineProps({
  // 文章内容
  content: {
    type: String,
    default: ''
  },
  // 是否显示详细信息（字数统计）
  showDetails: {
    type: Boolean,
    default: false
  }
});

const { theme } = useData();

// 默认配置
const defaultConfig = {
  wordsPerMinute: 300,
  chineseWordsPerMinute: 500,
  englishWordsPerMinute: 200,
  imageSeconds: 12
};

// 阅读时间配置
const readingTimeConfig = computed(() => {
  return {
    ...defaultConfig,
    ...theme.value.readingTime
  };
});

// 计算文章字数
const wordCount = computed(() => {
  if (!props.content) return 0;
  
  // 移除HTML标签和多余空格
  const cleanContent = props.content.replace(/<\/?[^>]+(>|$)/g, '').trim();
  
  // 中文字符计数（包括标点符号）
  const chineseCount = (cleanContent.match(/[\u4e00-\u9fa5。，、；：""（）《》？！·]/g) || []).length;
  
  // 英文单词计数
  const englishCount = (cleanContent.match(/[a-zA-Z]+/g) || []).length;
  
  // 数字计数
  const numberCount = (cleanContent.match(/[0-9]+/g) || []).length;
  
  return chineseCount + englishCount + numberCount;
});

// 计算图片数量
const imageCount = computed(() => {
  if (!props.content) return 0;
  return (props.content.match(/<img.*?>/g) || []).length;
});

// 计算阅读时间（分钟）
const readingTimeInMinutes = computed(() => {
  if (!props.content) return 0;
  
  const { chineseWordsPerMinute, englishWordsPerMinute, imageSeconds } = readingTimeConfig.value;
  
  // 中文字符计数
  const chineseCount = (props.content.match(/[\u4e00-\u9fa5。，、；：""（）《》？！·]/g) || []).length;
  
  // 英文单词计数
  const englishCount = (props.content.match(/[a-zA-Z]+/g) || []).length;
  
  // 计算图片阅读时间（转换为分钟）
  const imageTime = (imageCount.value * imageSeconds) / 60;
  
  // 计算中文阅读时间
  const chineseTime = chineseCount / chineseWordsPerMinute;
  
  // 计算英文阅读时间
  const englishTime = englishCount / englishWordsPerMinute;
  
  // 总阅读时间（分钟）
  const totalTimeInMinutes = chineseTime + englishTime + imageTime;
  
  // 取整并确保至少为1分钟
  return Math.max(1, Math.round(totalTimeInMinutes));
});
</script>

<style lang="scss" scoped>
.time-read {
  .details {
    color: var(--vp-c-text-2);
    font-size: 0.9em;
    margin-left: 4px;
  }
}
</style>
