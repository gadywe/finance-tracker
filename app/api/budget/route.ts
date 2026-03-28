import { NextResponse } from 'next/server'
import { getBudget, getBudgetRaw } from '@/lib/sheets'

export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('raw') === '1') {
      const raw = await getBudgetRaw()
      return NextResponse.json(raw)
    }
    const budget = await getBudget()
    return NextResponse.json(budget)
  } catch (error) {
    console.error('GET /api/budget error:', error)
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}
