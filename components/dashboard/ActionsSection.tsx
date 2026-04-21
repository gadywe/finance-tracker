'use client'

import { useState, useEffect } from 'react'
import { getActionLog, removeActionEntry, ActionLogEntry } from '@/lib/actionLog'

interface Props { onRefresh: () => void }

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000)
  const h = Math.floor(d / 3600000)
  const days = Math.floor(d / 86400000)
  if (m < 1)    return 'עכשיו'
  if (m < 60)   return `לפני ${m} דק'`
  if (h < 24)   return `לפני ${h} שע'`
  if (days < 7) return `לפני ${days} ימים`
  return new Date(ts).toLocaleDateString('he-IL')
}

function meta(type: string): { icon: string; color: string; label: string } {
  if (type.endsWith('_add'))    return { icon: '➕', color: '#06D6A0', label: 'הוספה'  }
  if (type.endsWith('_edit'))   return { icon: '✏️', color: '#60A5FA', label: 'עריכה'  }
                                return { icon: '🗑️', color: '#FF5A5A', label: 'מחיקה' }
}

export default function ActionsSection({ onRefresh }: Props) {
  const [log, setLog]         = useState<ActionLogEntry[]>([])
  const [undoing, setUndoing] = useState<string | null>(null)
  const [errors, setErrors]   = useState<Set<string>>(new Set())

  // קרא מ-localStorage בכל פעם שהלשונית נטענת
  useEffect(() => { setLog(getActionLog()) }, [])

  async function handleUndo(entry: ActionLogEntry) {
    setUndoing(entry.id)
    setErrors((s) => { const n = new Set(s); n.delete(entry.id); return n })

    try {
      const { actionType, entityId, undoData } = entry
      const domain = actionType.startsWith('expense') ? 'expenses' : 'income'
      let res: Response

      if (actionType.endsWith('_add')) {
        // ביטול הוספה → מחיקה
        res = await fetch(`/api/${domain}/${entityId}`, { method: 'DELETE' })

      } else if (actionType.endsWith('_edit')) {
        // ביטול עריכה → שחזור ערכים קודמים
        res = await fetch(`/api/${domain}/${entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(undoData),
        })

      } else {
        // ביטול מחיקה → הוספה מחדש (בלי id — השרת מייצר חדש)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _omit, ...body } = undoData as Record<string, unknown>
        res = await fetch(`/api/${domain}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) throw new Error()
      removeActionEntry(entry.id)
      setLog(getActionLog())
      onRefresh()
    } catch {
      setErrors((s) => new Set(s).add(entry.id))
    } finally {
      setUndoing(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base">היסטוריית פעולות</h2>
        {log.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{log.length} פעולות</span>
        )}
      </div>

      {log.length === 0 ? (
        <div className="rounded-xl p-10 text-center"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 24, marginBottom: 12 }}>📋</p>
          <p style={{ color: 'var(--text)',  fontSize: 14 }}>אין פעולות עדיין</p>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
            כל הוספה, עריכה ומחיקה של הוצאה או הכנסה יופיעו כאן
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {log.map((entry) => {
            const { icon, color, label } = meta(entry.actionType)
            const isUndoing = undoing === entry.id
            const hasError  = errors.has(entry.id)
            return (
              <div key={entry.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              >
                {/* אייקון */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: color + '20', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {icon}
                </div>

                {/* תוכן */}
                <div className="flex-1 min-w-0">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, padding: '1px 7px', borderRadius: 5,
                      background: color + '20', color,
                    }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate">
                      {entry.description}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                    {timeAgo(entry.timestamp)}
                  </p>
                  {hasError && (
                    <p style={{ fontSize: 11, color: '#FF5A5A', marginTop: 2 }}>
                      הביטול נכשל — ייתכן שהרשומה כבר שונתה
                    </p>
                  )}
                </div>

                {/* כפתורים */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => handleUndo(entry)}
                    disabled={isUndoing}
                    style={{
                      padding: '0.35rem 0.9rem', borderRadius: 8,
                      border: `1px solid ${color}`, background: color + '15',
                      color, fontSize: 12, fontWeight: 600,
                      cursor: isUndoing ? 'not-allowed' : 'pointer',
                      opacity: isUndoing ? 0.5 : 1, minHeight: 34,
                    }}
                  >
                    {isUndoing ? '...' : 'בטל'}
                  </button>
                  {hasError && (
                    <button
                      onClick={() => { removeActionEntry(entry.id); setLog(getActionLog()) }}
                      style={{
                        padding: '0.2rem 0.5rem', borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--bg3)',
                        color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      סגור
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
