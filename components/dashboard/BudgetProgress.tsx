'use client'

import { useState } from 'react'
import { Expense, BudgetEntry } from '@/lib/types'
import { EXPENSE_CATEGORIES, BI_MONTHLY_PERIODS } from '@/lib/constants'

interface Props {
  expenses: Expense[]
  budget: BudgetEntry[]
  period: string
}

function ProgressBar({ ratio, height = 8 }: { ratio: number; height?: number }) {
  const isOver = ratio > 1
  const pct = Math.min(ratio * 100, 100)
  const color = isOver ? '#FF5A5A' : ratio >= 0.8 ? '#FFD166' : '#06D6A0'
  return (
    <div className="rounded-full" style={{ height, background: 'var(--border)' }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ height, width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function BudgetProgress({ expenses, budget, period }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const periodConfig = BI_MONTHLY_PERIODS.find((p) => p.label === period)
  const periodBudget = budget.filter((b) => b.period === period)

  if (periodBudget.length === 0) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--muted)' }}>ביצוע מול יעד — {period}</h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>אין נתוני תכנון לתקופה זו</p>
      </div>
    )
  }

  const periodExpenses = periodConfig
    ? expenses.filter((e) => periodConfig.months.includes(new Date(e.date).getMonth()))
    : []

  // קיבוץ לפי group, שמירה על סדר ההופעה מהגיליון
  const groups: string[] = []
  for (const entry of periodBudget) {
    if (!groups.includes(entry.group)) groups.push(entry.group)
  }

  function toggle(group: string) {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>ביצוע מול יעד — {period}</h3>

      {groups.map((group) => {
        const groupEntries = periodBudget.filter((b) => b.group === group)
        const groupBudgeted = groupEntries.reduce((s, b) => s + b.amount, 0)
        const groupActual = groupEntries.reduce((s, b) => {
          return s + periodExpenses.filter((e) => e.category.trim() === b.category.trim()).reduce((a, e) => a + e.amount, 0)
        }, 0)
        const groupRatio = groupBudgeted > 0 ? groupActual / groupBudgeted : 0
        const groupIsOver = groupActual > groupBudgeted
        const isOpen = !collapsed[group]

        return (
          <div key={group}>
            {/* כותרת קבוצה */}
            <button
              onClick={() => toggle(group)}
              style={{
                width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, textAlign: 'right',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--muted)', fontSize: 11, transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
                  <span className="font-semibold text-sm">{group}</span>
                </div>
                <span style={{ fontSize: 13, color: groupIsOver ? '#FF5A5A' : 'var(--text)' }}>
                  ₪{groupActual.toLocaleString()} / ₪{groupBudgeted.toLocaleString()}
                  <span style={{ color: 'var(--muted)', marginRight: 6 }}>({Math.round(groupRatio * 100)}%)</span>
                </span>
              </div>
              <ProgressBar ratio={groupRatio} height={10} />
            </button>

            {/* פירוט קטגוריות */}
            {isOpen && (
              <div className="space-y-2.5 mt-3 pr-3" style={{ borderRight: '2px solid var(--border)' }}>
                {groupEntries.map(({ category, amount: budgeted }) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
                  const actual = periodExpenses
                    .filter((e) => e.category.trim() === category.trim())
                    .reduce((s, e) => s + e.amount, 0)
                  const ratio = budgeted > 0 ? actual / budgeted : 0
                  const isOver = actual > budgeted

                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1" style={{ fontSize: 13 }}>
                        <span style={{ color: 'var(--text)' }}>
                          {cat?.icon ?? '📦'} {category}
                        </span>
                        <span style={{ color: isOver ? '#FF5A5A' : 'var(--muted)' }}>
                          ₪{actual.toLocaleString()} / ₪{budgeted.toLocaleString()}
                        </span>
                      </div>
                      <ProgressBar ratio={ratio} height={7} />
                      {isOver && (
                        <p style={{ fontSize: 11, color: '#FF5A5A', marginTop: 2 }}>
                          חריגה ₪{(actual - budgeted).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
