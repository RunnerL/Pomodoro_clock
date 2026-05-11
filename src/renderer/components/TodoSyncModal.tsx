import React, { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import { X } from 'lucide-react'

const TodoSyncModal: React.FC = () => {
  // ALL hooks first
  const todoSyncOpen = useAppStore((s) => s.todoSyncOpen)
  const pendingSyncDate = useAppStore((s) => s.pendingSyncDate)
  const pendingSyncItems = useAppStore((s) => s.pendingSyncItems)
  const setTodoSyncOpen = useAppStore((s) => s.setTodoSyncOpen)
  const todoContent = useAppStore((s) => s.todoContent)
  const setTodoContent = useAppStore((s) => s.setTodoContent)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggleItem = (idx: number) => {
    const next = new Set(selected)
    if (next.has(idx)) next.delete(idx); else next.add(idx)
    setSelected(next)
  }
  const toggleAll = () => {
    if (selected.size === pendingSyncItems.length) setSelected(new Set())
    else setSelected(new Set(pendingSyncItems.map((_, i) => i)))
  }
  const handleSync = () => {
    const chosen = pendingSyncItems.filter((_, i) => selected.has(i))
    if (chosen.length === 0) { setTodoSyncOpen(false); return }
    const newBlock = `\n\n---\n\n## 🔄 从 ${pendingSyncDate} 同步的待办\n\n${chosen.map((item) => `- [ ] ${item}`).join('\n')}`
    setTodoContent((todoContent || '') + newBlock)
    setTodoSyncOpen(false)
  }

  // Always render container
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      display: todoSyncOpen ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        width: 420, maxHeight: '80%',
        background: 'rgba(25,25,35,0.94)', backdropFilter: 'blur(30px)',
        borderRadius: 18, padding: '24px 26px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            📋 发现未完成待办
          </h2>
          <button onClick={() => setTodoSyncOpen(false)} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={14} /></button>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.6 }}>
          你在 <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{pendingSyncDate}</strong> 还有以下待办未完成，是否同步到今天？
        </p>

        <div onClick={toggleAll} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
          cursor: 'pointer', borderRadius: 8, marginBottom: 8, background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            border: '1.5px solid',
            borderColor: selected.size === pendingSyncItems.length ? 'rgba(52,152,219,0.6)' : 'rgba(255,255,255,0.2)',
            background: selected.size === pendingSyncItems.length ? 'rgba(52,152,219,0.3)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.8)',
          }}>
            {selected.size === pendingSyncItems.length ? '✓' : ''}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            全选 ({selected.size}/{pendingSyncItems.length})
          </span>
        </div>

        <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
          {pendingSyncItems.map((item, idx) => (
            <div key={idx} onClick={() => toggleItem(idx)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                cursor: 'pointer', borderRadius: 8, marginBottom: 2,
                background: selected.has(idx) ? 'rgba(52,152,219,0.08)' : 'transparent',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                border: '1.5px solid',
                borderColor: selected.has(idx) ? 'rgba(52,152,219,0.6)' : 'rgba(255,255,255,0.2)',
                background: selected.has(idx) ? 'rgba(52,152,219,0.3)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.8)',
              }}>
                {selected.has(idx) ? '✓' : ''}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTodoSyncOpen(false)}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            跳过
          </button>
          <button onClick={handleSync}
            style={{ flex: 1.5, padding: 10, borderRadius: 10, border: 'none', background: 'rgba(52,152,219,0.35)', color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            同步选中项 ({selected.size})
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodoSyncModal