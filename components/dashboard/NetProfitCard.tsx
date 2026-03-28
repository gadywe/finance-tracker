import { IncomeJob, Expense } from '@/lib/types'
import ProgressRing from './ProgressRing'

interface Props {
  incomeJobs: IncomeJob[]
  expenses: Expense[]
}

export default function NetProfitCard({ incomeJobs, expenses }: Props) {
  const totalIncome = incomeJobs.reduce((s, j) => s + j.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const net = totalIncome - totalExpenses
  const pct = totalIncome > 0 ? Math.min((net / totalIncome) * 100, 100) : 0
  const color = net >= 0 ? 'var(--profit)' : 'var(--expense)'

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>רווח נקי</p>
      <div className="flex items-center gap-4">
        <ProgressRing value={Math.abs(pct)} size={80} strokeWidth={8} color={color}>
          <span className="text-xs font-bold" style={{ color }}>{Math.round(Math.abs(pct))}%</span>
        </ProgressRing>
        <div>
          <p className="text-2xl font-bold" style={{ color }}>
            {net < 0 ? '-' : ''}₪{Math.abs(net).toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>הכנסות − הוצאות</p>
          <p className="text-xs" style={{ color }}>{net >= 0 ? '📈 חיובי' : '📉 שלילי'}</p>
        </div>
      </div>
    </div>
  )
}
