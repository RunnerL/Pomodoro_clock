import React from 'react'
import useAppStore, { WeatherType } from '@/store/useAppStore'

const gradients: Record<WeatherType, string> = {
  sunny: 'linear-gradient(180deg,#3b8ed8 0%,#529ee0 12%,#6db2e8 25%,#87c4f0 40%,#9fd2f4 55%,#b5def7 70%,#c8e8f9 85%,#daf0fb 100%)',
  cloudy: 'linear-gradient(175deg,#bdc3c7 0%,#95a5a6 30%,#7f8c8d 70%,#5d6d6e 100%)',
  rain: 'linear-gradient(175deg,#3a5068 0%,#2c4053 20%,#1e3040 45%,#162736 70%,#0f1d2a 100%)',
  thunder: 'linear-gradient(175deg,#2c1b3d 0%,#1e1a2e 20%,#1a1a30 45%,#141428 70%,#0d0d1f 100%)',
  wind: 'linear-gradient(175deg,#7da89e 0%,#6b9086 20%,#5a7d74 45%,#4a6b63 70%,#3a5a52 100%)',
}

const BgGradient: React.FC = () => {
  const wt = useAppStore(s => s.weatherType)
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: gradients[wt], overflow: 'hidden' }}>
      {wt === 'sunny' && <div style={{ position: 'absolute', top: 30, left: '60%', width: 100, height: 100 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(255,255,240,.7) 40%,rgba(255,220,150,.2) 70%,transparent 100%)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 40px rgba(255,255,200,.4),0 0 80px rgba(255,245,200,.2)' }} />
      </div>}
      {wt === 'cloudy' && <>
        <div style={{ position: 'absolute', width: 240, height: 80, top: 50, left: -40, background: 'rgba(255,255,255,.2)', borderRadius: '50%', filter: 'blur(25px)' }} />
        <div style={{ position: 'absolute', width: 280, height: 90, top: 100, right: -60, background: 'rgba(255,255,255,.18)', borderRadius: '50%', filter: 'blur(25px)' }} />
      </>}
    </div>
  )
}
export default BgGradient