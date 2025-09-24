/**
 * Service Worker for AthleteAI
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'athleteai-v1.0.0';
const STATIC_CACHE_NAME = 'athleteai-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'athleteai-dynamic-v1.0.0';
const API_CACHE_NAME = 'athleteai-api-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/responsive.css',
    '/assets/js/app.js',
    '/assets/js/utils.js',
    '/assets/js/auth.js',
    '/assets/js/ai-assistant.js',
    '/assets/js/face-recognition.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/user/profile',
    '/api/training/sessions',
    '/api/ai/analysis',
    '/api/face/recognition'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME && 
                            cacheName !== API_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Check if request is for a static asset
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.includes(url.pathname) ||
           url.pathname.startsWith('/assets/') ||
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'cdnjs.cloudflare.com';
}

// Check if request is for an API endpoint
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

// Check if request is for an image
function isImageRequest(request) {
    return request.destination === 'image';
}

// Handle static asset requests
async function handleStaticAsset(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Failed to fetch static asset:', error);
        
        // Return offline page for HTML requests
        if (request.destination === 'document') {
            return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
        
        throw error;
    }
}

// Handle API requests
async function handleAPIRequest(request) {
    try {
        // Try network first for API requests
        const networkResponse = await fetch(request);
        
        // Cache successful GET responses
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('API request failed:', error);
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API requests
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'This feature is not available offline',
            timestamp: new Date().toISOString()
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Handle image requests
async function handleImageRequest(request) {
    try {
        // Try cache first for images
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Failed to fetch image:', error);
        
        // Return placeholder image
        return new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Handle dynamic requests (HTML pages)
async function handleDynamicRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Dynamic request failed:', error);
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/offline.html') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-training-data') {
        event.waitUntil(syncTrainingData());
    } else if (event.tag === 'sync-user-data') {
        event.waitUntil(syncUserData());
    }
});

// Sync training data when back online
async function syncTrainingData() {
    try {
        const offlineData = await getOfflineData('trainingData');
        if (offlineData && offlineData.length > 0) {
            console.log('Syncing training data:', offlineData.length, 'items');
            
            for (const data of offlineData) {
                try {
                    await fetch('/api/training/sessions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                } catch (error) {
                    console.error('Failed to sync training data item:', error);
                }
            }
            
            // Clear offline data after successful sync
            await clearOfflineData('trainingData');
            console.log('Training data synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync training data:', error);
    }
}

// Sync user data when back online
async function syncUserData() {
    try {
        const offlineData = await getOfflineData('userData');
        if (offlineData) {
            console.log('Syncing user data');
            
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(offlineData)
            });
            
            // Clear offline data after successful sync
            await clearOfflineData('userData');
            console.log('User data synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync user data:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    const options = {
        body: 'You have a new notification from AthleteAI',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/icons/action-view.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/action-close.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.data = { ...options.data, ...data };
    }
    
    event.waitUntil(
        self.registration.showNotification('AthleteAI', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/?notification=explore')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_DATA':
            cacheOfflineData(data.key, data.value);
            break;
            
        case 'GET_CACHED_DATA':
            getOfflineData(data.key).then((result) => {
                event.ports[0].postMessage({ success: true, data: result });
            }).catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CLEAR_CACHED_DATA':
            clearOfflineData(data.key);
            break;
            
        case 'SYNC_DATA':
            if (data.type === 'training') {
                syncTrainingData();
            } else if (data.type === 'user') {
                syncUserData();
            }
            break;
            
        default:
            console.log('Unknown message type:', type);
    }
});

// Utility functions for offline data management
async function cacheOfflineData(key, data) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await cache.put(`/offline-data/${key}`, response);
        console.log('Cached offline data for key:', key);
    } catch (error) {
        console.error('Failed to cache offline data:', error);
    }
}

async function getOfflineData(key) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = await cache.match(`/offline-data/${key}`);
        
        if (response) {
            const data = await response.json();
            console.log('Retrieved offline data for key:', key);
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Failed to get offline data:', error);
        return null;
    }
}

async function clearOfflineData(key) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        await cache.delete(`/offline-data/${key}`);
        console.log('Cleared offline data for key:', key);
    } catch (error) {
        console.error('Failed to clear offline data:', error);
    }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('Periodic sync triggered:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncAllData());
    }
});

async function syncAllData() {
    await Promise.all([
        syncTrainingData(),
        syncUserData()
    ]);
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');
