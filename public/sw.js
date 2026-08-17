const CACHE_NAME = 'demos-pwa-v1';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
	'/',
	'/manifest.json',
	'/favicon.ico',
	'/icon0.svg',
	'/icon1.png',
	'/apple-icon.png',
	'/web-app-manifest-192x192.png',
	'/web-app-manifest-512x512.png',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				}),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Bypass Next.js HMR or API routes from cache-first strategy
	if (
		url.pathname.startsWith('/api') ||
		url.pathname.startsWith('/_next/webpack-hmr')
	) {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Cache successful responses for assets
				if (
					response.status === 200 &&
					(url.pathname.startsWith('/_next/static') ||
						STATIC_ASSETS.includes(url.pathname))
				) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, clone);
					});
				}
				return response;
			})
			.catch(async () => {
				const cache = await caches.open(CACHE_NAME);
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					return cachedResponse;
				}
				if (event.request.mode === 'navigate') {
					return cache.match(OFFLINE_URL);
				}
				return new Response('Network error occurred', {
					status: 408,
					headers: { 'Content-Type': 'text/plain' },
				});
			}),
	);
});

// Handle push notification events
self.addEventListener('push', (event) => {
	let data = {
		title: 'Demos Club Update',
		body: 'You have a new update in Demos.',
		icon: '/web-app-manifest-192x192.png',
		badge: '/icon1.png',
		url: '/',
	};

	if (event.data) {
		try {
			data = { ...data, ...event.data.json() };
		} catch {
			data.body = event.data.text();
		}
	}

	const targetUrl = data.url || '/';

	const options = {
		body: data.body,
		icon: data.icon || '/web-app-manifest-192x192.png',
		badge: data.badge || '/icon1.png',
		vibrate: [100, 50, 100],
		data: {
			url: targetUrl,
		},
		actions: [{ action: 'open', title: 'Open' }],
	};

	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				// If a window is currently focused and looking at the exact target URL, don't interrupt with a popup
				const isActivelyViewing = clientList.some(
					(client) =>
						client.focused &&
						client.visibilityState === 'visible' &&
						client.url.includes(targetUrl),
				);

				if (isActivelyViewing) {
					return;
				}

				return self.registration.showNotification(data.title, options);
			}),
	);
});

// Handle notification click to navigate to the relevant url
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const targetUrl = event.notification.data?.url || '/';

	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.includes(self.location.origin) && 'focus' in client) {
						client.navigate(targetUrl);
						return client.focus();
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(targetUrl);
				}
			}),
	);
});
