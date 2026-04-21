'use client'

import { useState, useEffect, useCallback } from 'react'
import { IncomeJob, Expense, Goal } from '@/lib/types'
import Dashboard from '@/components/dashboard/Dashboard'

type Tab = 'summary' | 'income' | 'expenses' | 'actions'

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary',  label: '📊 סיכום'   },
  { id: 'income',   label: '💰 הכנסות'  },
  { id: 'expenses', label: '💸 הוצאות'  },
  { id: 'actions',  label: '🔄 פעולות'  },
]

export default function Home() {
  const [incomeJobs, setIncomeJobs] = useState<IncomeJob[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  const fetchAll = useCallback(async () => {
    try {
      const year = new Date().getFullYear()
      const [incRes, expRes, goalsRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/expenses'),
        fetch(`/api/goals?year=${year}`),
      ])
      const [inc, exp, gls] = await Promise.all([incRes.json(), expRes.json(), goalsRes.json()])
      setIncomeJobs(Array.isArray(inc) ? inc : [])
      setExpenses(Array.isArray(exp) ? exp : [])
      setGoals(Array.isArray(gls) ? gls : [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'var(--income)', fontWeight: 700, fontSize: '1.1rem' }}>מעקב פיננסי 2026</h1>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>גדי</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--income)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--income)' : 'var(--muted)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>טוען נתונים...</p>
        </div>
      ) : (
        <Dashboard
          activeTab={activeTab}
          incomeJobs={incomeJobs}
          expenses={expenses}
          goals={goals}
          onRefresh={fetchAll}
        />
      )}
    </div>
  )
}
