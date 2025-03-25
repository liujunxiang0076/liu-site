<template>
  <div class="weather-card s-card">
    <!-- 城市搜索组件 -->
    <div v-if="isQWeatherAPI" class="search-section">
      <WeatherCitySearch @select="handleCitySelect" />
    </div>
    
    <!-- 天气内容 -->
    <div class="weather-content">
      <!-- 主卡片 -->
      <div class="weather-main-card" :class="[currentWeather, timeOfDay]">
        <!-- 天空背景层 -->
        <div class="sky-background"></div>
        
        <!-- 星星（夜间） -->
        <div v-if="timeOfDay === 'night'" class="stars">
          <div v-for="i in 20" :key="`star-${i}`" class="star"
            :style="{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }">
          </div>
        </div>
        
        <!-- 太阳/月亮 -->
        <div v-if="currentWeather === 'sunny' || currentWeather === 'cloudy'" 
          :class="['celestial-body', { 'sun': isDayTime, 'moon': !isDayTime }]">
        </div>
        
        <!-- 云层 -->
        <div v-if="['cloudy', 'rainy', 'snowy'].includes(currentWeather)" class="clouds">
          <div v-for="i in 3" :key="`cloud-${i}`" 
            class="cloud"
            :style="{ 
              animationDuration: `${20 + i * 5}s`,
              animationDelay: `${i * 2}s`,
              opacity: timeOfDay === 'night' ? 0.6 : 0.8
            }">
          </div>
        </div>
        
        <!-- 雨滴 -->
        <div v-if="currentWeather === 'rainy'" class="rain">
          <div v-for="i in 20" :key="`rain-${i}`" class="drop"
            :style="{ 
              left: `${i * 5}%`,
              animationDuration: `${0.8 + (i * 0.1)}s`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.4 + (i * 0.02)
            }">
          </div>
        </div>
        
        <!-- 雪花 -->
        <div v-if="currentWeather === 'snowy'" class="snow">
          <div v-for="i in 20" :key="`snow-${i}`" class="snowflake"
            :style="{ 
              left: `${i * 5}%`,
              animationDuration: `${2.5 + (i * 0.1)}s`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.6 + (i * 0.02)
            }">
          </div>
        </div>
        
        <!-- 风效果 -->
        <div v-if="currentWeather === 'windy'" class="wind">
          <div v-for="i in 5" :key="`wind-${i}`" class="wind-line"
            :style="{ 
              top: `${20 + (i * 15)}%`,
              width: `${30 + (i * 10)}px`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.4 + (i * 0.1)
            }">
          </div>
        </div>
        
        <!-- 天气信息 -->
        <div v-if="weatherData" class="weather-info-overlay">
          <div class="city-name">{{ weatherData.location }}</div>
          <div class="current-temp">{{ weatherData.temperature }}<span class="temp-unit">°C</span></div>
          <div class="current-weather">{{ weatherData.weather }}</div>
          <div class="weather-details">
            <span>湿度 {{ weatherData.humidity }}%</span>
            <span class="divider">•</span>
            <span>{{ weatherData.windDirection }} {{ weatherData.windSpeed }}</span>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error && !weatherData" class="error-container">
        <span class="error-icon">!</span>
        <span>{{ t('weather.error') }}</span>
      </div>
      
      <!-- 天气预报 -->
      <div v-if="weatherData && weatherData.forecast && weatherData.forecast.length > 1" class="forecast-container">
        <div v-for="(day, index) in weatherData.forecast.slice(1, 3)" :key="index" class="forecast-item">
          <div class="forecast-day">{{ formatForecastDate(day.date) }}</div>
          <div class="forecast-weather">{{ day.dayWeather }}</div>
          <div class="forecast-temp">{{ day.dayTemp }}<small>/{{ day.nightTemp }}°</small></div>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="control-bar">
        <button @click="refreshWeather" class="refresh-btn" title="刷新">
          <span class="iconfont icon-refresh"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../../../i18n'
import { getWeather } from '../../../api'
import WeatherCitySearch from './WeatherCitySearch.vue'
import { getCurrentCoordinates,getQWeatherCityLookup } from '../../../api'

const { t } = useI18n()
const { theme, isDark } = useData()

// 天气类型
const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']
// 当前天气类型
const currentWeather = ref(null)
// 天气数据
const weatherData = ref(null)
// 加载状态
const loading = ref(false)
// 错误状态
const error = ref(false)
// 选中的城市ID
const selectedCityId = ref('')
// 经度，纬度
const {longitude, latitude} =ref(null)
// 是否使用和风天气API
const isQWeatherAPI = computed(() => {
  return theme.value.aside.weather?.type === 'qweather';
});

// 添加打印，查看变量的值
watchEffect(() => {
  console.log('深色模式状态:', isDark.value);
})

// 切换天气类型
const changeWeather = (weather) => {
  currentWeather.value = weather
}

// 刷新天气数据
const refreshWeather = async () => {
  await fetchWeatherData()
}

// 处理城市选择
const handleCitySelect = (city) => {
  console.log('选择城市:', city);
  selectedCityId.value = city.id;
  error.value = false; // 清除错误状态
  
  // 立即更新显示的城市名称
  if (weatherData.value) {
    weatherData.value.location = city.displayName || city.name;
  }
  
  // 构造完整配置，使用和风天气API
  const config = {
    type: 'qweather',
    params: {
      location: city.id,
      cityName: city.displayName || city.name
    },
    thirdParty: theme.value.thirdParty
  };
  
  // 获取新的天气数据
  fetchWeatherDataWithConfig(config);
};

// 获取天气数据（带配置）
const fetchWeatherDataWithConfig = async (config) => {
  if (!theme.value.aside.weather?.enable) return;
  
  loading.value = true;
  error.value = false;
  
  try {
    // 调用统一天气API
    console.log('正在获取天气数据...');
    const data = await getWeather(config);
    console.log('天气数据获取成功:', data);
    
    // 设置当前天气类型
    currentWeather.value = data.weatherType;
    
    // 保存天气数据
    weatherData.value = {
      location: data.location,
      temperature: data.temperature,
      weather: data.weatherText || t(`weather.${data.weatherType}`),
      humidity: data.humidity,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      forecast: data.forecast || []
    };
  } catch (err) {
    console.error('获取天气数据错误:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 格式化预报日期
const formatForecastDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 检查是否为今天或明天
    if (date.toDateString() === today.toDateString()) {
      return t('weather.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('weather.tomorrow');
    }

    // 返回星期几
    const weekdays = [
      t('weather.sunday'),
      t('weather.monday'),
      t('weather.tuesday'),
      t('weather.wednesday'),
      t('weather.thursday'),
      t('weather.friday'),
      t('weather.saturday')
    ];
    return weekdays[date.getDay()];
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateString;
  }
}

// 获取天气数据
const fetchWeatherData = async () => {
  if (!theme.value.aside.weather?.enable) return
  
  loading.value = true
  error.value = false
  currentWeather.value = currentWeather.value || 'sunny' // 设置一个默认值，防止界面闪烁
  
  try {
    // 获取位置信息
    let position = null;
    
    // 尝试获取格式化后的经纬度
    const coordinates = await getCurrentCoordinates();
    
    if (coordinates) {
      // 如果成功获取经纬度，创建position对象
      const [longitude, latitude] = coordinates.split(',');
      position = { 
        coords: { 
          longitude: parseFloat(longitude), 
          latitude: parseFloat(latitude) 
        } 
      };
      // console.log('浏览器地理位置获取成功：', coordinates);
    } else {
      // 如果获取失败，使用默认位置（北京）
      position = { coords: { longitude: 116.41, latitude: 39.91 } };
      console.log('使用默认位置: 北京');
    }
    
    // 构造完整配置，使用和风天气API
    const config = {
      type: 'qweather', // 强制使用和风天气API
      params: {
        ...(theme.value.aside.weather?.params || {}),
        // 如果选择了城市，则使用城市ID作为location
        ...(selectedCityId.value && { location: selectedCityId.value })
      },
      thirdParty: theme.value.thirdParty
    };
    
    // 调用统一天气API
    console.log('正在获取天气数据...');
    const data = await getWeather(config, position)
    console.log('天气数据获取成功:', data.location);
    
    // 设置当前天气类型
    currentWeather.value = data.weatherType
    
    // 保存天气数据
    weatherData.value = {
      location: data.location,
      temperature: data.temperature,
      weather: data.weatherText || t(`weather.${data.weatherType}`),
      humidity: data.humidity,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      forecast: data.forecast || []
    }
  } catch (err) {
    console.error('获取天气数据错误:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取天气数据
onMounted(() => {
  fetchWeatherData()
})


async function getLocation() {
  // 获取格式化后的经纬度
  const coordinates = await getCurrentCoordinates();
  
  if (coordinates) {
    console.log('当前位置坐标:', coordinates); // 例如："116.41,39.92"
    // 在这里使用坐标进行后续操作
  } else {
    console.log('无法获取位置信息，使用默认坐标');
    // 使用默认坐标
  }
}

const isDayTime = computed(() => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
});

const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'dusk';
  return 'night';
});
</script>

<style lang="scss" scoped>
html.dark {
  .weather-card {
    background-color: #1e1e20 !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
    
    .forecast-item {
      background-color: rgba(50, 50, 50, 0.8) !important;
      
      &:hover {
        background-color: rgba(60, 60, 60, 0.8) !important;
      }
    }
    
    .loading-container, .error-container {
      background-color: rgba(50, 50, 50, 0.8) !important;
    }
  }
}

.weather-card {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
  border-radius: 16px;
  background-color: var(--vp-c-bg-soft, #fff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 16px;
  margin: 12px 0;

  .search-section {
    margin-bottom: 16px;
  }

  .weather-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .weather-main-card {
    position: relative;
    height: 160px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    // 晴天 - 白天
    &.sunny.day {
      background: linear-gradient(160deg, #64B5F6, #42A5F5);
      .sky-background {
        background: linear-gradient(160deg, #1E88E5, #64B5F6);
        opacity: 0.8;
      }
    }

    // 晴天 - 夜晚
    &.sunny.night {
      background: linear-gradient(160deg, #1A237E, #283593);
      .sky-background {
        background: linear-gradient(160deg, #0D47A1, #1A237E);
        opacity: 0.9;
      }
    }

    // 晴天 - 黎明
    &.sunny.dawn {
      background: linear-gradient(160deg, #FF9800, #FFA726);
      .sky-background {
        background: linear-gradient(160deg, #FB8C00, #FF9800);
        opacity: 0.85;
      }
    }

    // 晴天 - 黄昏
    &.sunny.dusk {
      background: linear-gradient(160deg, #FF7043, #FF5722);
      .sky-background {
        background: linear-gradient(160deg, #F4511E, #FF7043);
        opacity: 0.85;
      }
    }

    // 多云 - 白天
    &.cloudy.day {
      background: linear-gradient(160deg, #90A4AE, #B0BEC5);
      .sky-background {
        background: linear-gradient(160deg, #78909C, #90A4AE);
        opacity: 0.9;
      }
    }

    // 多云 - 夜晚
    &.cloudy.night {
      background: linear-gradient(160deg, #37474F, #455A64);
      .sky-background {
        background: linear-gradient(160deg, #263238, #37474F);
        opacity: 0.95;
      }
    }

    // 多云 - 黎明/黄昏
    &.cloudy.dawn, &.cloudy.dusk {
      background: linear-gradient(160deg, #795548, #8D6E63);
      .sky-background {
        background: linear-gradient(160deg, #6D4C41, #795548);
        opacity: 0.9;
      }
    }

    // 雨天 - 白天
    &.rainy.day {
      background: linear-gradient(160deg, #546E7A, #78909C);
      .sky-background {
        background: linear-gradient(160deg, #455A64, #546E7A);
        opacity: 0.95;
      }
    }

    // 雨天 - 夜晚
    &.rainy.night {
      background: linear-gradient(160deg, #263238, #37474F);
      .sky-background {
        background: linear-gradient(160deg, #1A237E, #263238);
        opacity: 0.97;
      }
    }

    // 雪天 - 白天
    &.snowy.day {
      background: linear-gradient(160deg, #90A4AE, #CFD8DC);
      .sky-background {
        background: linear-gradient(160deg, #78909C, #B0BEC5);
        opacity: 0.9;
      }
    }

    // 雪天 - 夜晚
    &.snowy.night {
      background: linear-gradient(160deg, #37474F, #455A64);
      .sky-background {
        background: linear-gradient(160deg, #263238, #37474F);
        opacity: 0.95;
      }
    }

    // 大风 - 白天
    &.windy.day {
      background: linear-gradient(160deg, #64B5F6, #90CAF9);
      .sky-background {
        background: linear-gradient(160deg, #42A5F5, #64B5F6);
        opacity: 0.8;
      }
    }

    // 大风 - 夜晚
    &.windy.night {
      background: linear-gradient(160deg, #1A237E, #283593);
      .sky-background {
        background: linear-gradient(160deg, #0D47A1, #1A237E);
        opacity: 0.9;
      }
    }
  }
  
  .weather-info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    padding: 20px;
    
    .city-name {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 2px;
      opacity: 0.95;
    }
    
    .current-temp {
      font-size: 60px;
      font-weight: 200; // 超细字重，苹果风格
      line-height: 1;
      margin: 8px 0;
      
      .temp-unit {
        font-size: 30px;
        font-weight: 300;
      }
    }
    
    .current-weather {
      font-size: 18px;
      font-weight: 400;
      margin-bottom: 10px;
    }
    
    .weather-details {
      font-size: 13px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      
      .divider {
        margin: 0 8px;
        opacity: 0.7;
      }
    }
  }

  .forecast-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 0;
    
    .forecast-item {
      flex: 1;
      background-color: var(--vp-c-bg-alt, rgba(255, 255, 255, 0.6));
      backdrop-filter: blur(8px);
      border-radius: 14px;
      padding: 12px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        background-color: var(--vp-c-bg-soft, rgba(255, 255, 255, 0.7));
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
      }
      
      .forecast-day {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--vp-c-text-1);
      }
      
      .forecast-weather {
        font-size: 14px;
        color: var(--vp-c-text-2);
        margin-bottom: 4px;
      }
      
      .forecast-temp {
        font-size: 16px;
        font-weight: 500;
        color: var(--vp-c-text-1);
        
        small {
          font-size: 14px;
          font-weight: normal;
          opacity: 0.8;
        }
      }
    }
  }
  
  .loading-container {
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--vp-c-bg-alt, rgba(255, 255, 255, 0.6));
    backdrop-filter: blur(8px);
    border-radius: 16px;
    
    .spinner {
      width: 28px;
      height: 28px;
      border: 2px solid var(--vp-c-divider, rgba(0, 0, 0, 0.08));
      border-top-color: var(--vp-c-brand);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
  
  .error-container {
    height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--vp-c-bg-alt, rgba(255, 255, 255, 0.6));
    backdrop-filter: blur(8px);
    border-radius: 16px;
    color: var(--vp-c-danger);
    gap: 10px;
    
    .error-icon {
      font-size: 22px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 71, 87, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
    }
  }
  
  // 隐藏控制按钮
  .control-bar {
    display: none;
  }

  // 动画效果
  .sky-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 1s ease;
  }
  
  .celestial-body {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    left: 20px;
    top: 20px;
    transition: all 0.5s ease;
    
    &.sun {
      background: linear-gradient(145deg, #FDD835, #FFB300);
      box-shadow: 
        0 0 60px rgba(255, 235, 59, 0.6),
        0 0 120px rgba(255, 235, 59, 0.3);
      animation: float 6s ease-in-out infinite;
      
      // 黎明时的太阳
      .dawn & {
        background: linear-gradient(145deg, #FFB74D, #FFA726);
        box-shadow: 
          0 0 60px rgba(255, 167, 38, 0.4),
          0 0 120px rgba(255, 167, 38, 0.2);
        opacity: 0.9;
      }
      
      // 黄昏时的太阳
      .dusk & {
        background: linear-gradient(145deg, #FF7043, #FF5722);
        box-shadow: 
          0 0 60px rgba(255, 87, 34, 0.4),
          0 0 120px rgba(255, 87, 34, 0.2);
        opacity: 0.85;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        background: radial-gradient(circle, rgba(255, 235, 59, 0.3) 0%, transparent 70%);
        animation: sun-pulse 4s ease-in-out infinite;
        
        .dawn & {
          background: radial-gradient(circle, rgba(255, 167, 38, 0.3) 0%, transparent 70%);
        }
        
        .dusk & {
          background: radial-gradient(circle, rgba(255, 87, 34, 0.3) 0%, transparent 70%);
        }
      }
    }
    
    &.moon {
      background: linear-gradient(145deg, #FFFFFF 5%, #F4F4F4 50%, #E8E8E8 100%);
      box-shadow: 
        0 0 30px rgba(255, 255, 255, 0.3),
        0 0 60px rgba(255, 255, 255, 0.1),
        inset -8px -8px 15px rgba(0, 0, 0, 0.1);
      animation: float 8s ease-in-out infinite;
      overflow: hidden;
      
      // 深夜的月亮
      .night & {
        box-shadow: 
          0 0 40px rgba(255, 255, 255, 0.4),
          0 0 80px rgba(255, 255, 255, 0.2),
          inset -8px -8px 15px rgba(0, 0, 0, 0.15);
      }
      
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 25% 25%, rgba(244, 244, 244, 0.8) 5%, transparent 15%),
          radial-gradient(circle at 75% 30%, rgba(244, 244, 244, 0.8) 4%, transparent 12%),
          radial-gradient(circle at 35% 65%, rgba(244, 244, 244, 0.8) 6%, transparent 18%),
          radial-gradient(circle at 65% 70%, rgba(244, 244, 244, 0.8) 5%, transparent 15%);
        opacity: 0.8;
        transition: opacity 0.3s ease;
        
        .night & {
          opacity: 1;
        }
      }
    }
  }
  
  .stars {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      animation: twinkle 2s ease-in-out infinite;
      
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: white;
        border-radius: 50%;
        filter: blur(1px);
        opacity: 0.5;
      }
      
      // 使用固定序列替代随机值
      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          $size: if($i % 2 == 0, 2, 1);
          $duration: 1.5s + ($i % 10) * 0.1s;
          width: #{$size}px;
          height: #{$size}px;
          animation-duration: $duration;
        }
      }
    }
  }
  
  .clouds {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
    .cloud {
      position: absolute;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      animation: cloud-move 20s linear infinite;
      filter: blur(1px);
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        background: inherit;
        border-radius: 50%;
      }
      
      &:nth-child(1) {
        width: 60px;
        height: 20px;
        top: 30px;
        left: -60px;
        opacity: 0.9;
        animation-duration: 25s;
        
        &::before {
          width: 25px;
          height: 25px;
          top: -10px;
          left: 12px;
        }
        
        &::after {
          width: 30px;
          height: 30px;
          top: -15px;
          right: 10px;
        }
      }
      
      &:nth-child(2) {
        width: 50px;
        height: 18px;
        top: 60px;
        left: -50px;
        opacity: 0.7;
        animation-duration: 30s;
        animation-delay: -15s;
        
        &::before {
          width: 22px;
          height: 22px;
          top: -10px;
          left: 10px;
        }
        
        &::after {
          width: 26px;
          height: 26px;
          top: -12px;
          right: 8px;
        }
      }
      
      &:nth-child(3) {
        width: 40px;
        height: 15px;
        top: 90px;
        left: -40px;
        opacity: 0.6;
        animation-duration: 35s;
        animation-delay: -7s;
        
        &::before {
          width: 18px;
          height: 18px;
          top: -8px;
          left: 7px;
        }
        
        &::after {
          width: 20px;
          height: 20px;
          top: -10px;
          right: 7px;
        }
      }
      
      // 夜间云层效果
      .night & {
        background: rgba(255, 255, 255, 0.7);
        filter: blur(2px);
      }
      
      // 黎明/黄昏云层效果
      .dawn &, .dusk & {
        background: rgba(255, 255, 255, 0.8);
        filter: blur(1.5px);
      }
    }
  }

  .rain {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .drop {
      position: absolute;
      width: 2px;
      height: 20px;
      background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5));
      border-radius: 1px;
      animation: rain-drop 1s linear infinite;
      filter: blur(0.5px);
      
      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          left: ($i * 5) * 1%;
          animation-delay: ($i * 0.1) * 1s;
          animation-duration: (0.8 + $i * 0.1) * 1s;
          opacity: 0.4 + ($i * 0.02);
        }
      }
    }
  }

  .snow {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .snowflake {
      position: absolute;
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      animation: snow-drop 3s linear infinite;
      filter: blur(0.5px);
      
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        transform: scale(0.8);
      }
      
      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          left: ($i * 5) * 1%;
          animation-delay: ($i * 0.15) * 1s;
          animation-duration: (2.5 + $i * 0.1) * 1s;
          opacity: 0.6 + ($i * 0.02);
        }
      }
    }
  }

  .wind {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .wind-line {
      position: absolute;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.7), transparent);
      animation: wind-blow 3s linear infinite;
      filter: blur(0.5px);
      
      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          top: (20 + $i * 15) * 1%;
          width: (30 + $i * 10) * 1px;
          animation-delay: ($i * 0.2) * 1s;
          opacity: 0.4 + ($i * 0.1);
        }
      }
    }
  }
}

// 动画定义
@keyframes cloud-move {
  0% {
    transform: translateX(-120%) translateY(0);
  }
  50% {
    transform: translateX(-60%) translateY(-5px);
  }
  100% {
    transform: translateX(120%) translateY(0);
  }
}

@keyframes rain-drop {
  0% {
    transform: translateY(-10px) translateX(0) scaleY(1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(170px) translateX(-20px) scaleY(2);
    opacity: 0;
  }
}

@keyframes snow-drop {
  0% {
    transform: translateY(-10px) rotate(0deg) scale(1);
    opacity: 0;
  }
  25% {
    transform: translateY(40px) rotate(90deg) scale(1.2);
    opacity: 1;
  }
  75% {
    transform: translateY(120px) rotate(270deg) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translateY(170px) rotate(360deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes sun-rays {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sun-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

@keyframes wind-blow {
  0% {
    transform: translateX(-30px) scaleX(0.5);
    opacity: 0;
  }
  25% {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
  75% {
    transform: translateX(90px) scaleX(1.2);
    opacity: 0.7;
  }
  100% {
    transform: translateX(120px) scaleX(0.5);
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
