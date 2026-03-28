export interface IncomeJob {
  id: string
  project: string
  type: 'משחק' | 'כתיבת מחזות ותסריטים' | 'סימולציות' | 'תמ"י' | 'התא האפור' | 'עסק פיתוח מוח' | 'כתיבת אירועים' | 'בימוי' | 'עריכת תסריט' | 'נוירוטיב' | 'יצירה אישית' | 'סדנאות'
  amount: number
  endDate: string      // YYYY-MM-DD
  payDate: string      // YYYY-MM-DD
  status: 'paid' | 'expected'
  note: string
  owner: 'גדי' | 'שרון' | 'כללי'
}

export interface Expense {
  id: string
  date: string         // YYYY-MM-DD
  category: string
  description: string
  amount: number
  paymentMethod: 'מזומן' | 'אשראי' | 'ביט'
}
