import { NextResponse } from 'next/server'
import { getIncomeJobs, addIncomeJob } from '@/lib/sheets'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // ?debug=1 — מחזיר שורות גולמיות מלשונית הכנסות
  if (searchParams.get('debug') === '1') {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })
      const sheets = google.sheets({ version: 'v4', auth })
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
        range: 'הכנסות!A1:I',
      })
      const rows = res.data.values ?? []
      return NextResponse.json({ totalRows: rows.length, first5: rows.slice(0, 5), last10: rows.slice(-10) })
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
  }

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
