import React from 'react'
import { createRoot } from 'react-dom/client'
import AuthGate from './components/AuthGate'
import '@fontsource-variable/archivo/wdth.css'
import './styles.css'
import './designRefresh.css'
import './motionStudio.css'
import './studio3.css'
import './controlPolish.css'
import './privateStudio.css'

try {
 const pref=localStorage.getItem('fitflow-theme-v1')||'system'
 document.documentElement.dataset.theme=pref==='dark'||pref==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'
}catch{/* default theme */}
const root=createRoot(document.getElementById('root'))
root.render(<AuthGate/>)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
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
      // Look for the latest PWA release immediately, not only after an hour.
      reg.update().catch(() => {})
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {})
      })
    }).catch(() => {})
  })
}
