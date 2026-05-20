import clsx from 'clsx'
import type { OrderStatus } from '@/entities'

type StatusBadgeProps = {
  status: OrderStatus | 'offline' | 'ready'
}

const labels: Record<StatusBadgeProps['status'], string> = {
  aberta: 'aberta',
  preparando: 'preparando',
  pronta: 'pronta',
  entregue: 'entregue',
  finalizada: 'finalizada',
  offline: 'offline',
  ready: 'pronto'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={clsx('ui-badge', `ui-badge-${status}`)}>{labels[status]}</span>
  )
}
