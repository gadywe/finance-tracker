'use client'

export type Tab = 'summary' | 'income' | 'expenses'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'summary',  label: '📊 סיכום' },
  { id: 'income',   label: '💰 הכנסות' },
  { id: 'expenses', label: '💸 הוצאות' },
]

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed',
      top: 52,
      left: 0,
      right: 0,
      zIndex: 30,
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex' }}>
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(tab.id)
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 52,
              padding: '0.75rem 0.5rem',
              fontSize: '0.9rem',
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? 'var(--income)' : 'var(--muted)',
              textDecoration: 'none',
              borderBottom: active === tab.id ? '2px solid var(--income)' : '2px solid transparent',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
