'use client'

import { useState } from 'react'
import { IncomeJob } from '@/lib/types'
import { ANNUAL_INCOME_GOAL, QUARTERLY_GOAL } from '@/lib/constants'
import ProgressRing from './ProgressRing'
import TypeBreakdown from './TypeBreakdown'
import IncomeList from '@/components/income/IncomeList'
import IncomeForm from '@/components/income/IncomeForm'
import HazanaIncomeEditForm from '@/components/income/HazanaIncomeEditForm'

interface Props {
  incomeJobs: IncomeJob[]
  onRefresh: () => void
}

export default function IncomeSection({ incomeJobs, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState<IncomeJob | undefined>()
  const [hazanaEditJob, setHazanaEditJob] = useState<IncomeJob | undefined>()

  const total = incomeJobs.reduce((s, j) => s + j.amount, 0)
  const paid = incomeJobs.filter((j) => j.status === 'paid').reduce((s, j) => s + j.amount, 0)
  const expected = total - paid
  const annualPct = Math.min((total / ANNUAL_INCOME_GOAL) * 100, 100)

  // רבעון נוכחי
  const q = Math.floor(new Date().getMonth() / 3)
  const qMonths = [q * 3, q * 3 + 1, q * 3 + 2]
  const qTotal = incomeJobs
    .filter((j) => { const m = new Date(j.payDate).getMonth(); return qMonths.includes(m) })
    .reduce((s, j) => s + j.amount, 0)
  const qPct = Math.min((qTotal / QUARTERLY_GOAL) * 100, 100)

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>יעד שנתי</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={annualPct} size={90} strokeWidth={9} color="var(--income)">
              <span className="text-xs font-bold" style={{ color: 'var(--income)' }}>{Math.round(annualPct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--income)' }}>₪{total.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>מתוך ₪{ANNUAL_INCOME_GOAL.toLocaleString()}</p>
              <p className="text-xs" style={{ color: 'var(--profit)' }}>שולם ₪{paid.toLocaleString()}</p>
              {expected > 0 && <p className="text-xs" style={{ color: 'var(--warning)' }}>צפוי ₪{expected.toLocaleString()}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>יעד רבעוני (רבעון {q + 1})</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={qPct} size={90} strokeWidth={9} color="var(--warning)">
              <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>{Math.round(qPct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--warning)' }}>₪{qTotal.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>מתוך ₪{QUARTERLY_GOAL.toLocaleString()}</p>
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
