import { Expense } from '@/lib/types'

interface Props {
  expenses: Expense[]
}

const GROUP_COLORS: Record<string, string> = {
  'בית':                              '#45B7D1',
  'חוץ':                              '#96CEB4',
  'מינויים קבועים':                   '#4ECDC4',
  'חינוך ותרבות':                     '#87CEEB',
  'בריאות וטיפוח':                    '#DDA0DD',
  'הוצאות עסק מזומן ובלת"מ':         '#DEB887',
  'הוצאות עסק, מזומן ובלת"מ':        '#DEB887',
  'חסכונות מיסים וביטוחים':          '#90EE90',
  'חסכונות, מיסים וביטוחים':         '#90EE90',
}

const FALLBACK_COLORS = ['#FF6B6B', '#FFB347', '#F0E68C', '#98FB98', '#FFD166', '#A78BFA', '#F472B6']

export default function ExpenseBreakdown({ expenses }: Props) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  // קיבוץ לפי group (סוג), דינמי
  const groupMap = new Map<string, number>()
  for (const e of expenses) {
    const key = e.group?.trim() || e.category?.trim() || 'אחר'
    groupMap.set(key, (groupMap.get(key) ?? 0) + e.amount)
  }

  const categorized = [...groupMap.entries()]
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([group, amount], i) => ({
      group,
      amount,
      color: GROUP_COLORS[group] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>הוצאות לפי קטגוריה</h3>
      {categorized.map(({ group, color, amount }) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={group}>
            <div className="flex justify-between text-sm mb-1">
              <span>{group}</span>
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
