import type { ReactNode } from 'react'

type ListCardProps = {
  aside?: ReactNode
  label: string
  value: string
}

export function ListCard({ aside, label, value }: ListCardProps) {
  return (
    <article className="ui-list-card">
      <div>
        <p className="list-label">{label}</p>
        <strong>{value}</strong>
      </div>
      {aside ? <div className="ui-list-card-aside">{aside}</div> : null}
    </article>
  )
}
