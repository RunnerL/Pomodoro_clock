import React, { useEffect, useRef, useCallback } from 'react'
import useAppStore from '@/store/useAppStore'
import MarkdownPreview from './MarkdownPreview'
import { format } from 'date-fns'
import { Eye, Edit3 } from 'lucide-react'

const TodoPanel: React.FC = () => {
  const todoContent = useAppStore((s) => s.todoContent)
  const setTodoContent = useAppStore((s) => s.setTodoContent)
  const currentDate = useAppStore((s) => s.currentDate)
  const savePath = useAppStore((s) => s.savePath)
  const autoSaveStatus = useAppStore((s) => s.autoSaveStatus)
  const setAutoSaveStatus = useAppStore((s) => s.setAutoSaveStatus)
  const todoMode = useAppStore((s) => s.todoMode)
  const setTodoMode = useAppStore((s) => s.setTodoMode)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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