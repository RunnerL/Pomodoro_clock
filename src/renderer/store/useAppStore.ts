import { create } from 'zustand'
import { format } from 'date-fns'

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'thunder' | 'wind'
export type TimerState = 'idle' | 'running' | 'paused'
export type TimerMode = 'work' | 'rest'
export type TodoMode = 'edit' | 'preview'

export interface AppState {
  workDuration: number
  restDuration: number
  timerState: TimerState
  mode: TimerMode
  remainingSeconds: number
  progress: number
  autoCycle: boolean
  lightningTrigger: number

  savePath: string
  currentDate: string
  todoContent: string
  autoSaveStatus: string
  todoMode: TodoMode

  showCalendar: boolean
  weatherType: WeatherType
  settingsOpen: boolean
  weatherLoading: boolean
  autoWeather: boolean
  alwaysOnTop: boolean
  windowOpacity: number

  pendingSyncDate: string
  pendingSyncItems: string[]
  todoSyncOpen: boolean
  lastCheckDate: string

  setWorkDuration: (d: number) => void
  setRestDuration: (d: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  switchMode: (m: TimerMode) => void
  setAutoCycle: (v: boolean) => void
  triggerLightning: () => void
  setSavePath: (p: string) => void
  setCurrentDate: (d: string) => void
  setTodoContent: (c: string) => void
  setAutoSaveStatus: (s: string) => void
  setTodoMode: (m: TodoMode) => void
  toggleCalendar: () => void
  setShowCalendar: (v: boolean) => void
  setWeatherType: (w: WeatherType) => void
  setSettingsOpen: (o: boolean) => void
  setWeatherLoading: (l: boolean) => void
  setAutoWeather: (a: boolean) => void
  setAlwaysOnTop: (v: boolean) => void
  setWindowOpacity: (v: number) => void
  setPendingSync: (date: string, items: string[]) => void
  setTodoSyncOpen: (v: boolean) => void
  sendNotification: (title: string, body: string) => void
  checkYesterdayTodos: () => Promise<void>
  fetchAvailableDates: () => Promise<{ dateKey: string; date: string; filename: string }[]>
  openSyncForDate: (dateKey: string) => Promise<void>
}

function parseUncompletedTodos(content: string): string[] {
  const items: string[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const m = line.match(/^\s*-\s+\[ \]\s+(.+)$/)
    if (m) items.push(m[1].trim())
  }
  return items
}

const useAppStore = create<AppState>()((set, get) => ({
  workDuration: 45, restDuration: 10,
  timerState: 'idle', mode: 'work',
  remainingSeconds: 45 * 60, progress: 0,
  autoCycle: false, lightningTrigger: 0,

  savePath: '', currentDate: format(new Date(), 'yyyy-MM-dd'),
  todoContent: '', autoSaveStatus: '', todoMode: 'preview',

  showCalendar: true, weatherType: 'sunny',
  settingsOpen: false, weatherLoading: false, autoWeather: true,
  alwaysOnTop: true, windowOpacity: 0.95,

  pendingSyncDate: '', pendingSyncItems: [], todoSyncOpen: false,
  lastCheckDate: '',

  setWorkDuration: (d) => {
    set({ workDuration: d })
    if (get().timerState === 'idle' && get().mode === 'work')
      set({ remainingSeconds: d * 60, progress: 0 })
  },
  setRestDuration: (d) => {
    set({ restDuration: d })
    if (get().timerState === 'idle' && get().mode === 'rest')
      set({ remainingSeconds: d * 60, progress: 0 })
  },
  startTimer: () => set({ timerState: 'running' }),
  pauseTimer: () => set({ timerState: 'paused' }),
  resetTimer: () => {
    const { mode, workDuration, restDuration } = get()
    set({ timerState: 'idle', remainingSeconds: (mode === 'work' ? workDuration : restDuration) * 60, progress: 0 })
  },
  tick: () => {
    const { timerState, remainingSeconds, mode, workDuration, restDuration, autoCycle } = get()
    if (timerState !== 'running' || remainingSeconds <= 0) return

    const n = remainingSeconds - 1
    const total = (mode === 'work' ? workDuration : restDuration) * 60
    set({ remainingSeconds: n, progress: 1 - n / total })

    if (n <= 0) {
      if (mode === 'work') {
        get().sendNotification('🍅 专注完成！', `恭喜你专注了 ${workDuration} 分钟，现在起身休息一下吧！`)
        set({ mode: 'rest', remainingSeconds: restDuration * 60, progress: 0, timerState: autoCycle ? 'running' : 'idle' })
      } else {
        get().sendNotification('☕ 休息完成！', '休息完啦，开始攻克下一个任务吧！')
        set({ mode: 'work', remainingSeconds: workDuration * 60, progress: 0, timerState: autoCycle ? 'running' : 'idle' })
      }
    }
  },
  switchMode: (m) => {
    const { workDuration, restDuration } = get()
    set({ mode: m, timerState: 'idle', remainingSeconds: (m === 'work' ? workDuration : restDuration) * 60, progress: 0 })
  },
  setAutoCycle: (v) => set({ autoCycle: v }),
  triggerLightning: () => set((s) => ({ lightningTrigger: s.lightningTrigger + 1 })),
  setSavePath: (p) => set({ savePath: p }),
  setCurrentDate: (d) => set({ currentDate: d }),
  setTodoContent: (c) => set({ todoContent: c }),
  setAutoSaveStatus: (s) => set({ autoSaveStatus: s }),
  setTodoMode: (m) => set({ todoMode: m }),
  toggleCalendar: () => set((s) => ({ showCalendar: !s.showCalendar })),
  setShowCalendar: (v) => set({ showCalendar: v }),
  setWeatherType: (w) => set({ weatherType: w }),
  setSettingsOpen: (o) => set({ settingsOpen: o }),
  setWeatherLoading: (l) => set({ weatherLoading: l }),
  setAutoWeather: (a) => set({ autoWeather: a }),
  setAlwaysOnTop: (v) => {
    set({ alwaysOnTop: v })
    if (window.electronAPI) window.electronAPI.setAlwaysOnTop(v)
  },
  setWindowOpacity: (v) => {
    set({ windowOpacity: v })
    if (window.electronAPI) window.electronAPI.setWindowOpacity(v)
  },
  setPendingSync: (date, items) => set({ pendingSyncDate: date, pendingSyncItems: items }),
  setTodoSyncOpen: (v) => set({ todoSyncOpen: v }),

  fetchAvailableDates: async () => {
    const { savePath, currentDate } = get()
    if (!savePath || !window.electronAPI) return []
    const files = await window.electronAPI.listTodoFiles(savePath)

    // Calculate ±7 days range from currentDate
    const today = new Date(currentDate)
    const validKeys = new Set<string>()
    validKeys.add(format(today, 'yyMMdd'))
    for (let i = 1; i <= 7; i++) {
      const before = new Date(today)
      before.setDate(before.getDate() - i)
      validKeys.add(format(before, 'yyMMdd'))
      const after = new Date(today)
      after.setDate(after.getDate() + i)
      validKeys.add(format(after, 'yyMMdd'))
    }

    // Only show dates within ±7 days, exclude today
    const todayKey = format(today, 'yyMMdd')
    return files.filter((f) => f.dateKey !== todayKey && validKeys.has(f.dateKey))
  },

  openSyncForDate: async (dateKey: string) => {
    const { savePath } = get()
    if (!savePath || !window.electronAPI) return
    const fn = `${savePath}\\工作日志_${dateKey}.md`
    const exists = await window.electronAPI.fileExists(fn)
    if (!exists) {
      alert('该日期的工作日志文件不存在')
      return
    }
    const content = await window.electronAPI.readFile(fn)
    if (!content || !content.trim()) {
      // Parse display date for the alert
      const dYY = 2000 + parseInt(dateKey.slice(0, 2), 10)
      const dMM = dateKey.slice(2, 4)
      const dDD = dateKey.slice(4, 6)
      alert(`${dYY}-${dMM}-${dDD} 的工作日志中没有待办事项`)
      return
    }
    const items = parseUncompletedTodos(content)
    if (items.length === 0) {
      const dYY = 2000 + parseInt(dateKey.slice(0, 2), 10)
      const dMM = dateKey.slice(2, 4)
      const dDD = dateKey.slice(4, 6)
      alert(`${dYY}-${dMM}-${dDD} 的工作日志中没有待办事项`)
      return
    }
    // Parse yyyy-MM-dd from dateKey
    const yy = 2000 + parseInt(dateKey.slice(0, 2), 10)
    const mm = dateKey.slice(2, 4)
    const dd = dateKey.slice(4, 6)
    const fullDate = `${yy}-${mm}-${dd}`
    set({ pendingSyncDate: fullDate, pendingSyncItems: items, todoSyncOpen: true })
  },

  sendNotification: (title, body) => {
    if (window.electronAPI) window.electronAPI.sendNotification(title, body)
  },

  checkYesterdayTodos: async () => {
    const { savePath, currentDate, lastCheckDate } = get()
    // Only check once per date
    if (lastCheckDate === currentDate) return
    set({ lastCheckDate: currentDate })

    if (!savePath || !window.electronAPI) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yDate = format(yesterday, 'yyMMdd')
    const yFull = format(yesterday, 'yyyy-MM-dd')
    const fn = `${savePath}\\工作日志_${yDate}.md`

    const exists = await window.electronAPI.fileExists(fn)
    if (!exists) return

    const content = await window.electronAPI.readFile(fn)
    if (!content || !content.trim()) return

    const items = parseUncompletedTodos(content)
    if (items.length > 0) {
      set({ pendingSyncDate: yFull, pendingSyncItems: items, todoSyncOpen: true })
    }
  },
}))

export default useAppStore