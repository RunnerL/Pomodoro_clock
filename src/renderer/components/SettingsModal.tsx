import React from 'react'
import useAppStore from '@/store/useAppStore'
import { X } from 'lucide-react'

const weatherOptions = [
  { type: 'sunny' as const, icon: '☀️', label: '晴天' },
  { type: 'cloudy' as const, icon: '☁️', label: '阴天' },
  { type: 'rain' as const, icon: '🌧️', label: '下雨' },
  { type: 'thunder' as const, icon: '⛈️', label: '雷暴' },
  { type: 'wind' as const, icon: '💨', label: '大风' },
]

const SettingsModal: React.FC = () => {
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const workDuration = useAppStore((s) => s.workDuration)
  const restDuration = useAppStore((s) => s.restDuration)
  const autoCycle = useAppStore((s) => s.autoCycle)
  const savePath = useAppStore((s) => s.savePath)
  const showCalendar = useAppStore((s) => s.showCalendar)
  const weatherType = useAppStore((s) => s.weatherType)
  const autoWeather = useAppStore((s) => s.autoWeather)
  const weatherLoading = useAppStore((s) => s.weatherLoading)
  const alwaysOnTop = useAppStore((s) => s.alwaysOnTop)
  const windowOpacity = useAppStore((s) => s.windowOpacity)
  const setWorkDuration = useAppStore((s) => s.setWorkDuration)
  const setRestDuration = useAppStore((s) => s.setRestDuration)
  const setAutoCycle = useAppStore((s) => s.setAutoCycle)
  const setSavePath = useAppStore((s) => s.setSavePath)
  const toggleCalendar = useAppStore((s) => s.toggleCalendar)
  const setWeatherType = useAppStore((s) => s.setWeatherType)
  const setAutoWeather = useAppStore((s) => s.setAutoWeather)
  const setAlwaysOnTop = useAppStore((s) => s.setAlwaysOnTop)
  const setWindowOpacity = useAppStore((s) => s.setWindowOpacity)

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.55)', marginBottom: 8, letterSpacing: 0.5,
  }
  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.85)', fontSize: 15,
    textAlign: 'center', fontFamily: 'inherit',
  }
  const toggleBg = (on: boolean) => on ? 'rgba(52,152,219,0.5)' : 'rgba(255,255,255,0.1)'

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: settingsOpen ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        width: 480, maxHeight: '90%',
        background: 'rgba(25,25,35,0.92)', backdropFilter: 'blur(30px)',
        borderRadius: 18, padding: '24px 28px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>⚙️ 设置</h2>
          <button onClick={() => setSettingsOpen(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        {/* Timer */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>⏱️ 番茄钟时长</label>
          <div style={{ display: 'flex', gap: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>专注时间</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <input type="number" value={workDuration} min={1} max={120} onChange={(e) => setWorkDuration(Number(e.target.value))} style={{ ...inputStyle, width: 68 }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>分钟</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>休息时间</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <input type="number" value={restDuration} min={1} max={60} onChange={(e) => setRestDuration(Number(e.target.value))} style={{ ...inputStyle, width: 68 }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto cycle */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>🔄 自动循环（专注→休息→专注）</span>
          <div onClick={() => setAutoCycle(!autoCycle)} style={{ width: 42, height: 22, borderRadius: 11, background: toggleBg(autoCycle), position: 'relative', cursor: 'pointer', transition: 'background .25s' }}>
            <div style={{ position: 'absolute', top: 2, left: autoCycle ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'left .25s' }} />
          </div>
        </div>

        {/* Always on top */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>📌 窗口置顶</span>
          <div onClick={() => setAlwaysOnTop(!alwaysOnTop)} style={{ width: 42, height: 22, borderRadius: 11, background: toggleBg(alwaysOnTop), position: 'relative', cursor: 'pointer', transition: 'background .25s' }}>
            <div style={{ position: 'absolute', top: 2, left: alwaysOnTop ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'left .25s' }} />
          </div>
        </div>

        {/* Window opacity */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>🔍 窗口透明度（仅背景）</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={30} max={100} value={Math.round(windowOpacity * 100)} onChange={(e) => setWindowOpacity(Number(e.target.value) / 100)} style={{ flex: 1, accentColor: '#fff' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', minWidth: 36, textAlign: 'right' }}>{Math.round(windowOpacity * 100)}%</span>
          </div>
        </div>

        {/* Save path */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>📁 Todo 保存路径</label>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>每日日志保存为 工作日志_YYMMDD.md</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={savePath} onChange={(e) => setSavePath(e.target.value)} placeholder="选择路径..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.72)', fontSize: 12, fontFamily: 'inherit' }} />
            <button onClick={async () => { if (window.electronAPI) { const d = await window.electronAPI.selectDirectory(); if (d) setSavePath(d) } }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>浏览...</button>
          </div>
        </div>

        {/* Calendar toggle */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>📅 显示日历</span>
          <div onClick={toggleCalendar} style={{ width: 42, height: 22, borderRadius: 11, background: toggleBg(showCalendar), position: 'relative', cursor: 'pointer', transition: 'background .25s' }}>
            <div style={{ position: 'absolute', top: 2, left: showCalendar ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'left .25s' }} />
          </div>
        </div>

        {/* Weather */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>🌤️ 天气背景</label>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>🛰️ 自动获取真实天气</span>
            <div onClick={() => setAutoWeather(!autoWeather)} style={{ width: 42, height: 22, borderRadius: 11, background: toggleBg(autoWeather), position: 'relative', cursor: 'pointer', transition: 'background .25s' }}>
              <div style={{ position: 'absolute', top: 2, left: autoWeather ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', transition: 'left .25s' }} />
            </div>
          </div>
          {weatherLoading && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>⏳ 正在获取天气...</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {weatherOptions.map((opt) => (
              <button key={opt.type} onClick={() => setWeatherType(opt.type)}
                style={{
                  padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: weatherType === opt.type ? '1.5px solid rgba(255,255,255,0.22)' : '1.5px solid rgba(255,255,255,0.06)',
                  background: weatherType === opt.type ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: weatherType === opt.type ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                  fontSize: 11, fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 22, display: 'block', marginBottom: 2 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setSettingsOpen(false)} style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          保存设置
        </button>
      </div>
    </div>
  )
}

export default SettingsModal