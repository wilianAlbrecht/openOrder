import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

function App() {
  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">OpenOrder</p>
        <h1>Sistema de comandas local e offline-first</h1>
        <p>
          Base React, Capacitor e PWA pronta para evoluir com foco em operação
          simples, privacidade e segurança dos dados locais.
        </p>
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
