'use client'

import { IncomeJob } from '@/lib/types'
import { INCOME_TYPES, INCOME_OWNERS } from '@/lib/constants'

interface Props {
  jobs: IncomeJob[]
  onEdit: (job: IncomeJob) => void
  onEditHazana: (job: IncomeJob) => void
  onDelete: (id: string) => void
}

export default function IncomeList({ jobs, onEdit, onEditHazana, onDelete }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--muted)' }}>אין עבודות מוגדרות עדיין</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => {
        const typeInfo = INCOME_TYPES.find((t) => t.value === job.type)
        const ownerInfo = INCOME_OWNERS.find((o) => o.value === job.owner)
        return (
          <div
            key={job.id}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{job.project}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: typeInfo?.color + '22', color: typeInfo?.color }}>
                  {typeInfo?.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: job.status === 'paid' ? '#06D6A022' : job.status === 'pending' ? '#FB923C22' : '#FFD16622',
                    color:      job.status === 'paid' ? '#06D6A0'   : job.status === 'pending' ? '#FB923C'   : '#FFD166',
                  }}
                >
                  {job.status === 'paid' ? '✓ שולם' : job.status === 'pending' ? '🔔 ממתין לתשלום' : '⏳ צפוי'}
                </span>
                {ownerInfo && job.owner !== 'כללי' && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ownerInfo.color + '22', color: ownerInfo.color }}>
                    {job.owner}
                  </span>
                )}
                {job.id.startsWith('hazana-') && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#5a5a7a22', color: 'var(--muted)' }}>
                    הזנה
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                <span>תשלום: {job.payDate}</span>
                {job.note && <span>• {job.note}</span>}
              </div>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="font-bold text-lg" style={{ color: job.status === 'paid' ? '#06D6A0' : job.status === 'pending' ? '#FB923C' : '#FFD166' }}>
                ₪{job.amount.toLocaleString()}
              </p>
            </div>
            {job.id.startsWith('hazana-') ? (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditHazana(job)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text)', minHeight: 36, fontSize: 13 }}
                >
                  עריכה
                </button>
              </div>
            ) : (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(job)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text)', minHeight: 36, fontSize: 13 }}
                >
                  עריכה
                </button>
                <button
                  onClick={() => { if (confirm(`למחוק את "${job.project}"?`)) onDelete(job.id) }}
                  style={{ background: '#FF5A5A22', border: '1px solid var(--expense)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--expense)', minHeight: 36, fontSize: 13 }}
                >
                  מחק
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
