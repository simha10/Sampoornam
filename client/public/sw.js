const CACHE_NAME = 'sampoornam-cache-v2'; // Bumped version

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // 1. NEVER cache any API routes (both admin and customer)
    // Caching APIs can lead to customers seeing stale stock, outdated order statuses, or wrong prices on flaky networks.
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 2. Admin routes - Network Only (Fail fast rather than showing old dashboard)
    if (url.pathname.startsWith('/admin')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response('Network error. Admin dashboard requires internet.', { status: 503 });
            })
        );
        return;
    }
    
    // 3. Prevent caching Next.js RSC (React Server Components) data
    // Next.js uses RSC payloads. Caching them can break page hydration on spotty connections.
    if (event.request.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 4. Immutable Static Assets (Next.js Fingerprinted files) - strictly CACHE FIRST
    const isNextStatic = url.pathname.startsWith('/_next/static/');
    
    // 5. Public Media/Images (Un-fingerprinted) - STALE-WHILE-REVALIDATE
    // This allows customer to load the site fast, but silently updates the image in the background if you replace logo.png
    const isPublicImage = url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/);

    if (isNextStatic) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return networkResponse;
                });
            })
        );
    } else if (isPublicImage) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return networkResponse;
                }).catch(() => null); // Silently fail in background if offline

                return cachedResponse || fetchPromise;
            })
        );
    } else {
        // 6. Customer Document / Pages - NETWORK FIRST fallback to CACHE
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return networkResponse;
            }).catch(() => caches.match(event.request))
        );
    }
});
