import { showBrowserNotification, showModalNotification } from './firebase-init';

document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const notificationBanner = document.createElement('div');
        notificationBanner.className = 'notification-permission-banner';
        notificationBanner.innerHTML = `
            <div class="notification-banner-content">
                <p>Разрешите уведомления, чтобы быть в курсе новых сообщений</p>
                <button id="allow-notifications" class="btn btn-primary">Разрешить</button>
                <button id="close-notification-banner" class="btn btn-secondary">Позже</button>
            </div>
        `;
        document.body.appendChild(notificationBanner);

        document.getElementById('allow-notifications').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                console.log('Пользователь ' + (permission === 'granted' ? 'разрешил' : 'не разрешил') + ' уведомления');
                notificationBanner.remove();
            });
        });

        document.getElementById('close-notification-banner').addEventListener('click', () => {
            notificationBanner.remove();
        });
    }
});

export function showChatNotification(message, chatId = null, chatType = null) {
    showModalNotification('Новое сообщение', message, chatId, chatType);
}

export function checkForNewMessages(csrfToken, notifiedChats) {
    fetch('/chats/unread-counts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.unread_counts && data.unread_counts.length > 0) {
            data.unread_counts.forEach(chat => {
                if (chat.unread_count > 0 && !notifiedChats.has(chat.id)) {
                    const message = `У вас ${chat.unread_count} новых сообщений в чате ${chat.name}`;
                    showBrowserNotification('Новое сообщение', message, { chatId: chat.id, chatType: chat.type });
                    notifiedChats.add(chat.id);
                }
            });
        }
    })
    .catch(e => console.error('Ошибка при проверке новых сообщений:', e));
}

/**
 * Custom notification system to replace Firebase
 */
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.userId = null;
        this.enabled = true;
        this.checkInterval = null;
        this.lastCheck = Date.now();
    }

    /**
     * Initialize the notification system
     * @param {number} userId - The user ID to fetch notifications for
     */
    init(userId) {
        this.userId = userId;
        console.log('[Notification System] Initialized for user:', userId);
        
        // Start checking for new notifications
        this.startChecking();
        
        // Register service worker if supported
        this.registerServiceWorker();
        
        return this; // For chaining
    }

    /**
     * Register service worker for notifications if browser supports it
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/notification-sw.js')
                .then(registration => {
                    console.log('[Notification System] Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('[Notification System] Service Worker registration failed:', error);
                });
        }
    }

    /**
     * Start periodic checking for new notifications
     * @param {number} interval - Check interval in milliseconds (default: 10000 ms)
     */
    startChecking(interval = 10000) {
        // Clear any existing interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // Set up new checking interval
        this.checkInterval = setInterval(() => {
            this.checkForNewNotifications();
        }, interval);
        
        // Perform an immediate check
        this.checkForNewNotifications();
        
        console.log(`[Notification System] Started checking every ${interval}ms`);
    }

    /**
     * Stop checking for notifications
     */
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[Notification System] Stopped checking');
        }
    }

    /**
     * Check for new notifications from the server
     */
    checkForNewNotifications() {
        if (!this.userId || !this.enabled) return;
        
        const timestamp = this.lastCheck;
        this.lastCheck = Date.now();
        
        fetch(`/api/notifications?since=${timestamp}&user_id=${this.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data.notifications) && data.notifications.length > 0) {
                console.log('[Notification System] Received new notifications:', data.notifications);
                
                // Process each notification
                data.notifications.forEach(notification => {
                    this.processNotification(notification);
                });
            }
        })
        .catch(error => {
            console.error('[Notification System] Error fetching notifications:', error);
        });
    }

    /**
     * Process a single notification
     * @param {Object} notification - The notification data
     */
    processNotification(notification) {
        // Log to console for debugging
        console.log('[Notification System] Processing notification:', notification);
        
        // Store in our internal list
        this.notifications.push(notification);
        
        // Trigger any registered listeners
        this.notifyListeners(notification);
        
        // Display visual notification
        this.showNotification(notification);
    }

    /**
     * Show a visual notification
     * @param {Object} notification - The notification data
     */
    showNotification(notification) {
        // Try to use the Notification API if available and permitted
        if (window.Notification && Notification.permission === "granted") {
            const notif = new Notification(notification.title || 'Новое уведомление', {
                body: notification.body || notification.message || '',
                icon: notification.icon || '/storage/icon/notification.png',
            });
            
            notif.onclick = () => {
                // Handle notification click
                console.log('[Notification System] Notification clicked:', notification);
                if (notification.url) {
                    window.open(notification.url, '_blank');
                }
                notif.close();
            };
        } else {
            // Fallback to custom notification display
            this.showCustomNotification(notification);
        }
    }

    /**
     * Show a custom notification element in the page
     * @param {Object} notification - The notification data
     */
    showCustomNotification(notification) {
        // Create notification element if not exists
        let container = document.getElementById('custom-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'custom-notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        // Create the notification element
        const notifElement = document.createElement('div');
        notifElement.className = 'custom-notification';
        notifElement.innerHTML = `
            <div class="custom-notification-header">
                <strong>${notification.title || 'Новое уведомление'}</strong>
                <span class="custom-notification-close">&times;</span>
            </div>
            <div class="custom-notification-body">
                ${notification.body || notification.message || ''}
            </div>
        `;
        
        // Style the notification
        notifElement.style.backgroundColor = '#ffffff';
        notifElement.style.border = '1px solid #ddd';
        notifElement.style.borderRadius = '8px';
        notifElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        notifElement.style.padding = '15px';
        notifElement.style.marginBottom = '10px';
        notifElement.style.width = '300px';
        notifElement.style.opacity = '0';
        notifElement.style.transform = 'translateX(50px)';
        notifElement.style.transition = 'all 0.3s ease-in-out';
        
        // Add to DOM
        container.appendChild(notifElement);
        
        // Animate in
        setTimeout(() => {
            notifElement.style.opacity = '1';
            notifElement.style.transform = 'translateX(0)';
        }, 10);
        
        // Add click event to navigate to URL if provided
        if (notification.url) {
            notifElement.addEventListener('click', () => {
                window.location.href = notification.url;
            });
            notifElement.style.cursor = 'pointer';
        }
        
        // Add close button functionality
        notifElement.querySelector('.custom-notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(notifElement);
        });
        
        // Auto-close after a time period
        setTimeout(() => {
            this.removeNotification(notifElement);
        }, 5000);
    }
    
    /**
     * Remove a notification element with animation
     * @param {HTMLElement} element - The notification element
     */
    removeNotification(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
    
    /**
     * Register a notification listener
     * @param {Function} callback - The callback function
     */
    addListener(callback) {
        if (typeof callback === 'function' && !this.listeners.includes(callback)) {
            this.listeners.push(callback);
            console.log('[Notification System] Listener added');
        }
        return this; // For chaining
    }
    
    /**
     * Unregister a notification listener
     * @param {Function} callback - The callback function to remove
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
            this.listeners.splice(index, 1);
            console.log('[Notification System] Listener removed');
        }
        return this; // For chaining
    }
    
    /**
     * Call all registered listeners with notification data
     * @param {Object} notification - The notification data
     */
    notifyListeners(notification) {
        this.listeners.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('[Notification System] Error in listener:', error);
            }
        });
    }
    
    /**
     * Request permission for browser notifications
     */
    requestPermission() {
        if (window.Notification) {
            Notification.requestPermission()
                .then(permission => {
                    console.log('[Notification System] Notification permission:', permission);
                })
                .catch(error => {
                    console.error('[Notification System] Permission request error:', error);
                });
        }
    }
    
    /**
     * Enable notifications
     */
    enable() {
        this.enabled = true;
        console.log('[Notification System] Notifications enabled');
        return this; // For chaining
    }
    
    /**
     * Disable notifications
     */
    disable() {
        this.enabled = false;
        console.log('[Notification System] Notifications disabled');
        return this; // For chaining
    }
    
    /**
     * Send a test notification
     * @param {string} title - Test notification title
     * @param {string} message - Test notification message
     */
    sendTestNotification(title = 'Test Notification', message = 'This is a test notification') {
        const testNotification = {
            id: `test-${Date.now()}`,
            title: title,
            body: message,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'test'
        };
        
        console.log('[Notification System] Sending test notification:', testNotification);
        this.processNotification(testNotification);
    }
}

// Create global instance
window.notificationSystem = new NotificationSystem();

// Export the notification system
export default window.notificationSystem;
