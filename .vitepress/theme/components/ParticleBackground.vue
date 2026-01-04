<template>
  <Teleport to="body">
    <!-- 站点背景 -->
    <div v-if="backgroundType !== 'close'" :class="['background', backgroundType, themeValue]">
      <div class="particle-network-container">
        <canvas ref="particleCanvas" class="particle-network-canvas"></canvas>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { storeToRefs } from "pinia";
import { mainStore } from "../store/index";
import { isClient } from '../utils/helper.mjs'

const store = mainStore();
const { backgroundType, backgroundUrl, themeValue } = storeToRefs(store);
const particleCanvas = ref<HTMLCanvasElement | null>(null);
const animationFrameId = ref<number | null>(null);
const mousePosition = reactive({ x: 0, y: 0 });
const hasMouseMoved = ref(false);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
}

// 网络配置
const config = {
  // 核心设置
  particleCount: 100, // 增加粒子数量以提高视觉效果
  particleColor: 'rgba(255, 255, 255, 0.7)',
  lineColor: 'rgba(255, 255, 255, 0.2)',
  highlightLineColor: 'rgba(255, 255, 255, 0.5)',
  backgroundColor: {
    dark: {
      start: '#0f1a2c',
      end: '#162339'
    },
    light: {
      start: '#f1f5fa',
      end: '#e6f0fb'
    }
  },

  // 粒子属性
  particleMinRadius: 1,
  particleMaxRadius: 2.5, // 增加部分粒子的最大尺寸
  baseSpeed: 0.3, // 稍微提高基础速度

  // 连线属性
  lineWidth: 0.5,
  connectDistance: 150, // 增加连线距离，让网络更密集

  // 交互设置
  interactiveDistance: 300, // 增加交互影响范围
  interactiveForce: 100, // 增强鼠标交互力度
  baseBrightness: 0.4,

  // 光效设置
  spotlights: [
    { x: 0.2, y: 0, radius: 200, intensity: 0.3 },
    { x: 0.8, y: 0, radius: 200, intensity: 0.3 }
  ],

  // 动画设置
  pulseSpeed: 0.002,
  pulseIntensity: 0.1
};

// 修复：使用ref而不是直接数组
const particles = ref<Particle[]>([]);
let canvasWidth = 0;
let canvasHeight = 0;
let ctx: CanvasRenderingContext2D | null = null;
let animationPhase = 0;

// 初始化画布和粒子
const initCanvas = () => {
  if (!isClient || !particleCanvas.value) return () => { };

  ctx = particleCanvas.value.getContext('2d', { alpha: false }); // 禁用 alpha 以提高性能
  if (!ctx) return () => { };

  // 设置画布大小
  const dpr = window.devicePixelRatio || 1;
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  particleCanvas.value.width = canvasWidth * dpr;
  particleCanvas.value.height = canvasHeight * dpr;
  particleCanvas.value.style.width = `${canvasWidth}px`;
  particleCanvas.value.style.height = `${canvasHeight}px`;
  ctx?.scale(dpr, dpr);

  // 使用节流函数处理鼠标移动
  let mouseMoveTimeout: number | null = null;
  const handleMouseMove = (e: MouseEvent) => {
    if (mouseMoveTimeout) window.clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = window.setTimeout(() => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
      hasMouseMoved.value = true;
    }, 3); // 减少延迟时间，提高响应速度
  };

  window.addEventListener('mousemove', handleMouseMove);

  // 创建粒子
  particles.value = Array.from({ length: config.particleCount }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * config.baseSpeed,
    vy: (Math.random() - 0.5) * config.baseSpeed,
    radius: Math.random() * (config.particleMaxRadius - config.particleMinRadius) + config.particleMinRadius,
    brightness: Math.random() * 0.3 + config.baseBrightness
  }));

  // 开始动画
  animate();

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
  };
};

// 绘制背景
const drawBackground = () => {
  if (!ctx || !isClient) return;

  // 获取当前主题模式（浅色/深色）
  const isDark = document.documentElement.classList.contains('dark');
  const bgColors = isDark ? config.backgroundColor.dark : config.backgroundColor.light;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, bgColors.start);
  gradient.addColorStop(1, bgColors.end);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

// 绘制光效
const drawSpotlights = () => {
  if (!ctx || !isClient) return;

  ctx!.save();
  ctx!.globalCompositeOperation = 'lighter';

  config.spotlights.forEach(spot => {
    const x = canvasWidth * spot.x;
    const y = canvasHeight * spot.y;
    const pulseModifier = 1 + Math.sin(animationPhase) * config.pulseIntensity;

    const gradient = ctx!.createRadialGradient(
      x, y, 0,
      x, y, spot.radius * pulseModifier
    );

    gradient.addColorStop(0, `rgba(255, 255, 255, ${spot.intensity * 0.2})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${spot.intensity * 0.1})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx!.fillStyle = gradient;
    ctx!.beginPath();
    ctx!.arc(x, y, spot.radius * pulseModifier, 0, Math.PI * 2);
    ctx!.fill();
  });

  ctx!.restore();
};

// 动画循环
const animate = () => {
  if (!ctx || !isClient) return;

  // 获取当前主题模式
  const isDark = document.documentElement.classList.contains('dark');

  // 根据主题调整粒子和线的颜色
  const particleBaseColor = isDark ? 'rgba(255, 255, 255,' : 'rgba(25, 58, 125,';
  const lineBaseColor = isDark ? 'rgba(255, 255, 255,' : 'rgba(25, 58, 125,';
  const highlightLineBaseColor = isDark ? 'rgba(255, 255, 255,' : 'rgba(59, 130, 246,';

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  drawSpotlights();

  // 更新粒子
  animationPhase += config.pulseSpeed;

  ctx.save();

  // 更新和绘制粒子
  particles.value.forEach((particle, i) => {
    // 基础移动
    particle.x += particle.vx;
    particle.y += particle.vy;

    // 边界检测（使用取模运算实现无缝循环）
    particle.x = (particle.x + canvasWidth) % canvasWidth;
    particle.y = (particle.y + canvasHeight) % canvasHeight;

    // 鼠标交互
    if (hasMouseMoved.value) {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.interactiveDistance) {
        const angle = Math.atan2(dy, dx);
        const force = (config.interactiveDistance - distance) / config.interactiveDistance;

        particle.vx -= Math.cos(angle) * force * config.interactiveForce;
        particle.vy -= Math.sin(angle) * force * config.interactiveForce;
        particle.brightness = Math.min(1, particle.brightness + 0.1 * force);
      } else {
        particle.brightness = Math.max(config.baseBrightness, particle.brightness - 0.01);
      }
    }

    // 限制速度
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > config.baseSpeed * 2) {
      const scale = (config.baseSpeed * 2) / speed;
      particle.vx *= scale;
      particle.vy *= scale;
    }

    // 绘制连线（只检查后面的粒子以避免重复）
    if (ctx) {
      for (let j = i + 1; j < particles.value.length; j++) {
        const particle2 = particles.value[j];
        const dx = particle.x - particle2.x;
        const dy = particle.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectDistance) {
          const opacity = (1 - distance / config.connectDistance) * 0.5;

          // 检查鼠标是否靠近这条线
          let isHighlight = false;
          if (hasMouseMoved.value) {
            const lineX = (particle.x + particle2.x) / 2;
            const lineY = (particle.y + particle2.y) / 2;
            const mouseDist = Math.sqrt(
              Math.pow(mousePosition.x - lineX, 2) +
              Math.pow(mousePosition.y - lineY, 2)
            );

            isHighlight = mouseDist < config.interactiveDistance;
          }

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle2.x, particle2.y);

          if (isHighlight) {
            ctx.strokeStyle = highlightLineBaseColor + `${opacity * 1.5})`;
            ctx.lineWidth = config.lineWidth * 1.5;
          } else {
            ctx.strokeStyle = lineBaseColor + `${opacity})`;
            ctx.lineWidth = config.lineWidth;
          }

          ctx.stroke();
        }
      }
    }
  });

  // 绘制粒子
  if (ctx) {
    particles.value.forEach(particle => {
      const pulseBrightness = particle.brightness * (1 + Math.sin(animationPhase * 2) * 0.1);
      ctx!.beginPath();
      ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx!.fillStyle = particleBaseColor + `${pulseBrightness})`;
      ctx!.fill();
    });
  }

  ctx.restore();

  if (isClient) {
    animationFrameId.value = requestAnimationFrame(animate);
  }
};

// 处理窗口大小变化
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
let isResizing = false

const handleResize = () => {
  if (!isClient || !particleCanvas.value) return
  
  // 立即更新画布样式尺寸，保持视觉连续性
  const newWidth = window.innerWidth
  const newHeight = window.innerHeight
  
  particleCanvas.value.style.width = `${newWidth}px`
  particleCanvas.value.style.height = `${newHeight}px`
  
  // 标记正在resize，暂停动画以提升性能
  isResizing = true
  
  // 使用防抖来处理实际的画布重绘
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  
  resizeTimeout = setTimeout(() => {
    if (!particleCanvas.value || !ctx) return
    
    // 更新画布尺寸变量
    canvasWidth = newWidth
    canvasHeight = newHeight
    
    // 设置画布实际尺寸和DPR
    const dpr = window.devicePixelRatio || 1
    particleCanvas.value.width = canvasWidth * dpr
    particleCanvas.value.height = canvasHeight * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0) // 重置变换矩阵
    ctx.scale(dpr, dpr)
    
    // 智能调整粒子位置 - 只调整超出边界的粒子
    particles.value.forEach(particle => {
      // 按比例调整位置而不是随机重新定位
      if (particle.x > canvasWidth) {
        particle.x = canvasWidth * 0.9 // 移到边界内90%的位置
      }
      if (particle.y > canvasHeight) {
        particle.y = canvasHeight * 0.9
      }
    })
    
    // 恢复动画
    isResizing = false
  }, 150) // 稍微增加防抖时间，减少频繁重绘
}

// 生命周期钩子
let cleanup = () => {}

onMounted(() => {
  if (!isClient) return
  
  cleanup = initCanvas()
  window.addEventListener('resize', handleResize)
  
  // 确保只在客户端执行
  if (isClient) {
    animate()
  }
})

onUnmounted(() => {
  if (!isClient) return
  window.removeEventListener('resize', handleResize)
  cleanup()
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<style lang="scss" scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: -2;
}

.particle-network-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;

  .particle-network-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

// 优化网站整体与粒子背景的配合
:root {
  --bg-opacity: 0.7;
  --blur-strength: 10px;
  --card-border-color: rgba(255, 255, 255, 0.08);
  --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

html.dark {
  color-scheme: dark;

  body {
    color: #fff;
  }

  .card,
  .content-card,
  .blog-post,
  article {
    background: rgba(22, 35, 57, 0.5);
    border: 1px solid var(--card-border-color);
  }

  h1,
  h2,
  h3,
  .title {
    color: #fff;
  }
}

html:not(.dark) {
  color-scheme: light;

  :root {
    --bg-opacity: 0.95;
    --blur-strength: 8px;
    --card-border-color: rgba(0, 0, 0, 0.06);
    --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  }

  body {
    color: #1e293b;
  }

  .card,
  .content-card,
  .blog-post,
  article {
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid var(--card-border-color);
  }

  // 调整粒子背景的颜色
  .particle-network-canvas {
    opacity: 0.7;
  }

  h1,
  h2,
  h3,
  .title {
    color: #0f172a;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  // 导航栏浅色模式
  .vp-navbar,
  .navbar,
  header {
    background: rgba(255, 255, 255, var(--bg-opacity)) !important;
  }

  // 按钮和可交互元素浅色样式
  button,
  .button,
  a.link {
    background: rgba(59, 130, 246, 0.1);
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.2);

    &:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.3);
    }
  }

  // 工具栏元素浅色样式
  .toolbar,
  .tabs {
    background: rgba(248, 250, 252, 0.9);
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
}

// 导航栏样式调整
.vp-navbar,
.navbar,
header {
  backdrop-filter: blur(var(--blur-strength));
  -webkit-backdrop-filter: blur(var(--blur-strength));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100; // 确保导航在最上层
}

// 内容卡片样式优化
.card,
.content-card,
.blog-post,
article {
  backdrop-filter: blur(var(--blur-strength));
  -webkit-backdrop-filter: blur(var(--blur-strength));
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  }
}

// 标题文字优化
h1,
h2,
h3,
.title {
  letter-spacing: 0.5px;
}

// 按钮和可交互元素样式
button,
.button,
a.link {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 工具栏元素样式
.toolbar,
.tabs {
  backdrop-filter: blur(var(--blur-strength));
  -webkit-backdrop-filter: blur(var(--blur-strength));
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

// 页面内容容器
.content-wrapper,
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

// 滚动条美化
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 26, 44, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

// 移动端优化
@media (max-width: 768px) {
  :root {
    --bg-opacity: 0.9;
    --blur-strength: 8px;
  }

  .card,
  .content-card,
  .blog-post,
  article {
    border-radius: 8px;
  }
}
</style>
