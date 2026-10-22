import React from 'react'
import { exportData } from '../lib/backup'

/* Fängt Abstürze ab: statt weißer Seite gibt es Neuladen und eine Datensicherung */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('FitFlow-Fehler', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="crash">
        <div className="crashCard">
          <h1>Da ist etwas schiefgelaufen</h1>
          <p>Deine Trainingsdaten sind sicher gespeichert. Lade die App neu – meistens ist das Problem damit erledigt.</p>
          <div className="crashActions">
            <button className="primaryAction" onClick={() => window.location.reload()}>App neu laden</button>
            <button className="ghostBtn" onClick={() => exportData(this.props.version)}>Backup speichern</button>
          </div>
          <details>
            <summary>Technische Details</summary>
            <code>{String(this.state.error?.message || this.state.error)}</code>
          </details>
        </div>
      </main>
    )
  }
}
