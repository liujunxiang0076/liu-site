<template>
  <div id="fix-truncation"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

// Function to fix text truncation
const fixTruncation = () => {
  setTimeout(() => {
    const titles = document.querySelectorAll('.post-title')
    const descs = document.querySelectorAll('.post-desc')
    
    // Fix titles
    titles.forEach(title => {
      title.style.cssText = 'white-space: normal !important; overflow: visible !important; text-overflow: clip !important; height: auto !important; max-height: none !important; display: block !important;'
    })
    
    // Fix descriptions
    descs.forEach(desc => {
      desc.style.cssText = 'white-space: normal !important; overflow: visible !important; text-overflow: clip !important; height: auto !important; max-height: none !important; display: block !important;'
    })
  }, 100)
}

// Run on mount and periodically
let interval
onMounted(() => {
  fixTruncation()
  // Check periodically as content might change
  interval = setInterval(fixTruncation, 1000)
})

// Clean up
onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>
