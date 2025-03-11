document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-panel');
    const panel = document.querySelector('.main__ponel');
    
    // Проверка URL для страниц чата
    const currentPath = window.location.pathname;
    const isChatsPage = /^\/chats(\/.*)?$/.test(currentPath) || window.location.href.includes('/chats?');
    
    if (isChatsPage) {
        // На страницах чата всегда сжимаем панель
        panel.classList.add('collapsed');
        localStorage.setItem('panelCollapsed', 'true');
    } else {
        // Проверяем сохраненное состояние панели в localStorage
        const isCollapsed = localStorage.getItem('panelCollapsed') === 'true';
        if (isCollapsed) {
            panel.classList.add('collapsed');
        }
    }
    
    // Обработчик клика по кнопке переключения
    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        // Сохраняем текущее состояние панели в localStorage
        const collapsed = panel.classList.contains('collapsed');
        localStorage.setItem('panelCollapsed', collapsed);
    });
});
