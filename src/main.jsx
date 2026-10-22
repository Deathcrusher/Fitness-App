import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { applyPlanFixes } from './lib/planFixes'
import '@fontsource-variable/archivo/wdth.css'
import './styles.css'

applyPlanFixes()

const root = createRoot(document.getElementById('root'))
if (window.location.search.includes('figures')) {
  import('./components/FigureDebug.jsx').then(({ default: FigureDebug }) => root.render(<FigureDebug />))
} else {
  root.render(
    <ErrorBoundary version={__APP_VERSION__}>
      <App />
    </ErrorBoundary>,
  )
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const notify = () => {
        if (navigator.serviceWorker.controller && reg.waiting) {
          window.dispatchEvent(new CustomEvent('sw-update', { detail: { registration: reg } }))
        }
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed') notify()
        })
      })
      notify()
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {})
      })
    }).catch(() => {})
  })
}
