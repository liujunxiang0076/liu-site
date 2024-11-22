// .vitepress/theme/components/Icon.vue
<template>
  <i 
    :class="['iconfont', `icon-${name}`]" 
    :style="{ 
      fontSize: size + 'px',
      color
    }"
  ></i>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 16
  },
  color: {
    type: String,
    default: 'inherit'
  }
})
</script>