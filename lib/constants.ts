export const ANNUAL_INCOME_GOAL = 250000
export const QUARTERLY_GOAL = ANNUAL_INCOME_GOAL / 4

export const INCOME_TYPES = [
  { value: 'משחק',                   label: '🎭 משחק',                      color: '#FF5A5A' },
  { value: 'כתיבת מחזות ותסריטים',   label: '✍️ כתיבת מחזות ותסריטים',    color: '#3DDBD9' },
  { value: 'סימולציות',               label: '🎮 סימולציות',                 color: '#FF9F1C' },
  { value: "תמ\"י",                   label: "🔍 תמ\"י",                     color: '#A78BFA' },
  { value: 'התא האפור',               label: '🕵️ התא האפור',                color: '#94A3B8' },
  { value: 'עסק פיתוח מוח',           label: '🧠 עסק פיתוח מוח',            color: '#06D6A0' },
  { value: 'כתיבת אירועים',           label: '📝 כתיבת אירועים',            color: '#FFD166' },
  { value: 'בימוי',                   label: '🎬 בימוי',                     color: '#F472B6' },
  { value: 'עריכת תסריט',             label: '✂️ עריכת תסריט',              color: '#38BDF8' },
  { value: 'נוירוטיב',                label: '🌐 נוירוטיב',                  color: '#34D399' },
  { value: 'יצירה אישית',             label: '🎨 יצירה אישית',               color: '#FB923C' },
  { value: 'סדנאות',                  label: '🎓 סדנאות',                    color: '#E879F9' },
  { value: 'כללי',                    label: '📌 כללי',                       color: '#64748B' },
]

export const EXPENSE_CATEGORIES = [
  { value: 'מחיה',   color: '#FF6B6B', icon: '🏠' },
  { value: 'תקשורת', color: '#4ECDC4', icon: '📱' },
  { value: 'רכב',    color: '#45B7D1', icon: '🚗' },
  { value: 'מזון',   color: '#96CEB4', icon: '🛒' },
  { value: 'בריאות', color: '#DDA0DD', icon: '💊' },
  { value: 'ילדים',  color: '#F0E68C', icon: '👶' },
  { value: 'פנאי',   color: '#98FB98', icon: '🎉' },
  { value: 'הלבשה',  color: '#FFB347', icon: '👗' },
  { value: 'חינוך',  color: '#87CEEB', icon: '📚' },
  { value: 'עסקי',   color: '#DEB887', icon: '💼' },
  { value: 'חסכון',  color: '#90EE90', icon: '💰' },
  { value: 'שונות',  color: '#D3D3D3', icon: '📦' },
]

export const INCOME_OWNERS = [
  { value: 'גדי',   color: '#3DDBD9' },
  { value: 'שרון',  color: '#FF6FCB' },
  { value: 'כללי',  color: '#A0A0C0' },
] as const

export const PAYMENT_METHODS = ['מזומן', 'אשראי', 'ביט'] as const

export const BI_MONTHLY_PERIODS = [
  { label: 'ינו-פבר', months: [0, 1] },
  { label: 'מרץ-אפר', months: [2, 3] },
  { label: 'מאי-יונ', months: [4, 5] },
  { label: 'יול-אוג', months: [6, 7] },
  { label: 'ספט-אוק', months: [8, 9] },
  { label: 'נוב-דצמ', months: [10, 11] },
]
