'use client'

import { IncomeJob, Expense } from '@/lib/types'
import { Tab } from '@/components/layout/TabNav'
import FinancialSummary from './FinancialSummary'
import MonthlyBarChart from './MonthlyBarChart'
import TypeBreakdown from './TypeBreakdown'
import ExpenseBreakdown from './ExpenseBreakdown'
import OwnerBreakdown from './OwnerBreakdown'
import IncomeSection from './IncomeSection'
import ExpenseSection from './ExpenseSection'

interface Props {
  activeTab: Tab
  incomeJobs: IncomeJob[]
  expenses: Expense[]
  onRefresh: () => void
}

export default function Dashboard({ activeTab, incomeJobs, expenses, onRefresh }: Props) {
  const currentYear = new Date().getFullYear()
  const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear)

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {activeTab === 'summary' && (
        <>
          <FinancialSummary incomeJobs={incomeJobs} expenses={yearExpenses} />
          <MonthlyBarChart incomeJobs={incomeJobs} expenses={yearExpenses} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TypeBreakdown incomeJobs={incomeJobs} />
            <OwnerBreakdown incomeJobs={incomeJobs} />
            <ExpenseBreakdown expenses={yearExpenses} />
          </div>
        </>
      )}

      {activeTab === 'income' && (
        <IncomeSection incomeJobs={incomeJobs} onRefresh={onRefresh} />
      )}

      {activeTab === 'expenses' && (
        <ExpenseSection expenses={expenses} onRefresh={onRefresh} />
      )}
    </main>
  )
}
