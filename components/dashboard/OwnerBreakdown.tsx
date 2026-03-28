import { IncomeJob } from '@/lib/types'
import { INCOME_OWNERS } from '@/lib/constants'

interface Props {
  incomeJobs: IncomeJob[]
}

export default function OwnerBreakdown({ incomeJobs }: Props) {
  const total = incomeJobs.reduce((s, j) => s + j.amount, 0)

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>הכנסות לפי בעלים</h3>
      {INCOME_OWNERS.map(({ value, color }) => {
        const paid = incomeJobs.filter((j) => j.owner === value && j.status === 'paid').reduce((s, j) => s + j.amount, 0)
        const expected = incomeJobs.filter((j) => j.owner === value && j.status === 'expected').reduce((s, j) => s + j.amount, 0)
        const amount = paid + expected
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={value}>
            <div className="flex justify-between items-center text-sm mb-1">
              <span>{value}</span>
              <div className="flex gap-2 text-xs">
                {paid > 0 && <span style={{ color: 'var(--profit)' }}>שולם ₪{paid.toLocaleString()}</span>}
                {expected > 0 && <span style={{ color: 'var(--warning)' }}>צפוי ₪{expected.toLocaleString()}</span>}
                {amount === 0 && <span style={{ color: 'var(--muted)' }}>₪0</span>}
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
      {total === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>אין נתוני הכנסות</p>}
    </div>
  )
}
