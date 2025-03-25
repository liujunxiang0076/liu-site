<template>
  <div class="scroll-progress" :style="{ width: progress + '%' }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)

const calculateProgress = () => {
  const winScroll = window.scrollY
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = (winScroll / height) * 100
}

onMounted(() => {
  window.addEventListener('scroll', calculateProgress)
})

onUnmounted(() => {
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
