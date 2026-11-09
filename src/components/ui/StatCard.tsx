interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export function StatCard({ label, value, hint, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className={`stat-card__value tone-${tone}`}>{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </div>
  )
}
