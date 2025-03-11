import './bootstrap';
import notificationSystem from './notification';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get user ID from meta tag or data attribute
    const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content') || 
                  document.body.getAttribute('data-user-id');
    
    if (userId) {
        // Initialize notification system with user ID
        notificationSystem
            .init(userId)
            .addListener(notification => {
                // Update notification badges or counters here
                const counter = document.getElementById('unread-messages-counter');
                if (counter) {
                    const currentCount = parseInt(counter.textContent || '0');
                    counter.textContent = currentCount + 1;
                    counter.style.display = 'flex';
                }
                
                console.log('[App] Notification received and processed:', notification);
            });
        
        // Request browser notification permission
        notificationSystem.requestPermission();
        
        // Show a test notification after a delay (for testing purposes)
        setTimeout(() => {
            notificationSystem.sendTestNotification(
                'Тестовое уведомление', 
                'Эта система уведомлений работает без Firebase'
            );
        }, 3000);
    } else {
        console.warn('[App] User ID not found, notifications disabled');
    }
});

// Add global event listeners for page-specific functionality
window.addEventListener('load', function() {
    // Initialize tooltip functionality if Bootstrap is used
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
});
