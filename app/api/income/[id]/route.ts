import { NextResponse } from 'next/server'
import { updateIncomeJob, deleteIncomeJob } from '@/lib/sheets'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    await updateIncomeJob(id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/income/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update income job' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteIncomeJob(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/income/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete income job' }, { status: 500 })
  }
}
