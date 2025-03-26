<!-- 简约现代时钟组件 -->
<template>
  <div class="clock-wrapper">
    <div class="clock">
      <!-- 时钟表盘 -->
      <div class="clock-face">
        <!-- 刻度线 -->
        <div 
          v-for="n in 12" 
          :key="n" 
          class="hour-marker"
          :style="{ transform: `rotate(${n * 30}deg) translateY(-48%)` }"
        ></div>
        
        <!-- 时钟指针 -->
        <div 
          class="pointer hour" 
          :style="{ transform: `rotate(${hourRotate}deg)` }"
        ></div>
        
        <div 
          class="pointer minute" 
          :style="{ transform: `rotate(${minuteRotate}deg)` }"
        ></div>
        
        <div 
          class="pointer second" 
          :style="{ transform: `rotate(${secondRotate}deg)` }"
        ></div>
        
        <!-- 中心点 -->
        <div class="center-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 状态变量
const hourRotate = ref(0);
const minuteRotate = ref(0);
const secondRotate = ref(0);
const animationFrameId = ref(null);

// 平滑更新指针位置
const updatePointers = () => {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  
  // 计算更精确的角度（考虑毫秒）
  const secondsWithMs = seconds + (milliseconds / 1000);
  const minutesWithSec = minutes + (secondsWithMs / 60);
  const hoursWithMin = hours + (minutesWithSec / 60);
  
  // 更新角度
  secondRotate.value = secondsWithMs * 6; // 每秒6度
  minuteRotate.value = minutesWithSec * 6; // 每分钟6度
  hourRotate.value = hoursWithMin * 30; // 每小时30度
  
  // 使用requestAnimationFrame实现平滑动画
  animationFrameId.value = requestAnimationFrame(updatePointers);
};

// 组件挂载时启动时钟
onMounted(() => {
  updatePointers();
});

// 组件卸载前清理动画帧
onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
</script>

<style lang="scss" scoped>
.clock-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0 60px;
  width: 100%;
  aspect-ratio: 1/1;
  
  // 时钟主体
  .clock {
    position: relative;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
    aspect-ratio: 1/1;
    margin-top: -15px; // 向上移动时钟位置
    
    .dark & {
      background: #333;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    
    // 时钟表盘
    .clock-face {
      position: relative;
      width: 92%;
      height: 92%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      
      .dark & {
        background: #333;
      }
      
      // 刻度线
      .hour-marker {
        position: absolute;
        width: 3px;
        height: 12px;
        background-color: #5569E1;
        top: 5px;
        left: calc(50% - 1.5px);
        transform-origin: center 76px;
        opacity: 0.8;
        
        .dark & {
          background-color: #888;
        }
      }
      
      // 时针
      .pointer.hour {
        position: absolute;
        width: 8px;
        height: 48px;
        background: #5569E1;
        border-radius: 4px;
        bottom: 50%;
        left: calc(50% - 4px);
        transform-origin: 50% 100%;
        z-index: 3;
        
        .dark & {
          background: white;
        }
      }
      
      // 分针
      .pointer.minute {
        position: absolute;
        width: 6px;
        height: 68px;
        background: #6384F5;
        border-radius: 3px;
        bottom: 50%;
        left: calc(50% - 3px);
        transform-origin: 50% 100%;
        z-index: 2;
        
        .dark & {
          background: #eee;
        }
      }
      
      // 秒针
      .pointer.second {
        position: absolute;
        width: 3px;
        height: 75px;
        background: #FF3A3A;
        border-radius: 1.5px;
        bottom: 50%;
        left: calc(50% - 1.5px);
        transform-origin: 50% 100%;
        z-index: 4;
      }
      
      // 中心点
      .center-dot {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6384F5;
        z-index: 5;
        box-shadow: 0 0 6px rgba(99, 132, 245, 0.4);
        
        .dark & {
          background: white;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
}
</style>
