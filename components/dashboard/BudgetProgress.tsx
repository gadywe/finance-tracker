'use client'

import { useState } from 'react'
import { Expense, BudgetEntry } from '@/lib/types'
import { BI_MONTHLY_PERIODS } from '@/lib/constants'

interface Props {
  expenses: Expense[]
  budget: BudgetEntry[]
  period: string
  onCategoryClick?: (category: string, group: string) => void
}

// צבע ייחודי לכל קבוצת תקציב
const GROUP_COLORS: Record<string, string> = {
  'בית':                               '#60A5FA', // כחול
  'חסכונות, מיסים וביטוחים':           '#A78BFA', // סגול
  'חינוך ותרבות':                       '#2DD4BF', // טורקיז
  'בריאות וטיפוח':                      '#F472B6', // ורוד
  'מינויים קבועים':                     '#FB923C', // כתום
  'הוצאות עסק, מזומן ובלת"מ':          '#FBBF24', // ענבר
  'חוץ':                               '#818CF8', // אינדיגו
}
const DEFAULT_GROUP_COLOR = '#94A3B8'

function groupColor(group: string) {
  return GROUP_COLORS[group.trim()] ?? DEFAULT_GROUP_COLOR
}

function ProgressBar({ ratio, height = 8, baseColor }: { ratio: number; height?: number; baseColor?: string }) {
  const isOver = ratio > 1
  const pct = Math.min(ratio * 100, 100)
  const color = isOver ? '#FF5A5A' : ratio >= 0.8 ? '#FFD166' : (baseColor ?? '#06D6A0')
  return (
    <div className="rounded-full" style={{ height, background: 'var(--border)' }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ height, width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function BudgetProgress({ expenses, budget, period, onCategoryClick }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

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

  // מיפוי קטגוריה ספציפית → סוג, מכל רשומות התקציב
  const categoryToGroup = new Map(budget.map((b) => [b.category.trim(), b.group.trim()]))

  // סדר הקבוצות לפי הופעתן בגיליון
  const groups: string[] = []
  for (const entry of periodBudget) {
    if (!groups.includes(entry.group)) groups.push(entry.group)
  }

  function toggle(group: string) {
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>ביצוע מול יעד — {period}</h3>

      {groups.map((group) => {
        const groupEntries = periodBudget.filter((b) => b.group === group)
        const groupBudgeted = groupEntries.reduce((s, b) => s + b.amount, 0)

        // הוצאות בפועל: expense.group (חדש) → נגזר ממיפוי תקציב → fallback: category=group (ישן)
        const groupActual = periodExpenses
          .filter((e) => {
            const expGroup = e.group?.trim()
              || categoryToGroup.get(e.category.trim())
              || e.category.trim()
            return expGroup === group.trim()
          })
          .reduce((s, e) => s + e.amount, 0)

        const groupRatio = groupBudgeted > 0 ? groupActual / groupBudgeted : 0
        const groupIsOver = groupActual > groupBudgeted
        const isOpen = !!expanded[group]
        const gColor = groupColor(group)

        return (
          <div key={group}>
            {/* כותרת קבוצה + progress bar */}
            <button
              onClick={() => toggle(group)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span style={{
                    color: gColor, fontSize: 11, display: 'inline-block',
                    transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>▼</span>
                  <span className="font-semibold text-sm" style={{ color: gColor }}>{group}</span>
                </div>
                <span style={{ fontSize: 13, color: groupIsOver ? '#FF5A5A' : 'var(--text)' }}>
                  ₪{groupActual.toLocaleString()} / ₪{groupBudgeted.toLocaleString()}
                  <span style={{ color: 'var(--muted)', marginRight: 6 }}>({Math.round(groupRatio * 100)}%)</span>
                </span>
              </div>
              <ProgressBar ratio={groupRatio} height={10} baseColor={gColor} />
              {groupIsOver && (
                <p style={{ fontSize: 11, color: '#FF5A5A', marginTop: 2, textAlign: 'right' }}>
                  חריגה של ₪{(groupActual - groupBudgeted).toLocaleString()}
                </p>
              )}
            </button>

            {/* פירוט ביצוע מול תקציב לפי קטגוריה */}
            {isOpen && (
              <div className="mt-2.5 pr-3 space-y-2.5" style={{ borderRight: `2px solid ${gColor}55` }}>
                {groupEntries.map(({ category, amount: budgeted }) => {
                  const catActual = periodExpenses
                    .filter((e) => e.category.trim() === category.trim())
                    .reduce((s, e) => s + e.amount, 0)
                  const catRatio = budgeted > 0 ? catActual / budgeted : 0
                  const catIsOver = catActual > budgeted
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1" style={{ fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--text)' }}>{category}</span>
                          {catActual > 0 && onCategoryClick && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onCategoryClick(category, group) }}
                              style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                border: `1px solid ${gColor}`, background: gColor + '15',
                                color: gColor, cursor: 'pointer', lineHeight: 1.6,
                                fontWeight: 500,
                              }}
                            >
                              פירוט ›
                            </button>
                          )}
                        </div>
                        <span style={{ color: catIsOver ? '#FF5A5A' : 'var(--muted)' }}>
                          ₪{catActual.toLocaleString()} / ₪{budgeted.toLocaleString()}
                          <span style={{ marginRight: 4, opacity: 0.7 }}>({Math.round(catRatio * 100)}%)</span>
                        </span>
                      </div>
                      <ProgressBar ratio={catRatio} height={5} baseColor={gColor} />
                    </div>
                  )
                })}
                {/* קטגוריות ללא תקציב שיש בהן הוצאה בפועל */}
                {(() => {
                  const budgetCats = new Set(groupEntries.map((e) => e.category.trim()))
                  const byCategory = new Map<string, number>()
                  periodExpenses
                    .filter((e) => {
                      const expGroup = e.group?.trim() || categoryToGroup.get(e.category.trim()) || e.category.trim()
                      return expGroup === group.trim() && !budgetCats.has(e.category.trim())
                    })
                    .forEach((e) => byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount))
                  return [...byCategory.entries()].map(([cat, actual]) => (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1" style={{ fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--text)' }}>{cat}</span>
                          {onCategoryClick && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onCategoryClick(cat, group) }}
                              style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                border: `1px solid ${gColor}`, background: gColor + '15',
                                color: gColor, cursor: 'pointer', lineHeight: 1.6,
                                fontWeight: 500,
                              }}
                            >
                              פירוט ›
                            </button>
                          )}
                        </div>
                        <span style={{ color: '#FF5A5A' }}>
                          ₪{actual.toLocaleString()} / ללא תקציב
                        </span>
                      </div>
                      <ProgressBar ratio={1} height={5} baseColor={gColor} />
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
