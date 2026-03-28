import { IncomeJob, Expense } from '@/lib/types'
import { ANNUAL_INCOME_GOAL } from '@/lib/constants'
import ProgressRing from './ProgressRing'
import NetProfitCard from './NetProfitCard'

interface Props {
  incomeJobs: IncomeJob[]
  expenses: Expense[]
}

export default function FinancialSummary({ incomeJobs, expenses }: Props) {
  const totalIncome = incomeJobs.reduce((s, j) => s + j.amount, 0)
  const paidIncome = incomeJobs.filter((j) => j.status === 'paid').reduce((s, j) => s + j.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const incomePct = Math.min((totalIncome / ANNUAL_INCOME_GOAL) * 100, 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* הכנסות YTD */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>הכנסות YTD</p>
        <div className="flex items-center gap-4">
          <ProgressRing value={incomePct} size={80} strokeWidth={8} color="var(--income)">
            <span className="text-xs font-bold" style={{ color: 'var(--income)' }}>{Math.round(incomePct)}%</span>
          </ProgressRing>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--income)' }}>₪{totalIncome.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>יעד: ₪{ANNUAL_INCOME_GOAL.toLocaleString()}</p>
            <p className="text-xs" style={{ color: 'var(--profit)' }}>שולם: ₪{paidIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* הוצאות YTD */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>הוצאות YTD</p>
        <div className="flex items-center gap-4">
          <ProgressRing value={100} size={80} strokeWidth={8} color="var(--expense)">
            <span className="text-lg">💸</span>
          </ProgressRing>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--expense)' }}>₪{totalExpenses.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{expenses.length} הוצאות השנה</p>
          </div>
        </div>
      </div>

      {/* רווח נקי */}
      <NetProfitCard incomeJobs={incomeJobs} expenses={expenses} />
    </div>
  )
}
