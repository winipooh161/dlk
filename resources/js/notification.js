import { showBrowserNotification, showModalNotification, requestNotificationPermission, updateUnreadCounters } from './firebase-init';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация системы уведомлений при загрузке страницы
    initNotificationSystem();
    
    // Периодическое обновление счетчиков непрочитанных сообщений
    setInterval(() => {
        updateUnreadCounters();
    }, 30000); // Каждые 30 секунд
    
    // Обработка URL-параметров для автоматического открытия чата
    handleChatUrlParameters();
});

// Инициализация системы уведомлений
function initNotificationSystem() {
    // Проверяем, нужно ли показывать баннер разрешения уведомлений
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        showPermissionBanner();
    }
    
    // Установка глобальных обработчиков событий для значков уведомлений
    setupNotificationBadgeHandlers();
}

// Показать баннер с запросом разрешения на уведомления
function showPermissionBanner() {
    // Проверяем, не отображается ли уже баннер
    if (document.querySelector('.notification-permission-banner')) return;
    
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
        requestNotificationPermission();
        notificationBanner.remove();
    });

    document.getElementById('close-notification-banner').addEventListener('click', () => {
        notificationBanner.remove();
        
        // Сохраняем в localStorage, что пользователь отложил решение
        // чтобы не показывать баннер слишком часто
        localStorage.setItem('notification_permission_asked', Date.now());
    });
}

// Обработка параметров URL для автоматического открытия чата из уведомления
function handleChatUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chatId');
    const chatType = urlParams.get('chatType');
    
    if (chatId && chatType) {
        // Таймаут позволяет дождаться загрузки списка чатов
        setTimeout(() => {
            const chatElement = document.querySelector(`[data-chat-id="${chatId}"][data-chat-type="${chatType}"]`);
            if (chatElement) {
                chatElement.click();
            }
        }, 1000);
    }
}

// Установка обработчиков для значков уведомлений
function setupNotificationBadgeHandlers() {
    // Например, при клике на значок уведомлений в шапке
    document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('.notifications-icon')) {
            // Обновляем счетчики перед открытием
            updateUnreadCounters();
            
            // Здесь можно открыть панель уведомлений или перейти к чатам
            // В зависимости от логики вашего приложения
        }
    });
}

// Показать всплывающее уведомление в чате (in-app)
export function showChatNotification(message, chatId = null, chatType = null) {
    // Проверяем, не находимся ли мы в этом чате прямо сейчас
    const currentChatId = window.currentChatId;
    const currentChatType = window.currentChatType;
    
    // Если мы не в том чате, откуда пришло сообщение - показываем уведомление
    if (currentChatId !== chatId || currentChatType !== chatType) {
        showModalNotification('Новое сообщение', message, chatId, chatType);
    }
}

// Проверка наличия новых сообщений для активной страницы
export function checkForNewMessages(csrfToken, notifiedChats) {
    fetch('/chats/unread-counts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
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

// Для поддержки более старых браузеров
export function checkBrowserCompatibility() {
    const compatibilityResults = {
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window
    };
    
    console.log('Совместимость браузера:', compatibilityResults);
    return compatibilityResults;
}
