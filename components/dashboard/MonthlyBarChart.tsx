'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { IncomeJob, Expense } from '@/lib/types'

interface Props {
  incomeJobs: IncomeJob[]
  expenses: Expense[]
}

const MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export default function MonthlyBarChart({ incomeJobs, expenses }: Props) {
  const year = new Date().getFullYear()

  const data = MONTHS.map((month, i) => {
    const income = incomeJobs
      .filter((j) => { const d = new Date(j.payDate); return d.getFullYear() === year && d.getMonth() === i })
      .reduce((s, j) => s + j.amount, 0)
    const expense = expenses
      .filter((e) => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === i })
      .reduce((s, e) => s + e.amount, 0)
    return { month, income, expense, profit: income - expense }
  })

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--muted)' }}>הכנסות vs הוצאות לפי חודש</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `₪${(v / 1000).toFixed(0)}k` : `₪${v}`}
          />
          <Tooltip
            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, direction: 'rtl' }}
            labelStyle={{ color: 'var(--text)' }}
            formatter={(value, name) => [`₪${Number(value).toLocaleString()}`, String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
          <Bar dataKey="income" name="הכנסות" fill="var(--income)" opacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="הוצאות" fill="var(--expense)" opacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Line dataKey="profit" name="רווח נקי" stroke="var(--profit)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
