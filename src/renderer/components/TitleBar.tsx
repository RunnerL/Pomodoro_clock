import React, { useState } from 'react'
import { Minus, X } from 'lucide-react'

const TitleBar: React.FC = () => {
  const [hoverMin, setHoverMin] = useState(false)
  const [hoverClose, setHoverClose] = useState(false)

  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 14px',
      flexShrink: 0, WebkitAppRegion: 'drag' as any,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
      }}>
        Pomodoro
      </span>
      <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' as any, alignItems: 'center' }}>
        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          onMouseEnter={() => setHoverMin(true)}
          onMouseLeave={() => setHoverMin(false)}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            border: 'none', background: '#f5b041',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            position: 'relative',
          }}
        >
          {hoverMin && <Minus size={10} color="#3e2723" strokeWidth={3} />}
        </button>
        <button
          onClick={() => window.electronAPI?.closeWindow()}
          onMouseEnter={() => setHoverClose(true)}
          onMouseLeave={() => setHoverClose(false)}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            border: 'none', background: '#e74c3c',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            position: 'relative',
          }}
        >
          {hoverClose && <X size={10} color="#641e16" strokeWidth={3} />}
        </button>
      </div>
    </div>
  )
}

export default TitleBar