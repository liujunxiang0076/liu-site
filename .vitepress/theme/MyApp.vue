<template>
  <Nav />
  <h1>Custom Layout!</h1>

  <div v-if="page.isNotFound">Custom 404 page!</div>
  <div v-if="frontmatter.layout === 'home'">Custom home page!</div>
  <Content v-else />
</template>

<script setup>
import { useData } from "vitepress";
import Nav from "./components/Nav.vue";

const { page, frontmatter } = useData();
</script>

<style lang="scss" scoped>
.mian-layout {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  // 手动实现加载动画
  animation: show 0.5s forwards;
  animation-duration: 0.5s;
  display: block;
  &.loading {
    display: none;
  }
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    &.is-post {
      padding: 0;
    }
  }
}
.left-menu {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1002;
  transition: opacity 0.3s, transform 0.3s;
  &.hidden {
    opacity: 0;
    transform: translateY(100px);
  }
}
</style>
