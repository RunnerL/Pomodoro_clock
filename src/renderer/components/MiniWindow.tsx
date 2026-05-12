import React, { useEffect, useState } from 'react'
import useAppStore from '@/store/useAppStore'
import WeatherBackground from '@/weather/WeatherBackground'
import { Play, Pause, Shuffle, X } from 'lucide-react'

const gradients: Record<string, string> = {
  sunny: 'linear-gradient(180deg, #3b8ed8 0%, #529ee0 12%, #6db2e8 25%, #87c4f0 40%, #9fd2f4 55%, #b5def7 70%, #c8e8f9 85%, #daf0fb 100%)',
  cloudy: 'linear-gradient(175deg, #bdc3c7 0%, #95a5a6 30%, #7f8c8d 70%, #5d6d6e 100%)',
  rain: 'linear-gradient(175deg, #3a5068 0%, #2c4053 20%, #1e3040 45%, #162736 70%, #0f1d2a 100%)',
  thunder: 'linear-gradient(175deg, #2c1b3d 0%, #1e1a2e 20%, #1a1a30 45%, #141428 70%, #0d0d1f 100%)',
  wind: 'linear-gradient(175deg, #7da89e 0%, #6b9086 20%, #5a7d74 45%, #4a6b63 70%, #3a5a52 100%)',
}

interface TimerState {
  remainingSeconds: number
  mode: 'work' | 'rest'
  timerState: 'idle' | 'running' | 'paused'
  weatherType: string
}

const MiniWindow: React.FC = () => {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: 0, mode: 'work', timerState: 'idle', weatherType: 'sunny',
  })

  useEffect(() => {
    const poll = async () => {
      if (!window.electronAPI) return
      try {
        const s = await window.electronAPI.getTimerState()
        if (s) {
          setState(s)
          useAppStore.getState().setWeatherType(s.weatherType as any)
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 500)
    return () => clearInterval(id)
  }, [])

  const sendCmd = (cmd: string) => {
    ;(window.electronAPI as any)?.miniTimerCommand?.(cmd)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    ;(window.electronAPI as any)?.closeMiniWindow?.()
  }

  const doubleClickTimer = React.useRef(0)
  const handleClick = () => {
    const now = Date.now()
    if (now - doubleClickTimer.current < 400) {
      ;(window.electronAPI as any)?.restoreMainWindow()
    }
    doubleClickTimer.current = now
  }

  const m = Math.floor(state.remainingSeconds / 60)
  const s = state.remainingSeconds % 60
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  let modeText = '专注中'
  if (state.timerState === 'idle') modeText = state.mode === 'work' ? '准备专注' : '准备休息'
  else if (state.timerState === 'paused') modeText = '已暂停'
  else if (state.mode === 'rest') modeText = '休息中'

  const wt = state.weatherType || 'sunny'

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%', height: '100%', overflow: 'hidden',
        borderRadius: 14, position: 'relative',
        background: gradients[wt] || gradients.sunny,
        fontFamily: "'Inter','Noto Sans SC','Microsoft YaHei',sans-serif",
        WebkitAppRegion: 'drag',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <WeatherBackground />

      {/* X close button — top right */}
      <button
        onClick={handleClose}
        title="关闭浮窗（程序保留在托盘）"
        style={{
          position: 'absolute', top: 6, right: 8, zIndex: 20,
          width: 22, height: 22, borderRadius: '50%',
          border: 'none', background: 'rgba(0,0,0,0.25)',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          WebkitAppRegion: 'no-drag',
        }}
      >
        <X size={12} />
      </button>

      {/* Content — no background box */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px',
        WebkitAppRegion: 'no-drag',
      }}>
        <span style={{
          fontSize: 26, fontWeight: 300, color: 'rgba(255,255,255,0.92)',
          letterSpacing: 2, fontVariantNumeric: 'tabular-nums',
          textShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}>
          {timeStr}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
          letterSpacing: 1, textShadow: '0 1px 6px rgba(0,0,0,0.2)',
        }}>
          {modeText}
        </span>

        {/* Control buttons */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 2 }}>
          {/* Play / Pause */}
          {state.timerState === 'running' ? (
            <button onClick={(e) => { e.stopPropagation(); sendCmd('pause') }} title="暂停" style={btnStyle}>
              <Pause size={12} />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); sendCmd('start') }} title="开始" style={btnStyle}>
              <Play size={12} />
            </button>
          )}

          {/* Toggle work/rest */}
          <button
            onClick={(e) => { e.stopPropagation(); sendCmd(state.mode === 'work' ? 'switch-rest' : 'switch-work') }}
            title={state.mode === 'work' ? '切换休息' : '切换专注'}
            style={btnStyle}
          >
            <Shuffle size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 26, height: 26, borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(6px)',
}

export default MiniWindow