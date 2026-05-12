import React, { useEffect, useRef, useCallback, useState } from 'react'
import useAppStore from '@/store/useAppStore'
import MarkdownPreview from './MarkdownPreview'
import { format } from 'date-fns'
import { Eye, Edit3, RefreshCw } from 'lucide-react'

const TodoPanel: React.FC = () => {
  const todoContent = useAppStore((s) => s.todoContent)
  const setTodoContent = useAppStore((s) => s.setTodoContent)
  const currentDate = useAppStore((s) => s.currentDate)
  const savePath = useAppStore((s) => s.savePath)
  const autoSaveStatus = useAppStore((s) => s.autoSaveStatus)
  const setAutoSaveStatus = useAppStore((s) => s.setAutoSaveStatus)
  const todoMode = useAppStore((s) => s.todoMode)
  const setTodoMode = useAppStore((s) => s.setTodoMode)
  const fetchAvailableDates = useAppStore((s) => s.fetchAvailableDates)
  const openSyncForDate = useAppStore((s) => s.openSyncForDate)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dateList, setDateList] = useState<{ dateKey: string; date: string; filename: string }[]>([])
  const [syncLoading, setSyncLoading] = useState(false)

  const doSave = useCallback(async (content: string) => {
    if (!savePath || !window.electronAPI) return
    const fn = `${savePath}\\工作日志_${format(new Date(currentDate), 'yyMMdd')}.md`
    try {
      if (await window.electronAPI.writeFile(fn, content))
        setAutoSaveStatus('已自动保存 ' + format(new Date(), 'HH:mm'))
    } catch {}
  }, [savePath, currentDate, setAutoSaveStatus])

  // Load file
  useEffect(() => {
    if (!savePath || !window.electronAPI) return
    ;(async () => {
      const fn = `${savePath}\\工作日志_${format(new Date(currentDate), 'yyMMdd')}.md`
      const ex = await window.electronAPI.fileExists(fn)
      if (ex) {
        const c = await window.electronAPI.readFile(fn)
        if (c !== null) setTodoContent(c)
      } else {
        setTodoContent('')
        await window.electronAPI.writeFile(fn, '')
      }
    })()
  }, [savePath, currentDate, setTodoContent])

  // Ctrl+S
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        doSave(todoContent)
        if (saveTimer.current) clearTimeout(saveTimer.current)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [todoContent, doSave])

  // Open date picker for manual sync
  const handleOpenDatePicker = async () => {
    if (datePickerOpen) { setDatePickerOpen(false); return }
    setSyncLoading(true)
    try {
      const list = await fetchAvailableDates()
      setDateList(list)
      setDatePickerOpen(true)
    } finally {
      setSyncLoading(false)
    }
  }

  const handleSelectDate = async (dateKey: string) => {
    setDatePickerOpen(false)
    setSyncLoading(true)
    try {
      await openSyncForDate(dateKey)
    } finally {
      setSyncLoading(false)
    }
  }

  // Toggle checkbox in preview mode
  const handleToggleCheckbox = useCallback((lineIdx: number, checked: boolean) => {
    const lines = todoContent.split('\n')
    // Swap [ ] ↔ [x]
    const oldLine = lines[lineIdx]
    if (checked) {
      lines[lineIdx] = oldLine.replace(/\[ \]/, '[x]')
    } else {
      lines[lineIdx] = oldLine.replace(/\[x\]/i, '[ ]')
    }
    const newContent = lines.join('\n')
    setTodoContent(newContent)
    // Auto-save
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(newContent), 500)
  }, [todoContent, setTodoContent, doSave])

  return (
    <div style={{
      background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(24px)',
      borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      flex: '1 1 0', minWidth: 0,
    }}>
      <div style={{ padding: '8px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          📝 今日待办 · {currentDate}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {/* Sync button — opens date picker */}
          <button onClick={handleOpenDatePicker} disabled={syncLoading}
            title="从历史日志同步未完成待办"
            style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: syncLoading ? 0.5 : 1 }}>
            <RefreshCw size={14} style={syncLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
          </button>

          {/* Date picker dropdown */}
          {datePickerOpen && (
            <div style={{
              position: 'absolute', top: 34, right: 0, zIndex: 50,
              minWidth: 200, maxHeight: 260, overflowY: 'auto',
              background: 'rgba(25,25,35,0.95)', backdropFilter: 'blur(20px)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)', padding: '6px 0',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '6px 14px', fontSize: 11, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                选择要同步的日期
              </div>
              {dateList.length === 0 ? (
                <div style={{ padding: '14px', fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                  没有可同步的历史日志
                </div>
              ) : (
                dateList.map((d) => (
                  <div key={d.dateKey}
                    onClick={() => handleSelectDate(d.dateKey)}
                    style={{
                      padding: '8px 14px', cursor: 'pointer', fontSize: 12,
                      color: 'rgba(255,255,255,0.7)',
                      transition: 'background 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(52,152,219,0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>📄</span>
                    {d.date}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Click-away overlay */}
          {datePickerOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              onClick={() => setDatePickerOpen(false)} />
          )}

          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{autoSaveStatus}</span>
          <button onClick={() => setTodoMode(todoMode === 'edit' ? 'preview' : 'edit')}
            title={todoMode === 'edit' ? '预览' : '编辑'}
            style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {todoMode === 'edit' ? <Eye size={14} /> : <Edit3 size={14} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '2px 14px 10px', minHeight: 0, overflow: 'hidden' }}>
        {todoMode === 'edit' ? (
          <textarea value={todoContent} spellCheck={false} autoCorrect="off" autoCapitalize="off"
            onChange={(e) => { setTodoContent(e.target.value); if (saveTimer.current) clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => doSave(e.target.value), 2000) }}
            className="todo-content"
            placeholder={'# 今天的计划\n\n- [x] 已完成事项\n- [ ] 待办事项\n\n---\n\n用 **Markdown** 记录你的每一天 ✨'}
            style={{ width: '100%', height: '100%', minHeight: 260, background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.8, resize: 'none', fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace", padding: 4 }} />
        ) : (
          <div className="todo-content" style={{ width: '100%', height: '100%', minHeight: 260, overflowY: 'auto' }}>
            <MarkdownPreview content={todoContent || '# 新的一天\n\n点击 ✏️ 开始记录'} onToggleCheckbox={handleToggleCheckbox} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoPanel