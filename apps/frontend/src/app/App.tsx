import { useEffect, useState } from 'react'
import { ChefHat, Menu, MenuSquare, Package, Settings2, X } from 'lucide-react'
import {
  createApplicationContext,
  deriveActiveQueue,
  loadApplicationSnapshot,
  type ApplicationSnapshot
} from '@/app/services/application-context'
import {
  Button
} from '@/components/ui'
import { updateOrder, type Order, type Product } from '@/entities'
import { CardapioManager } from '@/features/cardapio/components/cardapio-manager'
import { ComandasManager } from '@/features/comandas/components/comandas-manager'
import { SettingsManager } from '@/features/configuracoes/components/settings-manager'
import { QueueManager } from '@/features/fila/components/queue-manager'

const context = createApplicationContext()

const navigationItems = [
  {
    id: 'comandas',
    label: 'Comandas',
    description: 'Mesas e pedidos em andamento',
    icon: MenuSquare
  },
  {
    id: 'fila',
    label: 'Fila',
    description: 'Fluxo de preparo e entrega',
    icon: ChefHat
  },
  {
    id: 'cardapio',
    label: 'Cardapio',
    description: 'Produtos e categorias locais',
    icon: Package
  },
  {
    id: 'configuracoes',
    label: 'Configuracoes',
    description: 'Privacidade e operacao local',
    icon: Settings2
  }
] as const

type NavigationId = (typeof navigationItems)[number]['id']

export function App() {
  const [snapshot, setSnapshot] = useState<ApplicationSnapshot | null>(null)
  const [activeView, setActiveView] = useState<NavigationId>('comandas')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    void loadApplicationSnapshot(context).then((nextSnapshot) => {
      if (active) {
        setSnapshot(nextSnapshot)
      }
    })

    return () => {
      active = false
    }
  }, [])

  async function handleSaveProduct(product: Product) {
    await context.products.save(product)

    setSnapshot((current) =>
      current
        ? {
            ...current,
            products: [
              ...current.products.filter((item) => item.id !== product.id),
              product
            ].sort((left, right) => left.name.localeCompare(right.name))
          }
        : current
    )
  }

  async function handleDeleteProduct(productId: string) {
    await context.products.remove(productId)

    setSnapshot((current) =>
      current
        ? {
            ...current,
            products: current.products.filter((item) => item.id !== productId)
          }
        : current
    )
  }

  async function handleSaveOrder(order: Order) {
    await context.orders.save(order)
    const nextOrders = (await context.orders.list()).sort(
      (left, right) => left.number - right.number
    )
    const nextQueue = deriveActiveQueue(nextOrders)

    await context.storage.set('queue', nextQueue)

    setSnapshot((current) =>
      current
        ? {
            ...current,
            orders: nextOrders,
            queue: nextQueue
          }
        : current
    )
  }

  async function handleDeleteOrder(orderId: string) {
    await context.orders.remove(orderId)
    const nextOrders = (await context.orders.list()).sort(
      (left, right) => left.number - right.number
    )
    const nextQueue = deriveActiveQueue(nextOrders)
    await context.storage.set('queue', nextQueue)

    setSnapshot((current) =>
      current
        ? {
            ...current,
            orders: nextOrders,
            queue: nextQueue
          }
        : current
    )
  }

  async function handleUpdateOrderStatus(order: Order, status: Order['status']) {
    await handleSaveOrder(
      updateOrder({
        order,
        status
      })
    )
  }

  async function handleSaveSettings(settings: ApplicationSnapshot['settings']) {
    await context.settings.save(settings)

    setSnapshot((current) =>
      current
        ? {
            ...current,
            settings
          }
        : current
    )
  }

  const activeViewLabel = navigationItems.find(
    (item) => item.id === activeView
  )?.label
  const establishmentName = snapshot?.settings.establishmentName ?? 'OpenOrder'
  const establishmentLogo = snapshot?.settings.logoImageUrl

  function handleSelectView(viewId: NavigationId) {
    setActiveView(viewId)
    setIsSidebarOpen(false)
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null)
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartX === null) {
      return
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX
    const deltaX = endX - touchStartX

    if (!isSidebarOpen && touchStartX <= 32 && deltaX >= 56) {
      setIsSidebarOpen(true)
    }

    if (isSidebarOpen && deltaX <= -56) {
      setIsSidebarOpen(false)
    }

    setTouchStartX(null)
  }

  const nextOrderNumber =
    (snapshot?.orders.reduce(
      (highest, order) => Math.max(highest, order.number),
      0
    ) ?? 0) + 1

  let content = null

  switch (activeView) {
    case 'comandas':
      content = (
        <ComandasManager
          nextOrderNumber={nextOrderNumber}
          onDeleteOrder={handleDeleteOrder}
          onSaveOrder={handleSaveOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          orders={snapshot?.orders ?? []}
          products={snapshot?.products ?? []}
        />
      )
      break
    case 'fila':
      content = (
        <QueueManager
          onUpdateOrderStatus={handleUpdateOrderStatus}
          orders={snapshot?.orders ?? []}
        />
      )
      break
    case 'cardapio':
      content = (
        <CardapioManager
          onDeleteProduct={handleDeleteProduct}
          onSaveProduct={handleSaveProduct}
          products={snapshot?.products ?? []}
        />
      )
      break
    case 'configuracoes':
      content = (
        snapshot ? (
          <SettingsManager
            onSaveSettings={handleSaveSettings}
            settings={snapshot.settings}
          />
        ) : null
      )
      break
  }

  return (
    <main
      className="layout-shell"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      <button
        aria-hidden="true"
        className={`sidebar-overlay ${isSidebarOpen ? 'sidebar-overlay-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        tabIndex={isSidebarOpen ? 0 : -1}
        type="button"
      />
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <p className="eyebrow">OpenOrder</p>
          <h1>Operacao local</h1>
          <p className="sidebar-copy">
            Frontend standalone, offline-first e preparado para Android.
          </p>
        </div>
        <nav className="sidebar-nav" aria-label="Navegacao principal">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <Button
                key={item.id}
                className={`nav-item ${item.id === activeView ? 'nav-item-active' : ''}`}
                icon={<Icon size={16} />}
                onClick={() => handleSelectView(item.id)}
                variant="ghost"
              >
                <span className="nav-item-copy">
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </span>
              </Button>
            )
          })}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <Button
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            className="menu-trigger"
            icon={isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            onClick={() => setIsSidebarOpen((current) => !current)}
            variant="ghost"
          >
            Menu
          </Button>
          <div className="topbar-identity">
            {establishmentLogo ? (
              <div className="topbar-logo">
                <img alt={`Logo de ${establishmentName}`} src={establishmentLogo} />
              </div>
            ) : null}
            <div>
              <p className="section-kicker">{establishmentName}</p>
              <h2>{activeViewLabel}</h2>
            </div>
          </div>
        </header>
        {content}
      </section>
    </main>
  )
}
