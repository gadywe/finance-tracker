'use client'

import { useState } from 'react'
import { IncomeJob, Expense, Goal } from '@/lib/types'
import { Tab } from '@/components/layout/TabNav'
import FinancialSummary from './FinancialSummary'
import MonthlyBarChart from './MonthlyBarChart'
import TypeBreakdown from './TypeBreakdown'
import ExpenseBreakdown from './ExpenseBreakdown'
import OwnerBreakdown from './OwnerBreakdown'
import OwnerProgress from './OwnerProgress'
import GoalsModal from './GoalsModal'
import IncomeSection from './IncomeSection'
import ExpenseSection from './ExpenseSection'
import ActionsSection from './ActionsSection'

interface Props {
  activeTab: Tab
  incomeJobs: IncomeJob[]
  expenses: Expense[]
  goals: Goal[]
  onRefresh: () => void
}

export default function Dashboard({ activeTab, incomeJobs, expenses, goals, onRefresh }: Props) {
  const currentYear = new Date().getFullYear()
  const [showGoals, setShowGoals] = useState(false)
  const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear)

  return (
    <main className={`max-w-5xl mx-auto px-4 space-y-6 ${activeTab === 'expenses' ? 'pt-2 pb-6' : 'py-6'}`}>
      {activeTab === 'summary' && (
        <>
          <FinancialSummary incomeJobs={incomeJobs} expenses={yearExpenses} goals={goals} />

          {/* התקדמות לפי בעלים */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span />
              <button
                onClick={() => setShowGoals(true)}
                style={{
                  fontSize: 13, padding: '0.4rem 0.9rem', borderRadius: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--muted)', cursor: 'pointer',
                }}
              >
                ✏️ הגדר יעדים
              </button>
            </div>
            <OwnerProgress incomeJobs={incomeJobs} goals={goals} year={currentYear} />
          </div>

          <MonthlyBarChart incomeJobs={incomeJobs} expenses={yearExpenses} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TypeBreakdown incomeJobs={incomeJobs} />
            <OwnerBreakdown incomeJobs={incomeJobs} />
            <ExpenseBreakdown expenses={yearExpenses} />
          </div>
        </>
      )}

      {activeTab === 'income' && (
        <IncomeSection incomeJobs={incomeJobs} goals={goals} onRefresh={onRefresh} />
      )}

      {activeTab === 'expenses' && (
        <ExpenseSection expenses={expenses} onRefresh={onRefresh} />
      )}

      {activeTab === 'actions' && (
        <ActionsSection onRefresh={onRefresh} />
      )}

      {showGoals && (
        <GoalsModal
          goals={goals}
          year={currentYear}
          onSaved={onRefresh}
          onClose={() => setShowGoals(false)}
        />
      )}
    </main>
  )
}
