'use client'

import { Expense } from '@/lib/types'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

interface Props {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--muted)' }}>אין הוצאות לתקופה זו</p>
      </div>
    )
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-2">
      {sorted.map((exp) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.value === exp.category)
        return (
          <div
            key={exp.id}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: (cat?.color ?? '#888') + '22' }}
            >
              {cat?.icon ?? '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{exp.description || exp.category}</p>
              <div className="flex gap-2 text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                <span>{exp.date}</span>
                {exp.category && <span>• {exp.category}</span>}
                {exp.paymentMethod && <span>• {exp.paymentMethod}</span>}
              </div>
            </div>
            <p className="font-bold flex-shrink-0" style={{ color: 'var(--expense)' }}>
              ₪{exp.amount.toLocaleString()}
            </p>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(exp)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer', color: 'var(--text)', minHeight: 36, fontSize: 13 }}
              >
                עריכה
              </button>
              <button
                onClick={() => { if (confirm('למחוק הוצאה זו?')) onDelete(exp.id) }}
                style={{ background: '#FF5A5A22', border: '1px solid var(--expense)', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer', color: 'var(--expense)', minHeight: 36, fontSize: 13 }}
              >
                מחק
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
