import { useMemo, useState } from 'react'
import { ImagePlus, Pencil, Trash2 } from 'lucide-react'
import {
  createProduct,
  updateProduct,
  type CreateProductInput,
  type Product
} from '@/entities'
import { Button, EmptyState, ListCard, Panel, StatusBadge } from '@/components/ui'

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024

type CardapioManagerProps = {
  onDeleteProduct: (productId: string) => Promise<void>
  onSaveProduct: (product: Product) => Promise<void>
  products: Product[]
}

type ProductFormState = {
  name: string
  category: string
  price: string
  description: string
  available: boolean
  imageUrl?: string
}

const initialFormState: ProductFormState = {
  name: '',
  category: '',
  price: '',
  description: '',
  available: true
}

export function CardapioManager({
  onDeleteProduct,
  onSaveProduct,
  products
}: CardapioManagerProps) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [formState, setFormState] = useState<ProductFormState>(initialFormState)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  )

  function resetForm() {
    setEditingProductId(null)
    setFormState(resetProductForm())
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  function startEditing(product: Product) {
    setEditingProductId(product.id)
    setFormState(startFormState(product))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const priceInCents = toPriceInCents(formState.price)
      const payload: CreateProductInput = {
        name: formState.name,
        category: formState.category,
        priceInCents,
        description: formState.description,
        available: formState.available,
        imageUrl: formState.imageUrl
      }

      const product = editingProductId
        ? updateProduct({
            product: products.find((item) => item.id === editingProductId)!,
            ...payload
          })
        : createProduct(payload)

      await onSaveProduct(product)
      resetForm()
      setSuccessMessage(
        editingProductId ? 'Produto atualizado.' : 'Produto cadastrado.'
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o produto.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const imageUrl = await readImageAsDataUrl(file)
      setFormState((current) => ({ ...current, imageUrl }))
      setErrorMessage(null)
      setSuccessMessage('Imagem local carregada.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.'
      )
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Remover o produto "${product.name}"? Esta acao nao pode ser desfeita.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingProductId(product.id)
      setErrorMessage(null)
      setSuccessMessage(null)
      await onDeleteProduct(product.id)

      if (editingProductId === product.id) {
        resetForm()
      }

      setSuccessMessage(`Produto "${product.name}" removido.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel remover o produto.'
      )
    } finally {
      setDeletingProductId(null)
    }
  }

  return (
    <section className="content-grid">
      <Panel
        kicker="Catalogo local"
        title={editingProductId ? 'Editar produto' : 'Novo produto'}
        actions={
          editingProductId ? (
            <Button onClick={resetForm} variant="ghost">
              Cancelar edicao
            </Button>
          ) : null
        }
      >
        <form className="product-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              required
              type="text"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Categoria</span>
            <input
              list="category-suggestions"
              required
              type="text"
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({ ...current, category: event.target.value }))
              }
            />
            <datalist id="category-suggestions">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Preco</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              required
              type="text"
              value={formState.price}
              onChange={(event) =>
                setFormState((current) => ({ ...current, price: event.target.value }))
              }
            />
          </label>
          <label className="field field-full">
            <span>Descricao</span>
            <textarea
              rows={3}
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
            />
          </label>
          <label className="field field-full field-file">
            <span>Imagem local opcional</span>
            <input accept="image/*" type="file" onChange={handleImageChange} />
            <small>A imagem fica localmente no dispositivo. Limite de 1 MB.</small>
          </label>
          <label className="toggle-field field-full">
            <input
              checked={formState.available}
              type="checkbox"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  available: event.target.checked
                }))
              }
            />
            <span>Produto disponivel</span>
          </label>
          {formState.imageUrl ? (
            <div className="image-preview field-full">
              <img alt="Preview do produto" src={formState.imageUrl} />
            </div>
          ) : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          <div className="form-actions field-full">
            <Button disabled={isSubmitting} icon={<ImagePlus size={16} />} type="submit" variant="primary">
              {isSubmitting
                ? 'Salvando...'
                : editingProductId
                  ? 'Salvar alteracoes'
                  : 'Cadastrar produto'}
            </Button>
          </div>
        </form>
      </Panel>
      <Panel kicker="Catalogo local" title="Produtos cadastrados">
        <div className="category-strip">
          {categories.length ? (
            categories.map((category) => (
              <span className="category-chip" key={category}>
                {category}
              </span>
            ))
          ) : (
            <span className="category-chip">Sem categorias ainda</span>
          )}
        </div>
        <div className="stack-list">
          {products.length === 0 ? (
            <EmptyState
              title="Cardapio ainda vazio"
              description="Cadastre produtos locais com categoria, disponibilidade, preco e imagem opcional."
            />
          ) : (
            products.map((product) => (
              <ListCard
                key={product.id}
                label={product.name}
                value={`${product.category} · R$ ${(product.priceInCents / 100).toFixed(2)}`}
                aside={
                  <div className="inline-actions">
                    <StatusBadge status={product.available ? 'ready' : 'finalizada'} />
                    <Button
                      icon={<Pencil size={15} />}
                      onClick={() => startEditing(product)}
                      variant="ghost"
                    >
                      Editar
                    </Button>
                    <Button
                      disabled={deletingProductId === product.id}
                      icon={<Trash2 size={15} />}
                      onClick={() => void handleDelete(product)}
                      variant="ghost"
                    >
                      {deletingProductId === product.id ? 'Removendo...' : 'Remover'}
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

function toPriceInCents(rawValue: string) {
  const normalized = rawValue.replace(/\./g, '').replace(',', '.').trim()
  const value = Number(normalized)

  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Preco invalido.')
  }

  return Math.round(value * 100)
}

function startFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    category: product.category,
    price: (product.priceInCents / 100).toFixed(2),
    description: product.description ?? '',
    available: product.available,
    imageUrl: product.imageUrl
  }
}

function resetProductForm() {
  return { ...initialFormState }
}

function readImageAsDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione apenas imagens locais.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('A imagem deve ter no maximo 1 MB.')
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Nao foi possivel ler a imagem.'))
    }

    reader.onerror = () => reject(new Error('Falha ao carregar a imagem.'))
    reader.readAsDataURL(file)
  })
}
