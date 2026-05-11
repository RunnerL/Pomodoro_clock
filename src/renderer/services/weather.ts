import type { WeatherType } from '@/store/useAppStore'

export interface WeatherData {
  type: WeatherType
  temp: number
  desc: string
  city: string
}

// WMO 天气代码映射
const wmoToType: Record<number, WeatherType> = {
  0: 'sunny', 1: 'sunny', 2: 'cloudy', 3: 'cloudy',
  45: 'wind', 48: 'wind',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'wind', 73: 'wind', 75: 'wind', 77: 'wind',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'wind', 86: 'wind',
  95: 'thunder', 96: 'thunder', 99: 'thunder',
}

const wmoDesc: Record<number, string> = {
  0: '晴朗', 1: '大部晴朗', 2: '多云', 3: '阴天',
  45: '有雾', 48: '雾凇', 51: '小毛毛雨', 53: '中毛毛雨', 55: '大毛毛雨',
  56: '冻毛毛雨', 57: '冻毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
  66: '冻雨', 67: '冻雨', 71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
  80: '阵雨', 81: '中阵雨', 82: '大阵雨', 85: '小阵雪', 86: '大阵雪',
  95: '雷暴', 96: '雷暴+小冰雹', 99: '雷暴+大冰雹',
}

async function fetchJson(url: string, timeout: number): Promise<any> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// === 方案一：Open-Meteo (免费，全球，无需 Key) ===
async function tryOpenMeteo(): Promise<WeatherData | null> {
  // 先获取位置
  const ipData = await fetchJson('https://ipapi.co/json/', 5000)
  if (!ipData || !ipData.latitude) return null

  const lat = ipData.latitude
  const lon = ipData.longitude
  const city = ipData.city || ipData.region || ''

  const weather = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&timezone=auto`,
    8000
  )
  if (!weather || !weather.current) return null

  const code = weather.current.weather_code
  return {
    type: wmoToType[code] || 'cloudy',
    temp: weather.current.temperature_2m,
    desc: wmoDesc[code] || '未知',
    city,
  }
}

// === 方案二：wttr.in (全球，纯文本解析，兼容好) ===
async function tryWttrIn(): Promise<WeatherData | null> {
  const data = await fetchJson('https://wttr.in/?format=j1', 8000)
  if (!data || !data.current_condition) return null

  const now = data.current_condition[0]
  const temp = parseInt(now.temp_C)
  const code = parseInt(now.weatherCode)
  const weatherDesc = now.weatherDesc?.[0]?.value || '未知'
  const query = (data.nearest_area?.[0]?.areaName?.[0]?.value) || ''

  return {
    type: wmoToType[code] || 'cloudy',
    temp,
    desc: weatherDesc,
    city: query,
  }
}

// === 方案三：ip-api.com (国内可用) + Open-Meteo ===
async function tryIpApi(): Promise<WeatherData | null> {
  const ipData = await fetchJson('http://ip-api.com/json/?lang=zh-CN', 5000)
  if (!ipData || !ipData.lat) return null

  const lat = ipData.lat
  const lon = ipData.lon
  const city = ipData.city || ipData.regionName || ''

  const weather = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&timezone=auto`,
    8000
  )
  if (!weather || !weather.current) return null

  const code = weather.current.weather_code
  return {
    type: wmoToType[code] || 'cloudy',
    temp: weather.current.temperature_2m,
    desc: wmoDesc[code] || '未知',
    city,
  }
}

// === 主入口：多重 fallback ===
export async function fetchWeather(): Promise<WeatherData | null> {
  // 按优先级依次尝试
  const methods = [tryOpenMeteo, tryWttrIn, tryIpApi]

  for (const fn of methods) {
    try {
      const result = await fn()
      if (result) return result
    } catch {}
  }

  return null
}