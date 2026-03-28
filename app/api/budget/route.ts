import { NextResponse } from 'next/server'
import { getBudget } from '@/lib/sheets'

export const revalidate = 300

export async function GET() {
  try {
    const budget = await getBudget()
    return NextResponse.json(budget)
  } catch (error) {
    console.error('GET /api/budget error:', error)
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}
