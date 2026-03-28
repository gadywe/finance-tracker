export default function Header() {
  return (
    <header
      style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '0.75rem 1rem',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--income)' }}>
          מעקב פיננסי 2026
        </h1>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>גדי</span>
      </div>
    </header>
  )
}
