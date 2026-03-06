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
        
        <!-- 大气光效层 -->
        <div class="atmosphere-glow"></div>
        
        <!-- 星星（夜间） -->
        <div v-if="timeOfDay === 'night'" class="stars">
          <div v-for="i in 25" :key="`star-${i}`" class="star"
            :style="{ 
              left: `${(i * 17 + 13) % 100}%`, 
              top: `${(i * 23 + 7) % 80}%`,
              animationDelay: `${(i * 0.37) % 3}s`
            }">
          </div>
          <!-- 流星 -->
          <div class="shooting-star"></div>
          <div class="shooting-star shooting-star-2"></div>
        </div>
        
        <!-- 太阳/月亮 -->
        <div v-if="currentWeather === 'sunny' || currentWeather === 'cloudy' || currentWeather === 'windy'" 
          :class="[
            'celestial-body', 
            { 'sun': isDayTime, 'moon': !isDayTime },
            currentWeather ? `weather-${currentWeather}` : ''
          ]">
          <!-- 太阳光芒（仅晴天） -->
          <div v-if="isDayTime && currentWeather === 'sunny'" class="sun-rays-ring"></div>
          <!-- 太阳光晕（仅晴天） -->
          <div v-if="isDayTime && currentWeather === 'sunny'" class="sun-halo"></div>
        </div>
        
        <!-- 云层 -->
        <div v-if="['cloudy', 'rainy', 'snowy'].includes(currentWeather)" class="clouds">
          <div v-for="i in 4" :key="`cloud-${i}`" 
            class="cloud"
            :style="{ 
              animationDuration: `${18 + i * 6}s`,
              animationDelay: `${i * 3}s`,
              opacity: timeOfDay === 'night' ? 0.5 : 0.85
            }">
          </div>
        </div>
        
        <!-- 雾气层（雨天） -->
        <div v-if="currentWeather === 'rainy'" class="mist">
          <div class="mist-layer mist-1"></div>
          <div class="mist-layer mist-2"></div>
        </div>
        
        <!-- 雨滴 -->
        <div v-if="currentWeather === 'rainy'" class="rain">
          <div v-for="i in 30" :key="`rain-${i}`" class="drop"
            :style="{ 
              left: `${(i * 3.3) % 100}%`,
              animationDuration: `${0.6 + (i % 8) * 0.08}s`,
              animationDelay: `${(i * 0.07) % 2}s`,
              opacity: 0.3 + (i % 10) * 0.04
            }">
          </div>
          <!-- 水花溅射 -->
          <div class="rain-splash">
            <div v-for="i in 8" :key="`splash-${i}`" class="splash"
              :style="{
                left: `${(i * 12.5) % 100}%`,
                animationDelay: `${(i * 0.25) % 2}s`
              }">
            </div>
          </div>
        </div>
        
        <!-- 闪电（雨天） -->
        <div v-if="currentWeather === 'rainy'" class="lightning-container">
          <div class="lightning"></div>
        </div>
        
        <!-- 雪花 -->
        <div v-if="currentWeather === 'snowy'" class="snow">
          <div v-for="i in 25" :key="`snow-${i}`" class="snowflake"
            :style="{ 
              left: `${(i * 4) % 100}%`,
              animationDuration: `${2 + (i % 6) * 0.3}s`,
              animationDelay: `${(i * 0.2) % 3}s`,
              opacity: 0.5 + (i % 8) * 0.06
            }">
          </div>
          <!-- 地面积雪 -->
          <div class="snow-ground"></div>
        </div>
        
        <!-- 风效果 -->
        <div v-if="currentWeather === 'windy'" class="wind">
          <div v-for="i in 6" :key="`wind-${i}`" class="wind-line"
            :style="{ 
              top: `${15 + (i * 13)}%`,
              width: `${25 + (i * 8)}px`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.3 + (i * 0.1)
            }">
          </div>
          <!-- 飘散粒子 -->
          <div v-for="i in 10" :key="`particle-${i}`" class="wind-particle"
            :style="{
              top: `${(i * 9 + 5) % 90}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
              animationDuration: `${2 + (i % 4) * 0.5}s`
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

// 本地存储键
const WEATHER_CACHE_KEY = 'weather_cache_data';
const WEATHER_CACHE_TIMESTAMP_KEY = 'weather_cache_timestamp';
const WEATHER_CACHE_CITY_ID_KEY = 'weather_cache_city_id';

// 获取缓存的天气数据
const getWeatherCache = () => {
  try {
    const cachedData = localStorage.getItem(WEATHER_CACHE_KEY);
    const timestamp = localStorage.getItem(WEATHER_CACHE_TIMESTAMP_KEY);
    const cachedCityId = localStorage.getItem(WEATHER_CACHE_CITY_ID_KEY);
    
    console.log('缓存检查 - 数据:', cachedData ? '存在' : '不存在', 
                '时间戳:', timestamp ? '存在' : '不存在');
    
    if (!cachedData || !timestamp) {
      console.log('缓存数据或时间戳不存在，需要重新获取');
      return null;
    }
    
    // 检查缓存是否是今天的
    const cachedDate = new Date(parseInt(timestamp));
    const today = new Date();
    
    console.log('缓存日期:', cachedDate.toLocaleString(), 
                '当前日期:', today.toLocaleString());
    
    // 如果不是同一天，则缓存无效
    if (cachedDate.getDate() !== today.getDate() || 
        cachedDate.getMonth() !== today.getMonth() || 
        cachedDate.getFullYear() !== today.getFullYear()) {
      console.log('缓存已过期 - 不是同一天');
      return null;
    }
    
    // 如果选择了不同的城市，则缓存无效
    if (selectedCityId.value && cachedCityId !== selectedCityId.value) {
      console.log('城市已更改，缓存无效 - 缓存城市:', cachedCityId, '当前城市:', selectedCityId.value);
      return null;
    }
    
    // console.log('使用缓存的天气数据');
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('获取缓存数据出错:', error);
    return null;
  }
};

// 保存天气数据到缓存
const saveWeatherCache = (data) => {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(WEATHER_CACHE_TIMESTAMP_KEY, Date.now().toString());
    if (selectedCityId.value) {
      localStorage.setItem(WEATHER_CACHE_CITY_ID_KEY, selectedCityId.value);
    }
    console.log('天气数据已缓存');
    
    // 验证缓存是否成功写入
    const saved = localStorage.getItem(WEATHER_CACHE_KEY);
    console.log('缓存验证:', saved ? '成功' : '失败');
  } catch (error) {
    console.error('缓存天气数据出错:', error);
  }
};

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
  // 清除缓存强制刷新
  localStorage.removeItem(WEATHER_CACHE_KEY);
  localStorage.removeItem(WEATHER_CACHE_TIMESTAMP_KEY);
  await fetchWeatherData();
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
  
  // 清除之前的缓存
  localStorage.removeItem(WEATHER_CACHE_KEY);
  localStorage.removeItem(WEATHER_CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(WEATHER_CACHE_CITY_ID_KEY);
  
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
    const weatherInfo = {
      location: data.location,
      temperature: data.temperature,
      weather: data.weatherText || t(`weather.${data.weatherType}`),
      humidity: data.humidity,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      forecast: data.forecast || [],
      weatherType: data.weatherType
    };
    
    // 更新显示
    weatherData.value = weatherInfo;
    
    // 保存到缓存
    saveWeatherCache(weatherInfo);
  } catch (err) {
    console.error('获取天气数据错误:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取天气数据
const fetchWeatherData = async () => {
  if (!theme.value.aside.weather?.enable) return;
  
  // 先检查缓存
  const cachedData = getWeatherCache();
  if (cachedData) {
    // 使用缓存数据
    weatherData.value = cachedData;
    currentWeather.value = cachedData.weatherType;
    loading.value = false;
    error.value = false;
    return;
  }
  
  loading.value = true;
  error.value = false;
  currentWeather.value = currentWeather.value || 'sunny'; // 设置一个默认值，防止界面闪烁
  
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
    const data = await getWeather(config, position);
    console.log('天气数据获取成功:', data.location);
    
    // 设置当前天气类型
    currentWeather.value = data.weatherType;
    
    // 保存天气数据
    const weatherInfo = {
      location: data.location,
      temperature: data.temperature,
      weather: data.weatherText || t(`weather.${data.weatherType}`),
      humidity: data.humidity,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      forecast: data.forecast || [],
      weatherType: data.weatherType
    };
    
    // 更新显示
    weatherData.value = weatherInfo;
    
    // 保存到缓存
    saveWeatherCache(weatherInfo);
  } catch (err) {
    console.error('获取天气数据错误:', err);
    error.value = true;
  } finally {
    loading.value = false;
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

// 将被删除的formatForecastDate函数恢复
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
</script>

<style lang="scss" scoped>
html.dark {
  .weather-card {
    background-color: #1e1e20 !important;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2) !important;
    
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

  // ==================== 主卡片 ====================
  .weather-main-card {
    position: relative;
    height: 180px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    // ===== 晴天 =====
    &.sunny.day {
      background: linear-gradient(160deg, #4FC3F7 0%, #29B6F6 40%, #039BE5 100%);
      .sky-background {
        background: linear-gradient(180deg, #0288D1 0%, #4FC3F7 60%, #81D4FA 100%);
        opacity: 0.75;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 25% 20%, rgba(255, 249, 196, 0.35) 0%, transparent 55%),
                    radial-gradient(ellipse at 80% 80%, rgba(129, 212, 250, 0.2) 0%, transparent 40%);
      }
    }

    &.sunny.night {
      background: linear-gradient(160deg, #0d1b2a 0%, #1b2838 40%, #1a237e 100%);
      .sky-background {
        background: linear-gradient(180deg, #070d1a 0%, #0d1b2a 50%, #1a237e 100%);
        opacity: 0.9;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 25% 25%, rgba(100, 149, 237, 0.12) 0%, transparent 50%),
                    radial-gradient(ellipse at 75% 60%, rgba(63, 81, 181, 0.08) 0%, transparent 40%);
      }
    }

    &.sunny.dawn {
      background: linear-gradient(160deg, #FF8A65 0%, #FFAB91 30%, #FFE0B2 70%, #FFF9C4 100%);
      .sky-background {
        background: linear-gradient(180deg, #E65100 0%, #FF6D00 30%, #FFB74D 70%, #FFF176 100%);
        opacity: 0.7;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 90%, rgba(255, 183, 77, 0.5) 0%, transparent 60%),
                    radial-gradient(ellipse at 30% 60%, rgba(255, 138, 101, 0.3) 0%, transparent 50%);
      }
    }

    &.sunny.dusk {
      background: linear-gradient(160deg, #7B1FA2 0%, #E91E63 30%, #FF5722 60%, #FF9800 100%);
      .sky-background {
        background: linear-gradient(180deg, #4A148C 0%, #C62828 40%, #E65100 80%, #FFB300 100%);
        opacity: 0.7;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 85%, rgba(255, 152, 0, 0.4) 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 40%, rgba(233, 30, 99, 0.2) 0%, transparent 40%);
      }
    }

    // ===== 多云 =====
    &.cloudy.day {
      background: linear-gradient(160deg, #78909C 0%, #90A4AE 40%, #B0BEC5 100%);
      .sky-background {
        background: linear-gradient(180deg, #607D8B 0%, #78909C 50%, #B0BEC5 100%);
        opacity: 0.85;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      }
    }

    &.cloudy.night {
      background: linear-gradient(160deg, #1a2332 0%, #263238 40%, #37474F 100%);
      .sky-background {
        background: linear-gradient(180deg, #0d1520 0%, #1a2332 50%, #37474F 100%);
        opacity: 0.93;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 50%, rgba(96, 125, 139, 0.08) 0%, transparent 50%);
      }
    }

    &.cloudy.dawn {
      background: linear-gradient(160deg, #8D6E63 0%, #A1887F 40%, #BCAAA4 70%, #D7CCC8 100%);
      .sky-background {
        background: linear-gradient(180deg, #6D4C41 0%, #8D6E63 40%, #BCAAA4 100%);
        opacity: 0.85;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 85%, rgba(255, 183, 77, 0.2) 0%, transparent 50%);
      }
    }

    &.cloudy.dusk {
      background: linear-gradient(160deg, #5D4037 0%, #795548 30%, #A1887F 70%, #D7CCC8 100%);
      .sky-background {
        background: linear-gradient(180deg, #4E342E 0%, #6D4C41 40%, #A1887F 100%);
        opacity: 0.85;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 80%, rgba(255, 138, 101, 0.2) 0%, transparent 50%);
      }
    }

    // ===== 雨天 =====
    &.rainy.day {
      background: linear-gradient(160deg, #37474F 0%, #455A64 30%, #546E7A 60%, #607D8B 100%);
      .sky-background {
        background: linear-gradient(180deg, #263238 0%, #37474F 40%, #546E7A 100%);
        opacity: 0.92;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0.2) 0%, transparent 60%),
                    radial-gradient(ellipse at 50% 100%, rgba(69, 90, 100, 0.3) 0%, transparent 40%);
      }
    }

    &.rainy.night {
      background: linear-gradient(160deg, #0d1520 0%, #1a2332 40%, #263238 100%);
      .sky-background {
        background: linear-gradient(180deg, #050a12 0%, #0d1520 50%, #1a2332 100%);
        opacity: 0.95;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0.3) 0%, transparent 60%);
      }
    }

    &.rainy.dawn, &.rainy.dusk {
      background: linear-gradient(160deg, #4E342E 0%, #5D4037 30%, #6D4C41 60%, #795548 100%);
      .sky-background {
        background: linear-gradient(180deg, #3E2723 0%, #4E342E 50%, #6D4C41 100%);
        opacity: 0.9;
      }
    }

    // ===== 雪天 =====
    &.snowy.day {
      background: linear-gradient(160deg, #B0BEC5 0%, #CFD8DC 40%, #ECEFF1 100%);
      .sky-background {
        background: linear-gradient(180deg, #90A4AE 0%, #B0BEC5 50%, #E0E0E0 100%);
        opacity: 0.85;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
      }
    }

    &.snowy.night {
      background: linear-gradient(160deg, #1a2332 0%, #2C3E50 40%, #34495E 100%);
      .sky-background {
        background: linear-gradient(180deg, #0d1520 0%, #1a2332 50%, #2C3E50 100%);
        opacity: 0.92;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 50% 50%, rgba(189, 195, 199, 0.08) 0%, transparent 50%);
      }
    }

    &.snowy.dawn, &.snowy.dusk {
      background: linear-gradient(160deg, #78909C 0%, #90A4AE 40%, #B0BEC5 70%, #CFD8DC 100%);
      .sky-background {
        background: linear-gradient(180deg, #607D8B 0%, #78909C 50%, #B0BEC5 100%);
        opacity: 0.88;
      }
    }

    // ===== 大风 =====
    &.windy.day {
      background: linear-gradient(160deg, #4FC3F7 0%, #81D4FA 40%, #B3E5FC 100%);
      .sky-background {
        background: linear-gradient(180deg, #29B6F6 0%, #4FC3F7 50%, #B3E5FC 100%);
        opacity: 0.8;
      }
      .atmosphere-glow {
        background: radial-gradient(ellipse at 80% 40%, rgba(179, 229, 252, 0.3) 0%, transparent 50%);
      }
    }

    &.windy.night {
      background: linear-gradient(160deg, #0d1b2a 0%, #1b2838 40%, #1a237e 100%);
      .sky-background {
        background: linear-gradient(180deg, #070d1a 0%, #0d1b2a 50%, #1a237e 100%);
        opacity: 0.9;
      }
    }

    &.windy.dawn, &.windy.dusk {
      background: linear-gradient(160deg, #FF8A65 0%, #FFAB91 50%, #FFCCBC 100%);
      .sky-background {
        background: linear-gradient(180deg, #E64A19 0%, #FF7043 50%, #FFAB91 100%);
        opacity: 0.8;
      }
    }
  }

  // ==================== 大气光效 ====================
  .atmosphere-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
    transition: all 1s ease;
  }
  
  // ==================== 天气信息 ====================
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
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    padding: 20px;
    z-index: 10;
    
    .city-name {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 2px;
      opacity: 0.92;
      letter-spacing: 0.5px;
    }
    
    .current-temp {
      font-size: 64px;
      font-weight: 200;
      line-height: 1;
      margin: 6px 0;
      
      .temp-unit {
        font-size: 28px;
        font-weight: 300;
        vertical-align: top;
        margin-left: -4px;
      }
    }
    
    .current-weather {
      font-size: 17px;
      font-weight: 400;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    
    .weather-details {
      font-size: 12px;
      opacity: 0.85;
      display: flex;
      align-items: center;
      letter-spacing: 0.2px;
      
      .divider {
        margin: 0 8px;
        opacity: 0.6;
      }
    }
  }

  // ==================== 预报 ====================
  .forecast-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 0;
    
    .forecast-item {
      flex: 1;
      background-color: var(--vp-c-bg-alt, rgba(255, 255, 255, 0.6));
      backdrop-filter: blur(10px);
      border-radius: 14px;
      padding: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-3px);
        background-color: var(--vp-c-bg-soft, rgba(255, 255, 255, 0.7));
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
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
          opacity: 0.7;
        }
      }
    }
  }
  
  // ==================== 加载/错误 ====================
  .loading-container {
    height: 180px;
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
    height: 180px;
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
  
  .control-bar {
    display: none;
  }

  // ==================== 天空背景 ====================
  .sky-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 1s ease;
  }

  // ==================== 天体（太阳/月亮） ====================
  .celestial-body {
    position: absolute;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    left: 22px;
    top: 22px;
    transition: all 0.5s ease;
    z-index: 2;
    
    &.sun {
      background: linear-gradient(145deg, #FDD835, #FFB300);
      box-shadow: 
        0 0 40px rgba(255, 235, 59, 0.7),
        0 0 80px rgba(255, 235, 59, 0.4),
        0 0 140px rgba(255, 235, 59, 0.15);
      animation: float 6s ease-in-out infinite;
      
      .dawn & {
        background: linear-gradient(145deg, #FFB74D, #FF9800);
        box-shadow: 
          0 0 40px rgba(255, 152, 0, 0.5),
          0 0 80px rgba(255, 152, 0, 0.25),
          0 0 140px rgba(255, 152, 0, 0.1);
      }
      
      .dusk & {
        background: linear-gradient(145deg, #FF7043, #E64A19);
        box-shadow: 
          0 0 40px rgba(255, 87, 34, 0.5),
          0 0 80px rgba(255, 87, 34, 0.25),
          0 0 140px rgba(255, 87, 34, 0.1);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: -25px;
        left: -25px;
        right: -25px;
        bottom: -25px;
        background: radial-gradient(circle, rgba(255, 235, 59, 0.35) 0%, rgba(255, 235, 59, 0.1) 40%, transparent 70%);
        animation: sun-pulse 4s ease-in-out infinite;
        
        .dawn & {
          background: radial-gradient(circle, rgba(255, 152, 0, 0.35) 0%, transparent 70%);
        }
        
        .dusk & {
          background: radial-gradient(circle, rgba(255, 87, 34, 0.35) 0%, transparent 70%);
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 200%;
        transform: translate(-50%, -50%);
        background: 
          conic-gradient(
            from 0deg,
            transparent 0deg, rgba(255, 235, 59, 0.08) 10deg, transparent 20deg,
            transparent 30deg, rgba(255, 235, 59, 0.06) 40deg, transparent 50deg,
            transparent 60deg, rgba(255, 235, 59, 0.08) 70deg, transparent 80deg,
            transparent 90deg, rgba(255, 235, 59, 0.06) 100deg, transparent 110deg,
            transparent 120deg, rgba(255, 235, 59, 0.08) 130deg, transparent 140deg,
            transparent 150deg, rgba(255, 235, 59, 0.06) 160deg, transparent 170deg,
            transparent 180deg, rgba(255, 235, 59, 0.08) 190deg, transparent 200deg,
            transparent 210deg, rgba(255, 235, 59, 0.06) 220deg, transparent 230deg,
            transparent 240deg, rgba(255, 235, 59, 0.08) 250deg, transparent 260deg,
            transparent 270deg, rgba(255, 235, 59, 0.06) 280deg, transparent 290deg,
            transparent 300deg, rgba(255, 235, 59, 0.08) 310deg, transparent 320deg,
            transparent 330deg, rgba(255, 235, 59, 0.06) 340deg, transparent 350deg
          );
        animation: sun-rays-rotate 30s linear infinite;
        border-radius: 50%;
      }

      .sun-rays-ring {
        position: absolute;
        top: -35px;
        left: -35px;
        right: -35px;
        bottom: -35px;
        border-radius: 50%;
        animation: sun-rays-rotate 25s linear infinite;
        
        &::before, &::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
        }
        
        &::before {
          background: 
            linear-gradient(0deg, transparent 42%, rgba(255, 235, 59, 0.15) 48%, rgba(255, 235, 59, 0.15) 52%, transparent 58%),
            linear-gradient(45deg, transparent 42%, rgba(255, 235, 59, 0.1) 48%, rgba(255, 235, 59, 0.1) 52%, transparent 58%),
            linear-gradient(90deg, transparent 42%, rgba(255, 235, 59, 0.15) 48%, rgba(255, 235, 59, 0.15) 52%, transparent 58%),
            linear-gradient(135deg, transparent 42%, rgba(255, 235, 59, 0.1) 48%, rgba(255, 235, 59, 0.1) 52%, transparent 58%);
        }
        
        &::after {
          background: 
            linear-gradient(22.5deg, transparent 44%, rgba(255, 235, 59, 0.07) 48%, rgba(255, 235, 59, 0.07) 52%, transparent 56%),
            linear-gradient(67.5deg, transparent 44%, rgba(255, 235, 59, 0.07) 48%, rgba(255, 235, 59, 0.07) 52%, transparent 56%),
            linear-gradient(112.5deg, transparent 44%, rgba(255, 235, 59, 0.07) 48%, rgba(255, 235, 59, 0.07) 52%, transparent 56%),
            linear-gradient(157.5deg, transparent 44%, rgba(255, 235, 59, 0.07) 48%, rgba(255, 235, 59, 0.07) 52%, transparent 56%);
          animation: sun-rays-rotate 40s linear infinite reverse;
        }
      }

      // 晴天时的暖色光晕层
      .sun-halo {
        position: absolute;
        top: -50px;
        left: -50px;
        right: -50px;
        bottom: -50px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(255, 249, 196, 0.25) 0%,
          rgba(255, 235, 59, 0.08) 30%,
          transparent 65%
        );
        animation: sun-pulse 5s ease-in-out infinite;
        pointer-events: none;
        
        .dawn & {
          background: radial-gradient(
            circle,
            rgba(255, 224, 178, 0.3) 0%,
            rgba(255, 183, 77, 0.06) 35%,
            transparent 65%
          );
        }
        
        .dusk & {
          background: radial-gradient(
            circle,
            rgba(255, 204, 188, 0.25) 0%,
            rgba(255, 138, 101, 0.06) 35%,
            transparent 65%
          );
        }
      }
    }

    // 阴天/多云：太阳弱化，无光芒，置于云层后
    &.weather-cloudy.sun {
      z-index: 1;
      width: 38px;
      height: 38px;
      left: 28px;
      top: 28px;
      opacity: 0.5;
      filter: blur(0.5px);
      box-shadow: 
        0 0 15px rgba(255, 235, 59, 0.2),
        0 0 30px rgba(255, 235, 59, 0.08);
      
      &::before {
        opacity: 0.4;
      }
      
      &::after {
        display: none;
      }
    }

    // 大风白天：太阳略弱于晴天，保留轻微光感
    &.weather-windy.sun {
      opacity: 0.88;
      box-shadow: 
        0 0 30px rgba(255, 235, 59, 0.5),
        0 0 60px rgba(255, 235, 59, 0.2);
    }
    
    &.moon {
      background: linear-gradient(145deg, #FFFFFF 5%, #F5F5F5 30%, #E8E8E8 60%, #D5D5D5 100%);
      box-shadow: 
        0 0 25px rgba(255, 255, 255, 0.35),
        0 0 50px rgba(200, 210, 230, 0.15),
        0 0 100px rgba(180, 200, 230, 0.08),
        inset -8px -6px 12px rgba(0, 0, 0, 0.12);
      animation: float 8s ease-in-out infinite;
      overflow: hidden;
      
      .night & {
        box-shadow: 
          0 0 30px rgba(255, 255, 255, 0.45),
          0 0 60px rgba(200, 210, 230, 0.2),
          0 0 120px rgba(180, 200, 230, 0.1),
          inset -8px -6px 12px rgba(0, 0, 0, 0.15);
      }
      
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 30% 20%, rgba(200, 200, 200, 0.5) 4%, transparent 12%),
          radial-gradient(circle at 70% 35%, rgba(200, 200, 200, 0.4) 3%, transparent 10%),
          radial-gradient(circle at 25% 60%, rgba(200, 200, 200, 0.3) 5%, transparent 14%),
          radial-gradient(circle at 60% 70%, rgba(200, 200, 200, 0.5) 4%, transparent 12%),
          radial-gradient(circle at 45% 40%, rgba(200, 200, 200, 0.2) 6%, transparent 16%);
      }

      &::after {
        content: '';
        position: absolute;
        top: -40px;
        left: -40px;
        right: -40px;
        bottom: -40px;
        background: radial-gradient(circle, rgba(200, 210, 230, 0.12) 0%, transparent 60%);
        animation: moon-glow 5s ease-in-out infinite;
      }
    }
  }

  // ==================== 星空 ====================
  .stars {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    
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
        top: -1px;
        left: -1px;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        background: white;
        border-radius: 50%;
        filter: blur(1.5px);
        opacity: 0.4;
      }
      
      @for $i from 1 through 25 {
        &:nth-child(#{$i}) {
          $size: if($i % 3 == 0, 3, if($i % 2 == 0, 2, 1));
          $duration: 1.5s + ($i % 12) * 0.15s;
          width: #{$size}px;
          height: #{$size}px;
          animation-duration: $duration;
          
          @if $size == 3 {
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
    
    .shooting-star {
      position: absolute;
      width: 80px;
      height: 1px;
      top: 18%;
      right: -80px;
      background: linear-gradient(to left, transparent, rgba(255, 255, 255, 0.8));
      transform: rotate(-35deg);
      animation: shooting 7s ease-in infinite;
      animation-delay: 3s;
      z-index: 3;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: -1px;
        width: 5px;
        height: 3px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.6);
      }
      
      &.shooting-star-2 {
        top: 40%;
        right: -60px;
        width: 60px;
        animation-delay: 9s;
        animation-duration: 6s;
        transform: rotate(-40deg);
      }
    }
  }
  
  // ==================== 云层 ====================
  .clouds {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    
    .cloud {
      position: absolute;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      animation: cloud-move 20s linear infinite;
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        background: inherit;
        border-radius: 50%;
      }
      
      &:nth-child(1) {
        width: 65px;
        height: 22px;
        top: 25px;
        left: -65px;
        animation-duration: 28s;
        filter: blur(0.5px);
        
        &::before {
          width: 28px;
          height: 28px;
          top: -12px;
          left: 12px;
        }
        
        &::after {
          width: 34px;
          height: 34px;
          top: -18px;
          right: 10px;
        }
      }
      
      &:nth-child(2) {
        width: 55px;
        height: 18px;
        top: 55px;
        left: -55px;
        opacity: 0.7;
        animation-duration: 35s;
        animation-delay: -18s;
        filter: blur(0.8px);
        
        &::before {
          width: 24px;
          height: 24px;
          top: -10px;
          left: 10px;
        }
        
        &::after {
          width: 28px;
          height: 28px;
          top: -14px;
          right: 8px;
        }
      }
      
      &:nth-child(3) {
        width: 45px;
        height: 16px;
        top: 85px;
        left: -45px;
        opacity: 0.55;
        animation-duration: 40s;
        animation-delay: -8s;
        filter: blur(1px);
        
        &::before {
          width: 20px;
          height: 20px;
          top: -9px;
          left: 8px;
        }
        
        &::after {
          width: 22px;
          height: 22px;
          top: -10px;
          right: 7px;
        }
      }

      &:nth-child(4) {
        width: 50px;
        height: 17px;
        top: 115px;
        left: -50px;
        opacity: 0.4;
        animation-duration: 45s;
        animation-delay: -22s;
        filter: blur(1.2px);
        
        &::before {
          width: 22px;
          height: 22px;
          top: -10px;
          left: 10px;
        }
        
        &::after {
          width: 25px;
          height: 25px;
          top: -12px;
          right: 8px;
        }
      }
      
      .night & {
        background: rgba(180, 200, 220, 0.35);
        filter: blur(2px);
      }
      
      .dawn & {
        background: rgba(255, 230, 200, 0.7);
        filter: blur(1px);
      }
      
      .dusk & {
        background: rgba(255, 200, 180, 0.6);
        filter: blur(1px);
      }
    }
  }

  // ==================== 雾气 ====================
  .mist {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 4;
    
    .mist-layer {
      position: absolute;
      width: 250%;
      height: 45%;
      filter: blur(12px);
      
      &.mist-1 {
        bottom: 15%;
        left: -50%;
        background: linear-gradient(to right, 
          transparent 0%, 
          rgba(255, 255, 255, 0.06) 15%, 
          rgba(255, 255, 255, 0.1) 40%, 
          rgba(255, 255, 255, 0.06) 65%, 
          transparent 100%
        );
        animation: mist-drift 14s ease-in-out infinite;
      }
      
      &.mist-2 {
        bottom: -5%;
        left: -60%;
        background: linear-gradient(to right, 
          transparent 0%, 
          rgba(255, 255, 255, 0.08) 20%, 
          rgba(255, 255, 255, 0.12) 50%, 
          rgba(255, 255, 255, 0.08) 80%, 
          transparent 100%
        );
        animation: mist-drift 18s ease-in-out infinite reverse;
        opacity: 0.8;
      }
    }
  }

  // ==================== 雨 ====================
  .rain {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 5;
    
    .drop {
      position: absolute;
      width: 1.5px;
      height: 18px;
      background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.6));
      border-radius: 0 0 2px 2px;
      animation: rain-drop 0.9s linear infinite;
      
      @for $i from 1 through 30 {
        &:nth-child(#{$i}) {
          $h: 14 + ($i % 5) * 3;
          height: #{$h}px;
          left: (($i * 3.3) % 100) * 1%;
          animation-delay: (($i * 0.07) % 2) * 1s;
          animation-duration: (0.6 + ($i % 8) * 0.08) * 1s;
          opacity: 0.3 + (($i % 10) * 0.04);
        }
      }
    }
    
    .rain-splash {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      
      .splash {
        position: absolute;
        bottom: 2px;
        width: 6px;
        height: 2px;
        border-radius: 50%;
        background: rgba(174, 194, 224, 0.3);
        animation: splash-pop 1.8s ease-out infinite;
        
        &::before, &::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 2px;
          height: 5px;
          background: rgba(174, 194, 224, 0.2);
          border-radius: 50% 50% 0 0;
          animation: splash-drop 1.8s ease-out infinite;
        }
        
        &::before {
          left: -3px;
          transform: rotate(-25deg);
          animation-delay: inherit;
        }
        
        &::after {
          right: -3px;
          transform: rotate(25deg);
          animation-delay: inherit;
        }
      }
    }
  }

  // ==================== 闪电 ====================
  .lightning-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 6;
    
    .lightning {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      animation: lightning-flash 10s ease-in-out infinite;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.6) 0%, rgba(200, 220, 255, 0.3) 30%, transparent 70%);
      }
    }
  }

  // ==================== 雪 ====================
  .snow {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 5;
    
    .snowflake {
      position: absolute;
      background: white;
      border-radius: 50%;
      animation: snow-drop 3s linear infinite;
      
      &::before {
        content: '';
        position: absolute;
        top: -1px;
        left: -1px;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        filter: blur(1px);
      }
      
      @for $i from 1 through 25 {
        &:nth-child(#{$i}) {
          $size: 3 + ($i % 4) * 1.5;
          width: #{$size}px;
          height: #{$size}px;
          left: (($i * 4) % 100) * 1%;
          animation-delay: (($i * 0.2) % 3) * 1s;
          animation-duration: (2 + ($i % 6) * 0.3) * 1s;
          opacity: 0.5 + (($i % 8) * 0.06);
          
          @if $size > 5 {
            box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
          }
        }
      }
    }
    
    .snow-ground {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 18px;
      z-index: 6;
      background: linear-gradient(to top, 
        rgba(255, 255, 255, 0.55) 0%, 
        rgba(255, 255, 255, 0.3) 40%, 
        rgba(255, 255, 255, 0.1) 70%,
        transparent 100%
      );
      border-radius: 0 0 16px 16px;
      
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 5%;
        width: 30%;
        height: 10px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 50% 50% 0 0;
        filter: blur(3px);
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 10%;
        width: 25%;
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50% 50% 0 0;
        filter: blur(3px);
      }
    }
  }

  // ==================== 风 ====================
  .wind {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 5;
    
    .wind-line {
      position: absolute;
      height: 1.5px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3), transparent);
      animation: wind-blow 3s linear infinite;
      border-radius: 1px;
      
      @for $i from 1 through 6 {
        &:nth-child(#{$i}) {
          top: (15 + $i * 13) * 1%;
          width: (25 + $i * 8) * 1px;
          animation-delay: ($i * 0.3) * 1s;
          opacity: 0.3 + ($i * 0.1);
          animation-duration: (2.5 + ($i % 3) * 0.5) * 1s;
        }
      }
    }
    
    .wind-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      left: -10px;
      animation: particle-drift 3s ease-in-out infinite;
      
      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 1px;
        background: linear-gradient(to left, rgba(255, 255, 255, 0.35), transparent);
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
      }
      
      @for $i from 1 through 10 {
        &:nth-child(n+7):nth-child(#{$i + 6}) {
          $size: 2 + ($i % 3);
          width: #{$size}px;
          height: #{$size}px;
          opacity: 0.3 + ($i % 5) * 0.1;
        }
      }
    }
  }
}

// ==================== 关键帧动画 ====================

@keyframes cloud-move {
  0% {
    transform: translateX(-130%) translateY(0);
  }
  25% {
    transform: translateX(-65%) translateY(-3px);
  }
  50% {
    transform: translateX(0%) translateY(-6px);
  }
  75% {
    transform: translateX(65%) translateY(-3px);
  }
  100% {
    transform: translateX(130%) translateY(0);
  }
}

@keyframes rain-drop {
  0% {
    transform: translateY(-15px) translateX(0) scaleY(0.8);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  85% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(190px) translateX(-15px) scaleY(1.3);
    opacity: 0;
  }
}

@keyframes splash-pop {
  0%, 60% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes splash-drop {
  0%, 60% { height: 0; opacity: 0; }
  70% { height: 5px; opacity: 0.4; }
  100% { height: 8px; opacity: 0; transform: translateY(-4px); }
}

@keyframes snow-drop {
  0% {
    transform: translateY(-15px) translateX(0) rotate(0deg) scale(0.8);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  30% {
    transform: translateY(40px) translateX(8px) rotate(90deg) scale(1.1);
  }
  60% {
    transform: translateY(100px) translateX(-5px) rotate(200deg) scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: translateY(190px) translateX(10px) rotate(360deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes sun-rays-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sun-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.55;
  }
}

@keyframes moon-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.12;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.2;
  }
}

@keyframes wind-blow {
  0% {
    transform: translateX(-30px) scaleX(0.3);
    opacity: 0;
  }
  20% {
    transform: translateX(10px) scaleX(1);
    opacity: 0.8;
  }
  70% {
    transform: translateX(100px) scaleX(1.3);
    opacity: 0.5;
  }
  100% {
    transform: translateX(150px) scaleX(0.4);
    opacity: 0;
  }
}

@keyframes particle-drift {
  0% {
    transform: translateX(0) translateY(0) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
    transform: translateX(30px) translateY(-3px) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateX(120px) translateY(5px) scale(0.8);
  }
  100% {
    transform: translateX(280px) translateY(-2px) scale(0.2);
    opacity: 0;
  }
}

@keyframes lightning-flash {
  0%, 100% { opacity: 0; }
  42% { opacity: 0; }
  43% { opacity: 0.25; }
  44% { opacity: 0; }
  45.5% { opacity: 0.4; }
  46% { opacity: 0.1; }
  46.5% { opacity: 0.35; }
  47% { opacity: 0; }
}

@keyframes shooting {
  0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 0; }
  3% { opacity: 1; }
  12% { transform: translateX(-220px) translateY(100px) rotate(-35deg); opacity: 0; }
  100% { opacity: 0; }
}

@keyframes mist-drift {
  0%, 100% { transform: translateX(-20%); }
  50% { transform: translateX(5%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.15;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}
</style>
