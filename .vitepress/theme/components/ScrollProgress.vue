<template>
  <div class="scroll-progress" :style="{ width: progress + '%' }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { isClient } from '../utils/helper.mjs'

const progress = ref(0)

const calculateProgress = () => {
  if (!isClient) return
  const winScroll = window.scrollY
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = (winScroll / height) * 100
}

onMounted(() => {
  if (!isClient) return
  window.addEventListener('scroll', calculateProgress)
})

onUnmounted(() => {
  if (!isClient) return
  window.removeEventListener('scroll', calculateProgress)
})
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--vp-c-brand);
  z-index: 9999;
  transition: width 0.1s ease;
}
</style> 
