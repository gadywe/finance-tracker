import { Expense, IncomeJob } from './types'

export type ActionType =
  | 'expense_add'    | 'expense_edit'    | 'expense_delete'
  | 'income_add'     | 'income_edit'     | 'income_delete'

export interface ActionLogEntry {
  id:          string
  timestamp:   number
  actionType:  ActionType
  description: string                              // טקסט בעברית לתצוגה
  entityId:    string                              // id של הרשומה שנגעה
  undoData?:   Partial<Expense> | Partial<IncomeJob>
  // edit  → undoData = הסטייט הקודם (לשחזור)
  // delete → undoData = הרשומה המלאה (להוספה מחדש)
  // add    → undoData = undefined (מספיק entityId למחיקה)
}

const KEY = 'finance_action_log'
const MAX = 200

function read(): ActionLogEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
function write(log: ActionLogEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(log))
}

export function logAction(entry: Omit<ActionLogEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  const log = read()
  log.unshift({
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  })
  if (log.length > MAX) log.length = MAX
  write(log)
}

export function getActionLog(): ActionLogEntry[] { return read() }

export function removeActionEntry(id: string): void {
  if (typeof window === 'undefined') return
  write(read().filter((e) => e.id !== id))
}
