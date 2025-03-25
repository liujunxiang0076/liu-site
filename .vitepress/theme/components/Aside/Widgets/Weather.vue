<template>
  <div class="weather-card">
    <!-- 天气标题 -->
    <div class="title">
      <span class="iconfont icon-weather"></span>
      <span class="title-name">{{ t('weather.title') }}</span>
    </div>
    
    <!-- 城市搜索组件 -->
    <div v-if="isQWeatherAPI" class="search-section">
      <WeatherCitySearch @select="handleCitySelect" />
    </div>
    
    <!-- 天气内容 -->
    <div class="weather-content">
      <div class="weather-display" :class="currentWeather">
        <!-- 云朵动画 -->
        <div v-if="['cloudy', 'rainy', 'snowy', 'windy'].includes(currentWeather)" class="clouds">
          <div class="cloud"></div>
          <div class="cloud"></div>
        </div>
        <!-- 雨滴动画 -->
        <div v-if="currentWeather === 'rainy'" class="rain">
          <div v-for="i in 10" :key="`rain-${i}`" class="drop"
            :style="{ left: `${i * 10}%`, animationDuration: `${0.7 + Math.random() * 0.3}s`, animationDelay: `${Math.random() * 0.5}s` }">
          </div>
        </div>
        <!-- 雪花动画 -->
        <div v-if="currentWeather === 'snowy'" class="snow">
          <div v-for="i in 10" :key="`snow-${i}`" class="snowflake"
            :style="{ left: `${i * 10}%`, animationDuration: `${1 + Math.random() * 0.5}s`, animationDelay: `${Math.random() * 0.5}s` }">
          </div>
        </div>
        <!-- 太阳动画 -->
        <div v-if="currentWeather === 'sunny'" class="sun"></div>
        <!-- 风动画 -->
        <div v-if="currentWeather === 'windy'" class="wind">
          <div v-for="i in 3" :key="`wind-${i}`" class="wind-line" :style="{ animationDelay: `${i * 0.2}s` }"></div>
        </div>
      </div>
      <!-- 天气信息 -->
      <div class="weather-info">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <!-- 天气数据 -->
        <template v-else-if="weatherData">
          <div class="location">{{ weatherData.location }}</div>
          <div class="temperature">{{ weatherData.temperature }}°C</div>
          <div class="weather-text">{{ weatherData.weather }}</div>
          <div class="weather-detail">
            <span>{{ t('weather.humidity') }}: {{ weatherData.humidity }}%</span>
            <span>{{ weatherData.windDirection }} {{ weatherData.windSpeed }}</span>
          </div>

          <!-- 天气预报 -->
          <div v-if="weatherData.forecast && weatherData.forecast.length > 0" class="weather-forecast">
            <div class="forecast-title">{{ t('weather.forecast') }}</div>
            <div class="forecast-items">
              <div v-for="(day, index) in weatherData.forecast.slice(0, 3)" :key="index" class="forecast-item">
                <div class="forecast-date">{{ formatForecastDate(day.date) }}</div>
                <div class="forecast-temp">{{ day.dayTemp }}/{{ day.nightTemp }}°C</div>
                <div class="forecast-weather">{{ day.dayWeather }}</div>
              </div>
            </div>
          </div>
        </template>
        <!-- 天气数据错误 -->
        <div v-else-if="error" class="error">
          {{ t('weather.error') }}
        </div>
      </div>
      <!-- 天气按钮 -->
      <div class="weather-buttons">
        <button v-for="weather in weatherTypes" :key="weather" @click="changeWeather(weather)"
          :class="{ active: currentWeather === weather }" :title="t(`weather.${weather}`)">
          <span class="iconfont" :class="`icon-${weather}`"></span>
        </button>
        <button @click="refreshWeather" class="refresh" title="刷新">
          <span class="iconfont icon-refresh"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../../../i18n'
import { getWeather } from '../../../api'
import WeatherCitySearch from './WeatherCitySearch.vue'
import { getCurrentCoordinates } from '../../../api'

const { t } = useI18n()
const { theme } = useData()

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
  fetchWeatherData();
}

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
    
    // 如果已选择城市且使用和风天气API，则不需要位置信息
    if (!(isQWeatherAPI.value && selectedCityId.value)) {
      // 尝试通过浏览器定位
      try {
        if (navigator.geolocation) {
          position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos),
              (err) => {
                console.warn('浏览器地理位置获取失败:', err.message);
                reject(err);
              },
              { timeout: 10000, maximumAge: 3600000 } // 1小时内缓存位置
            )
          });

          longitude=position.coords.longitude
          
          latitude=position.coords.latitude
          console.log('浏览器地理位置获取成功：', longitude,latitude);
        }
      } catch (locErr) {
        console.warn('浏览器定位失败:', locErr);
        // 浏览器定位失败，继续后续流程
      }
      
      // 如果浏览器定位失败且未设置position，创建默认位置
      if (!position) {
        position = { coords: { longitude: 116.41, latitude: 39.91 } };
        console.log('使用默认位置: 北京');
      }
    }
    
    // 构造完整配置，包括天气配置和第三方API配置
    const config = {
      type: theme.value.aside.weather?.type,
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
.weather-card {
  position: relative;
  overflow: hidden;
  
  .search-section {
    margin-bottom: 10px;
  }

  .weather-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 180px;
  }

  .weather-display {
    width: 100%;
    height: 80px;
    position: relative;
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;

    &.sunny {
      background: linear-gradient(to bottom, #ffdb6f, #ffb86c);
    }

    &.cloudy {
      background: linear-gradient(to bottom, #c2d9ff, #7ba3e7);
    }

    &.rainy {
      background: linear-gradient(to bottom, #89a4c7, #546987);
    }

    &.snowy {
      background: linear-gradient(to bottom, #c4d9f1, #9fb1c7);
    }

    &.windy {
      background: linear-gradient(to bottom, #a0c8e0, #7ca6c5);
    }
  }

  .weather-info {
    text-align: center;
    width: 100%;

    .location {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .temperature {
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 4px;
    }

    .weather-text {
      font-size: 14px;
      margin-bottom: 4px;
      opacity: 0.8;
    }

    .weather-detail {
      font-size: 12px;
      opacity: 0.7;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 8px;
    }

    .error {
      color: #ff6b6b;
      font-size: 14px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;

      .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top-color: var(--vp-c-brand);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .weather-forecast {
      width: 100%;
      margin-top: 8px;

      .forecast-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 6px;
        opacity: 0.8;
      }

      .forecast-items {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }

      .forecast-item {
        flex: 1;
        background-color: var(--vp-c-bg-soft);
        border-radius: 6px;
        padding: 6px;
        text-align: center;

        .forecast-date {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 2px;
        }

        .forecast-temp {
          font-size: 12px;
          margin-bottom: 2px;
        }

        .forecast-weather {
          font-size: 11px;
          opacity: 0.8;
        }
      }
    }
  }

  .weather-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;

    button {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      transition: all 0.3s;

      &:hover {
        background-color: var(--vp-c-bg-soft);
        opacity: 1;
      }

      &.active {
        opacity: 1;
        background-color: var(--vp-c-bg-soft);
      }

      .iconfont {
        font-size: 16px;
      }
    }
  }

  // 动画效果
  // 云朵
  .clouds {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .cloud {
      position: absolute;
      width: 30px;
      height: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 10px;
      animation: cloud-move 20s linear infinite;

      &:before,
      &:after {
        content: '';
        position: absolute;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
      }

      &:before {
        width: 15px;
        height: 15px;
        top: -7px;
        left: 5px;
      }

      &:after {
        width: 20px;
        height: 20px;
        top: -10px;
        right: 5px;
      }

      &:nth-child(1) {
        top: 15px;
        left: -30px;
        animation-duration: 30s;
      }

      &:nth-child(2) {
        top: 40px;
        left: -50px;
        width: 40px;
        height: 15px;
        animation-duration: 25s;
        animation-delay: 5s;
      }
    }
  }

  // 雨滴
  .rain {
    position: absolute;
    width: 100%;
    height: 100%;

    .drop {
      position: absolute;
      top: -10px;
      width: 2px;
      height: 10px;
      background: rgba(255, 255, 255, 0.6);
      animation: rain-drop 1s linear infinite;
    }
  }

  // 雪花
  .snow {
    position: absolute;
    width: 100%;
    height: 100%;

    .snowflake {
      position: absolute;
      top: -10px;
      width: 5px;
      height: 5px;
      background: white;
      border-radius: 50%;
      animation: snow-drop 2s linear infinite;
    }
  }

  // 太阳
  .sun {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px #fff, 0 0 20px #ff0;
    animation: sun-pulse 2s ease-in-out infinite;
  }

  // 风
  .wind {
    position: absolute;
    width: 100%;
    height: 100%;

    .wind-line {
      position: absolute;
      height: 2px;
      background: rgba(255, 255, 255, 0.6);
      animation: wind-blow 3s linear infinite;

      &:nth-child(1) {
        top: 20px;
        left: -20px;
        width: 30px;
      }

      &:nth-child(2) {
        top: 35px;
        left: -20px;
        width: 40px;
      }

      &:nth-child(3) {
        top: 50px;
        left: -20px;
        width: 20px;
      }
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
    transform: translateY(80px) scaleY(2);
    opacity: 0;
  }
}

@keyframes snow-drop {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(80px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes sun-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.9;
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
