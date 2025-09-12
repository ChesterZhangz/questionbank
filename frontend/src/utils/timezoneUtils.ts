// 时区定位和管理工具

// 翻译函数类型
export type TranslationFunction = (key: string, params?: Record<string, any>) => string;

// 检测当前语言环境
const detectLocale = (t?: TranslationFunction): string => {
  if (!t) return 'zh-CN';
  
  // 通过测试翻译来判断当前语言
  const testTranslation = t('utils.timezoneUtils.names.Asia_Shanghai');
  if (testTranslation && testTranslation.includes('China Standard Time')) {
    return 'en-US';
  }
  return 'zh-CN';
};

// 直接设置语言环境的格式化函数
export const formatTimezoneTimeWithLocale = (date: Date, timezone: string, locale: 'zh-CN' | 'en-US' = 'zh-CN'): string => {
  try {
    return date.toLocaleString(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('无法格式化时区时间:', error);
    return date.toLocaleString('zh-CN');
  }
};

// 获取用户当前位置的时区
export const getUserTimezone = (): string => {
  try {
    // 尝试使用 Intl.DateTimeFormat().resolvedOptions().timeZone 获取时区
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      return timezone;
    }
  } catch (error) {
    console.warn('无法获取用户时区:', error);
  }

  // 如果无法获取，返回默认时区
  return 'Asia/Shanghai';
};

// 获取时区偏移量（分钟）
export const getTimezoneOffset = (timezone: string): number => {
  try {
    // 使用更简单的方法计算时区偏移
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(now.toLocaleString('en-US', { timeZone: timezone } as any));
    const offset = (targetTime.getTime() - utcTime) / (1000 * 60);
    return Math.round(offset);
  } catch (error) {
    console.warn('无法获取时区偏移量:', error);
    // 返回硬编码的时区偏移量
    const hardcodedOffsets: { [key: string]: number } = {
      'Asia/Shanghai': 480,      // UTC+8
      'Asia/Hong_Kong': 480,     // UTC+8
      'Asia/Taipei': 480,        // UTC+8
      'Asia/Tokyo': 540,         // UTC+9
      'Asia/Seoul': 540,         // UTC+9
      'Asia/Singapore': 480,     // UTC+8
      'Asia/Bangkok': 420,       // UTC+7
      'Asia/Kolkata': 330,       // UTC+5:30
      'Asia/Dubai': 240,         // UTC+4
      'Europe/London': 0,        // UTC+0
      'Europe/Paris': 60,        // UTC+1
      'Europe/Berlin': 60,       // UTC+1
      'Europe/Moscow': 180,      // UTC+3
      'America/New_York': -300,  // UTC-5
      'America/Chicago': -360,   // UTC-6
      'America/Denver': -420,    // UTC-7
      'America/Los_Angeles': -480, // UTC-8
      'America/Toronto': -300,   // UTC-5
      'America/Vancouver': -480, // UTC-8
      'Australia/Sydney': 600,   // UTC+10
      'Australia/Perth': 480,    // UTC+8
      'Pacific/Auckland': 720,   // UTC+12
      'Pacific/Fiji': 720        // UTC+12
    };
    
    return hardcodedOffsets[timezone] || 480; // 默认返回北京时间偏移量
  }
};

// 格式化时区显示名称
export const formatTimezoneName = (timezone: string, t?: TranslationFunction): string => {
  if (t) {
    return t(`utils.timezoneUtils.names.${timezone.replace('/', '_')}`);
  }
  
  // 常见时区的友好名称（默认中文）
  const timezoneNames: { [key: string]: string } = {
    'Asia/Shanghai': '中国标准时间',
    'Asia/Hong_Kong': '香港时间',
    'Asia/Taipei': '台北时间',
    'Asia/Tokyo': '日本标准时间',
    'Asia/Seoul': '韩国标准时间',
    'Asia/Singapore': '新加坡时间',
    'Asia/Bangkok': '曼谷时间',
    'Asia/Kolkata': '印度时间',
    'Asia/Dubai': '迪拜时间',
    'America/New_York': '美国东部时间',
    'America/Chicago': '美国中部时间',
    'America/Denver': '美国山地时间',
    'America/Los_Angeles': '美国太平洋时间',
    'America/Toronto': '多伦多时间',
    'America/Vancouver': '温哥华时间',
    'Europe/London': '格林威治时间',
    'Europe/Paris': '中欧时间',
    'Europe/Berlin': '中欧时间',
    'Europe/Moscow': '莫斯科时间',
    'Australia/Sydney': '澳大利亚东部时间',
    'Australia/Perth': '澳大利亚西部时间',
    'Pacific/Auckland': '新西兰标准时间',
    'Pacific/Fiji': '斐济时间'
  };

  const friendlyName = timezoneNames[timezone] || timezone;
  
  // 使用硬编码的偏移量，避免计算错误
  const hardcodedOffsets: { [key: string]: string } = {
    'Asia/Shanghai': '(UTC+8)',
    'Asia/Hong_Kong': '(UTC+8)',
    'Asia/Taipei': '(UTC+8)',
    'Asia/Tokyo': '(UTC+9)',
    'Asia/Seoul': '(UTC+9)',
    'Asia/Singapore': '(UTC+8)',
    'Asia/Bangkok': '(UTC+7)',
    'Asia/Kolkata': '(UTC+5:30)',
    'Asia/Dubai': '(UTC+4)',
    'Europe/London': '(UTC+0)',
    'Europe/Paris': '(UTC+1)',
    'Europe/Berlin': '(UTC+1)',
    'Europe/Moscow': '(UTC+3)',
    'America/New_York': '(UTC-5)',
    'America/Chicago': '(UTC-6)',
    'America/Denver': '(UTC-7)',
    'America/Los_Angeles': '(UTC-8)',
    'America/Toronto': '(UTC-5)',
    'America/Vancouver': '(UTC-8)',
    'Australia/Sydney': '(UTC+10)',
    'Australia/Perth': '(UTC+8)',
    'Pacific/Auckland': '(UTC+12)',
    'Pacific/Fiji': '(UTC+12)'
  };
  
  const offsetStr = hardcodedOffsets[timezone] || '(UTC+8)';
  
  return `${friendlyName} ${offsetStr}`;
};

// 获取所有支持的时区列表
export const getSupportedTimezones = (t?: TranslationFunction): Array<{ value: string; label: string }> => {
  const timezones = [
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Taipei',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Bangkok',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'Australia/Sydney',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Fiji'
  ];

  return timezones.map(tz => ({
    value: tz,
    label: formatTimezoneName(tz, t)
  }));
};

// 检测用户是否启用了定位服务
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

// 获取用户地理位置并推荐时区
export const getUserLocationAndTimezone = (): Promise<{ timezone: string; city?: string; country?: string }> => {
  return new Promise((resolve) => {
    // 首先尝试使用IP地址获取时区（免费且简单）
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        if (data.timezone) {
          resolve({ 
            timezone: data.timezone,
            city: data.city,
            country: data.country_name
          });
          return;
        }
        throw new Error('无法从IP获取时区');
      })
      .catch(() => {
        // 如果IP定位失败，尝试GPS定位
        if (isGeolocationSupported()) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              try {
                const { latitude, longitude } = position.coords;
                
                // 根据坐标估算时区
                const estimatedTimezone = estimateTimezoneFromCoordinates(
                  latitude,
                  longitude
                );
                
                resolve({ timezone: estimatedTimezone });
              } catch (error) {
                console.warn('无法通过坐标估算时区:', error);
                resolve({ timezone: getUserTimezone() });
              }
            },
            (error) => {
              console.warn('无法获取用户位置:', error);
              // 如果定位失败，返回默认时区
              resolve({ timezone: getUserTimezone() });
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000 // 5分钟缓存
            }
          );
        } else {
          // 如果都不支持，返回默认时区
          resolve({ timezone: getUserTimezone() });
        }
      });
  });
};

// 根据坐标估算时区（简化版本）
const estimateTimezoneFromCoordinates = (lat: number, lng: number): string => {
  // 简化的时区估算逻辑
  if (lat >= 20 && lat <= 50 && lng >= 70 && lng <= 140) {
    // 亚洲地区
    if (lng >= 100 && lng <= 140) {
      return 'Asia/Shanghai'; // 中国、东南亚
    } else if (lng >= 70 && lng < 100) {
      return 'Asia/Kolkata'; // 印度
    }
  } else if (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 40) {
    // 欧洲地区
    if (lng >= -10 && lng <= 10) {
      return 'Europe/London'; // 英国
    } else if (lng >= 10 && lng <= 20) {
      return 'Europe/Berlin'; // 德国
    } else {
      return 'Europe/Paris'; // 法国等
    }
  } else if (lat >= 25 && lat <= 50 && lng >= -125 && lng <= -65) {
    // 北美地区
    if (lng >= -80 && lng <= -65) {
      return 'America/New_York'; // 美国东部
    } else if (lng >= -105 && lng <= -80) {
      return 'America/Chicago'; // 美国中部
    } else if (lng >= -125 && lng <= -105) {
      return 'America/Los_Angeles'; // 美国西部
    }
  }

  // 默认返回北京时间
  return 'Asia/Shanghai';
};

// 获取当前时区的当前时间
export const getCurrentTimeInTimezone = (timezone: string): Date => {
  try {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (getTimezoneOffset(timezone) * 60000));
    return targetTime;
  } catch (error) {
    console.warn('无法获取时区时间:', error);
    return new Date();
  }
};

// 格式化时区时间显示
export const formatTimezoneTime = (date: Date, timezone: string, t?: TranslationFunction): string => {
  try {
    const locale = detectLocale(t);
    
    return date.toLocaleString(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('无法格式化时区时间:', error);
    return date.toLocaleString('zh-CN');
  }
};
