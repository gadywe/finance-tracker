'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import ExpenseBreakdown from './ExpenseBreakdown'
import ExpenseList from '@/components/expenses/ExpenseList'
import ExpenseForm from '@/components/expenses/ExpenseForm'

interface Props {
  expenses: Expense[]
  onRefresh: () => void
}

export default function ExpenseSection({ expenses, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | undefined>()
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())

  const now = new Date()
  const currentYear = now.getFullYear()

  // הוצאות חודש נוכחי
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && d.getMonth() === filterMonth
  })

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)

  // ממוצע חודשי (מחודשים עם נתונים)
  const byMonth = Array.from({ length: 12 }, (_, i) =>
    expenses.filter((e) => { const d = new Date(e.date); return d.getFullYear() === currentYear && d.getMonth() === i })
      .reduce((s, e) => s + e.amount, 0)
  )
  const activeMonths = byMonth.filter((m) => m > 0).length
  const monthlyAvg = activeMonths > 0 ? byMonth.reduce((s, m) => s + m, 0) / activeMonths : 0

  const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

  async function handleDelete(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  function openEdit(expense: Expense) {
    setEditExpense(expense)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditExpense(undefined)
  }

  return (
    <div className="space-y-4">
      {/* סיכום חודשי */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>חודש {MONTHS[filterMonth]}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--expense)' }}>₪{monthTotal.toLocaleString()}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{monthExpenses.length} הוצאות</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>ממוצע חודשי</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--warning)' }}>₪{Math.round(monthlyAvg).toLocaleString()}</p>
          <p className="text-xs mt-1" style={{ color: monthTotal > monthlyAvg ? 'var(--expense)' : 'var(--profit)' }}>
            {monthTotal > monthlyAvg ? '▲ מעל הממוצע' : '▼ מתחת לממוצע'}
          </p>
        </div>
      </div>

      {/* פירוט לפי קטגוריה (כל השנה) */}
      <ExpenseBreakdown expenses={expenses.filter((e) => new Date(e.date).getFullYear() === currentYear)} />

      {/* בחירת חודש + כפתור הוספה */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>חודש:</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text)', padding: '0.4rem 0.75rem', fontSize: 14,
            }}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setEditExpense(undefined); setShowForm(true) }}
          style={{
            background: 'var(--expense)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '0.5rem 1.25rem', fontWeight: 700,
            cursor: 'pointer', minHeight: 44, fontSize: 14,
          }}
        >
          + הוצאה חדשה
        </button>
      </div>

      <ExpenseList expenses={monthExpenses} onEdit={openEdit} onDelete={handleDelete} />

      {showForm && (
        <ExpenseForm
          expense={editExpense}
          onSuccess={onRefresh}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
