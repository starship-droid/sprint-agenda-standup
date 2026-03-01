import { useState, useRef, useCallback } from 'react'
import { useAblyNotes } from '../hooks/useAblyNotes'
import styles from './SharedNotes.module.css'

const TOOLBAR = [
  { cmd: 'bold',          icon: 'B',  title: 'Bold',           style: { fontWeight: 700 } },
  { cmd: 'italic',        icon: 'I',  title: 'Italic',         style: { fontStyle: 'italic' } },
  { cmd: 'underline',     icon: 'U',  title: 'Underline',      style: { textDecoration: 'underline' } },
  { cmd: 'strikeThrough', icon: 'S',  title: 'Strikethrough',  style: { textDecoration: 'line-through' } },
  '|',
  { cmd: 'insertOrderedList',   icon: '1.', title: 'Numbered list' },
  { cmd: 'insertUnorderedList', icon: '•',  title: 'Bullet list' },
  '|',
  { cmd: 'indent',  icon: '→', title: 'Indent' },
  { cmd: 'outdent', icon: '←', title: 'Outdent' },
  '|',
  { cmd: 'undo', icon: '↶', title: 'Undo' },
  { cmd: 'redo', icon: '↷', title: 'Redo' },
  '|',
  { cmd: 'removeFormat', icon: 'T̸', title: 'Clear formatting' },
]

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function SharedNotes({ sidebarMode }) {
  const [open, setOpen]         = useState(false)
  const editorRef               = useRef(null)
  const localEditRef            = useRef(false)
  const localEditTimerRef       = useRef(null)

  const markLocalEdit = useCallback(() => {
    localEditRef.current = true
    if (localEditTimerRef.current) clearTimeout(localEditTimerRef.current)
    localEditTimerRef.current = setTimeout(() => {
      localEditRef.current = false
    }, 600)
  }, [])

  const handleRemoteNotes = useCallback((remote) => {
    if (localEditRef.current) return
    if (editorRef.current && editorRef.current.innerHTML !== remote) {
      editorRef.current.innerHTML = remote
    }
  }, [])

  const { publish } = useAblyNotes({ onNotesUpdate: handleRemoteNotes })

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    markLocalEdit()
    publish(editorRef.current.innerHTML)
  }, [publish, markLocalEdit])

  const execCmd = useCallback((cmd) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    handleInput()
  }, [handleInput])

  const handleExportText = useCallback(() => {
    const text = editorRef.current?.innerText || ''
    downloadFile('lightning-ladder-notes.txt', text, 'text/plain')
  }, [])

  const handleExportHtml = useCallback(() => {
    const html = editorRef.current?.innerHTML || ''
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lightning Ladder Notes</title><style>body{font-family:monospace;padding:24px;max-width:800px;margin:0 auto;line-height:1.6}</style></head><body>${html}</body></html>`
    downloadFile('lightning-ladder-notes.html', full, 'text/html')
  }, [])

  const handleClearAll = useCallback(() => {
    if (!confirm('Clear all notes? This affects all connected users.')) return
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      publish('')
    }
  }, [publish])

  const panelClass = sidebarMode
    ? `${styles.panel} ${styles.sidebarPanel}`
    : styles.panel

  const isOpen = open || sidebarMode

  return (
    <div className={panelClass}>
      {!sidebarMode && (
        <button className={styles.toggle} onClick={() => setOpen((o) => !o)}>
          <span className={styles.toggleIcon}>{open ? '▾' : '▸'}</span>
          <span className={styles.toggleLabel}>SHARED NOTES</span>
          <span className={styles.toggleHint}>
            {open ? '' : '// click to expand'}
          </span>
        </button>
      )}

      {sidebarMode && (
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>SHARED NOTES</span>
        </div>
      )}

      {isOpen && (
        <div className={styles.editorWrap}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {TOOLBAR.map((item, i) =>
                item === '|' ? (
                  <div key={i} className={styles.toolSep} />
                ) : (
                  <button
                    key={item.cmd}
                    className={styles.toolBtn}
                    title={item.title}
                    style={item.style || {}}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => execCmd(item.cmd)}
                  >
                    {item.icon}
                  </button>
                )
              )}
            </div>
            <div className={styles.toolbarRight}>
              <button
                className={styles.toolBtn}
                title="Export as text"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleExportText}
              >
                ↓TXT
              </button>
              <button
                className={styles.toolBtn}
                title="Export as HTML"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleExportHtml}
              >
                ↓HTML
              </button>
              <button
                className={`${styles.toolBtn} ${styles.toolDanger}`}
                title="Clear all notes"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearAll}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Rich text editable area */}
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder="Type shared notes here... everyone sees updates in real-time."
          />
        </div>
      )}
    </div>
  )
}
