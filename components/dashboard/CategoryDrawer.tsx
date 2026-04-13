'use client'

import { Expense } from '@/lib/types'

interface Props {
  category: string
  group: string
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function CategoryDrawer({ category, group, expenses, onEdit, onDelete, onClose }: Props) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 50,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0,
          height: '100dvh',
          width: 'min(420px, 92vw)',
          background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          zIndex: 51,
          display: 'flex', flexDirection: 'column',
          animation: 'slideInLeft 0.22s ease',
          direction: 'rtl',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1rem 0.75rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{group}</p>
            <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{category}</h2>
            <p style={{ color: 'var(--expense)', fontWeight: 600, fontSize: 15, marginTop: 2 }}>
              ₪{total.toLocaleString()} סה"כ
              <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginRight: 6 }}>
                ({sorted.length} הוצאות)
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0.35rem 0.6rem',
              color: 'var(--muted)', cursor: 'pointer', fontSize: 16,
              lineHeight: 1, minHeight: 36,
            }}
          >
            ✕
          </button>
        </div>

        {/* Expense list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {sorted.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem', fontSize: 14 }}>
              אין הוצאות בקטגוריה זו בתקופה הנבחרת
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sorted.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.description || exp.category}
                    </p>
                    <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      <span>{exp.date}</span>
                      {exp.paymentMethod && <span>• {exp.paymentMethod}</span>}
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--expense)', flexShrink: 0, fontSize: 14 }}>
                    ₪{exp.amount.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => onEdit(exp)}
                      style={{
                        background: 'var(--bg2)', border: '1px solid var(--border)',
                        borderRadius: 7, padding: '0.3rem 0.55rem',
                        color: 'var(--text)', cursor: 'pointer', fontSize: 12, minHeight: 32,
                      }}
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => { if (confirm('למחוק הוצאה זו?')) onDelete(exp.id) }}
                      style={{
                        background: '#FF5A5A18', border: '1px solid var(--expense)',
                        borderRadius: 7, padding: '0.3rem 0.55rem',
                        color: 'var(--expense)', cursor: 'pointer', fontSize: 12, minHeight: 32,
                      }}
                    >
                      מחק
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
