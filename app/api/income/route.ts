import { NextResponse } from 'next/server'
import { getIncomeJobs, addIncomeJob } from '@/lib/sheets'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

// ?recover=1 — מזיז שורות שנכתבו לעמודות I-Q בחזרה לעמודות A-I
export async function PATCH() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'הכנסות!A1:Q',
    })
    const rows = res.data.values ?? []

    // מצא שורות שבהן A ריק אבל I מכיל ID (שורות שנכתבו לעמודות הלא נכונות)
    const badRows = rows
      .map((r, i) => ({ rowNum: i + 1, r }))
      .filter(({ r }) => !r[0] && r[8])

    if (badRows.length === 0) return NextResponse.json({ fixed: 0, message: 'No misplaced rows found' })

    // לכל שורה כזו: העבר I:Q → A:I ונקה I:Q
    const batchWrite = badRows.map(({ rowNum, r }) => ({
      range: `הכנסות!A${rowNum}:I${rowNum}`,
      values: [r.slice(8, 17)],  // 9 values from column I (index 8) to Q (index 16)
    }))
    const batchClear = badRows.map(({ rowNum }) => `הכנסות!I${rowNum}:Q${rowNum}`)

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchWrite },
    })
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { ranges: batchClear },
    })

    return NextResponse.json({ fixed: badRows.length, rows: badRows.map(b => b.rowNum) })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

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
