<script setup>
import { useData } from 'vitepress'
import Nav from './components/Nav.vue'

const { page, frontmatter } = useData()
</script>

<template>

  <Nav />
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">
    Custom 404 page!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Custom home page!
  </div>
  <Content v-else />
</template>