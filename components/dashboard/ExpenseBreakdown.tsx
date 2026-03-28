import { Expense } from '@/lib/types'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

interface Props {
  expenses: Expense[]
}

export default function ExpenseBreakdown({ expenses }: Props) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const categorized = EXPENSE_CATEGORIES
    .map(({ value, color, icon }) => ({
      value, color, icon,
      amount: expenses.filter((e) => e.category === value).reduce((s, e) => s + e.amount, 0),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>הוצאות לפי קטגוריה</h3>
      {categorized.map(({ value, color, icon, amount }) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={value}>
            <div className="flex justify-between text-sm mb-1">
              <span>{icon} {value}</span>
              <span style={{ color }}>{pct.toFixed(0)}% — ₪{amount.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
      {categorized.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>אין נתוני הוצאות</p>}
    </div>
  )
}
