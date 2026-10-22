/** Alle FitFlow-Daten als JSON-Datei herunterladen */
export function exportData(version) {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('fitflow-')) data[key] = localStorage.getItem(key)
  }
  const payload = { app: 'FitFlow', version, exportedAt: new Date().toISOString(), data }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fitflow-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Bilder vorab für offline laden lassen (Service Worker) */
export function prefetchMedia(urls) {
  try {
    const list = [...new Set(urls.filter(Boolean))]
    if (list.length) navigator.serviceWorker?.controller?.postMessage({ type: 'PREFETCH', urls: list })
  } catch {
    /* ohne Service Worker egal */
  }
}
