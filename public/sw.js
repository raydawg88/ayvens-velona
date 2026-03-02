// Service Worker for Fleet Management Dashboard
const CACHE_NAME = 'velona-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/logo_icon.svg'
]

// Network-first strategy for API calls, Cache-first for static assets
const CACHE_STRATEGIES = {
  api: 'network-first',
  assets: 'cache-first',
  pages: 'stale-while-revalidate'
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      self.skipWaiting() // Activate immediately
    })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      self.clients.claim() // Take control immediately
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return

  // API requests - network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Static assets - cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Pages - stale-while-revalidate strategy
  if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request))
    return
  }
})

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request)

    // Cache successful responses (except auth endpoints)
    if (response.ok && !request.url.includes('/auth/')) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Unable to connect to server'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // Optionally update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response.clone())
        })
      }
    }).catch(() => {}) // Ignore background update errors

    return cachedResponse
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('[SW] Asset fetch failed:', request.url)
    throw error
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request)

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME)
      cache.then(c => c.put(request, response.clone()))
    }
    return response
  }).catch(() => cachedResponse) // Fallback to cache on network error

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse
  }

  // Otherwise wait for network
  return fetchPromise
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  return (
    pathname.includes('/assets/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp')
  )
}

function isPageRequest(request) {
  const url = new URL(request.url)

  return (
    request.mode === 'navigate' ||
    request.headers.get('Accept')?.includes('text/html')
  )
}