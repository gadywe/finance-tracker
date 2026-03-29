'use client'

import { useState } from 'react'
import { IncomeJob } from '@/lib/types'
import { INCOME_TYPES } from '@/lib/constants'

interface Props {
  incomeJobs: IncomeJob[]
  onEdit?: (job: IncomeJob) => void
  onEditHazana?: (job: IncomeJob) => void
}

export default function TypeBreakdown({ incomeJobs, onEdit, onEditHazana }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const total = incomeJobs.reduce((s, j) => s + j.amount, 0)

  function toggle(type: string) {
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>הכנסות לפי סוג</h3>
      {INCOME_TYPES.map(({ value, label, color }) => {
        const jobs = incomeJobs.filter((j) => j.type === value)
        const paid = jobs.filter((j) => j.status === 'paid').reduce((s, j) => s + j.amount, 0)
        const expected = jobs.filter((j) => j.status === 'expected').reduce((s, j) => s + j.amount, 0)
        const amount = paid + expected
        if (amount === 0) return null
        const pct = total > 0 ? (amount / total) * 100 : 0
        const isOpen = !!expanded[value]

        return (
          <div key={value}>
            {/* שורת סוג עם חץ */}
            <button
              onClick={() => toggle(value)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right' }}
            >
              <div className="flex justify-between items-center text-sm mb-1">
                <div className="flex items-center gap-1.5">
                  <span style={{
                    fontSize: 10, color: 'var(--muted)', display: 'inline-block',
                    transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>▼</span>
                  <span>{label}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  {paid > 0 && <span style={{ color: 'var(--profit)' }}>שולם ₪{paid.toLocaleString()}</span>}
                  {expected > 0 && <span style={{ color: 'var(--warning)' }}>צפוי ₪{expected.toLocaleString()}</span>}
                </div>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>
            </button>

            {/* פירוט הכנסות */}
            {isOpen && (
              <div className="mt-2 space-y-1 pr-3" style={{ borderRight: `2px solid ${color}40` }}>
                {jobs
                  .slice()
                  .sort((a, b) => b.payDate.localeCompare(a.payDate))
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
                      style={{ background: 'var(--bg3)', fontSize: 13 }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{job.project || '—'}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>{job.payDate}</span>
                      </div>
                      <span style={{ color: job.status === 'paid' ? 'var(--profit)' : 'var(--warning)', fontWeight: 600, flexShrink: 0 }}>
                        ₪{job.amount.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: 11, padding: '0.1rem 0.4rem', borderRadius: 4, flexShrink: 0,
                          background: job.status === 'paid' ? '#06D6A022' : '#FFD16622',
                          color: job.status === 'paid' ? 'var(--profit)' : 'var(--warning)',
                        }}
                      >
                        {job.status === 'paid' ? 'שולם' : 'צפוי'}
                      </span>
                      {(onEdit || onEditHazana) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); job.id.startsWith('hazana-') ? onEditHazana?.(job) : onEdit?.(job) }}
                          style={{
                            background: 'var(--bg2)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer',
                            color: 'var(--muted)', fontSize: 12, flexShrink: 0,
                          }}
                        >
                          עריכה
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )
      })}
      {total === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>אין נתוני הכנסות</p>}
    </div>
  )
}
