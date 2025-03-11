/**
 * Service Worker for handling notifications
 */

self.addEventListener('install', event => {
    console.log('[Service Worker] Installed');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activated');
    return self.clients.claim();
});

self.addEventListener('push', event => {
    console.log('[Service Worker] Push message received:', event);
    
    let data = {};
    try {
        data = event.data.json();
    } catch (error) {
        data = {
            title: 'Новое уведомление',
            body: event.data ? event.data.text() : 'Получено новое уведомление',
            icon: '/storage/icon/notification.png',
            url: '/'
        };
    }
    
    console.log('[Service Worker] Push data:', data);
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body || data.message,
            icon: data.icon || '/storage/icon/notification.png',
            badge: '/storage/icon/badge.png',
            data: data
        })
    );
});

self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked', event);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // If no window/tab is open with the URL, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
