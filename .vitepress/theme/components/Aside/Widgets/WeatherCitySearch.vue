<template>
  <div class="city-search">
    <div class="search-input">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('weather.searchCity')"
        @input="handleInput"
      />
      <button @click="search" :disabled="loading || !searchQuery">
        <span class="iconfont icon-search"></span>
      </button>
    </div>
    
    <div v-if="loading" class="search-loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="error" class="search-error">
      {{ t('weather.searchError') }}
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div 
        v-for="city in searchResults" 
        :key="city.id" 
        class="city-item"
        @click="selectCity(city)"
      >
        <div class="city-name">{{ city.name }}</div>
        <div class="city-detail">
          {{ city.adm2 ? city.adm2 + ', ' : '' }}{{ city.adm1 }}
        </div>
      </div>
    </div>
    
    <div v-else-if="hasSearched && searchResults.length === 0" class="no-results">
      {{ t('weather.noResults') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useData } from 'vitepress';
import { useI18n } from '../../../i18n';
import { getQWeatherCityLookup } from '../../../api';

const { t } = useI18n();
const { theme } = useData();
const emit = defineEmits(['select']);

const searchQuery = ref('');
const searchResults = ref([]);
const loading = ref(false);
const error = ref(false);
const hasSearched = ref(false);
let debounceTimer = null;

const handleInput = () => {
  clearTimeout(debounceTimer);
  if (searchQuery.value.trim().length > 1) {
    debounceTimer = setTimeout(() => {
      search();
    }, 500);
  }
};

const search = async () => {
  if (!searchQuery.value.trim() || loading.value) return;
  
  loading.value = true;
  error.value = false;
  searchResults.value = [];
  
  try {
    const qweatherKey = theme.value.thirdParty?.qweather?.key;
    if (!qweatherKey) {
      throw new Error('未配置和风天气API密钥');
    }
    
    const data = await getQWeatherCityLookup(
      qweatherKey, 
      searchQuery.value, 
      { number: 10 }
    );
    
    if (data && data.location) {
      searchResults.value = data.location.map(city => ({
        id: city.id,
        name: city.name,
        adm1: city.adm1,
        adm2: city.adm2,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      }));
    }
    
    hasSearched.value = true;
  } catch (err) {
    console.error('城市搜索错误:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const selectCity = (city) => {
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;
  error.value = false;
  
  emit('select', {
    id: city.id,
    name: city.name,
    adm1: city.adm1,
    adm2: city.adm2,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    displayName: city.adm2 && city.name !== city.adm2 
      ? `${city.name}, ${city.adm2}` 
      : city.name
  });
};

watch(searchQuery, (newValue) => {
  if (!newValue.trim()) {
    searchResults.value = [];
    hasSearched.value = false;
  }
});
</script>

<style lang="scss" scoped>
.city-search {
  margin-bottom: 10px;
  
  .search-input {
    display: flex;
    margin-bottom: 8px;
    
    input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--vp-c-border);
      border-radius: 4px 0 0 4px;
      background-color: var(--vp-c-bg-soft);
      color: var(--vp-c-text);
      font-size: 14px;
      outline: none;
      
      &:focus {
        border-color: var(--vp-c-brand);
      }
    }
    
    button {
      padding: 6px 10px;
      background-color: var(--vp-c-brand);
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  
  .search-loading {
    display: flex;
    justify-content: center;
    padding: 10px 0;
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top-color: var(--vp-c-brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  .search-error {
    color: #ff5252;
    font-size: 14px;
    text-align: center;
    padding: 8px 0;
  }
  
  .search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--vp-c-border);
    border-radius: 4px;
    background-color: var(--vp-c-bg-soft);
    
    .city-item {
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid var(--vp-c-border);
      transition: background-color 0.2s;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: var(--vp-c-bg-mute);
      }
      
      .city-name {
        font-weight: bold;
        font-size: 14px;
      }
      
      .city-detail {
        font-size: 12px;
        color: var(--vp-c-text-2);
      }
    }
  }
  
  .no-results {
    text-align: center;
    padding: 8px 0;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
