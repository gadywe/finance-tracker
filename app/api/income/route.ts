import { NextResponse } from 'next/server'
import { getIncomeJobs, addIncomeJob } from '@/lib/sheets'

export const revalidate = 60

export async function GET() {
  try {
    const jobs = await getIncomeJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('GET /api/income error:', error)
    return NextResponse.json({ error: 'Failed to fetch income jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const job = await addIncomeJob(body)
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('POST /api/income error:', error)
    return NextResponse.json({ error: 'Failed to add income job' }, { status: 500 })
  }
}
