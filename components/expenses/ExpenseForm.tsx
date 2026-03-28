'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'

interface Props {
  expense?: Expense
  onSuccess: () => void
  onClose: () => void
}

const today = () => new Date().toISOString().split('T')[0]

export default function ExpenseForm({ expense, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    date:          expense?.date          ?? today(),
    category:      expense?.category      ?? EXPENSE_CATEGORIES[0].value,
    description:   expense?.description   ?? '',
    amount:        expense?.amount        ?? '',
    paymentMethod: expense?.paymentMethod ?? 'מזומן',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount) { setError('נא למלא תיאור וסכום'); return }
    setLoading(true)
    setError('')
    try {
      const body = { ...form, amount: Number(form.amount) }
      const res = expense
        ? await fetch(`/api/expenses/${expense.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
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

  const selectedCat = EXPENSE_CATEGORIES.find((c) => c.value === form.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{expense ? 'עריכת הוצאה' : 'הוצאה חדשה'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>תאריך</label>
            <input style={inputStyle} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>קטגוריה</label>
            <select
              style={{ ...inputStyle, color: selectedCat?.color ?? 'var(--text)' }}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>תיאור</label>
            <input style={inputStyle} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="תיאור ההוצאה..." />
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>סכום (₪)</label>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" />
          </div>

          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--muted)' }}>אמצעי תשלום</label>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m} type="button"
                  onClick={() => set('paymentMethod', m)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 8,
                    border: `1px solid ${form.paymentMethod === m ? 'var(--income)' : 'var(--border)'}`,
                    background: form.paymentMethod === m ? '#3DDBD922' : 'var(--bg3)',
                    color: form.paymentMethod === m ? 'var(--income)' : 'var(--muted)',
                    cursor: 'pointer', fontWeight: form.paymentMethod === m ? 600 : 400,
                    minHeight: 44, fontSize: 14,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--expense)' }}>{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                background: 'var(--expense)', color: '#fff', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                minHeight: 48,
              }}
            >
              {loading ? 'שומר...' : expense ? 'שמור שינויים' : 'הוסף הוצאה'}
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
