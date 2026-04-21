'use client'

import { useState, useEffect } from 'react'
import { Expense, BudgetEntry } from '@/lib/types'
import { BI_MONTHLY_PERIODS } from '@/lib/constants'
import { logAction } from '@/lib/actionLog'
import BudgetProgress from './BudgetProgress'
import CategoryDrawer from './CategoryDrawer'
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


export default function ExpenseSection({ expenses, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | undefined>()
  const [periodIndex, setPeriodIndex] = useState(getCurrentPeriodIndex)
  const [budget, setBudget] = useState<BudgetEntry[]>([])
  const [drawer, setDrawer] = useState<{ category: string; group: string } | null>(null)

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

  async function handleDelete(id: string) {
    const deleted = expenses.find((e) => e.id === id)
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (deleted) {
      logAction({
        actionType: 'expense_delete',
        description: `${deleted.description || deleted.category} — ₪${deleted.amount}`,
        entityId: id,
        undoData: deleted,
      })
    }
    onRefresh()
  }

  function openEdit(expense: Expense) {
    setDrawer(null)
    setEditExpense(expense)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditExpense(undefined)
  }

  // הוצאות לתקופה שנבחרה — לדרואר
  const drawerExpenses = drawer
    ? periodExpenses.filter((e) => e.category.trim() === drawer.category.trim())
    : []

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
      <BudgetProgress
        expenses={expenses}
        budget={budget}
        period={selectedPeriod.label}
        onCategoryClick={(category, group) => setDrawer({ category, group })}
      />

      {drawer && (
        <CategoryDrawer
          category={drawer.category}
          group={drawer.group}
          expenses={drawerExpenses}
          onEdit={openEdit}
          onDelete={handleDelete}
          onClose={() => setDrawer(null)}
        />
      )}

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
