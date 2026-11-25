/* FitFlow Service Worker
 * - App-Shell: Netzwerk zuerst, offline aus dem Cache
 * - Build-Dateien mit Hash (JS, CSS, Schrift): Cache zuerst, ändern sich nie
 * - Übungsbilder: Cache zuerst, bleiben über Updates erhalten (Version steckt in ?v=)
 */
// Bump when releasing a visible UI update; old CacheStorage entries must not hide new HTML/CSS.
const CACHE = 'fitflow-v241-ff-icon'
const MEDIA = 'fitflow-media-v1'
const MEDIA_LIMIT = 200
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192-ff.png', '/icon-512-ff.png', '/brand-mark.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== MEDIA).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function trimMedia() {
  const cache = await caches.open(MEDIA)
  const keys = await cache.keys()
  if (keys.length > MEDIA_LIMIT) await Promise.all(keys.slice(0, keys.length - MEDIA_LIMIT).map((k) => cache.delete(k)))
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response && response.ok) {
    cache.put(request, response.clone())
    if (cacheName === MEDIA) trimMedia()
  }
  return response
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }
  if (event.data?.type === 'PREFETCH' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(MEDIA).then((cache) => Promise.all(event.data.urls.map(async (url) => {
        if (await cache.match(url)) return
        try {
          const res = await fetch(url)
          if (res.ok) await cache.put(url, res)
        } catch {
          /* offline – später erneut */
        }
      }))).then(trimMedia),
    )
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html').then((res) => res || caches.match('/'))),
    )
    return
  }

  if (url.pathname.startsWith('/assets/exercises/') || /\.(?:webp|jpg|jpeg|png)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MEDIA).catch(() => caches.match(request)))
    return
  }

  if (/^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE))
    return
  }

  // Non-fingerprinted resources must be network-first, otherwise an old CSS/JS
  // can remain visible indefinitely in an installed PWA even after a release.
  // All durable workouts are in localStorage/Supabase, NOT CacheStorage.
  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-cache' })
      if (response && response.ok) {
        try {
          const cache = await caches.open(CACHE)
          await cache.put(request, response.clone())
        } catch {
          /* A cache write must never block a live response. */
        }
      }
      return response
    } catch {
      return (await caches.match(request)) || Response.error()
    }
  })())
})
