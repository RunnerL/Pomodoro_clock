import React, { useMemo, useCallback } from 'react'

interface MdPreviewProps {
  content: string
  onToggleCheckbox?: (lineIndex: number, checked: boolean) => void
}

function parseInlineHtml(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:rgba(255,255,255,0.9);font-weight:700">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em style="color:rgba(255,255,255,0.6);font-style:italic">$1</em>')
  html = html.replace(/`(.+?)`/g, '<code style="font-family:monospace;background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:rgba(52,152,219,0.9)">$1</a>')
  return html
}

const MarkdownPreview: React.FC<MdPreviewProps> = ({ content, onToggleCheckbox }) => {
  const lines = content.split('\n')

  const handleCheckClick = useCallback((lineIdx: number) => {
    if (!onToggleCheckbox) return
    const line = lines[lineIdx]
    const isChecked = line.match(/^\s*-\s+\[x\]/i)
    onToggleCheckbox(lineIdx, !isChecked)
  }, [lines, onToggleCheckbox])

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 260, color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.8, overflowY: 'auto', padding: 4 }}>
      {lines.map((line, i) => {
        // Heading
        const h = line.match(/^(#{1,6})\s+(.+)$/)
        if (h) {
          const lv = h[1].length
          const sz = { 1: 20, 2: 17, 3: 15, 4: 14, 5: 13, 6: 12 }[lv] || 14
          return <div key={i} style={{ fontSize: sz, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: '8px 0 4px', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: parseInlineHtml(h[2]) }} />
        }

        // HR
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '10px 0' }} />
        }

        // Checkbox: - [ ] or - [x]
        const ck = line.match(/^(\s*)-\s+\[(.)\]\s+(.+)$/)
        if (ck) {
          const indent = ck[1].length
          const isChecked = ck[2].toLowerCase() === 'x'
          return (
            <div
              key={i}
              onClick={() => handleCheckClick(i)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '2px 0', cursor: 'pointer', marginLeft: indent, userSelect: 'none' }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 3,
                border: '1.5px solid',
                borderColor: isChecked ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.25)',
                background: isChecked ? 'rgba(46,204,113,0.2)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'rgba(255,255,255,0.8)', transition: 'all 0.15s',
              }}>
                {isChecked ? '✓' : ''}
              </span>
              <span style={{
                color: isChecked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.72)',
                textDecoration: isChecked ? 'line-through' : 'none',
                fontSize: 13, lineHeight: 1.5,
                transition: 'all 0.2s',
              }}
                dangerouslySetInnerHTML={{ __html: parseInlineHtml(ck[3]) }}
              />
            </div>
          )
        }

        // Regular list item
        const li = line.match(/^(\s*)-\s+(.+)$/)
        if (li) {
          return (
            <div key={i} style={{ padding: '1px 0', marginLeft: li[1].length + 18 }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }} dangerouslySetInnerHTML={{ __html: parseInlineHtml(li[2]) }} />
            </div>
          )
        }

        // Empty
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />

        // Paragraph
        return <p key={i} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '3px 0', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: parseInlineHtml(line) }} />
      })}
    </div>
  )
}

export default MarkdownPreview