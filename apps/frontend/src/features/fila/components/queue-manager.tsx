import { useMemo, useState } from 'react'
import { Clock3, PackageCheck, RotateCcw } from 'lucide-react'
import {
  Button,
  EmptyState,
  MetricCard,
  Panel,
  StatusBadge
} from '@/components/ui'
import {
  getNextOrderStatuses,
  getPreviousOrderStatus,
  type Order
} from '@/entities'

type ActiveQueueStatus = 'aberta' | 'preparando' | 'pronta'
type QueueFilter = 'all' | 'aberta' | 'preparando' | 'pronta'

type QueueManagerProps = {
  onUpdateOrderStatus: (order: Order, status: Order['status']) => Promise<void>
  orders: Order[]
}

const queueFilters: Array<{ id: QueueFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'aberta', label: 'Pendente' },
  { id: 'preparando', label: 'Em preparo' },
  { id: 'pronta', label: 'Prontas' }
]

const queueStatusLabels: Record<ActiveQueueStatus, string> = {
  aberta: 'pendente',
  preparando: 'em preparo',
  pronta: 'pronta'
}

export function QueueManager({
  onUpdateOrderStatus,
  orders
}: QueueManagerProps) {
  const [activeFilter, setActiveFilter] = useState<QueueFilter>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const queueOrders = useMemo(
    () =>
      orders
        .filter(isActiveQueueOrder)
        .sort((left, right) => {
          const createdAtDiff =
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()

          if (createdAtDiff !== 0) {
            return createdAtDiff
          }

          return left.number - right.number
        }),
    [orders]
  )

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return queueOrders
    }

    return queueOrders.filter((order) => order.status === activeFilter)
  }, [activeFilter, queueOrders])

  const metrics = useMemo(
    () => ({
      total: queueOrders.length,
      aberta: queueOrders.filter((order) => order.status === 'aberta').length,
      preparando: queueOrders.filter((order) => order.status === 'preparando').length,
      pronta: queueOrders.filter((order) => order.status === 'pronta').length
    }),
    [queueOrders]
  )

  async function handleStatusChange(order: Order, status: Order['status']) {
    const actionLabel =
      status === 'preparando'
        ? 'mover para em preparo'
        : status === 'pronta'
          ? 'mover para pronta'
          : status === 'entregue'
            ? 'marcar como entregue'
            : 'voltar o status'

    const confirmed = window.confirm(
      `Confirmar: ${actionLabel} da comanda #${order.number}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setUpdatingOrderId(order.id)
      setErrorMessage(null)
      await onUpdateOrderStatus(order, status)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel atualizar o status da comanda.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <section className="content-grid">
      <Panel
        kicker="Cozinha"
        title="Fila de pedidos ativos"
        actions={
          <div className="filter-strip" role="tablist" aria-label="Filtro da fila">
            {queueFilters.map((filter) => (
              <Button
                key={filter.id}
                aria-pressed={activeFilter === filter.id}
                className={activeFilter === filter.id ? 'filter-button-active' : ''}
                onClick={() => setActiveFilter(filter.id)}
                variant={activeFilter === filter.id ? 'primary' : 'ghost'}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        }
      >
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <div className="stack-list">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="Nenhum pedido neste filtro"
              description="A fila mostra apenas comandas pendentes, em preparo ou prontas."
            />
          ) : (
            filteredOrders.map((order) => {
              const nextStatuses = getNextOrderStatuses(order.status)
              const previousStatus = getPreviousOrderStatus(order.status)

              return (
                <article key={order.id} className="queue-card">
                  <header className="queue-card-header">
                    <div className="queue-card-title">
                      <p className="list-label">Comanda #{order.number}</p>
                      <div className="queue-card-meta">
                        <StatusBadge status={order.status} />
                        <span className="queue-meta-text">
                          {queueStatusLabels[order.status]}
                        </span>
                        <span className="queue-meta-text">
                          {formatOrderTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <strong>R$ {(order.totalInCents / 100).toFixed(2)}</strong>
                  </header>

                  <div className="queue-card-body">
                    <div className="queue-section">
                      <p className="queue-section-title">
                        {order.items.length} pedido(s) nesta comanda
                      </p>
                      <ul className="queue-item-list">
                        {order.items.map((item) => (
                          <li key={item.id} className="queue-item-row">
                            <div>
                              <strong>
                                {item.quantity}x {item.productName}
                              </strong>
                              {item.notes ? (
                                <p className="queue-item-note">{item.notes}</p>
                              ) : null}
                            </div>
                            <span className="queue-meta-text">
                              R$ {((item.unitPriceInCents * item.quantity) / 100).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.notes ? (
                      <div className="queue-section">
                        <p className="queue-section-title">Observacoes da comanda</p>
                        <p className="queue-item-note">{order.notes}</p>
                      </div>
                    ) : null}
                  </div>

                  <footer className="queue-card-actions">
                    {previousStatus ? (
                      <Button
                        disabled={updatingOrderId === order.id}
                        icon={<RotateCcw size={16} />}
                        onClick={() => void handleStatusChange(order, previousStatus)}
                        variant="ghost"
                      >
                        {updatingOrderId === order.id
                          ? 'Atualizando...'
                          : previousStatus === 'aberta'
                            ? 'Voltar para pendente'
                            : previousStatus === 'preparando'
                              ? 'Voltar para preparo'
                              : 'Voltar para pronta'}
                      </Button>
                    ) : null}
                    {nextStatuses.map((status) => (
                      <Button
                        disabled={updatingOrderId === order.id}
                        key={status}
                        icon={status === 'entregue' ? <PackageCheck size={16} /> : <Clock3 size={16} />}
                        onClick={() => void handleStatusChange(order, status)}
                        variant={status === 'entregue' ? 'primary' : 'secondary'}
                      >
                        {updatingOrderId === order.id
                          ? 'Atualizando...'
                          : status === 'preparando'
                            ? 'Marcar em preparo'
                            : status === 'pronta'
                              ? 'Marcar pronta'
                              : 'Marcar entregue'}
                      </Button>
                    ))}
                  </footer>
                </article>
              )
            })
          )}
        </div>
      </Panel>

      <Panel kicker="Resumo" title="Visao rapida da fila">
        <div className="metrics-grid">
          <MetricCard label="Ativas" value={String(metrics.total)} />
          <MetricCard label="Pendentes" value={String(metrics.aberta)} />
          <MetricCard label="Em preparo" value={String(metrics.preparando)} />
          <MetricCard label="Prontas" value={String(metrics.pronta)} />
        </div>
      </Panel>
    </section>
  )
}

function formatOrderTime(timestamp: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
}

function isActiveQueueOrder(
  order: Order
): order is Order & { status: ActiveQueueStatus } {
  return (
    order.status === 'aberta' ||
    order.status === 'preparando' ||
    order.status === 'pronta'
  )
}
