'use client'

import { Expense, BudgetEntry } from '@/lib/types'
import { EXPENSE_CATEGORIES, BI_MONTHLY_PERIODS } from '@/lib/constants'

interface Props {
  expenses: Expense[]
  budget: BudgetEntry[]
  period: string
}

export default function BudgetProgress({ expenses, budget, period }: Props) {
  const periodConfig = BI_MONTHLY_PERIODS.find((p) => p.label === period)
  const periodBudget = budget.filter((b) => b.period === period)

  if (periodBudget.length === 0) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--muted)' }}>ביצוע מול יעד — {period}</h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>אין נתוני תכנון לתקופה זו</p>
      </div>
    )
  }

  const periodExpenses = periodConfig
    ? expenses.filter((e) => {
        const month = new Date(e.date).getMonth()
        return periodConfig.months.includes(month)
      })
    : []

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>ביצוע מול יעד — {period}</h3>
      {periodBudget.map(({ category, amount: budgeted }) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
        const actual = periodExpenses
          .filter((e) => e.category === category)
          .reduce((s, e) => s + e.amount, 0)

        const ratio = budgeted > 0 ? actual / budgeted : 0
        const pct = Math.min(ratio * 100, 100)
        const isOver = actual > budgeted
        const barColor = isOver ? '#FF5A5A' : ratio >= 0.8 ? '#FFD166' : '#06D6A0'

        return (
          <div key={category}>
            <div className="flex justify-between text-sm mb-1">
              <span>
                {cat?.icon ?? '📦'} {category}
              </span>
              <span style={{ color: isOver ? '#FF5A5A' : 'var(--text)', fontSize: 13 }}>
                ₪{actual.toLocaleString()} / ₪{budgeted.toLocaleString()}
                <span style={{ color: 'var(--muted)', marginRight: 6 }}>
                  ({Math.round(ratio * 100)}%)
                </span>
              </span>
            </div>
            <div
              className="rounded-full"
              style={{ height: 10, background: 'var(--border)' }}
            >
              <div
                className="rounded-full transition-all duration-500"
                style={{ height: 10, width: `${pct}%`, background: barColor }}
              />
            </div>
            {isOver && (
              <p className="text-xs mt-0.5" style={{ color: '#FF5A5A' }}>
                חריגה של ₪{(actual - budgeted).toLocaleString()}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
