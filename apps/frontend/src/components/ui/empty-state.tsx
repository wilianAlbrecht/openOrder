type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
