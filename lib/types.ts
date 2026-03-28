export interface IncomeJob {
  id: string
  project: string
  type: 'משחק' | 'כתיבת מחזות ותסריטים' | 'סימולציות' | 'תמ"י' | 'התא האפור' | 'עסק פיתוח מוח' | 'כתיבת אירועים' | 'בימוי' | 'עריכת תסריט' | 'נוירוטיב' | 'יצירה אישית' | 'סדנאות' | 'כללי'
  amount: number
  endDate: string      // YYYY-MM-DD
  payDate: string      // YYYY-MM-DD
  status: 'paid' | 'expected'
  note: string
  owner: 'גדי' | 'שרון' | 'כללי'
}

export interface Goal {
  owner: 'גדי' | 'שרון' | 'כללי'
  period: 'שנתי' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  amount: number
}

export interface Expense {
  id: string
  date: string         // YYYY-MM-DD
  category: string
  description: string
  amount: number
  paymentMethod: 'מזומן' | 'אשראי' | 'ביט'
}
