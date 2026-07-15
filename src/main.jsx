import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import WorkoutTimer from './WorkoutTimer.jsx'
import ConnieGeneratedImages from './ConnieGeneratedImages.jsx'
import { applyPlanFixes } from './planFixes'
import './styles.css'
import './connieSpriteFix.css'

applyPlanFixes()

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <WorkoutTimer />
    <ConnieGeneratedImages />
  </>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const notify = () => {
        if (reg.waiting) {
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
