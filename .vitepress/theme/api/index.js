/**
 * 获取一言
 * @param {string} [rule="updated"] - 文章的排序规则，可以是 "created" 或 "updated"
 */
export const getHitokoto = async () => {
  // 在开发环境使用代理
  if (import.meta.env.DEV) {
    const result = await fetch("/api/hitokoto");
    return await result.json();
  }

  // 生产环境：使用 Promise.any 竞速，哪个接口快用哪个
  const targets = [
    "https://v1.hitokoto.cn",
    "https://international.v1.hitokoto.cn/"
  ];

  try {
    const result = await Promise.any(
      targets.map(url => 
        fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url))
          .then(res => res.json())
      )
    );
    return result;
  } catch (error) {
    console.error("获取一言失败:", error);
    return {
      hitokoto: "即使是微不足道的光芒，也能照亮前行的路。",
      from: "系统默认"
    };
  }
};

/* 
  获取毒鸡汤
*/
export const geBadsoup = async () => {
  const result = await fetch("https://www.7ed.net/soup/api");
  const badsoup = await result.json();
  return badsoup;
}

/**
 * 获取给定网址的站点图标和描述
 * @param {string} url - 站点 URL
 * @returns {Promise<{iconUrl: string, description: string}>}
 */
export const getSiteInfo = async (url) => {
  const details = {
    iconUrl: null,
    title: null,
    description: null,
  };
  try {
    // 站点数据
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    // 获取页面标题
    const titleElement = doc.querySelector("title");
    details.title = titleElement ? titleElement.textContent : "暂无标题";
    // 获取 icon
    let iconLink =
      doc.querySelector("link[rel='shortcut icon']") || doc.querySelector("link[rel='icon']");
    if (iconLink) {
      details.iconUrl = new URL(iconLink.getAttribute("href"), url).href;
    } else {
      details.iconUrl = new URL("/favicon.ico", url).href;
    }
    // 获取描述
    const metaDescription = doc.querySelector("meta[name='description']");
    details.description = metaDescription ? metaDescription.content : "暂无站点描述";
  } catch (error) {
    console.error("获取站点信息失败：", error);
  }
  return details;
};

/**
 * Meting
 * @param {id} string - 歌曲ID
 * @param {server} string - 服务器
 * @param {type} string - 类型
 * @returns {Promise<Object>} - 音乐详情
 */
export const getMusicList = async (url, id, server = "netease", type = "playlist") => {
  try {
    console.log(`正在请求音乐API: ${url}?server=${server}&type=${type}&id=${id}`);
    
    const response = await fetch(`${url}?server=${server}&type=${type}&id=${id}`);
    
    if (!response.ok) {
      throw new Error(`音乐API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const list = await response.json();
    
    if (!Array.isArray(list)) {
      console.warn('API返回的数据不是数组格式', list);
      return [];
    }
    
    console.log(`成功获取到${list.length}首歌曲`);
    
    return list.map((song) => {
      // 防止解构出错，先进行检查
      if (!song || typeof song !== 'object') {
        console.warn('歌曲数据无效', song);
        return {
          name: '未知歌曲',
          artist: '未知艺术家',
          url: '',
          cover: '',
          lrc: ''
        };
      }
      
      const { pic, ...data } = song;
      return {
        ...data,
        cover: pic || '',
      };
    });
  } catch (error) {
    console.error('获取音乐列表失败:', error);
    return [];
  }
};

/**
 * 站点统计数据
 */
export const getStatistics = async (key) => {
  const result = await fetch(`https://v6-widget.51.la/v6/${key}/quote.js`);
  const title = [
    "最近活跃",
    "今日人数",
    "今日访问",
    "昨日人数",
    "昨日访问",
    "本月访问",
    "总访问量",
  ];
  const data = await result.text();
  let num = data.match(/(<\/span><span>).*?(\/span><\/p>)/g);
  num = num.map((el) => {
    const val = el.replace(/(<\/span><span>)/g, "");
    return val.replace(/(<\/span><\/p>)/g, "");
  });
  const statistics = {};
  for (let i = 0; i < num.length; i++) {
    if (i === num.length - 1) continue;
    statistics[title[i]] = num[i];
  }
  return statistics;
};

/**
 * 获取最近的中国节假日
 * @returns {Promise<Object>} 最近的中国节假日信息
 */
export const getRecentHoliday = async () => {
  const url = "https://date.nager.at/api/v3/NextPublicHolidays/CN"; // 中国节假日
  try {
    const response = await fetch(url);
    const holidays = await response.json();
    if (holidays.length > 0) {
      const nextHoliday = holidays[0];
      // console.log("最近节假日：", nextHoliday.name, nextHoliday.date);
      return nextHoliday;
    } else {
      // console.log("未找到节假日数据");
      return null;
    }
  } catch (error) {
    // console.error("获取节假日数据失败：", error);
    return null;
  }
}

/**
 * 获取和风天气实时数据
 * @param {string} key - 和风天气API密钥
 * @param {string} location - 位置，可以是LocationID或经纬度坐标
 * @param {Object} options - 请求选项
 * @param {string} options.lang - 语言，默认为'zh'
 * @param {string} options.unit - 单位，'m'公制(默认)，'i'英制
 * @param {boolean} options.isFree - 是否使用免费版API，默认为true
 * @returns {Promise<Object>} - 和风天气实时数据
 */
export const getQWeatherNowData = async (key, location, options = {}) => {
  try {
    const { lang = 'zh', unit = 'm', isFree = true } = options;
    // 和风天气API的URL
    const baseUrl = isFree ? 'https://devapi.qweather.com' : 'https://api.qweather.com';

    // console.log('实况天气请求URL:', `${baseUrl}/v7/weather/now?key=${key}&location=${location}`);
    
    const response = await fetch(
      `${baseUrl}/v7/weather/now?key=${key}&location=${location}&lang=${lang}&unit=${unit}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`和风天气API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('实况天气API返回数据:', JSON.stringify(data));

    if (data.code !== '200') {
      throw new Error(data.msg || '和风天气数据获取失败');
    }

    return data;
  } catch (error) {
    console.error('获取和风天气数据错误:', error);
    throw error;
  }
};

/**
 * 获取和风天气天气预报数据
 * @param {string} key - 和风天气API密钥
 * @param {string} location - 位置，可以是LocationID或经纬度坐标
 * @param {string} days - 天数，可选值：3,7,10,15,30
 * @param {Object} options - 请求选项
 * @param {string} options.lang - 语言，默认为'zh'
 * @param {string} options.unit - 单位，'m'公制(默认)，'i'英制
 * @param {boolean} options.isFree - 是否使用免费版API，默认为true
 * @returns {Promise<Object>} - 和风天气预报数据
 */
export const getQWeatherForecastData = async (key, location, days = '3', options = {}) => {
  try {
    const { lang = 'zh', unit = 'm', isFree = true } = options;
    // 和风天气API的URL
    const baseUrl = isFree ? 'https://devapi.qweather.com' : 'https://api.qweather.com';

    // console.log('天气预报请求URL:', `${baseUrl}/v7/weather/${days}d?key=${key}&location=${location}`);

    const response = await fetch(
      `${baseUrl}/v7/weather/${days}d?key=${key}&location=${location}&lang=${lang}&unit=${unit}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`和风天气API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('天气预报API返回数据:', JSON.stringify(data));

    if (data.code !== '200') {
      throw new Error(data.msg || '和风天气数据获取失败');
    }

    return data;
  } catch (error) {
    console.error('获取和风天气预报数据错误:', error);
    throw error;
  }
};

/**
 * 获取天气数据
 * @param {Object} config - 配置参数
 * @param {string} config.type - API类型，只支持'qweather'
 * @param {Object} config.params - API参数
 * @param {Object} config.thirdParty - 第三方API配置
 * @param {Object} position - 位置信息，包含经纬度
 * @returns {Promise<Object>} - 处理后的天气数据
 */
export const getWeather = async (config, position) => {
  try {
    // 确保config是有效对象
    config = config || {};

    // 解构配置
    const params = config.params || {};
    const thirdParty = config.thirdParty || {};

    // 默认位置: 北京
    const defaultCoords = { longitude: 116.41, latitude: 39.91 };
    const { longitude, latitude } = position?.coords || defaultCoords;

    // 初始化weatherData变量
    let weatherData = null;

    // 和风天气API
    const key = thirdParty?.qweather?.key || '';
    
    // 优先使用选择的城市ID，其次使用浏览器获取的经纬度，最后使用传入的位置参数
    let location = params.location;
    if (!location && position?.coords) {
      const longitude = parseFloat(position.coords.longitude).toFixed(2);
      const latitude = parseFloat(position.coords.latitude).toFixed(2);
      location = `${longitude},${latitude}`;
    }
    
    if (!location) {
      console.log('没有有效的位置信息，尝试获取当前坐标');
      location = await getCurrentCoordinates();
    }
    
    if (!location) {
      // 默认北京坐标
      location = '116.41,39.91';
    }
    
    const lang = params.lang || 'zh';
    const unit = params.unit || 'm';
    const days = params.days || '3';
    const isFree = params.isFree === undefined ? true : params.isFree;

    if (!key) {
      throw new Error('和风天气API密钥未配置');
    }
    
    console.log('使用和风天气API，location:', location);
    
    // 先通过坐标获取位置名称
    let locationName = '未知位置';
    
    // 如果是城市ID，直接使用传入的城市名称
    if (params.cityName) {
      locationName = params.cityName;
    } else if (location) {
      try {
        const cityInfo = await getQWeatherCityLookup(key, location, { isFree });
        if (cityInfo?.location?.[0]) {
          const cityData = cityInfo.location[0];
          locationName = cityData.name;
          
          // 如果有区/县级名称，且与城市名不同，则添加到名称中
          if (cityData.adm2 && cityData.name !== cityData.adm2) {
            locationName = `${cityData.name}, ${cityData.adm2}`;
          }
        }
      } catch (err) {
        console.warn('位置查询失败:', err);
      }
    }

    console.log('最终使用的位置名称:', locationName);

    try {
      // 获取实时天气
      const nowResult = await getQWeatherNowData(key, location, { lang, unit, isFree });
      const now = nowResult.now;
      
      // 获取天气预报
      const forecastResult = await getQWeatherForecastData(key, location, days, { lang, unit, isFree });
      const forecast = forecastResult.daily;
      
      // 判断天气类型
      let weatherType = 'sunny';
      const text = now.text;
      
      if (text.includes('晴')) {
        weatherType = 'sunny';
      } else if (text.includes('云') || text.includes('阴')) {
        weatherType = 'cloudy';
      } else if (text.includes('雨')) {
        weatherType = 'rainy';
      } else if (text.includes('雪')) {
        weatherType = 'snowy';
      } else if (parseInt(now.windScale) > 4) {
        weatherType = 'windy';
      }
      
      weatherData = {
        location: locationName || now.fxLink?.split('/')[4] || '未知位置',
        temperature: parseInt(now.temp),
        weatherType,
        weatherText: now.text,
        humidity: parseInt(now.humidity),
        windDirection: now.windDir,
        windSpeed: `${now.windScale}级`,
        forecast: forecast.map(day => ({
          date: day.fxDate,
          dayWeather: day.textDay,
          nightWeather: day.textNight,
          dayTemp: parseInt(day.tempMax),
          nightTemp: parseInt(day.tempMin),
          windDirection: day.windDirDay,
          windSpeed: `${day.windScaleDay}级`
        }))
      };
    } catch (error) {
      console.error('获取天气数据失败:', error);
      throw error;
    }

    return weatherData;
  } catch (error) {
    console.error('获取天气数据错误:', error);
    throw error;
  }
};

/**
 * 和风天气城市搜索API
 * @param {string} key - 和风天气API密钥
 * @param {string} location - 需要查询的城市名称、经纬度坐标、LocationID或Adcode
 * @param {Object} options - 请求选项
 * @param {string} [options.adm] - 城市的上级行政区划，用于排除重名城市
 * @param {string} [options.range] - 搜索范围，可设定只在某个国家内搜索，默认全球范围
 * @param {number} [options.number] - 返回结果的数量，取值范围1-20，默认10个
 * @param {string} [options.lang] - 多语言设置，默认中文
 * @param {boolean} [options.isFree] - 是否使用免费版API，默认为true
 * @returns {Promise<Object>} - 城市搜索结果
 */
export const getQWeatherCityLookup = async (key, location, options = {}) => {
  try {
    const {
      adm = '',
      range = '',
      number = 10,
      lang = 'zh',
      isFree = true
    } = options;

    if (!key) {
      throw new Error('和风天气API密钥未配置');
    }

    // 修正URL，免费和商业版都使用同一个域名
    const baseUrl = 'https://geoapi.qweather.com';

    // 构建请求URL
    let url = `${baseUrl}/v2/city/lookup?key=${key}&location=${encodeURIComponent(location)}&number=${number}&lang=${lang}`;

    // 添加可选参数
    if (adm) {
      url += `&adm=${encodeURIComponent(adm)}`;
    }
    if (range) {
      url += `&range=${range}`;
    }

    // console.log('城市查询请求URL:', url);

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error('和风天气城市搜索API请求失败');
    }

    const data = await response.json();
    // console.log('城市搜索API返回数据:', JSON.stringify(data));

    if (data.code !== '200') {
      throw new Error(data.msg || '城市搜索失败');
    }

    return data;
  } catch (error) {
    console.error('城市搜索错误:', error);
    throw error;
  }
};

/**
 * 获取用户当前位置的经纬度并格式化
 * @returns {Promise<string|null>} - 格式化后的经纬度字符串，格式为"经度,纬度"，小数点后保留两位
 */
export const getCurrentCoordinates = async () => {
  try {
    if (!navigator.geolocation) {
      console.warn('浏览器不支持地理位置获取');
      return null;
    }
    
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => {
          console.warn('浏览器地理位置获取失败:', err.message);
          reject(err);
        },
        { timeout: 10000, maximumAge: 3600000 } // 1小时内缓存位置
      );
    });
    
    // 格式化经纬度到小数点后两位
    const longitude = parseFloat(position.coords.longitude).toFixed(2);
    const latitude = parseFloat(position.coords.latitude).toFixed(2);
    const formattedCoords = `${longitude},${latitude}`;
    
    // console.log('浏览器地理位置获取成功:', formattedCoords);
    return formattedCoords;
  } catch (error) {
    console.error('获取位置坐标错误:', error);
    return null;
  }
};
