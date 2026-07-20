import { CONNIE_CRITICAL_PRELOAD_URLS } from './plans'

export function preloadConnieImages() {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return

  for (const src of CONNIE_CRITICAL_PRELOAD_URLS) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)

    const image = new Image()
    image.decoding = 'async'
    image.fetchPriority = 'high'
    image.src = src
  }
}
