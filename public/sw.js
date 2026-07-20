const CACHE = 'fitflow-v8'
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/exercises/connie/marschieren.webp?v=8',
  '/assets/exercises/connie/arme-kreisen.webp',
  '/assets/exercises/connie/knie-heben.webp',
  '/assets/exercises/connie/ferse-zum-po.webp?v=8',
  '/assets/exercises/connie/leichte-kniebeugen.webp',
  '/assets/exercises/connie/kniebeugen.webp',
  '/assets/exercises/connie/ausfallschritte.webp',
  '/assets/exercises/connie/rudern-mit-hanteln.webp',
  '/assets/exercises/connie/schulterdruecken.webp',
  '/assets/exercises/connie/glute-bridge.webp?v=8',
  '/assets/exercises/connie/plank.webp',
  '/assets/exercises/connie/cardio-hometrainer.webp',
  '/assets/exercises/connie/hula-hoop.webp',
  '/assets/exercises/connie/russian-twists.webp',
  '/assets/exercises/connie/bicycle-crunches.webp',
  '/assets/exercises/connie/beinheben.webp',
  '/assets/exercises/connie/brustdruecken-am-boden.webp',
  '/assets/exercises/connie/seitheben.webp',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.allSettled(
      PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
    )),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
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

  // Exercise images are network-first so corrected assets replace stale PWA/browser copies.
  if (url.pathname.startsWith('/assets/exercises/')) {
    event.respondWith(
      fetch(request, { cache: 'reload' })
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
