import React from 'react'

interface SplitTextProps {
  text: string
  style?: React.CSSProperties
  className?: string
}

const SplitText: React.FC<SplitTextProps> = ({ text, style, className }) => {
  // Use stable seeds — same text gets same random values
  const hashStr = (s: string): number => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
    return h
  }

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }

  const chars = []
  for (let i = 0; i < text.length; i++) {
    const seed = hashStr(text + '-pos-' + i)
    const delay = seededRandom(seed + 1) * 0.8
    const sx = (seededRandom(seed + 2) > 0.5 ? '' : '-') + (3 + seededRandom(seed + 3) * 8).toFixed(0)
    const sy = (seededRandom(seed + 4) > 0.5 ? '' : '-') + (2 + seededRandom(seed + 5) * 6).toFixed(0)
    chars.push({
      char: text[i] === ' ' ? ' ' : text[i],
      delay: delay.toFixed(2),
      sx: sx + 'px',
      sy: sy + 'px',
    })
  }

  return (
    <span style={style} className={className}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="char-wrapper"
          style={{
            '--char-delay': c.delay + 's',
            '--sx': c.sx,
            '--sy': c.sy,
          } as React.CSSProperties}
        >
          {c.char}
        </span>
      ))}
    </span>
  )
}

export default SplitText