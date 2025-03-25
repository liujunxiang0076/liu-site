/**
 * 获取一言
 * @param {string} [rule="updated"] - 文章的排序规则，可以是 "created" 或 "updated"
 */
export const getHitokoto = async () => {
  const result = await fetch("https://v1.hitokoto.cn");
  const hitokoto = await result.json();
  return hitokoto;
};

/* 
  获取毒鸡汤
*/
export const geBadsoup = async () => {
  const result = await fetch("https://api.7ed.net/soup/api");
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
  const result = await fetch(`${url}?server=${server}&type=${type}&id=${id}`);
  const list = await result.json();
  return list.map((song) => {
    const { pic, ...data } = song;
    return {
      ...data,
      cover: pic,
    };
  });
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
 * 获取彩云天气数据
 * @param {string} token - 彩云天气API token
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @returns {Promise<Object>} - 天气数据
 */
export const getCaiYunData = async (token, longitude, latitude) => {
  try {
    // 调用彩云天气API
    const response = await fetch(
      `https://api.caiyunapp.com/v2.6/${token}/${longitude},${latitude}/weather?alert=true&dailysteps=1&hourlysteps=24&lang=zh_CN`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('天气API请求失败');
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.error || '天气数据获取失败');
    }

    return data.result;
  } catch (error) {
    console.error('获取天气数据错误:', error);
    throw error;
  }
};

/**
 * 获取百度地图天气数据
 * @param {string} ak - 百度地图API密钥
 * @param {string} district_id - 区域ID
 * @param {string} [data_type='all'] - 数据类型，默认为'all'
 * @returns {Promise<Object>} - 百度地图天气数据
 */
export const getBaiduWeatherData = async (ak, district_id, data_type = 'all') => {
  try {
    const response = await fetch(
      `https://api.map.baidu.com/weather/v1/?district_id=${district_id}&data_type=${data_type}&ak=${ak}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('百度天气API请求失败');
    }

    const data = await response.json();

    if (data.status !== 0) {
      throw new Error(data.message || '百度天气数据获取失败');
    }

    return data.result;
  } catch (error) {
    console.error('获取百度天气数据错误:', error);
    throw error;
  }
};


/**
 * 获取高德地图天气数据
 * @param {string} key - 高德地图API密钥
 * @param {string} city - 城市编码
 * @param {string} [extensions='base'] - 气象类型，默认为'base'实况天气
 * @returns {Promise<Object>} - 高德地图天气数据
 */
export const getAmapWeatherData = async (key, city, extensions = 'base') => {
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}&extensions=${extensions}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('高德天气API请求失败');
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.info || '高德天气数据获取失败');
    }

    return data;
  } catch (error) {
    console.error('获取高德天气数据错误:', error);
    throw error;
  }
};

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
    const baseUrl = isFree ? 'https://devapi.qweather.com' : 'https://api.qweather.com';

    const response = await fetch(
      `${baseUrl}/v7/weather/now?key=${key}&location=${location}&lang=${lang}&unit=${unit}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('和风天气API请求失败');
    }

    const data = await response.json();

    if (data.code !== '200') {
      throw new Error(data.msg || '和风天气数据获取失败');
    }

    return data;
  } catch (error) {
    console.error('获取和风天气实时数据错误:', error);
    throw error;
  }
};

/**
 * 获取和风天气预报数据
 * @param {string} key - 和风天气API密钥
 * @param {string} location - 位置，可以是LocationID或经纬度坐标
 * @param {string} days - 预报天数，可选 '3'|'7'|'10'|'15'|'30'
 * @param {Object} options - 请求选项
 * @param {string} options.lang - 语言，默认为'zh'
 * @param {string} options.unit - 单位，'m'公制(默认)，'i'英制
 * @param {boolean} options.isFree - 是否使用免费版API，默认为true
 * @returns {Promise<Object>} - 和风天气预报数据
 */
export const getQWeatherForecastData = async (key, location, days = '3', options = {}) => {
  try {
    const { lang = 'zh', unit = 'm', isFree = true } = options;
    const baseUrl = isFree ? 'https://devapi.qweather.com' : 'https://api.qweather.com';

    // 验证天数参数
    const validDays = ['3', '7', '10', '15', '30'];
    if (!validDays.includes(days)) {
      days = '3'; // 默认使用3天预报
    }

    const response = await fetch(
      `${baseUrl}/v7/weather/${days}d?key=${key}&location=${location}&lang=${lang}&unit=${unit}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('和风天气API请求失败');
    }

    const data = await response.json();

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
 * 高德IP定位API - 自动获取当前IP
 * @param {string} key - 高德地图API密钥
 * @param {string} [ip] - IP地址（可选，不传则使用当前IP）
 * @returns {Promise<Object>} - IP定位结果
 */
export const getAmapIPLocation = async (key, ip = '') => {
  try {
    // 获取当前IP地址
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        console.log('你的 IP 地址是：', data.ip);
        ip = data.ip;
      })
      .catch(error => {
        console.error('获取 IP 地址失败：', error);
      });

    // 构建URL，不传IP参数时高德API会自动使用请求方IP
    let url = `https://restapi.amap.com/v3/ip?key=${key}`;
    // 仅当明确提供IP时才添加到请求参数
    if (ip) {
      url += `&ip=${ip}`;
    }

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error('高德IP定位API请求失败');
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.info || '高德IP定位失败');
    }

    console.log('IP定位成功:', data);

    return {
      province: data.province || '',
      city: data.city || '',
      adcode: data.adcode || '',
      rectangle: data.rectangle || ''
    };
  } catch (error) {
    console.error('高德IP定位错误:', error);
    throw error;
  }
};

/**
 * 统一获取天气数据接口
 * @param {Object} config - 天气API配置
 * @param {string} config.type - API类型: 'caiyun' 或 'baidu' 或 'amap' 或 'qweather'
 * @param {Object} config.params - API参数
 * @param {Object} config.thirdParty - 第三方API配置
 * @param {Object} [position] - 位置信息（经纬度）
 * @returns {Promise<Object>} - 标准化的天气数据
 */
export const getWeather = async (config, position) => {
  try {
    // 确保config是有效对象
    config = config || {};

    // 解构配置
    const apiType = config.type || 'caiyun';
    const params = config.params || {};
    const thirdParty = config.thirdParty || {};

    // 默认位置: 北京
    const defaultCoords = { longitude: 116.41, latitude: 39.91 };
    const { longitude, latitude } = position?.coords || defaultCoords;

    // 根据API类型选择不同的处理方式
    let weatherData = null;

    if (apiType === 'caiyun') {
      // 彩云天气API
      const token = thirdParty?.caiyun?.token || '';

      if (!token) {
        throw new Error('彩云天气API Token未配置');
      }

      const result = await getCaiYunData(token, longitude, latitude);

      // 处理数据
      const realtime = result.realtime;
      const skycon = realtime.skycon;

      // 判断天气类型
      let weatherType = 'sunny';
      if (skycon.includes('CLEAR') || skycon.includes('FAIR')) {
        weatherType = 'sunny';
      } else if (skycon.includes('CLOUDY') || skycon.includes('PARTLY_CLOUDY')) {
        weatherType = 'cloudy';
      } else if (skycon.includes('RAIN')) {
        weatherType = 'rainy';
      } else if (skycon.includes('SNOW')) {
        weatherType = 'snowy';
      } else if (realtime.wind.speed > 6) {
        weatherType = 'windy';
      }

      // 获取风向
      const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
      const windDirection = directions[Math.round(realtime.wind.direction / 45) % 8];

      // 获取天气文本
      const weatherText = realtime.text;

      weatherData = {
        location: result.alert?.adcode_name?.replace('市', '') || '未知位置',
        temperature: Math.round(realtime.temperature),
        weatherType,
        weatherText,
        humidity: Math.round(realtime.humidity * 100),
        windDirection,
        windSpeed: `${realtime.wind.speed.toFixed(1)}m/s`
      };
    } else if (apiType === 'baidu') {
      // 百度地图天气API
      const ak = thirdParty?.baidu?.key || '';
      const districtId = params.districtId || '222405';

      if (!ak) {
        throw new Error('百度地图API密钥未配置');
      }

      const result = await getBaiduWeatherData(ak, districtId);
      const now = result.now;

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
      } else if (now.wind_class.includes('强') || parseInt(now.wind_dir_degree) > 30) {
        weatherType = 'windy';
      }

      weatherData = {
        location: result.location?.name || '未知位置',
        temperature: parseInt(now.temp),
        weatherType,
        weatherText: now.text,
        humidity: parseInt(now.rh),
        windDirection: now.wind_dir,
        windSpeed: now.wind_class
      };
    } else if (apiType === 'amap') {
      // 高德地图天气API
      const key = thirdParty?.amap?.webServerKey || '';

      let city = params.city || '110101';

      if (!key) {
        throw new Error('高德地图API密钥未配置');
      }

      // 如果没有指定城市，尝试使用IP定位
      if (!city) {
        try {
          console.log('正在通过IP获取位置...');
          const ipLocation = await getAmapIPLocation(key);

          if (ipLocation.adcode) {
            console.log('使用IP定位获取的adcode:', ipLocation.adcode);
            city = ipLocation.adcode;
          } else if (ipLocation.city) {
            console.log('使用IP定位获取的城市名:', ipLocation.city);
            // 尝试根据城市名称自动获取adcode
            city = ipLocation.city;
          } else {
            console.log('IP定位未返回有效城市信息，使用默认北京');
            city = '110101'; // 默认北京
          }
        } catch (error) {
          console.warn('IP定位失败，使用默认城市:', error);
          city = '110101'; // 默认北京
        }
      } else if (!city) {
        city = '110101'; // 默认北京
      }

      console.log('使用城市编码获取天气:', city);
      const result = await getAmapWeatherData(key, city);

      if (!result.lives || result.lives.length === 0) {
        throw new Error('高德天气API未返回有效数据');
      }

      const live = result.lives[0]; // 实况天气数据

      // 判断天气类型
      let weatherType = 'sunny';
      const weather = live.weather;
      if (weather.includes('晴')) {
        weatherType = 'sunny';
      } else if (weather.includes('云') || weather.includes('阴')) {
        weatherType = 'cloudy';
      } else if (weather.includes('雨')) {
        weatherType = 'rainy';
      } else if (weather.includes('雪')) {
        weatherType = 'snowy';
      } else if (parseInt(live.windpower) > 4) {
        weatherType = 'windy';
      }

      weatherData = {
        location: live.city || '未知位置',
        temperature: parseInt(live.temperature),
        weatherType,
        weatherText: live.weather,
        humidity: parseInt(live.humidity),
        windDirection: live.winddirection,
        windSpeed: `${live.windpower}级`
      };
    } else if (apiType === 'qweather') {
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
      try {
        const cityInfo = await getQWeatherCityLookup(key, location, { isFree });
        console.log('城市查询返回结果:', JSON.stringify(cityInfo));
        
        if (cityInfo && cityInfo.location && cityInfo.location.length > 0) {
          // 使用第一个结果的城市名
          const cityData = cityInfo.location[0];
          console.log('城市数据:', JSON.stringify(cityData));
          
          // 优先使用城市名称，如果有区/县级名称则使用
          if (cityData.adm2 && cityData.name !== cityData.adm2) {
            // 如果区/县名不同于城市名，优先使用区/县名
            locationName = cityData.name;
          } else if (cityData.adm2) {
            // 否则使用城市名
            locationName = cityData.adm2;
          } else if (cityData.name) {
            // 兜底使用名称字段
            locationName = cityData.name;
          }
          
          console.log('获取到位置名称:', locationName);
        } else {
          // 如果城市查询API没有返回结果，尝试使用高德地图IP定位
          try {
            console.log('尝试使用高德地图IP定位');
            const amapKey = thirdParty?.amap?.webServerKey;
            if (amapKey) {
              const ipLocation = await getAmapIPLocation(amapKey);
              if (ipLocation && ipLocation.city) {
                locationName = ipLocation.city.replace('市', '');
                console.log('通过高德IP定位获取城市名:', locationName);
              }
            }
          } catch (ipErr) {
            console.warn('高德IP定位失败:', ipErr);
          }
        }
      } catch (err) {
        console.warn('获取位置名称失败:', err);
        // 尝试使用高德地图IP定位作为备选
        try {
          console.log('尝试使用高德地图IP定位');
          const amapKey = thirdParty?.amap?.webServerKey;
          if (amapKey) {
            const ipLocation = await getAmapIPLocation(amapKey);
            if (ipLocation && ipLocation.city) {
              locationName = ipLocation.city.replace('市', '');
              console.log('通过高德IP定位获取城市名:', locationName);
            }
          }
        } catch (ipErr) {
          console.warn('高德IP定位也失败:', ipErr);
        }
      }
      
      // 获取实时天气和预报数据
      const [nowResult, forecastResult] = await Promise.all([
        getQWeatherNowData(key, location, { lang, unit, isFree }),
        getQWeatherForecastData(key, location, days, { lang, unit, isFree })
      ]);

      const now = nowResult.now;
      const forecast = forecastResult.daily;

      // 判断天气类型
      let weatherType = 'sunny';
      const iconCode = parseInt(now.icon);

      // 参考和风天气图标代码: https://dev.qweather.com/docs/resource/icons/
      if (iconCode === 100 || iconCode === 150) {
        weatherType = 'sunny';  // 晴
      } else if ([101, 102, 103, 151, 152, 153].includes(iconCode)) {
        weatherType = 'cloudy'; // 多云
      } else if ([104, 154].includes(iconCode)) {
        weatherType = 'cloudy'; // 阴
      } else if (iconCode >= 300 && iconCode < 400) {
        weatherType = 'rainy';  // 雨
      } else if (iconCode >= 400 && iconCode < 500) {
        weatherType = 'snowy';  // 雪
      } else if ([200, 201, 202, 203, 204, 205, 206, 207, 208].includes(iconCode)) {
        weatherType = 'windy';  // 风
      }

      weatherData = {
        location: locationName,
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
    } else {
      throw new Error(`不支持的天气API类型: ${apiType}`);
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

    // 根据是否免费选择正确的基础URL
    const baseUrl = isFree ? 'https://devapi.qweather.com' : 'https://geoapi.qweather.com';

    // 构建请求URL
    let url = `${baseUrl}/v2/city/lookup?key=${key}&location=${encodeURIComponent(location)}&number=${number}&lang=${lang}`;

    // 添加可选参数
    if (adm) {
      url += `&adm=${encodeURIComponent(adm)}`;
    }
    if (range) {
      url += `&range=${range}`;
    }

    console.log('城市搜索请求URL:', url);

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error('和风天气城市搜索API请求失败');
    }

    const data = await response.json();
    console.log('城市搜索API返回数据:', JSON.stringify(data));

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
 * 获取当前城市信息
 * @param {string} key - 高德地图API密钥
 * @returns {Promise<Object>} - 当前城市信息
 */
export const getCurrentCityInfo = async (key) => {
  try {
    if (!key) {
      throw new Error('高德地图API密钥未配置');
    }
    
    // 尝试获取浏览器地理位置
    let position = null;
    let formattedCoords = null;
    
    if (navigator.geolocation) {
      try {
        position = await new Promise((resolve, reject) => {
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
        formattedCoords = `${longitude},${latitude}`;
        
        console.log('浏览器地理位置获取成功:', formattedCoords);
      } catch (locErr) {
        console.warn('浏览器定位失败:', locErr);
      }
    }

    // 获取当前IP地址
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) {
      throw new Error('获取IP地址失败');
    }
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // 使用高德IP定位API获取城市信息
    const url = `https://restapi.amap.com/v3/ip?key=${key}&ip=${ip}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error('高德IP定位API请求失败');
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.info || '高德IP定位失败');
    }

    return {
      province: data.province || '',
      city: data.city || '',
      adcode: data.adcode || '',
      rectangle: data.rectangle || '',
      coordinates: formattedCoords // 返回格式化后的经纬度
    };
  } catch (error) {
    console.error('获取当前城市信息错误:', error);
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
    
    console.log('浏览器地理位置获取成功:', formattedCoords);
    return formattedCoords;
  } catch (error) {
    console.error('获取位置坐标错误:', error);
    return null;
  }
};
