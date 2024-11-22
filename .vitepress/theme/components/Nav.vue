<template>
  <header class="main-header">
    <nav >
      <div class="nav-all">
        <!-- 导航栏左侧 -->
        <div class="left-nav">
          <div class="more-menu nav-btn" title="更多内容">
            <!-- <i class="iconfont icon-more" /> -->
            <Icon name="more" :size="30" color="#333" />
            <div class="more-card s-card">
              123
            </div>
          </div>
          <div class="site-name" >
          </div>
        </div>
        <!-- 导航栏菜单 -->
        <div class="nav-center">
          <div class="site-menu">
            
          </div>
          <span class="site-title" >

          </span>
        </div>
        <div class="right-nav">
          <!-- 开往 -->
          <a
            class="menu-btn nav-btn travellings"
            title="开往-友链接力"
            href="https://www.travellings.cn/go.html"
            target="_blank"
          >
            <i class="iconfont icon-subway"></i>
          </a>
          <!-- 随机文章 -->
          <div
            class="menu-btn nav-btn"
            title="随机前往一篇文章"
          >
            <i class="iconfont icon-shuffle"></i>
          </div>
          <!-- 搜索 -->
          <div
            class="menu-btn nav-btn"
            title="全站搜索"
          >
            <i class="iconfont icon-search"></i>
          </div>
          <!-- 中控台 -->
          <div
            id="open-control"
            class="menu-btn nav-btn pc"
            title="打开中控台"
          >
            <i class="iconfont icon-dashboard" />
          </div>
          <!-- 返回顶部 -->
          <div
            :class="[
              'to-top',
              'menu-btn',
            ]"
            title="返回顶部"
          >
            <div class="to-top-btn">
              <Transition name="fade" mode="out-in">
                <span  class="num">
                  
                </span>
              </Transition>
              <i class="iconfont icon-up"></i>
            </div>
          </div>
          <!-- 移动端菜单 -->
          <div
            class="menu-btn nav-btn mobile"
            title="打开菜单"
          >
            <i class="iconfont icon-toc" />
          </div>
        </div>
      </div>
    </nav>
    <!-- 移动端菜单 -->
    <!-- <MobileMenu /> -->
    <!-- 全局搜索 -->
    <!-- <ClientOnly>
      <Search v-if="theme.search.enable" />
    </ClientOnly> -->
  </header>
</template>

<script setup>
// import { serialize } from 'v8';


</script>

<style lang="scss"></style>
