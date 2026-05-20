type MetricCardProps = {
  label: string
  value: string
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="ui-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
