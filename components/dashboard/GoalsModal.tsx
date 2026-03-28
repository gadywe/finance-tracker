'use client'

import { useState } from 'react'
import { Goal } from '@/lib/types'
import { INCOME_OWNERS } from '@/lib/constants'

const PERIODS: Goal['period'][] = ['שנתי', 'Q1', 'Q2', 'Q3', 'Q4']
const OWNERS: Goal['owner'][] = ['גדי', 'שרון', 'כללי']

interface Props {
  goals: Goal[]
  year: number
  onSaved: () => void
  onClose: () => void
}

function getAmount(goals: Goal[], owner: Goal['owner'], period: Goal['period'], year: number): string {
  const g = goals.find((g) => g.owner === owner && g.period === period && g.year === year)
  return g ? String(g.amount) : ''
}

export default function GoalsModal({ goals, year, onSaved, onClose }: Props) {
  type FormState = Record<string, string> // key: "owner|period"
  const initial: FormState = {}
  OWNERS.forEach((o) => PERIODS.forEach((p) => { initial[`${o}|${p}`] = getAmount(goals, o, p, year) }))
  const [form, setForm] = useState<FormState>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.4rem 0.5rem', textAlign: 'center',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', fontSize: 14,
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const toSave: Goal[] = []
      OWNERS.forEach((owner) => {
        PERIODS.forEach((period) => {
          const val = Number(form[`${owner}|${period}`])
          if (!isNaN(val) && val >= 0) {
            toSave.push({ owner, period, year, amount: val })
          }
        })
      })
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      })
      if (!res.ok) throw new Error()
      onSaved()
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">יעדים {year}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', padding: '0 0.25rem' }}>×</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem', color: 'var(--muted)', fontWeight: 500, textAlign: 'right' }}>תקופה</th>
                {OWNERS.map((o) => {
                  const ownerColor = INCOME_OWNERS.find((x) => x.value === o)?.color ?? 'var(--text)'
                  return (
                    <th key={o} style={{ padding: '0.5rem', color: ownerColor, fontWeight: 600, textAlign: 'center', minWidth: 90 }}>
                      {o}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem', color: 'var(--muted)', fontWeight: 500 }}>{period}</td>
                  {OWNERS.map((owner) => (
                    <td key={owner} style={{ padding: '0.4rem 0.5rem' }}>
                      <input
                        style={inputStyle}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form[`${owner}|${period}`]}
                        onChange={(e) => setForm((f) => ({ ...f, [`${owner}|${period}`]: e.target.value }))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--expense)' }}>{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
              background: 'var(--income)', color: '#000', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: 48,
            }}
          >
            {loading ? 'שומר...' : 'שמור יעדים'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.25rem', borderRadius: 10,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer', minHeight: 48,
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
