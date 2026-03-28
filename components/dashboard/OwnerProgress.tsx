import { IncomeJob, Goal } from '@/lib/types'
import { INCOME_OWNERS } from '@/lib/constants'
import ProgressRing from './ProgressRing'

interface Props {
  incomeJobs: IncomeJob[]
  goals: Goal[]
  year: number
}

const OWNERS: Goal['owner'][] = ['גדי', 'שרון', 'כללי']

export default function OwnerProgress({ incomeJobs, goals, year }: Props) {
  const currentQ = Math.floor(new Date().getMonth() / 3) + 1
  const qPeriod = `Q${currentQ}` as Goal['period']
  const qMonths = [(currentQ - 1) * 3, (currentQ - 1) * 3 + 1, (currentQ - 1) * 3 + 2]

  function getGoalAmount(owner: Goal['owner'], period: Goal['period']): number {
    return goals.find((g) => g.owner === owner && g.period === period && g.year === year)?.amount ?? 0
  }

  function getOwnerIncome(owner: Goal['owner']): number {
    return incomeJobs.filter((j) => j.owner === owner).reduce((s, j) => s + j.amount, 0)
  }

  function getOwnerQIncome(owner: Goal['owner']): number {
    return incomeJobs
      .filter((j) => j.owner === owner && qMonths.includes(new Date(j.payDate).getMonth()))
      .reduce((s, j) => s + j.amount, 0)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>התקדמות לפי בעלים</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OWNERS.map((owner) => {
          const color = INCOME_OWNERS.find((o) => o.value === owner)?.color ?? 'var(--income)'
          const annualGoal = getGoalAmount(owner, 'שנתי')
          const qGoal = getGoalAmount(owner, qPeriod)
          const annualActual = getOwnerIncome(owner)
          const qActual = getOwnerQIncome(owner)
          const annualPct = annualGoal > 0 ? Math.min((annualActual / annualGoal) * 100, 100) : 0
          const qPct = qGoal > 0 ? Math.min((qActual / qGoal) * 100, 100) : 0

          return (
            <div
              key={owner}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg2)', border: `1px solid var(--border)` }}
            >
              <p className="font-semibold text-base mb-3" style={{ color }}>{owner}</p>

              <div className="flex gap-4 items-start">
                {/* שנתי */}
                <div className="flex flex-col items-center gap-1">
                  <ProgressRing value={annualPct} size={72} strokeWidth={7} color={color}>
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{Math.round(annualPct)}%</span>
                  </ProgressRing>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>שנתי</span>
                  <span className="text-xs font-semibold" style={{ color }}>₪{annualActual.toLocaleString()}</span>
                  {annualGoal > 0 && (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>מתוך ₪{annualGoal.toLocaleString()}</span>
                  )}
                </div>

                {/* רבעוני */}
                <div className="flex flex-col items-center gap-1">
                  <ProgressRing value={qPct} size={72} strokeWidth={7} color={color + 'aa'}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: color + 'aa' }}>{Math.round(qPct)}%</span>
                  </ProgressRing>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{qPeriod}</span>
                  <span className="text-xs font-semibold" style={{ color: color + 'aa' }}>₪{qActual.toLocaleString()}</span>
                  {qGoal > 0 && (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>מתוך ₪{qGoal.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {annualGoal === 0 && qGoal === 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>לא הוגדר יעד</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
