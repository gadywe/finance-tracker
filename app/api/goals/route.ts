import { NextResponse } from 'next/server'
import { getGoals, setGoals } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const year = parseInt(new URL(request.url).searchParams.get('year') ?? String(new Date().getFullYear()), 10)
    const goals = await getGoals(year)
    return NextResponse.json(goals)
  } catch (error) {
    console.error('GET /api/goals error:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const goals = Array.isArray(body) ? body : [body]
    await setGoals(goals)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/goals error:', error)
    return NextResponse.json({ error: 'Failed to save goals' }, { status: 500 })
  }
}
