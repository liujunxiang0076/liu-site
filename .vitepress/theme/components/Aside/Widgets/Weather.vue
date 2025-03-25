<template>
  <div class="weather-card s-card">
    <!-- 城市搜索组件 -->
    <div v-if="isQWeatherAPI" class="search-section">
      <WeatherCitySearch @select="handleCitySelect" />
    </div>
    
    <!-- 天气内容 -->
    <div class="weather-content">
      <!-- 主卡片 -->
      <div class="weather-main-card" :class="currentWeather">
        <!-- 动画效果 -->
        <div v-if="['cloudy', 'rainy', 'snowy', 'windy'].includes(currentWeather)" class="clouds">
          <div class="cloud"></div>
          <div class="cloud"></div>
        </div>
        
        <div v-if="currentWeather === 'rainy'" class="rain">
          <div v-for="i in 10" :key="`rain-${i}`" class="drop"
            :style="{ left: `${i * 10}%`, animationDuration: `${0.7 + Math.random() * 0.3}s`, animationDelay: `${Math.random() * 0.5}s` }">
          </div>
        </div>
        
        <div v-if="currentWeather === 'snowy'" class="snow">
          <div v-for="i in 10" :key="`snow-${i}`" class="snowflake"
            :style="{ left: `${i * 10}%`, animationDuration: `${1 + Math.random() * 0.5}s`, animationDelay: `${Math.random() * 0.5}s` }">
          </div>
        </div>
        
        <div v-if="currentWeather === 'sunny'" class="sun"></div>
        
        <div v-if="currentWeather === 'windy'" class="wind">
          <div v-for="i in 3" :key="`wind-${i}`" class="wind-line" :style="{ animationDelay: `${i * 0.2}s` }"></div>
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

    &.sunny {
      background: linear-gradient(160deg, #FFA53E, #FFCB7B);
    }

    &.cloudy {
      background: linear-gradient(160deg, #7F9EFA, #A8C0FF);
    }

    &.rainy {
      background: linear-gradient(160deg, #6B8299, #9BADBF);
    }

    &.snowy {
      background: linear-gradient(160deg, #B8D9FB, #D5E8FF);
    }

    &.windy {
      background: linear-gradient(160deg, #90CAE8, #C1E2F5);
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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
  .clouds, .rain, .snow, .wind, .sun {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .cloud {
    position: absolute;
    width: 40px;
    height: 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    animation: cloud-move 20s linear infinite;

    &:before,
    &:after {
      content: '';
      position: absolute;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }

    &:before {
      width: 20px;
      height: 20px;
      top: -9px;
      left: 7px;
    }

    &:after {
      width: 24px;
      height: 24px;
      top: -12px;
      right: 7px;
    }

    &:nth-child(1) {
      top: 25px;
      left: -40px;
      animation-duration: 30s;
    }

    &:nth-child(2) {
      top: 70px;
      left: -60px;
      width: 50px;
      height: 20px;
      animation-duration: 25s;
      animation-delay: 5s;
    }
  }

  .drop {
    position: absolute;
    top: -20px;
    width: 2px;
    height: 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 1px;
    animation: rain-drop 1s linear infinite;
  }

  .snowflake {
    position: absolute;
    top: -10px;
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: snow-drop 2s linear infinite;
  }

  .sun {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 240, 180, 0.6);
    animation: sun-pulse 3s ease-in-out infinite;
  }

  .wind-line {
    position: absolute;
    height: 2px;
    background: rgba(255, 255, 255, 0.7);
    animation: wind-blow 3s linear infinite;

    &:nth-child(1) {
      top: 40px;
      left: -30px;
      width: 40px;
    }

    &:nth-child(2) {
      top: 80px;
      left: -30px;
      width: 60px;
    }

    &:nth-child(3) {
      top: 120px;
      left: -30px;
      width: 30px;
    }
  }
}

// 动画定义
@keyframes cloud-move {
  0% {
    transform: translateX(-10%);
  }
  100% {
    transform: translateX(120%);
  }
}

@keyframes rain-drop {
  0% {
    transform: translateY(0) scaleY(1);
    opacity: 1;
  }
  100% {
    transform: translateY(170px) scaleY(2);
    opacity: 0;
  }
}

@keyframes snow-drop {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(170px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes sun-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes wind-blow {
  0% {
    transform: translateX(-10px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
