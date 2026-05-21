import { useMemo, useState } from 'react'
import { Minus, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import {
  createOrder,
  getPreviousOrderStatus,
  updateOrder,
  type Order,
  type OrderItem,
  type Product
} from '@/entities'
import { Button, EmptyState, ListCard, Panel, StatusBadge } from '@/components/ui'

type ComandasManagerProps = {
  nextOrderNumber: number
  onDeleteOrder: (orderId: string) => Promise<void>
  onSaveOrder: (order: Order) => Promise<void>
  onUpdateOrderStatus: (order: Order, status: Order['status']) => Promise<void>
  orders: Order[]
  products: Product[]
}

type DraftItem = OrderItem

export function ComandasManager({
  nextOrderNumber,
  onDeleteOrder,
  onSaveOrder,
  onUpdateOrderStatus,
  orders,
  products
}: ComandasManagerProps) {
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '')
  const [reference, setReference] = useState('')
  const [draftItems, setDraftItems] = useState<DraftItem[]>([])
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'finalizada').sort((a, b) => a.number - b.number),
    [orders]
  )

  const availableProducts = useMemo(
    () => products.filter((product) => product.available).sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (draftItems.length === 0) {
      setErrorMessage('Adicione pelo menos um item na comanda.')
      return
    }

    try {
      setIsSubmitting(true)
      const order = editingOrderId
        ? updateOrder({
            order: orders.find((item) => item.id === editingOrderId)!,
            reference,
            items: draftItems,
            notes
          })
        : createOrder({
            number: nextOrderNumber,
            reference,
            items: draftItems,
            notes
          })

      await onSaveOrder(order)
      resetDraft()
      setSuccessMessage(
        editingOrderId ? 'Comanda atualizada.' : `Comanda #${order.number} criada.`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel salvar a comanda.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function addProductToDraft() {
    const product = availableProducts.find((item) => item.id === selectedProductId)

    if (!product) {
      setErrorMessage('Selecione um produto disponivel.')
      return
    }

    setDraftItems((current) => {
      const existing = current.find((item) => item.productId === product.id)

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...current,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          unitPriceInCents: product.priceInCents,
          quantity: 1
        }
      ]
    })
  }

  function changeItemQuantity(productId: string, delta: number) {
    setDraftItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function startEditing(order: Order) {
    setEditingOrderId(order.id)
    setReference(order.reference ?? '')
    setDraftItems(order.items)
    setNotes(order.notes ?? '')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  function resetDraft() {
    setEditingOrderId(null)
    setReference('')
    setDraftItems([])
    setNotes('')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleDelete(order: Order) {
    const confirmed = window.confirm(
      `Remover a comanda #${order.number}? Esta acao nao pode ser desfeita.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingOrderId(order.id)
      setErrorMessage(null)
      setSuccessMessage(null)
      await onDeleteOrder(order.id)

      if (editingOrderId === order.id) {
        resetDraft()
      }

      setSuccessMessage(`Comanda #${order.number} removida.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel remover a comanda.'
      )
    } finally {
      setDeletingOrderId(null)
    }
  }

  async function handleRollbackStatus(order: Order) {
    const previousStatus = getPreviousOrderStatus(order.status)

    if (!previousStatus) {
      return
    }

    const confirmed = window.confirm(
      `Voltar a comanda #${order.number} para ${getRollbackLabel(previousStatus)}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setUpdatingOrderId(order.id)
      setErrorMessage(null)
      setSuccessMessage(null)
      await onUpdateOrderStatus(order, previousStatus)
      setSuccessMessage(`Comanda #${order.number} voltou para ${getRollbackLabel(previousStatus)}.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel voltar o status da comanda.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const draftTotal = draftItems.reduce(
    (sum, item) => sum + item.unitPriceInCents * item.quantity,
    0
  )

  return (
    <section className="content-grid">
      <Panel
        kicker="Operacao"
        title={editingOrderId ? 'Editar comanda' : `Nova comanda #${nextOrderNumber}`}
        actions={
          editingOrderId ? (
            <Button onClick={resetDraft} variant="ghost">
              Cancelar edicao
            </Button>
          ) : null
        }
      >
        <form className="product-form" onSubmit={handleSubmit}>
          <label className="field field-full">
            <span>Referencia da comanda</span>
            <input
              placeholder="Ex.: Mesa 4 ou Maria"
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </label>
          <label className="field field-full">
            <span>Adicionar produto</span>
            <div className="composed-row">
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                {availableProducts.length === 0 ? (
                  <option value="">Nenhum produto disponivel</option>
                ) : (
                  availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · R$ {(product.priceInCents / 100).toFixed(2)}
                    </option>
                  ))
                )}
              </select>
              <Button
                disabled={availableProducts.length === 0}
                icon={<Plus size={16} />}
                onClick={addProductToDraft}
                variant="secondary"
              >
                Adicionar
              </Button>
            </div>
          </label>
          <label className="field field-full">
            <span>Observacoes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <div className="field-full stack-list">
            {draftItems.length === 0 ? (
              <EmptyState
                title="Sem itens ainda"
                description="Selecione produtos do cardapio para montar a comanda local."
              />
            ) : (
              draftItems.map((item) => (
                <ListCard
                  key={item.productId}
                  label={item.productName}
                  value={`Qtd ${item.quantity} · R$ ${((item.unitPriceInCents * item.quantity) / 100).toFixed(2)}`}
                  aside={
                    <div className="inline-actions">
                      <Button
                        icon={<Minus size={14} />}
                        onClick={() => changeItemQuantity(item.productId, -1)}
                        variant="ghost"
                      >
                        Menos
                      </Button>
                      <Button
                        icon={<Plus size={14} />}
                        onClick={() => changeItemQuantity(item.productId, 1)}
                        variant="ghost"
                      >
                        Mais
                      </Button>
                    </div>
                  }
                />
              ))
            )}
          </div>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          <div className="form-actions field-full">
            <Button disabled={isSubmitting} type="submit" variant="primary">
              {isSubmitting
                ? 'Salvando...'
                : editingOrderId
                  ? 'Salvar comanda'
                  : 'Criar comanda'}
            </Button>
            <span className="price-tag">Total R$ {(draftTotal / 100).toFixed(2)}</span>
          </div>
        </form>
      </Panel>
      <Panel kicker="Comandas" title="Abertas e em preparo">
        <div className="stack-list">
          {activeOrders.length === 0 ? (
            <EmptyState
              title="Nenhuma comanda aberta"
              description="Crie comandas locais com numero automatico e itens do cardapio."
            />
          ) : (
            activeOrders.map((order) => (
              <ListCard
                key={order.id}
                label={
                  order.reference
                    ? `Comanda #${order.number} · ${order.reference}`
                    : `Comanda #${order.number}`
                }
                value={`${order.items.length} item(ns) · R$ ${(order.totalInCents / 100).toFixed(2)}`}
                aside={
                  <div className="inline-actions">
                    <StatusBadge status={order.status} />
                    {getPreviousOrderStatus(order.status) ? (
                      <Button
                        disabled={updatingOrderId === order.id}
                        icon={<RotateCcw size={15} />}
                        onClick={() => void handleRollbackStatus(order)}
                        variant="ghost"
                      >
                        {updatingOrderId === order.id ? 'Voltando...' : 'Voltar status'}
                      </Button>
                    ) : null}
                    <Button
                      icon={<Pencil size={15} />}
                      onClick={() => startEditing(order)}
                      variant="ghost"
                    >
                      Editar
                    </Button>
                    <Button
                      disabled={deletingOrderId === order.id}
                      icon={<Trash2 size={15} />}
                      onClick={() => void handleDelete(order)}
                      variant="ghost"
                    >
                      {deletingOrderId === order.id ? 'Removendo...' : 'Remover'}
                    </Button>
                  </div>
                }
              />
            ))
          )}
        </div>
      </Panel>
    </section>
  )
}

function getRollbackLabel(status: Order['status']) {
  if (status === 'aberta') {
    return 'pendente'
  }

  if (status === 'preparando') {
    return 'em preparo'
  }

  if (status === 'pronta') {
    return 'pronta'
  }

  return 'entregue'
}
