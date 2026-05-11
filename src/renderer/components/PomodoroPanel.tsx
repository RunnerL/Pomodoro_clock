import React from 'react'
import useAppStore from '@/store/useAppStore'
import SplitText from './SplitText'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const PomodoroPanel: React.FC = () => {
  const remaining = useAppStore(s => s.remainingSeconds)
  const timerState = useAppStore(s => s.timerState)
  const mode = useAppStore(s => s.mode)
  const startTimer = useAppStore(s => s.startTimer)
  const pauseTimer = useAppStore(s => s.pauseTimer)
  const resetTimer = useAppStore(s => s.resetTimer)
  const switchMode = useAppStore(s => s.switchMode)
  const setSettingsOpen = useAppStore(s => s.setSettingsOpen)

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '8px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, fontWeight: 300, color: 'rgba(255,255,255,.93)', letterSpacing: 2, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 16px rgba(0,0,0,.2)' }}>
          <SplitText text={timeStr} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.65)', marginTop: 4, letterSpacing: 1 }}>
          <SplitText text={mode === 'work' ? 'FOCUS · 专注' : 'REST · 休息'} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.12)', borderRadius: 20, padding: 3, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}>
          <button onClick={() => switchMode('work')} style={{ padding: '6px 16px', borderRadius: 18, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: mode === 'work' ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.5)', background: mode === 'work' ? 'rgba(255,255,255,.22)' : 'transparent' }}>☀️ 专注</button>
          <button onClick={() => switchMode('rest')} style={{ padding: '6px 16px', borderRadius: 18, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: mode === 'rest' ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.5)', background: mode === 'rest' ? 'rgba(255,255,255,.22)' : 'transparent' }}>🌙 休息</button>
        </div>
        <button onClick={() => timerState === 'running' ? pauseTimer() : startTimer()} style={{ width: 46, height: 46, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.28)', background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.88)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>{timerState === 'running' ? <Pause size={20} /> : <Play size={20} />}</button>
        <button onClick={resetTimer} style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}><RotateCcw size={16} /></button>
        <button onClick={() => setSettingsOpen(true)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}><Settings size={14} /></button>
      </div>
    </div>
  )
}
export default PomodoroPanel