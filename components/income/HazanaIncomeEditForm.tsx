'use client'

import { useState } from 'react'
import { IncomeJob } from '@/lib/types'
import { INCOME_TYPES, INCOME_OWNERS } from '@/lib/constants'

interface Props {
  job: IncomeJob
  onSuccess: () => void
  onClose: () => void
}

export default function HazanaIncomeEditForm({ job, onSuccess, onClose }: Props) {
  const [type, setType] = useState<IncomeJob['type']>(job.type)
  const [owner, setOwner] = useState<IncomeJob['owner']>(job.owner)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/income/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, owner }),
      })
      if (!res.ok) throw new Error()
      onSuccess()
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  const btnBase: React.CSSProperties = {
    flex: 1, padding: '0.5rem', borderRadius: 8,
    cursor: 'pointer', fontWeight: 400, minHeight: 44,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold">עריכת הכנסה</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{job.project} • ₪{job.amount.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--muted)' }}>סוג הכנסה</label>
            <div className="grid grid-cols-2 gap-2">
              {INCOME_TYPES.map(({ value, label, color }) => (
                <button
                  key={value} type="button"
                  onClick={() => setType(value as IncomeJob['type'])}
                  style={{
                    ...btnBase,
                    border: `1px solid ${type === value ? color : 'var(--border)'}`,
                    background: type === value ? color + '33' : 'var(--bg3)',
                    color: type === value ? color : 'var(--text)',
                    fontWeight: type === value ? 700 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--muted)' }}>בעלים</label>
            <div className="flex gap-2">
              {INCOME_OWNERS.map(({ value, color }) => (
                <button
                  key={value} type="button"
                  onClick={() => setOwner(value as IncomeJob['owner'])}
                  style={{
                    ...btnBase,
                    border: `1px solid ${owner === value ? color : 'var(--border)'}`,
                    background: owner === value ? color + '33' : 'var(--bg3)',
                    color: owner === value ? color : 'var(--text)',
                    fontWeight: owner === value ? 700 : 400,
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--expense)' }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                background: 'var(--income)', color: '#000', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                minHeight: 48,
              }}
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '0.75rem 1.25rem', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--muted)', cursor: 'pointer', minHeight: 48,
              }}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
