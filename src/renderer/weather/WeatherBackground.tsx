import React, { useRef, useEffect } from 'react'
import useAppStore from '@/store/useAppStore'

// ====== Rain streak (fast thin line) ======
interface RainDrop {
  x: number; y: number
  speed: number; length: number
  opacity: number; angle: number
}

// ====== 3D Cloud ======
interface CloudBlob {
  cx: number; cy: number   // center offset from cloud position
  rx: number; ry: number   // radii
  highlightX: number; highlightY: number
}
interface Cloud {
  x: number; y: number
  baseY: number
  speed: number
  amp: number
  phase: number
  opacity: number
  blobs: CloudBlob[]
}

// ====== Sunny bokeh ======
interface Bokeh {
  x: number; y: number; r: number; opacity: number; phase: number; speed: number
}

// ====== Thunder bolt ======
interface Bolt {
  active: boolean; timer: number
  sx: number; sy: number; ex: number; ey: number; branches: boolean
}

const WeatherBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const weatherType = useAppStore((s) => s.weatherType)
  const animRef = useRef(0)
  const dataRef = useRef<{
    drops?: RainDrop[]
    clouds?: Cloud[]
    bokehs?: Bokeh[]
    bolt: Bolt
    flash: number
    windLines?: { x: number; y: number; speed: number; len: number; op: number }[]
    leaves?: { x: number; y: number; speed: number; amp: number; f: number; op: number; p: number; r: number; rs: number; e: string }[]
  }>({ bolt: { active: false, timer: 0, sx: 0, sy: 0, ex: 0, ey: 0, branches: false }, flash: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement!.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const obs = new ResizeObserver(resize)
    obs.observe(canvas.parentElement!)

    const W = () => canvas.width / (window.devicePixelRatio || 1)
    const H = () => canvas.height / (window.devicePixelRatio || 1)

    // ====== INIT DATA ======
    const d = dataRef.current

    // Rain drops
    d.drops = []
    for (let i = 0; i < 150; i++) {
      d.drops.push({
        x: Math.random() * W(), y: Math.random() * H(),
        speed: 12 + Math.random() * 20,
        length: 10 + Math.random() * 22,
        opacity: 0.12 + Math.random() * 0.3,
        angle: -0.08 + Math.random() * 0.16,
      })
    }

    // ====== CLOUDS ======
    d.clouds = []
    if (weatherType === 'sunny') {
      // 晴天：蓬松白金色云朵，带体积感
      for (let i = 0; i < 6; i++) {
        const blobs: CloudBlob[] = generate3DCloudBlobs(8 + Math.floor(Math.random() * 8), 30, 65, 0.6)
        d.clouds.push({
          x: -100 + Math.random() * (W() + 200),
          y: 30 + Math.random() * 200,
          baseY: 30 + Math.random() * 200,
          speed: 0.15 + Math.random() * 0.4,
          amp: 4 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.6 + Math.random() * 0.35,
          blobs,
        })
      }
    } else if (weatherType === 'cloudy') {
      // 阴天：浓厚灰暗积云
      for (let i = 0; i < 6; i++) {
        const blobs: CloudBlob[] = generate3DCloudBlobs(10 + Math.floor(Math.random() * 12), 40, 90, 0.5)
        d.clouds.push({
          x: -150 + Math.random() * (W() + 300),
          y: -40 + Math.random() * 350,
          baseY: -40 + Math.random() * 350,
          speed: 0.06 + Math.random() * 0.22,
          amp: 2 + Math.random() * 6,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.55 + Math.random() * 0.4,
          blobs,
        })
      }
    }

    // Sunny bokeh
    d.bokehs = []
    for (let i = 0; i < 12; i++) {
      d.bokehs.push({
        x: Math.random() * W(), y: Math.random() * H(),
        r: 4 + Math.random() * 20,
        opacity: 0.08 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
      })
    }

    // Wind
    d.windLines = []
    for (let i = 0; i < 20; i++) {
      d.windLines.push({
        x: Math.random() * W(), y: 20 + Math.random() * (H() - 40),
        speed: 2 + Math.random() * 8, len: 40 + Math.random() * 140,
        op: 0.04 + Math.random() * 0.12,
      })
    }
    const leafEmojis = ['🍂', '🍃', '🌿', '🍁']
    d.leaves = []
    for (let i = 0; i < 10; i++) {
      d.leaves.push({
        x: -40 - Math.random() * 200, y: Math.random() * H(),
        speed: 1.5 + Math.random() * 5, amp: 10 + Math.random() * 30,
        f: 0.02 + Math.random() * 0.04, op: 0.3 + Math.random() * 0.4,
        p: Math.random() * Math.PI * 2, r: 0, rs: 0.02 + Math.random() * 0.06,
        e: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
      })
    }

    // Thunder interval: ~10 minutes between flashes
    let thunderTimer: any = null
    if (weatherType === 'thunder') {
      const THUNDER_INTERVAL = 600000 // 10 minutes
      thunderTimer = setInterval(() => {
        if (Math.random() < 0.7) {
          d.bolt = {
            active: true, timer: 12,
            sx: 100 + Math.random() * (W() - 200),
            sy: -20,
            ex: 100 + Math.random() * (W() - 200) + (Math.random() - 0.5) * 200,
            ey: 200 + Math.random() * (H() - 250),
            branches: Math.random() < 0.6,
          }
          d.flash = 1
          useAppStore.getState().triggerLightning()
          if (Math.random() < 0.3) {
            setTimeout(() => {
              d.bolt = {
                active: true, timer: 8,
                sx: 100 + Math.random() * (W() - 200),
                sy: -20,
                ex: 100 + Math.random() * (W() - 200) + (Math.random() - 0.5) * 200,
                ey: 200 + Math.random() * (H() - 250),
                branches: Math.random() < 0.5,
              }
              d.flash = 0.7
              useAppStore.getState().triggerLightning()
            }, 300 + Math.random() * 800)
          }
        }
      }, THUNDER_INTERVAL)
    }

    // ====== DRAW HELPERS ======
    const drawRainDrop = (rd: RainDrop) => {
      ctx.strokeStyle = `rgba(170,200,225,${rd.opacity})`
      ctx.lineWidth = 0.8 + rd.opacity * 1.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      const dx = Math.sin(rd.angle) * rd.length
      const dy = Math.cos(rd.angle) * rd.length
      ctx.moveTo(rd.x, rd.y)
      ctx.lineTo(rd.x + dx, rd.y + dy)
      ctx.stroke()
    }

    // 3D 云朵渲染
    const drawCloud3D = (cloud: Cloud, baseColor: [number,number,number], darkColor: [number,number,number]) => {
      ctx.save()
      ctx.globalAlpha = cloud.opacity

      // Sort blobs by vertical position for layering (bottom first)
      const sorted = [...cloud.blobs].sort((a, b) => a.cy - b.cy)

      for (const blob of sorted) {
        const cx = cloud.x + blob.cx
        const cy = cloud.y + blob.cy

        // --- Shadow/Ambient layer (larger, offset down, dark) ---
        const shGrad = ctx.createRadialGradient(
          cx - blob.rx * 0.08, cy + blob.ry * 0.25, blob.rx * 0.2,
          cx, cy, blob.rx * 1.1
        )
        const sdR = darkColor[0], sdG = darkColor[1], sdB = darkColor[2]
        shGrad.addColorStop(0, `rgba(${sdR},${sdG},${sdB},0.15)`)
        shGrad.addColorStop(0.5, `rgba(${sdR},${sdG},${sdB},0.06)`)
        shGrad.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.beginPath()
        ctx.ellipse(cx + 2, cy + 4, blob.rx * 1.1, blob.ry * 1.05, 0, 0, Math.PI * 2)
        ctx.fillStyle = shGrad
        ctx.fill()

        // --- Body (volumetric radial gradient) ---
        const bodyGrad = ctx.createRadialGradient(
          cx - blob.rx * 0.15, cy - blob.ry * 0.3, blob.rx * 0.08,
          cx, cy, blob.rx
        )
        const bR = baseColor[0], bG = baseColor[1], bB = baseColor[2]
        bodyGrad.addColorStop(0, `rgba(${clamp(bR+60)},${clamp(bG+60)},${clamp(bB+60)},0.85)`)
        bodyGrad.addColorStop(0.25, `rgba(${clamp(bR+35)},${clamp(bG+35)},${clamp(bB+35)},0.55)`)
        bodyGrad.addColorStop(0.5, `rgba(${bR},${bG},${bB},0.35)`)
        bodyGrad.addColorStop(0.75, `rgba(${clamp(bR-15)},${clamp(bG-15)},${clamp(bB-15)},0.12)`)
        bodyGrad.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.beginPath()
        ctx.ellipse(cx, cy, blob.rx, blob.ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = bodyGrad
        ctx.fill()

        // --- Highlight (small bright spot, upper-left) ---
        const hlX = cx - blob.rx * 0.22
        const hlY = cy - blob.ry * 0.28
        const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, blob.rx * 0.45)
        hlGrad.addColorStop(0, `rgba(255,255,255,0.65)`)
        hlGrad.addColorStop(0.3, `rgba(255,255,255,0.3)`)
        hlGrad.addColorStop(0.7, `rgba(255,255,255,0.05)`)
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)')

        ctx.beginPath()
        ctx.ellipse(hlX, hlY, blob.rx * 0.45, blob.ry * 0.35, 0, 0, Math.PI * 2)
        ctx.fillStyle = hlGrad
        ctx.fill()
      }

      // --- Edge softening (feathered outer glow around entire cloud) ---
      if (sorted.length > 0) {
        const avgCx = cloud.x
        const avgCy = cloud.y
        const maxR = Math.max(...sorted.map(b => b.rx)) * 1.5
        const edgeGrad = ctx.createRadialGradient(avgCx, avgCy, maxR * 0.6, avgCx, avgCy, maxR)
        edgeGrad.addColorStop(0, 'rgba(255,255,255,0)')
        edgeGrad.addColorStop(0.7, `rgba(${baseColor.join(',')},0.06)`)
        edgeGrad.addColorStop(1, 'rgba(255,255,255,0)')

        ctx.beginPath()
        ctx.arc(avgCx, avgCy, maxR, 0, Math.PI * 2)
        ctx.fillStyle = edgeGrad
        ctx.fill()
      }

      ctx.restore()
    }

    const drawBolt = (b: Bolt) => {
      const segs: { x: number; y: number }[] = []
      const n = 8 + Math.floor(Math.random() * 8)
      for (let i = 0; i < n; i++) {
        const t = (i + 1) / n
        segs.push({
          x: b.sx + (b.ex - b.sx) * t + (Math.random() - 0.5) * (b.ey - b.sy) * 0.25,
          y: b.sy + (b.ey - b.sy) * t,
        })
      }
      ctx.save()
      ctx.shadowColor = '#aaccff'
      ctx.strokeStyle = '#c8d8ff'; ctx.lineWidth = 10; ctx.shadowBlur = 35; ctx.globalAlpha = 0.35
      ctx.beginPath(); ctx.moveTo(b.sx, b.sy); segs.forEach(s => ctx.lineTo(s.x, s.y)); ctx.stroke()
      ctx.strokeStyle = '#e8f0ff'; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.globalAlpha = 0.6
      ctx.beginPath(); ctx.moveTo(b.sx, b.sy); segs.forEach(s => ctx.lineTo(s.x, s.y)); ctx.stroke()
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff'; ctx.globalAlpha = 0.9
      ctx.beginPath(); ctx.moveTo(b.sx, b.sy); segs.forEach(s => ctx.lineTo(s.x, s.y)); ctx.stroke()
      if (b.branches) {
        for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
          const pi = 3 + Math.floor(Math.random() * (segs.length - 5))
          const p = segs[pi]
          const bx = p.x + (Math.random() - 0.5) * 60
          const by = p.y + 20 + Math.random() * 80
          const mx = p.x + (bx - p.x) * 0.5 + (Math.random() - 0.5) * 25
          const my = p.y + (by - p.y) * 0.4
          ctx.strokeStyle = '#b8ccff'; ctx.lineWidth = 3.5; ctx.shadowBlur = 12; ctx.globalAlpha = 0.25
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.lineTo(bx, by); ctx.stroke()
          ctx.strokeStyle = '#f0f5ff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.55
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.lineTo(bx, by); ctx.stroke()
        }
      }
      ctx.restore()
    }

    // ====== MAIN LOOP ======
    const loop = () => {
      ctx.clearRect(0, 0, W(), H())

      if (weatherType === 'rain' || weatherType === 'thunder') {
        for (const rd of d.drops!) {
          rd.y += rd.speed
          rd.x += Math.sin(rd.angle) * rd.speed * 0.06
          if (rd.y > H() + 20) { rd.y = -20; rd.x = Math.random() * W() }
          drawRainDrop(rd)
        }
      }

      if (weatherType === 'thunder') {
        if (d.bolt.active) {
          d.bolt.timer--
          if (d.bolt.timer <= 0) d.bolt.active = false
          else drawBolt(d.bolt)
        }
        if (d.flash > 0) {
          ctx.fillStyle = `rgba(200,210,255,${d.flash * 0.8})`
          ctx.fillRect(0, 0, W(), H())
          d.flash = Math.max(0, d.flash - 0.06)
        }
      }

      if (weatherType === 'sunny') {
        for (const bk of d.bokehs!) {
          bk.phase += bk.speed * 0.02
          bk.opacity = 0.05 + Math.abs(Math.sin(bk.phase)) * 0.18
          const grad = ctx.createRadialGradient(bk.x, bk.y, 0, bk.x, bk.y, bk.r)
          grad.addColorStop(0, `rgba(255,255,240,${bk.opacity})`)
          grad.addColorStop(0.6, `rgba(255,255,200,${bk.opacity * 0.3})`)
          grad.addColorStop(1, 'rgba(255,255,200,0)')
          ctx.beginPath(); ctx.arc(bk.x, bk.y, bk.r, 0, Math.PI * 2)
          ctx.fillStyle = grad; ctx.fill()
        }
        for (const c of d.clouds!) {
          c.x += c.speed
          c.y = c.baseY + Math.sin(c.phase) * c.amp
          c.phase += 0.004
          if (c.x > W() + 300) { c.x = -300; c.baseY = 30 + Math.random() * 200 }
          // 白金色暖调云
          drawCloud3D(c, [252, 250, 240], [220, 215, 200])
        }
      }

      if (weatherType === 'cloudy') {
        for (const c of d.clouds!) {
          c.x += c.speed
          c.y = c.baseY + Math.sin(c.phase) * c.amp
          c.phase += 0.003
          if (c.x > W() + 400) { c.x = -400; c.baseY = -40 + Math.random() * 350 }
          drawCloud3D(c, [155, 162, 175], [110, 118, 130])
        }
      }

      if (weatherType === 'wind') {
        for (const wl of d.windLines!) {
          wl.x += wl.speed
          if (wl.x > W() + 200) { wl.x = -200; wl.y = 20 + Math.random() * (H() - 40) }
          ctx.strokeStyle = `rgba(200,220,240,${wl.op})`; ctx.lineWidth = 0.8
          ctx.beginPath(); ctx.moveTo(wl.x, wl.y); ctx.lineTo(wl.x + wl.len, wl.y + 2); ctx.stroke()
        }
        for (const lf of d.leaves!) {
          lf.x += lf.speed; lf.y += Math.sin(lf.p) * lf.amp * 0.02; lf.p += lf.f; lf.r += lf.rs
          if (lf.x > W() + 50) { lf.x = -50 - Math.random() * 100; lf.y = Math.random() * H() }
          ctx.save(); ctx.globalAlpha = lf.op; ctx.font = '16px sans-serif'
          ctx.translate(lf.x, lf.y); ctx.rotate(lf.r); ctx.fillText(lf.e, 0, 0); ctx.restore()
        }
      }

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      if (thunderTimer) clearInterval(thunderTimer)
      obs.disconnect()
    }
  }, [weatherType])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} />
  )
}

// ====== 3D Cloud generation ======
function generate3DCloudBlobs(count: number, minR: number, maxR: number, heightRatio: number): CloudBlob[] {
  const blobs: CloudBlob[] = []
  const centerOffset = maxR * 1.2

  for (let i = 0; i < count; i++) {
    // 高斯分布 —— 中心更多 blob，边缘少
    const gauss = () => {
      let u = 0, v = 0
      while (u === 0) u = Math.random()
      while (v === 0) v = Math.random()
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    }

    const ox = gauss() * centerOffset * 0.7
    const oy = gauss() * centerOffset * 0.35
    const r = minR + Math.random() * (maxR - minR)
    const ry = r * heightRatio * (0.7 + Math.random() * 0.6)

    blobs.push({
      cx: ox,
      cy: oy,
      rx: r,
      ry,
      highlightX: -r * 0.2 + (Math.random() - 0.5) * r * 0.15,
      highlightY: -ry * 0.3 + (Math.random() - 0.5) * ry * 0.1,
    })
  }
  return blobs
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v))
}

export default WeatherBackground