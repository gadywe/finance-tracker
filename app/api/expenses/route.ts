import { NextResponse } from 'next/server'
import { getExpenses, getExpensesRaw, addExpense } from '@/lib/sheets'

export const revalidate = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ?categories=1 — מחזיר קטגוריות ייחודיות לצורך דיבוג
    if (searchParams.get('categories') === '1') {
      const all = await getExpenses()
      const unique = [...new Set(all.map((e) => e.category).filter(Boolean))].sort()
      return NextResponse.json(unique)
    }

    // ?debug=1 — מחזיר 5 שורות ראשונות עם כל העמודות הגולמיות
    if (searchParams.get('debug') === '1') {
      const raw = await getExpensesRaw()
      return NextResponse.json(raw)
    }

    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
    const month = monthParam !== null ? parseInt(monthParam, 10) : undefined
    const expenses = await getExpenses(year, month)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const expense = await addExpense(body)
    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 })
  }
}
