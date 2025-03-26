<!-- 简约现代时钟组件 -->
<template>
  <div class="clock-wrapper">
    <div 
      class="clock" 
      :class="{ 
        'party-mode': partyMode, 
        'spin-mode': spinMode, 
        'bounce-mode': bounceMode, 
        'neon-mode': neonMode,
        'night-mode': isNightTime && nightModeEnabled
      }"
      @click="handleClockClick"
      @dblclick="handleDoubleClick"
      @mouseover="handleMouseOver"
    >
      <!-- 时钟表盘 -->
      <div class="clock-face">
        <!-- 刻度线 -->
        <div 
          v-for="n in 12" 
          :key="n" 
          class="hour-marker"
          :class="{ 'highlight': n === currentHour % 12 || n === 12 && currentHour % 12 === 0 }"
          :style="{ transform: `rotate(${n * 30}deg) translateY(-48%)` }"
        ></div>
        
        <!-- 时钟指针 -->
        <div 
          class="pointer hour" 
          :class="{ 'glow': glowPointers }"
          :style="{ transform: `rotate(${hourRotate}deg)` }"
        ></div>
        
        <div 
          class="pointer minute" 
          :class="{ 'glow': glowPointers }"
          :style="{ transform: `rotate(${minuteRotate}deg)` }"
        ></div>
        
        <div 
          class="pointer second" 
          :class="{ 'glow': glowPointers }"
          :style="{ 
            transform: `rotate(${secondRotate}deg)`, 
            'animation-duration': speedMode ? '2s' : '60s',
            'animation-play-state': freezeMode ? 'paused' : 'running'
          }"
        ></div>
        
        <!-- 中心点 -->
        <div 
          class="center-dot" 
          :class="{ 
            'pulse': pulseMode, 
            'rainbow': rainbowMode 
          }"
        ></div>
        
        <!-- 时间提示 (仅在特定条件下显示) -->
        <div v-if="showDigitalTime" class="digital-time">
          {{ digitalTimeDisplay }}
        </div>
        
        <!-- 彩蛋提示 -->
        <div v-if="eggMessage" class="egg-message">{{ eggMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

// 状态变量
const hourRotate = ref(0);
const minuteRotate = ref(0);
const secondRotate = ref(0);
const currentHour = ref(0);
const currentMinute = ref(0);
const currentSecond = ref(0);
const animationFrameId = ref(null);
const clickCount = ref(0);
const specialClickCombo = ref([]);
const lastClickTime = ref(0);
const comboTimeout = ref(null);

// 特效状态
const partyMode = ref(false);
const spinMode = ref(false);
const speedMode = ref(false);
const pulseMode = ref(false);
const bounceMode = ref(false);
const neonMode = ref(false);
const rainbowMode = ref(false);
const glowPointers = ref(false);
const freezeMode = ref(false);
const showDigitalTime = ref(false);
const eggMessage = ref('');
const eggTimeout = ref(null);
const nightModeEnabled = ref(true);

// 当前是否是晚上 (18:00 - 06:00)
const isNightTime = computed(() => {
  const hours = new Date().getHours();
  return hours >= 18 || hours < 6;
});

// 数字时间显示
const digitalTimeDisplay = computed(() => {
  const h = currentHour.value.toString().padStart(2, '0');
  const m = currentMinute.value.toString().padStart(2, '0');
  const s = currentSecond.value.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
});

// 检查特殊点击组合
const checkSpecialCombos = () => {
  // 将组合转换为字符串以便比较
  const comboString = specialClickCombo.value.join('');
  
  // SOS组合 (慢-慢-慢-快-快-快-慢-慢-慢)
  if (comboString === 'slowslowslowfastfastfastslowslowslow') {
    triggerSOSMode();
    return true;
  }
  
  // 海盗模式组合 (快-慢-快-快)
  if (comboString === 'fastslowfastfast') {
    triggerPirateMode();
    return true;
  }
  
  // 彩虹模式组合 (慢-快-慢-快-慢)
  if (comboString === 'slowfastslowfastslow') {
    rainbowMode.value = !rainbowMode.value;
    eggMessage.value = rainbowMode.value ? "🌈 彩虹模式已启动!" : "彩虹模式已关闭";
    return true;
  }
  
  return false;
};

// 记录点击速度组合
const recordClickCombo = () => {
  const now = Date.now();
  const timeSinceLastClick = now - lastClickTime.value;
  
  // 重置超时计时器
  if (comboTimeout.value) {
    clearTimeout(comboTimeout.value);
  }
  
  // 判断点击速度 (快/慢)
  if (timeSinceLastClick < 500) {
    specialClickCombo.value.push('fast');
  } else {
    specialClickCombo.value.push('slow');
  }
  
  // 只保留最近9次点击记录
  if (specialClickCombo.value.length > 9) {
    specialClickCombo.value.shift();
  }
  
  // 检查是否触发特殊组合
  const triggeredCombo = checkSpecialCombos();
  
  // 更新最后点击时间
  lastClickTime.value = now;
  
  // 3秒后重置组合
  comboTimeout.value = setTimeout(() => {
    specialClickCombo.value = [];
  }, 3000);
  
  return triggeredCombo;
};

// SOS模式 (紧急闪烁效果)
const triggerSOSMode = () => {
  // 显示SOS消息
  eggMessage.value = "🆘 SOS 模式已激活!";
  
  // 快速闪烁效果
  let flashCount = 0;
  const maxFlashes = 9; // 3组SOS闪烁
  
  const flashInterval = setInterval(() => {
    neonMode.value = !neonMode.value;
    flashCount++;
    
    if (flashCount >= maxFlashes) {
      clearInterval(flashInterval);
      neonMode.value = false;
      eggMessage.value = "SOS模式结束";
      
      // 3秒后清除消息
      setTimeout(() => {
        eggMessage.value = '';
      }, 3000);
    }
  }, 300);
};

// 海盗模式
const triggerPirateMode = () => {
  eggMessage.value = "🏴‍☠️ 啊哈，海盗模式!";
  bounceMode.value = true;
  
  // 模拟海浪摇晃效果
  setTimeout(() => {
    bounceMode.value = false;
    eggMessage.value = "";
  }, 5000);
};

// 双击时钟事件处理
const handleDoubleClick = () => {
  // 冻结/解冻时钟
  freezeMode.value = !freezeMode.value;
  eggMessage.value = freezeMode.value ? "⏸️ 时间已冻结" : "▶️ 时间继续流动";
  
  // 冻结时显示数字时间
  showDigitalTime.value = freezeMode.value;
  
  // 5秒后隐藏消息
  setTimeout(() => {
    eggMessage.value = '';
    // 如果不再处于冻结模式，隐藏数字时间
    if (!freezeMode.value) {
      showDigitalTime.value = false;
    }
  }, 5000);
};

// 鼠标悬停事件
const handleMouseOver = () => {
  // 有10%的几率触发随机彩蛋
  if (Math.random() < 0.1 && !eggMessage.value) {
    const randomMessages = [
      "嘿，别偷看我!",
      "时间不等人...",
      "嘀嗒、嘀嗒...",
      "今天过得怎么样?",
      "记得喝水哦!",
      "该休息一下了吧?"
    ];
    
    eggMessage.value = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    
    // 2秒后隐藏消息
    setTimeout(() => {
      eggMessage.value = '';
    }, 2000);
  }
};

// 处理时钟点击事件
const handleClockClick = () => {
  clickCount.value++;
  
  // 清除之前的提示消息超时
  if (eggTimeout.value) {
    clearTimeout(eggTimeout.value);
  }
  
  // 检查是否触发了特殊组合
  const triggeredCombo = recordClickCombo();
  if (triggeredCombo) {
    // 如果触发了特殊组合，不执行普通点击逻辑
    return;
  }
  
  // 根据点击次数触发不同效果
  if (clickCount.value === 1) {
    eggMessage.value = "你好呀！";
  } else if (clickCount.value === 3) {
    eggMessage.value = "嘿，别戳我！";
  } else if (clickCount.value === 5) {
    speedMode.value = !speedMode.value;
    eggMessage.value = speedMode.value ? "我要开始加速了！" : "恢复正常速度...";
  } else if (clickCount.value === 7) {
    pulseMode.value = !pulseMode.value;
    eggMessage.value = "心跳模式" + (pulseMode.value ? "开启" : "关闭");
  } else if (clickCount.value === 10) {
    triggerPartyMode();
    eggMessage.value = "派对时间到！";
  } else if (clickCount.value === 12) {
    showDigitalTime.value = !showDigitalTime.value;
    eggMessage.value = showDigitalTime.value ? "显示数字时间" : "隐藏数字时间";
  } else if (clickCount.value === 15) {
    spinMode.value = true;
    setTimeout(() => {
      spinMode.value = false;
    }, 2000);
    eggMessage.value = "我晕了...";
  } else if (clickCount.value === 18) {
    glowPointers.value = !glowPointers.value;
    eggMessage.value = glowPointers.value ? "指针发光模式开启" : "指针发光模式关闭";
  } else if (clickCount.value === 20) {
    eggMessage.value = "你真有耐心...";
    neonMode.value = !neonMode.value;
  } else if (clickCount.value === 25) {
    nightModeEnabled.value = !nightModeEnabled.value;
    eggMessage.value = nightModeEnabled.value ? "夜间模式已启用" : "夜间模式已禁用";
  } else if (clickCount.value === 30) {
    eggMessage.value = "别点了，真的别点了...";
  } else if (clickCount.value === 42) {
    eggMessage.value = "生命、宇宙以及任何事情的终极答案...";
  } else if (clickCount.value === 50) {
    eggMessage.value = "你是认真的吗？给你个彩蛋吧！";
    triggerRainbowEffect();
  } else if (clickCount.value === 100) {
    eggMessage.value = "👑 点击王！重置所有效果";
    resetAllEffects();
    clickCount.value = 0;
  } else if (clickCount.value > 50 && clickCount.value % 10 === 0) {
    // 每10次点击给予鼓励
    const encouragements = [
      "继续点！你真棒！",
      "不放弃是成功的秘诀！",
      "坚持就是胜利！",
      "你的毅力令人敬佩！",
      "我开始佩服你了！"
    ];
    
    eggMessage.value = encouragements[Math.floor(Math.random() * encouragements.length)];
  }
  
  // 3秒后清除提示消息
  eggTimeout.value = setTimeout(() => {
    eggMessage.value = '';
  }, 3000);
};

// 触发彩虹效果
const triggerRainbowEffect = () => {
  rainbowMode.value = true;
  
  // 10秒后关闭彩虹模式
  setTimeout(() => {
    rainbowMode.value = false;
  }, 10000);
};

// 触发派对模式
const triggerPartyMode = () => {
  partyMode.value = true;
  setTimeout(() => {
    partyMode.value = false;
  }, 5000);
};

// 检查特殊时间 (整点报时)
const checkSpecialTimes = () => {
  // 整点报时
  if (currentMinute.value === 0 && currentSecond.value === 0) {
    showDigitalTime.value = true;
    eggMessage.value = `整点报时: ${currentHour.value}:00`;
    
    // 如果是工作时间 (9:00 - 18:00)，显示休息提醒
    if (currentHour.value >= 9 && currentHour.value <= 18) {
      setTimeout(() => {
        eggMessage.value = "工作一小时了，该休息一下眼睛啦！";
      }, 3000);
    }
    
    // 10秒后隐藏
    setTimeout(() => {
      showDigitalTime.value = false;
      eggMessage.value = '';
    }, 10000);
  }
  
  // 中午提醒
  if (currentHour.value === 12 && currentMinute.value === 0 && currentSecond.value === 0) {
    setTimeout(() => {
      eggMessage.value = "午餐时间到啦！";
    }, 5000);
  }
  
  // 午夜特效
  if (currentHour.value === 0 && currentMinute.value === 0 && currentSecond.value === 0) {
    eggMessage.value = "新的一天开始了！";
    triggerPartyMode();
  }
};

// 重置所有特效
const resetAllEffects = () => {
  partyMode.value = false;
  spinMode.value = false;
  speedMode.value = false;
  pulseMode.value = false;
  bounceMode.value = false;
  neonMode.value = false;
  rainbowMode.value = false;
  glowPointers.value = false;
  freezeMode.value = false;
  showDigitalTime.value = false;
};

// 平滑更新指针位置
const updatePointers = () => {
  if (freezeMode.value) {
    // 如果时钟冻结，只请求下一帧但不更新角度
    animationFrameId.value = requestAnimationFrame(updatePointers);
    return;
  }

  const now = new Date();
  currentHour.value = now.getHours();
  currentMinute.value = now.getMinutes();
  currentSecond.value = now.getSeconds();
  
  const hours = currentHour.value % 12;
  const minutes = currentMinute.value;
  const seconds = currentSecond.value;
  const milliseconds = now.getMilliseconds();
  
  // 计算更精确的角度（考虑毫秒）
  const secondsWithMs = seconds + (milliseconds / 1000);
  const minutesWithSec = minutes + (secondsWithMs / 60);
  const hoursWithMin = hours + (minutesWithSec / 60);
  
  // 更新角度
  secondRotate.value = secondsWithMs * 6; // 每秒6度
  minuteRotate.value = minutesWithSec * 6; // 每分钟6度
  hourRotate.value = hoursWithMin * 30; // 每小时30度
  
  // 检查特殊时间
  checkSpecialTimes();
  
  // 使用requestAnimationFrame实现平滑动画
  animationFrameId.value = requestAnimationFrame(updatePointers);
};

// 组件挂载时启动时钟
onMounted(() => {
  updatePointers();
  
  // 如果是晚上，显示一个问候
  if (isNightTime.value) {
    setTimeout(() => {
      eggMessage.value = "夜深了，注意休息哦~";
      
      // 3秒后隐藏消息
      setTimeout(() => {
        eggMessage.value = '';
      }, 3000);
    }, 1000);
  }
});

// 组件卸载前清理动画帧和超时
onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  if (eggTimeout.value) {
    clearTimeout(eggTimeout.value);
  }
  if (comboTimeout.value) {
    clearTimeout(comboTimeout.value);
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
    margin-top: -15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    cursor: pointer;
    
    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      transform: translateY(-3px);
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    // 派对模式
    &.party-mode {
      animation: party-colors 1s infinite;
    }
    
    // 旋转模式
    &.spin-mode {
      animation: spin-around 2s cubic-bezier(0.68, -0.55, 0.27, 1.55);
      transform-origin: center center;
    }
    
    // 弹跳模式
    &.bounce-mode {
      animation: bounce 0.5s infinite alternate;
    }
    
    // 霓虹模式
    &.neon-mode {
      box-shadow: 0 0 20px rgba(99, 132, 245, 0.7), 
                 0 0 40px rgba(99, 132, 245, 0.3), 
                 inset 0 0 15px rgba(99, 132, 245, 0.5);
    }
    
    // 夜间模式
    &.night-mode {
      background: #222;
      
      .clock-face {
        background: #222;
        
        .hour-marker {
          background-color: #555;
          &.highlight {
            background-color: #888;
          }
        }
        
        .pointer.hour {
          background: #ddd;
        }
        
        .pointer.minute {
          background: #bbb;
        }
        
        .center-dot {
          background: #aaa;
        }
        
        .digital-time {
          color: #ddd;
          background: rgba(34, 34, 34, 0.7);
        }
      }
    }
    
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
      transition: background 0.3s ease;
      
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
        transition: background-color 0.3s ease, height 0.2s ease;
        
        &.highlight {
          height: 15px;
          opacity: 1;
          background-color: #FF3A3A;
        }
        
        .dark & {
          background-color: #888;
          
          &.highlight {
            background-color: #FF5252;
          }
        }
        
        .party-mode & {
          animation: marker-colors 2s infinite;
          animation-delay: calc(var(--n) * 0.1s);
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
        transition: background 0.3s ease, height 0.3s ease, filter 0.3s ease;
        
        &.glow {
          filter: drop-shadow(0 0 3px #5569E1);
        }
        
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
        transition: background 0.3s ease, height 0.3s ease, filter 0.3s ease;
        
        &.glow {
          filter: drop-shadow(0 0 3px #6384F5);
        }
        
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
        transition: background 0.3s ease, filter 0.3s ease;
        
        &.glow {
          filter: drop-shadow(0 0 3px #FF3A3A);
        }
        
        .party-mode & {
          animation: second-colors 1s infinite;
        }
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
        transition: transform 0.3s ease, background 0.3s ease;
        
        &.pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        &.rainbow {
          animation: rainbow-color 3s linear infinite;
        }
        
        .dark & {
          background: white;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }
      }
      
      // 数字时间显示
      .digital-time {
        position: absolute;
        left: 50%;
        top: 60%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.8);
        padding: 3px 12px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        color: #5569E1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        opacity: 0;
        animation: fade-in 0.3s forwards;
        z-index: 6;
        text-align: center;
        min-width: 80px;
        
        .dark & {
          background: rgba(51, 51, 51, 0.8);
          color: white;
        }
      }
      
      // 彩蛋提示消息
      .egg-message {
        position: absolute;
        bottom: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #5569E1;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: fade-in 0.3s;
        z-index: 10;
        
        .dark & {
          background: rgba(51, 51, 51, 0.9);
          color: white;
        }
      }
    }
  }
}

// 动画定义
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes party-colors {
  0% { background: white; }
  25% { background: #fff8e1; }
  50% { background: #e3f2fd; }
  75% { background: #f3e5f5; }
  100% { background: white; }
}

@keyframes second-colors {
  0% { background: #FF3A3A; }
  33% { background: #4CAF50; }
  66% { background: #2196F3; }
  100% { background: #FF3A3A; }
}

@keyframes marker-colors {
  0% { background-color: #5569E1; }
  33% { background-color: #FF3A3A; }
  66% { background-color: #4CAF50; }
  100% { background-color: #5569E1; }
}

@keyframes rainbow-color {
  0% { background: #FF3A3A; }
  17% { background: #FF9800; }
  33% { background: #FFEB3B; }
  50% { background: #4CAF50; }
  67% { background: #2196F3; }
  83% { background: #9C27B0; }
  100% { background: #FF3A3A; }
}

@keyframes spin-around {
  0% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(180deg) translateY(0); }
  100% { transform: rotate(360deg) translateY(0); }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
