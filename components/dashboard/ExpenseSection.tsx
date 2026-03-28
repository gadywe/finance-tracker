'use client'

import { useState, useEffect } from 'react'
import { Expense, BudgetEntry } from '@/lib/types'
import { BI_MONTHLY_PERIODS } from '@/lib/constants'
import BudgetProgress from './BudgetProgress'
import ExpenseList from '@/components/expenses/ExpenseList'
import ExpenseForm from '@/components/expenses/ExpenseForm'

interface Props {
  expenses: Expense[]
  onRefresh: () => void
}

function getCurrentPeriodIndex() {
  const month = new Date().getMonth()
  const idx = BI_MONTHLY_PERIODS.findIndex((p) => p.months.includes(month))
  return idx >= 0 ? idx : 0
}

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export default function ExpenseSection({ expenses, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | undefined>()
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())
  const [periodIndex, setPeriodIndex] = useState(getCurrentPeriodIndex)
  const [budget, setBudget] = useState<BudgetEntry[]>([])

  const currentYear = new Date().getFullYear()
  const selectedPeriod = BI_MONTHLY_PERIODS[periodIndex]

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBudget(data) })
      .catch(() => {})
  }, [])

  // הוצאות לתקופה הדו-חודשית הנבחרת
  const periodExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && selectedPeriod.months.includes(d.getMonth())
  })
  const periodTotal = periodExpenses.reduce((s, e) => s + e.amount, 0)
  const periodBudgetTotal = budget
    .filter((b) => b.period === selectedPeriod.label)
    .reduce((s, b) => s + b.amount, 0)
  const budgetRemaining = periodBudgetTotal - periodTotal
  const hasBudget = periodBudgetTotal > 0

  // הוצאות לחודש הנבחר (לרשימה)
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && d.getMonth() === filterMonth
  })

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
      {/* כפתור הוספה */}
      <button
        onClick={() => { setEditExpense(undefined); setShowForm(true) }}
        style={{
          width: '100%', background: 'var(--expense)', color: '#fff', border: 'none',
          borderRadius: 10, padding: '0.75rem', fontWeight: 700,
          cursor: 'pointer', minHeight: 48, fontSize: 15,
        }}
      >
        + הוצאה חדשה
      </button>

      {/* בורר תקופה דו-חודשית */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-3">
        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>תקופה דו-חודשית</p>
        <div className="flex gap-1.5 flex-wrap">
          {BI_MONTHLY_PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIndex(i)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 8,
                border: `1px solid ${periodIndex === i ? 'var(--income)' : 'var(--border)'}`,
                background: periodIndex === i ? '#3DDBD922' : 'var(--bg3)',
                color: periodIndex === i ? 'var(--income)' : 'var(--muted)',
                fontWeight: periodIndex === i ? 600 : 400,
                cursor: 'pointer',
                fontSize: 13,
                minHeight: 36,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* סיכום תקופה */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>הוצאות {selectedPeriod.label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--expense)' }}>
            ₪{periodTotal.toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{periodExpenses.length} הוצאות</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {hasBudget ? (
            <>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {budgetRemaining >= 0 ? 'נותר בתקציב' : 'חריגה מתקציב'}
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: budgetRemaining >= 0 ? 'var(--profit)' : 'var(--expense)' }}
              >
                ₪{Math.abs(budgetRemaining).toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                מתוך ₪{periodBudgetTotal.toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>תקציב מתוכנן</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--muted)' }}>—</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>לא הוגדר</p>
            </>
          )}
        </div>
      </div>

      {/* ביצוע מול יעד לפי קטגוריה */}
      <BudgetProgress expenses={expenses} budget={budget} period={selectedPeriod.label} />

      {/* בחירת חודש */}
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
