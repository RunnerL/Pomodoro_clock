import React, { useEffect, useRef, useCallback } from 'react'
import useAppStore from '@/store/useAppStore'
import { fetchWeather } from '@/services/weather'
import TitleBar from './components/TitleBar'
import PomodoroBar from './components/PomodoroBar'
import PomodoroPanel from './components/PomodoroPanel'
import TodoPanel from './components/TodoPanel'
import CalendarPanel from './components/CalendarPanel'
import SettingsModal from './components/SettingsModal'
import TodoSyncModal from './components/TodoSyncModal'
import WeatherBackground from '@/weather/WeatherBackground'
import { format } from 'date-fns'
import './styles/global.css'

const gradients: Record<string, string> = {
  sunny: 'linear-gradient(180deg, #3b8ed8 0%, #529ee0 12%, #6db2e8 25%, #87c4f0 40%, #9fd2f4 55%, #b5def7 70%, #c8e8f9 85%, #daf0fb 100%)',
  cloudy: 'linear-gradient(175deg, #bdc3c7 0%, #95a5a6 30%, #7f8c8d 70%, #5d6d6e 100%)',
  rain: 'linear-gradient(175deg, #3a5068 0%, #2c4053 20%, #1e3040 45%, #162736 70%, #0f1d2a 100%)',
  thunder: 'linear-gradient(175deg, #2c1b3d 0%, #1e1a2e 20%, #1a1a30 45%, #141428 70%, #0d0d1f 100%)',
  wind: 'linear-gradient(175deg, #7da89e 0%, #6b9086 20%, #5a7d74 45%, #4a6b63 70%, #3a5a52 100%)',
}

const App: React.FC = () => {
  const timerState = useAppStore((s) => s.timerState)
  const tick = useAppStore((s) => s.tick)
  const showCalendar = useAppStore((s) => s.showCalendar)
  const weatherType = useAppStore((s) => s.weatherType)
  const savePath = useAppStore((s) => s.savePath)
  const autoWeather = useAppStore((s) => s.autoWeather)
  const alwaysOnTop = useAppStore((s) => s.alwaysOnTop)
  const windowOpacity = useAppStore((s) => s.windowOpacity)
  const autoCycle = useAppStore((s) => s.autoCycle)
  const lightningTrigger = useAppStore((s) => s.lightningTrigger)
  const setCurrentDate = useAppStore((s) => s.setCurrentDate)
  const setSavePath = useAppStore((s) => s.setSavePath)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const setWorkDuration = useAppStore((s) => s.setWorkDuration)
  const setRestDuration = useAppStore((s) => s.setRestDuration)
  const setWeatherType = useAppStore((s) => s.setWeatherType)
  const setShowCalendar = useAppStore((s) => s.setShowCalendar)
  const setWeatherLoading = useAppStore((s) => s.setWeatherLoading)
  const setAutoWeather = useAppStore((s) => s.setAutoWeather)
  const setAlwaysOnTop = useAppStore((s) => s.setAlwaysOnTop)
  const setWindowOpacity = useAppStore((s) => s.setWindowOpacity)
  const setAutoCycle = useAppStore((s) => s.setAutoCycle)
  const checkYesterdayTodos = useAppStore((s) => s.checkYesterdayTodos)
  const appRef = useRef<HTMLDivElement>(null)
  const idleRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const shockRef = useRef<ReturnType<typeof setTimeout>>()

  // Timer
  useEffect(() => {
    if (timerState !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timerState, tick])

  // Poll for mini window timer commands
  useEffect(() => {
    const poll = setInterval(async () => {
      if (!window.electronAPI) return
      try {
        const cmd = await (window.electronAPI as any).getPendingTimerCommand?.()
        if (!cmd) return
        const store = useAppStore.getState()
        if (cmd === 'start') store.startTimer()
        else if (cmd === 'pause') store.pauseTimer()
        else if (cmd === 'switch-work') store.switchMode('work')
        else if (cmd === 'switch-rest') store.switchMode('rest')
      } catch {}
    }, 300)
    return () => clearInterval(poll)
  }, [])

  // Date
  useEffect(() => { setCurrentDate(format(new Date(), 'yyyy-MM-dd')) }, [setCurrentDate])

  // Load settings
  useEffect(() => {
    const load = async () => {
      if (!window.electronAPI) return
      try {
        const s = await window.electronAPI.getSettings()
        if (s.workDuration) setWorkDuration(s.workDuration)
        if (s.restDuration) setRestDuration(s.restDuration)
        if (s.autoCycle !== undefined) setAutoCycle(s.autoCycle)
        if (s.savePath) { setSavePath(s.savePath) } else { setSettingsOpen(true) }
        if (s.showCalendar !== undefined) setShowCalendar(s.showCalendar)
        if (s.weatherType) setWeatherType(s.weatherType)
        if (s.autoWeather !== undefined) setAutoWeather(s.autoWeather)
        if (s.alwaysOnTop !== undefined) setAlwaysOnTop(s.alwaysOnTop); else setAlwaysOnTop(true)
        if (s.windowOpacity !== undefined) setWindowOpacity(s.windowOpacity)
      } catch { setSettingsOpen(true) }
    }
    load()
  }, [setWorkDuration, setRestDuration, setSavePath, setSettingsOpen, setShowCalendar, setWeatherType, setAutoWeather, setAlwaysOnTop, setWindowOpacity, setAutoCycle])

  // Adjust min window width based on calendar visibility
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.setMinWidth(showCalendar ? 700 : 300)
    }
  }, [showCalendar])
  useEffect(() => {
    if (!window.electronAPI || !savePath) return
    const t = setTimeout(() => {
      const s = useAppStore.getState()
      window.electronAPI.saveSettings({
        workDuration: s.workDuration, restDuration: s.restDuration,
        autoCycle: s.autoCycle,
        savePath: s.savePath, showCalendar: s.showCalendar,
        weatherType: s.weatherType, autoWeather: s.autoWeather,
        alwaysOnTop: s.alwaysOnTop, windowOpacity: s.windowOpacity,
      })
    }, 800)
    return () => clearTimeout(t)
  }, [savePath])

  // Fetch weather
  useEffect(() => {
    let cancelled = false
    const doFetch = async () => {
      setWeatherLoading(true)
      const data = await fetchWeather()
      if (!cancelled && data && autoWeather) setWeatherType(data.type)
      if (!cancelled) setWeatherLoading(false)
    }
    doFetch()
    const interval = setInterval(doFetch, 30 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [autoWeather, setWeatherType, setWeatherLoading])

  // Check yesterday unfinished todos
  useEffect(() => {
    if (savePath) checkYesterdayTodos()
  }, [savePath, checkYesterdayTodos])

  // ======= 闪电 → 文字抖动同步 =======
  useEffect(() => {
    if (lightningTrigger === 0) return // skip initial
    const el = appRef.current
    if (!el || !idleRef.current) return // 只在 idle 状态抖动
    el.classList.add('thunder-shocked')
    const t = setTimeout(() => el.classList.remove('thunder-shocked'), 400)
    return () => clearTimeout(t)
  }, [lightningTrigger])

  // ======= Idle anims =======
  const removeIdle = useCallback(() => {
    idleRef.current = false
    const el = appRef.current; if (!el) return
    el.classList.remove('idle-sunny', 'idle-rain', 'idle-thunder', 'idle-wind', 'thunder-shocked')
  }, [])
  const startIdle = useCallback(() => {
    if (idleRef.current) return
    idleRef.current = true
    const el = appRef.current; if (!el) return
    const wt = useAppStore.getState().weatherType
    const m: Record<string, string> = { sunny: 'idle-sunny', rain: 'idle-rain', thunder: 'idle-thunder', wind: 'idle-wind' }
    if (m[wt]) el.classList.add(m[wt])
  }, [])
  useEffect(() => {
    const el = appRef.current; if (!el) return
    const en = () => { removeIdle(); clearTimeout(timerRef.current); timerRef.current = setTimeout(startIdle, 10000) }
    const mv = () => { if (idleRef.current) removeIdle(); clearTimeout(timerRef.current); timerRef.current = setTimeout(startIdle, 10000) }
    const lv = () => { clearTimeout(timerRef.current); timerRef.current = setTimeout(startIdle, 10000) }
    el.addEventListener('mouseenter', en); el.addEventListener('mousemove', mv); el.addEventListener('mouseleave', lv)
    timerRef.current = setTimeout(startIdle, 10000)
    return () => { el.removeEventListener('mouseenter', en); el.removeEventListener('mousemove', mv); el.removeEventListener('mouseleave', lv); clearTimeout(timerRef.current) }
  }, [removeIdle, startIdle])

  return (
    <div ref={appRef} className="app-root" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      borderRadius: 16, position: 'relative',
      background: gradients[weatherType] || gradients.sunny,
      fontFamily: "'Inter','Noto Sans SC','Microsoft YaHei',sans-serif",
    }}>
      <WeatherBackground />
      <PomodoroBar />
      <div style={{ position: 'relative', zIndex: 10, flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <TitleBar />
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', padding: '8px 16px 16px', gap: 12, minHeight: 0 }}>
          <PomodoroPanel />
          <div style={{ flex: '1 1 0', display: 'flex', gap: 12, minHeight: 0 }}>
            <TodoPanel />
            {showCalendar && <CalendarPanel />}
          </div>
        </div>
      </div>
      <SettingsModal />
      <TodoSyncModal />
    </div>
  )
}

export default App