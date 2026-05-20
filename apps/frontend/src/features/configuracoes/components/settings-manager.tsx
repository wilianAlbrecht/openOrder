import { useState } from 'react'
import { ImagePlus, Shield, Store } from 'lucide-react'
import { Button, Panel } from '@/components/ui'
import { updateSettings, type Settings } from '@/entities'

const MAX_LOGO_SIZE_BYTES = 512 * 1024

type SettingsManagerProps = {
  onSaveSettings: (settings: Settings) => Promise<void>
  settings: Settings
}

type SettingsFormState = {
  establishmentName: string
  currencyCode: string
  locale: string
  logoImageUrl: string
  showClosedOrders: boolean
  shareSensitiveData: boolean
  printIntegrationEnabled: boolean
  diagnosticsEnabled: boolean
  whatsappIntegrationEnabled: boolean
}

export function SettingsManager({
  onSaveSettings,
  settings
}: SettingsManagerProps) {
  const [formState, setFormState] = useState(() => toFormState(settings))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      setIsSubmitting(true)
      const nextSettings = updateSettings({
        settings,
        establishmentName: formState.establishmentName,
        currencyCode: formState.currencyCode.toUpperCase(),
        locale: formState.locale,
        logoImageUrl: formState.logoImageUrl || undefined,
        showClosedOrders: formState.showClosedOrders,
        shareSensitiveData: formState.shareSensitiveData,
        printIntegrationEnabled: formState.printIntegrationEnabled,
        diagnosticsEnabled: formState.diagnosticsEnabled,
        whatsappIntegrationEnabled: formState.whatsappIntegrationEnabled
      })

      await onSaveSettings(nextSettings)
      setFormState(toFormState(nextSettings))
      setSuccessMessage('Configuracoes salvas localmente.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar as configuracoes.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      const logoImageUrl = await readImageAsDataUrl(file)
      setFormState((current) => ({
        ...current,
        logoImageUrl
      }))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao carregar a logo local.'
      )
    } finally {
      event.target.value = ''
    }
  }

  function updateField<Key extends keyof SettingsFormState>(
    key: Key,
    value: SettingsFormState[Key]
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value
    }))
  }

  return (
    <section className="content-grid">
      <Panel kicker="Operacao local" title="Configuracoes da operacao">
        <form className="product-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome do estabelecimento</span>
            <input
              value={formState.establishmentName}
              onChange={(event) => updateField('establishmentName', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Moeda</span>
            <input
              maxLength={3}
              value={formState.currencyCode}
              onChange={(event) => updateField('currencyCode', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Locale</span>
            <input
              value={formState.locale}
              onChange={(event) => updateField('locale', event.target.value)}
            />
          </label>

          <label className="field field-file">
            <span>Logo local opcional</span>
            <input accept="image/*" onChange={handleLogoChange} type="file" />
          </label>

          <div className="field-full">
            {formState.logoImageUrl ? (
              <div className="image-preview settings-logo-preview">
                <img alt="Logo do estabelecimento" src={formState.logoImageUrl} />
                <Button
                  icon={<ImagePlus size={16} />}
                  onClick={() => {
                    updateField('logoImageUrl', '')
                    setSuccessMessage('Logo removida do rascunho local.')
                  }}
                  variant="ghost"
                >
                  Remover logo
                </Button>
              </div>
            ) : null}
          </div>

          <label className="toggle-field field-full">
            <input
              checked={formState.showClosedOrders}
              onChange={(event) => updateField('showClosedOrders', event.target.checked)}
              type="checkbox"
            />
            <span>Exibir comandas finalizadas nas listagens futuras</span>
          </label>

          <label className="toggle-field field-full">
            <input
              checked={formState.shareSensitiveData}
              onChange={(event) => updateField('shareSensitiveData', event.target.checked)}
              type="checkbox"
            />
            <span>Permitir compartilhamento manual de dados sensiveis</span>
          </label>

          <label className="toggle-field field-full">
            <input
              checked={formState.printIntegrationEnabled}
              onChange={(event) =>
                updateField('printIntegrationEnabled', event.target.checked)
              }
              type="checkbox"
            />
            <span>Preparar integracao futura de impressao</span>
          </label>

          <label className="toggle-field field-full">
            <input
              checked={formState.whatsappIntegrationEnabled}
              onChange={(event) =>
                updateField('whatsappIntegrationEnabled', event.target.checked)
              }
              type="checkbox"
            />
            <span>Preparar compartilhamento futuro via WhatsApp</span>
          </label>

          <label className="toggle-field field-full">
            <input
              checked={formState.diagnosticsEnabled}
              onChange={(event) => updateField('diagnosticsEnabled', event.target.checked)}
              type="checkbox"
            />
            <span>Ativar diagnosticos locais sem envio automatico</span>
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}

          <div className="form-actions field-full">
            <Button
              disabled={isSubmitting}
              icon={<Store size={16} />}
              type="submit"
              variant="primary"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar configuracoes'}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel kicker="Privacidade" title="Estado atual da instalacao">
        <div className="settings-summary">
          <div className="settings-summary-item">
            <Shield size={16} />
            <div>
              <p className="list-label">Telemetria</p>
              <strong>
                {settings.diagnosticsEnabled ? 'Local e explicita' : 'Desativada por padrao'}
              </strong>
            </div>
          </div>
          <div className="settings-summary-item">
            <Store size={16} />
            <div>
              <p className="list-label">Estabelecimento</p>
              <strong>{settings.establishmentName}</strong>
            </div>
          </div>
        </div>

        <ul className="detail-list">
          <li>Logo permanece apenas no armazenamento local do dispositivo.</li>
          <li>Impressao e WhatsApp continuam opcionais e desativados por padrao.</li>
          <li>Nenhum envio externo ocorre sem acao explicita do usuario.</li>
        </ul>
      </Panel>
    </section>
  )
}

function toFormState(settings: Settings): SettingsFormState {
  return {
    establishmentName: settings.establishmentName,
    currencyCode: settings.currencyCode,
    locale: settings.locale,
    logoImageUrl: settings.logoImageUrl ?? '',
    showClosedOrders: settings.showClosedOrders,
    shareSensitiveData: settings.shareSensitiveData,
    printIntegrationEnabled: settings.printIntegrationEnabled,
    diagnosticsEnabled: settings.diagnosticsEnabled,
    whatsappIntegrationEnabled: settings.whatsappIntegrationEnabled
  }
}

function readImageAsDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione apenas imagens locais.')
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error('A logo deve ter no maximo 512 KB.')
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Nao foi possivel ler a logo.'))
    }

    reader.onerror = () => reject(new Error('Falha ao carregar a logo.'))
    reader.readAsDataURL(file)
  })
}
