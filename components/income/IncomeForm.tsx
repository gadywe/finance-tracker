'use client'

import { useState } from 'react'
import { IncomeJob } from '@/lib/types'
import { INCOME_TYPES, INCOME_OWNERS } from '@/lib/constants'

interface Props {
  job?: IncomeJob
  onSuccess: () => void
  onClose: () => void
}

const today = () => new Date().toISOString().split('T')[0]

export default function IncomeForm({ job, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    project:  job?.project  ?? '',
    type:     job?.type     ?? 'הצגה',
    amount:   job?.amount   ?? '',
    endDate:  job?.endDate  ?? today(),
    payDate:  job?.payDate  ?? today(),
    status:   job?.status   ?? 'expected',
    note:     job?.note     ?? '',
    owner:    job?.owner    ?? 'כללי',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.project || !form.amount) { setError('נא למלא שם פרויקט וסכום'); return }
    setLoading(true)
    setError('')
    try {
      const body = { ...form, amount: Number(form.amount) }
      const res = job
        ? await fetch(`/api/income/${job.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/income', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('שגיאה בשמירה')
      onSuccess()
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 16,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{job ? 'עריכת עבודה' : 'עבודה חדשה'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>שם פרויקט / לקוח</label>
            <input style={inputStyle} value={form.project} onChange={(e) => set('project', e.target.value)} placeholder="שם הפרויקט" />
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>סוג עבודה</label>
            <select style={inputStyle} value={form.type} onChange={(e) => set('type', e.target.value)}>
              {INCOME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>סכום (₪)</label>
            <input style={inputStyle} type="number" min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm" style={{ color: 'var(--muted)' }}>תאריך סיום עבודה</label>
              <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
            <div>
              <label className="text-sm" style={{ color: 'var(--muted)' }}>תאריך קבלת תשלום</label>
              <input style={inputStyle} type="date" value={form.payDate} onChange={(e) => set('payDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--muted)' }}>סטטוס</label>
            <div className="flex gap-2">
              {(['expected', 'paid'] as const).map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => set('status', s)}
                  style={{
                    flex: 1, padding: '0.5rem',
                    borderRadius: 8, border: '1px solid var(--border)',
                    background: form.status === s ? (s === 'paid' ? 'var(--profit)' : 'var(--warning)') : 'var(--bg3)',
                    color: form.status === s ? '#000' : 'var(--text)',
                    cursor: 'pointer', fontWeight: form.status === s ? 600 : 400,
                    minHeight: 44,
                  }}
                >
                  {s === 'paid' ? '✓ שולם' : '⏳ צפוי'}
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
                  onClick={() => set('owner', value)}
                  style={{
                    flex: 1, padding: '0.5rem',
                    borderRadius: 8, border: `1px solid ${form.owner === value ? color : 'var(--border)'}`,
                    background: form.owner === value ? color + '33' : 'var(--bg3)',
                    color: form.owner === value ? color : 'var(--text)',
                    cursor: 'pointer', fontWeight: form.owner === value ? 700 : 400,
                    minHeight: 44,
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>הערה (אופציונלי)</label>
            <input style={inputStyle} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="הערה..." />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--expense)' }}>{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                background: 'var(--income)', color: '#000', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                minHeight: 48,
              }}
            >
              {loading ? 'שומר...' : job ? 'שמור שינויים' : 'הוסף עבודה'}
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
