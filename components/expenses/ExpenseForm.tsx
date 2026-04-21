'use client'

import { useState, useEffect, useRef } from 'react'
import { Expense, BudgetEntry } from '@/lib/types'
import { PAYMENT_METHODS } from '@/lib/constants'
import { logAction } from '@/lib/actionLog'

interface Props {
  expense?: Expense
  onSuccess: () => void
  onClose: () => void
}

const today = () => new Date().toISOString().split('T')[0]

export default function ExpenseForm({ expense, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    date:          expense?.date          ?? today(),
    category:      expense?.category      ?? '',
    group:         expense?.group         ?? '',
    description:   expense?.description   ?? '',
    amount:        expense?.amount        ?? '',
    paymentMethod: expense?.paymentMethod ?? 'מזומן',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // autocomplete
  const [catQuery, setCatQuery] = useState(expense?.category ?? '')
  const [budgetCategories, setBudgetCategories] = useState<{ category: string; group: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/budget')
      .then((r) => r.json())
      .then((data: BudgetEntry[]) => {
        if (!Array.isArray(data)) return
        const seen = new Set<string>()
        const unique = data
          .filter((b) => { if (seen.has(b.category)) return false; seen.add(b.category); return true })
          .map((b) => ({ category: b.category, group: b.group }))
          .sort((a, b) => a.category.localeCompare(b.category, 'he'))
        setBudgetCategories(unique)
      })
      .catch(() => {})
  }, [])

  const suggestions = catQuery.trim()
    ? budgetCategories.filter((b) => b.category.includes(catQuery.trim()))
    : budgetCategories

  function selectCategory(b: { category: string; group: string }) {
    setCatQuery(b.category)
    setForm((f) => ({ ...f, category: b.category, group: b.group }))
    setShowDropdown(false)
  }

  function handleCatInput(val: string) {
    setCatQuery(val)
    setForm((f) => ({ ...f, category: val, group: '' }))
    setShowDropdown(true)
  }

  function handleCatBlur() {
    // delay כדי לאפשר click על אפשרות לפני סגירה
    setTimeout(() => setShowDropdown(false), 150)
  }

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category || !form.amount) { setError('נא למלא קטגוריה וסכום'); return }
    setLoading(true)
    setError('')
    try {
      const body = { ...form, amount: Number(form.amount) }
      if (expense) {
        // עריכה
        const res = await fetch(`/api/expenses/${expense.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error()
        logAction({
          actionType: 'expense_edit',
          description: `${expense.description || expense.category} — ₪${expense.amount}`,
          entityId: expense.id,
          undoData: expense,
        })
      } else {
        // הוספה
        const res = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error()
        const newExp: Expense = await res.json()
        logAction({
          actionType: 'expense_add',
          description: `${body.description || body.category} — ₪${body.amount}`,
          entityId: newExp.id,
        })
      }
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
        <h2 className="text-lg font-bold">{expense ? 'עריכת הוצאה' : 'הוצאה חדשה'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>תאריך</label>
            <input style={inputStyle} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>

          {/* autocomplete קטגוריה */}
          <div style={{ position: 'relative' }}>
            <label className="text-sm" style={{ color: 'var(--muted)' }}>קטגוריה</label>
            <input
              ref={inputRef}
              style={inputStyle}
              value={catQuery}
              onChange={(e) => handleCatInput(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={handleCatBlur}
              placeholder="חפש קטגוריה או הקלד חופשי..."
              autoComplete="off"
            />
            {form.group ? (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>סוג: {form.group}</p>
            ) : catQuery ? (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>קטגוריה חופשית</p>
            ) : null}

            {showDropdown && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 100,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 8, marginTop: 2, maxHeight: 200, overflowY: 'auto',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                {suggestions.map((b) => (
                  <button
                    key={b.category}
                    type="button"
                    onMouseDown={() => selectCategory(b)}
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'right',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ color: 'var(--text)', fontSize: 14 }}>{b.category}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>{b.group}</span>
                  </button>
                ))}
              </div>
            )}
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
