import { google } from 'googleapis'
import { unstable_cache, revalidateTag } from 'next/cache'
import { IncomeJob, Expense, Goal } from './types'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
const INCOME_SHEET = 'הכנסות'
const EXPENSES_SHEET = 'הזנה'
const GOALS_SHEET = 'יעדים'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

async function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

// ─── הכנסות ───────────────────────────────────────────────

const VALID_INCOME_TYPES: IncomeJob['type'][] = ['משחק', 'כתיבת מחזות ותסריטים', 'סימולציות', 'תמ"י', 'התא האפור', 'עסק פיתוח מוח', 'כתיבת אירועים', 'בימוי', 'עריכת תסריט', 'נוירוטיב', 'יצירה אישית', 'סדנאות']

async function getManualIncomeJobs(): Promise<IncomeJob[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${INCOME_SHEET}!A2:I`,
  })
  const rows = res.data.values ?? []
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0] ?? '',
      project: row[1] ?? '',
      type: row[2] as IncomeJob['type'],
      amount: Number(row[3]) || 0,
      endDate: row[4] ?? '',
      payDate: row[5] ?? '',
      status: (row[6] ?? 'expected') as IncomeJob['status'],
      note: row[7] ?? '',
      owner: (['גדי', 'שרון', 'כללי'].includes(row[8]) ? row[8] : 'כללי') as IncomeJob['owner'],
    }))
}

// קורא שורות הכנסה מלשונית "הזנה" (עמודה B = 'הכנסה')
// עמודה H משמשת לאחסון owner שנשמר ע"י הדשבורד
async function getIncomeFromHazana(): Promise<IncomeJob[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A2:H`,
  })
  const rows = res.data.values ?? []
  return rows
    .filter((row) => row[0] && row[1] === 'הכנסה')
    .map((row) => {
      const sheetRowNum = rows.indexOf(row) + 2
      const rawType = row[3] as string
      const type: IncomeJob['type'] = VALID_INCOME_TYPES.includes(rawType as IncomeJob['type'])
        ? (rawType as IncomeJob['type'])
        : 'משחק'
      const rawOwner = row[7] as string
      return {
        id: `hazana-row-${sheetRowNum}`,
        project: row[5] ?? row[4] ?? '',
        type,
        amount: parseAmount(row[2]),
        endDate: row[0] ?? '',
        payDate: row[0] ?? '',
        status: 'paid' as const,
        note: '',
        owner: (['גדי', 'שרון', 'כללי'].includes(rawOwner) ? rawOwner : 'כללי') as IncomeJob['owner'],
      }
    })
}

export const getIncomeJobs = unstable_cache(
  async (): Promise<IncomeJob[]> => {
    const [manual, fromHazana] = await Promise.all([getManualIncomeJobs(), getIncomeFromHazana()])
    return [...manual, ...fromHazana]
  },
  ['income-jobs'],
  { revalidate: 60, tags: ['income-jobs'] },
)

export async function addIncomeJob(job: Omit<IncomeJob, 'id'>): Promise<IncomeJob> {
  const sheets = await getSheets()
  const id = String(Date.now())
  const row = [id, job.project, job.type, job.amount, job.endDate, job.payDate, job.status, job.note, job.owner ?? 'כללי']
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${INCOME_SHEET}!A:I`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
  revalidateTag('income-jobs', 'max')
  return { id, ...job }
}

async function updateHazanaIncome(id: string, updates: Partial<IncomeJob>): Promise<void> {
  const sheets = await getSheets()
  const rowNum = parseInt(id.replace('hazana-row-', ''), 10)
  // קורא את השורה הנוכחית כדי לא לדרוס נתונים קיימים
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A${rowNum}:H${rowNum}`,
  })
  const r = res.data.values?.[0] ?? []
  const newType = updates.type ?? r[3] ?? ''
  const newOwner = updates.owner ?? ((['גדי', 'שרון', 'כללי'].includes(r[7]) ? r[7] : 'כללי') as IncomeJob['owner'])
  // כותב type ל-D (index 3) ו-owner ל-H (index 7)
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `${EXPENSES_SHEET}!D${rowNum}`, values: [[newType]] },
        { range: `${EXPENSES_SHEET}!H${rowNum}`, values: [[newOwner]] },
      ],
    },
  })
  revalidateTag('income-jobs', 'max')
}

export async function updateIncomeJob(id: string, updates: Partial<IncomeJob>): Promise<void> {
  if (id.startsWith('hazana-')) return updateHazanaIncome(id, updates)
  const sheets = await getSheets()
  const jobs = await getManualIncomeJobs()
  const index = jobs.findIndex((j) => j.id === id)
  if (index === -1) throw new Error(`Income job ${id} not found`)
  const existing = jobs[index]
  const merged = { ...existing, ...updates }
  const row = [merged.id, merged.project, merged.type, merged.amount, merged.endDate, merged.payDate, merged.status, merged.note, merged.owner ?? 'כללי']
  const rowNum = index + 2 // +1 for header, +1 for 1-based index
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${INCOME_SHEET}!A${rowNum}:I${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
  revalidateTag('income-jobs', 'max')
}

export async function deleteIncomeJob(id: string): Promise<void> {
  if (id.startsWith('hazana-')) throw new Error('Cannot delete auto-imported income rows')
  const sheets = await getSheets()
  const jobs = await getManualIncomeJobs()
  const index = jobs.findIndex((j) => j.id === id)
  if (index === -1) throw new Error(`Income job ${id} not found`)
  const rowNum = index + 2
  // מחיקה ע"י ניקוי השורה
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${INCOME_SHEET}!A${rowNum}:I${rowNum}`,
  })
  revalidateTag('income-jobs', 'max')
}

// ─── הוצאות ───────────────────────────────────────────────
// לשונית "הזנה" אין עמודת id — העמודות: תאריך|קטגוריה|תיאור|סכום|אמצעי תשלום
// משתמשים במספר השורה בגיליון כ-id (פורמט: "row-{rowNum}")

function rowNumFromId(id: string): number {
  return parseInt(id.replace('row-', ''), 10)
}

// מבנה עמודות "הזנה":
// A: תאריך | B: סוג תנועה | C: סכום | D: סוג | E: קטגוריה | F: תיאור/ספק | G: אמצעי תשלום
// H,I,J,K: אוטומטי/הערות — לא נוגעים בהם

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0
  return Number(String(raw).replace(/,/g, '')) || 0
}

export const getExpenses = unstable_cache(
  async (year?: number, month?: number): Promise<Expense[]> => {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${EXPENSES_SHEET}!A2:G`,
    })
    const rows = res.data.values ?? []
    let expenses: Expense[] = rows
      .filter((row) => row[0] && row[1] === 'הוצאה')
      .map((row) => {
        const sheetRowNum = rows.indexOf(row) + 2
        return {
          id: `row-${sheetRowNum}`,
          date: row[0] ?? '',
          category: row[4] ?? '',
          description: row[5] ?? '',
          amount: parseAmount(row[2]),
          paymentMethod: (row[6] ?? 'מזומן') as Expense['paymentMethod'],
        }
      })
    if (year !== undefined) {
      expenses = expenses.filter((e) => {
        const d = new Date(e.date)
        if (month !== undefined) {
          return d.getFullYear() === year && d.getMonth() === month
        }
        return d.getFullYear() === year
      })
    }
    return expenses
  },
  ['expenses'],
  { revalidate: 60, tags: ['expenses'] },
)

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const sheets = await getSheets()
  // A: תאריך | B: סוג תנועה | C: סכום | D: סוג | E: קטגוריה | F: תיאור | G: אמצעי תשלום
  const row = [expense.date, 'הוצאה', expense.amount, 'הוצאה', expense.category, expense.description, expense.paymentMethod]
  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A:G`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
  const updatedRange = appendRes.data.updates?.updatedRange ?? ''
  const match = updatedRange.match(/(\d+)$/)
  const rowNum = match ? parseInt(match[1], 10) : Date.now()
  revalidateTag('expenses', 'max')
  return { id: `row-${rowNum}`, ...expense }
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  const sheets = await getSheets()
  const rowNum = rowNumFromId(id)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A${rowNum}:G${rowNum}`,
  })
  const r = res.data.values?.[0] ?? []
  const merged = {
    date:          updates.date          ?? r[0] ?? '',
    amount:        updates.amount        ?? parseAmount(r[2]),
    category:      updates.category      ?? r[4] ?? '',
    description:   updates.description   ?? r[5] ?? '',
    paymentMethod: updates.paymentMethod ?? r[6] ?? 'מזומן',
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A${rowNum}:G${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[merged.date, 'הוצאה', merged.amount, 'הוצאה', merged.category, merged.description, merged.paymentMethod]] },
  })
  revalidateTag('expenses', 'max')
}

export async function deleteExpense(id: string): Promise<void> {
  const sheets = await getSheets()
  const rowNum = rowNumFromId(id)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EXPENSES_SHEET}!A${rowNum}:G${rowNum}`,
  })
  revalidateTag('expenses', 'max')
}

// ─── יעדים ───────────────────────────────────────────────
// לשונית "יעדים": A: owner | B: period | C: year | D: amount

const VALID_OWNERS = ['גדי', 'שרון', 'כללי']
const VALID_PERIODS = ['שנתי', 'Q1', 'Q2', 'Q3', 'Q4']

export const getGoals = unstable_cache(
  async (year: number): Promise<Goal[]> => {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GOALS_SHEET}!A2:D`,
    })
    const rows = res.data.values ?? []
    return rows
      .filter((r) => VALID_OWNERS.includes(r[0]) && VALID_PERIODS.includes(r[1]) && Number(r[2]) === year)
      .map((r) => ({
        owner: r[0] as Goal['owner'],
        period: r[1] as Goal['period'],
        year: Number(r[2]),
        amount: Number(r[3]) || 0,
      }))
  },
  ['goals'],
  { revalidate: 60, tags: ['goals'] },
)

// שומר מערך יעדים — מעדכן שורות קיימות ומוסיף חדשות
export async function setGoals(goals: Goal[]): Promise<void> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${GOALS_SHEET}!A2:D`,
  })
  const rows = res.data.values ?? []

  // מפה של owner|period|year → מספר שורה (1-based, +2 לכותרת)
  const rowMap = new Map<string, number>()
  rows.forEach((r, i) => {
    if (r[0] && r[1] && r[2]) rowMap.set(`${r[0]}|${r[1]}|${r[2]}`, i + 2)
  })

  const updates: { range: string; values: (string | number)[][] }[] = []
  const appends: (string | number)[][] = []

  for (const g of goals) {
    const key = `${g.owner}|${g.period}|${g.year}`
    const rowNum = rowMap.get(key)
    if (rowNum !== undefined) {
      updates.push({ range: `${GOALS_SHEET}!A${rowNum}:D${rowNum}`, values: [[g.owner, g.period, g.year, g.amount]] })
    } else {
      appends.push([g.owner, g.period, g.year, g.amount])
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    })
  }
  if (appends.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GOALS_SHEET}!A:D`,
      valueInputOption: 'RAW',
      requestBody: { values: appends },
    })
  }
  revalidateTag('goals', 'max')
}
