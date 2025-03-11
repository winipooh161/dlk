importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js');

// Конфигурация Firebase
firebase.initializeApp({
    apiKey: "AIzaSyB6N1n8dW95YGMMuTsZMRnJY1En7lK2s2M",
    authDomain: "dlk-diz.firebaseapp.com",
    projectId: "dlk-diz",
    storageBucket: "dlk-diz.firebasestorage.app",
    messagingSenderId: "209164982906",
    appId: "1:209164982906:web:0836fbb02e7effd80679c3"
});

const messaging = firebase.messaging();

// Обработчик для фоновых сообщений (когда браузер в фоне или закрыт)
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Получено фоновое сообщение:', payload);

    const notificationTitle = payload.notification.title || 'Новое сообщение';
    const notificationOptions = {
        body: payload.notification.body || '',
        icon: '/storage/icon/notification-icon.png',
        badge: '/storage/icon/badge-icon.png',
        data: payload.data || {},
        vibrate: [200, 100, 200], // Вибрация для мобильных
        requireInteraction: true, // Не исчезает автоматически
        silent: false // Звук включен
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Клик по уведомлению', event);
    event.notification.close();
    
    const data = event.notification.data;
    let url = '/chats';
    
    // Если есть информация о чате, формируем URL для перехода
    if (data && data.chatId && data.chatType) {
        url = `/chats?chatId=${data.chatId}&chatType=${data.chatType}`;
    }
    
    // Открываем нужную страницу при клике на уведомление
    event.waitUntil(
        clients.matchAll({type: 'window'})
        .then(function(clientList) {
            // Если уже есть открытое окно, фокусируемся на нем
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(() => {
                        if (client.url !== url) {
                            return client.navigate(url);
                        }
                    });
                }
            }
            
            // Иначе открываем новое окно
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
