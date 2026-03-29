'use client'

import { useState } from 'react'
import { IncomeJob, Goal } from '@/lib/types'
import { ANNUAL_INCOME_GOAL } from '@/lib/constants'
import ProgressRing from './ProgressRing'
import TypeBreakdown from './TypeBreakdown'
import IncomeList from '@/components/income/IncomeList'
import IncomeForm from '@/components/income/IncomeForm'
import HazanaIncomeEditForm from '@/components/income/HazanaIncomeEditForm'

interface Props {
  incomeJobs: IncomeJob[]
  goals: Goal[]
  onRefresh: () => void
}

export default function IncomeSection({ incomeJobs, goals, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState<IncomeJob | undefined>()
  const [hazanaEditJob, setHazanaEditJob] = useState<IncomeJob | undefined>()

  const total = incomeJobs.reduce((s, j) => s + j.amount, 0)
  const paid = incomeJobs.filter((j) => j.status === 'paid').reduce((s, j) => s + j.amount, 0)
  const expected = total - paid

  const annualGoal = goals.filter((g) => g.period === 'שנתי').reduce((s, g) => s + g.amount, 0) || ANNUAL_INCOME_GOAL
  const annualPct = Math.min((total / annualGoal) * 100, 100)

  function qData(period: 'Q1' | 'Q2', months: number[]) {
    const goalAmt = goals.filter((g) => g.period === period).reduce((s, g) => s + g.amount, 0)
    const incomeAmt = incomeJobs
      .filter((j) => months.includes(new Date(j.payDate).getMonth()))
      .reduce((s, j) => s + j.amount, 0)
    return { goalAmt, incomeAmt, pct: goalAmt > 0 ? Math.min((incomeAmt / goalAmt) * 100, 100) : 0 }
  }

  const q1 = qData('Q1', [0, 1, 2])
  const q2 = qData('Q2', [3, 4, 5])

  async function handleDelete(id: string) {
    await fetch(`/api/income/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  function openEdit(job: IncomeJob) {
    setEditJob(job)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditJob(undefined)
  }

  return (
    <div className="space-y-4">
      {/* יעדים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* שנתי */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>יעד שנתי</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={annualPct} size={80} strokeWidth={8} color="var(--income)">
              <span className="text-xs font-bold" style={{ color: 'var(--income)' }}>{Math.round(annualPct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--income)' }}>₪{total.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>מתוך ₪{annualGoal.toLocaleString()}</p>
              <p className="text-xs" style={{ color: 'var(--profit)' }}>שולם ₪{paid.toLocaleString()}</p>
              {expected > 0 && <p className="text-xs" style={{ color: 'var(--warning)' }}>צפוי ₪{expected.toLocaleString()}</p>}
            </div>
          </div>
        </div>

        {/* Q1 */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>Q1 — ינואר-מרץ</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={q1.pct} size={80} strokeWidth={8} color="#94A3B8">
              <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>{Math.round(q1.pct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold" style={{ color: '#94A3B8' }}>₪{q1.incomeAmt.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>מתוך ₪{q1.goalAmt.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Q2 — נוכחי */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--income)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--income)' }}>Q2 — אפריל-יוני ✦ נוכחי</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={q2.pct} size={80} strokeWidth={8} color="var(--warning)">
              <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>{Math.round(q2.pct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--warning)' }}>₪{q2.incomeAmt.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>מתוך ₪{q2.goalAmt.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* פירוט לפי סוג */}
      <TypeBreakdown incomeJobs={incomeJobs} onEdit={openEdit} onEditHazana={setHazanaEditJob} />

      {/* רשימה + כפתור הוספה */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">כל העבודות ({incomeJobs.length})</h3>
        <button
          onClick={() => { setEditJob(undefined); setShowForm(true) }}
          style={{
            background: 'var(--income)', color: '#000', border: 'none',
            borderRadius: 10, padding: '0.5rem 1.25rem', fontWeight: 700,
            cursor: 'pointer', minHeight: 44, fontSize: 14,
          }}
        >
          + עבודה חדשה
        </button>
      </div>

      <IncomeList jobs={incomeJobs} onEdit={openEdit} onEditHazana={setHazanaEditJob} onDelete={handleDelete} />

      {showForm && (
        <IncomeForm
          job={editJob}
          onSuccess={onRefresh}
          onClose={closeForm}
        />
      )}

      {hazanaEditJob && (
        <HazanaIncomeEditForm
          job={hazanaEditJob}
          onSuccess={onRefresh}
          onClose={() => setHazanaEditJob(undefined)}
        />
      )}
    </div>
  )
}
