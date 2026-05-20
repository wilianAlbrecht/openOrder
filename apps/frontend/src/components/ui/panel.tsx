import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

type PanelProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode
  kicker?: string
  title: string
}

export function Panel({
  actions,
  children,
  className,
  kicker,
  title,
  ...props
}: PanelProps) {
  return (
    <article className={clsx('ui-panel', className)} {...props}>
      <header className="ui-panel-header">
        <div>
          {kicker ? <p className="section-kicker">{kicker}</p> : null}
          <h2>{title}</h2>
        </div>
        {actions ? <div className="ui-panel-actions">{actions}</div> : null}
      </header>
      {children}
    </article>
  )
}
