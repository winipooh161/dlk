export function initializeEmojiPicker(textarea) {
    const container = textarea.parentElement;
    const emojiButton = document.createElement('button');
    const emojiPicker = document.createElement('div');
    
    emojiButton.textContent = "😉";
    emojiButton.type = "button";
    emojiButton.classList.add('emoji-button');
    
    emojiPicker.classList.add('emoji-picker');
    emojiPicker.style.position = 'absolute';

    
    // Эмодзи по категориям
    const emojiCategories = {
        recent: [], // Будет содержать недавно использованные эмодзи
        smileys: ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😍","😘","😜","😎","😭","😡"],
        emotions: ["😇","😈","🙃","🤔","😥","😓","🤩","🥳","🤯","🤬","😱","😴","🥰","😝","🤗","😶"],
        animals: ["🐱","🐶","🐭","🐹","🐰","🦊","🐻","🐼","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦"],
        plants: ["🌹","🌻","🌺","🌷","🌼","🍀","🌿","🌴","🌵","🌲","🌳","🍄","🌾","🍁","🍂","🍃"],
        food: ["🍎","🍓","🍒","🍇","🍉","🍋","🍊","🍌","🥝","🍍","🥭","🍕","🍔","🌮","🍣","🍩"],
        objects: ["📱","💻","📷","🔋","💡","🎁","⚽","🏀","🎮","🎧","📚","🔑","💰","⏰","🔍","🔒"]
    };
    
    // Загрузка истории использования эмодзи из localStorage
    try {
        const savedRecent = localStorage.getItem('recentEmojis');
        if (savedRecent) {
            emojiCategories.recent = JSON.parse(savedRecent).slice(0, 10); // Ограничение до 10 эмодзи
        }
    } catch (e) {
        console.error('Ошибка загрузки истории эмодзи:', e);
        emojiCategories.recent = [];
    }
    
    // Функция для добавления эмодзи в историю
    function addToRecentEmojis(emoji) {
        // Удаляем эмодзи, если он уже есть в истории
        emojiCategories.recent = emojiCategories.recent.filter(e => e !== emoji);
        
        // Добавляем эмодзи в начало массива
        emojiCategories.recent.unshift(emoji);
        
        // Оставляем только последние 10 эмодзи
        if (emojiCategories.recent.length > 10) {
            emojiCategories.recent.pop();
        }
        
        // Сохраняем обновленную историю
        try {
            localStorage.setItem('recentEmojis', JSON.stringify(emojiCategories.recent));
        } catch (e) {
            console.error('Ошибка сохранения истории эмодзи:', e);
        }
        
        // Обновляем отображение категории "Недавние"
        updateRecentEmojisDisplay();
    }
    
    // Функция для обновления отображения недавних эмодзи
    function updateRecentEmojisDisplay() {
        const recentTab = emojiPicker.querySelector('.emoji-category[data-category="recent"]');
        if (recentTab) {
            const recentContent = recentTab.querySelector('.emoji-content');
            
            // Если недавних эмодзи нет, показываем подсказку
            if (emojiCategories.recent.length === 0) {
                recentContent.innerHTML = '<div class="emoji-empty-message">Здесь будут отображаться ваши недавние эмодзи</div>';
            } else {
                recentContent.innerHTML = '';
                emojiCategories.recent.forEach(emoji => {
                    const span = document.createElement('span');
                    span.classList.add('emoji-item');
                    span.textContent = emoji;
                    recentContent.appendChild(span);
                });
            }
        }
    }
    
    // Создаем HTML для эмодзи-пикера с вкладками категорий
    let pickerHTML = '<div class="emoji-tabs">';
    
    // Добавляем вкладки для каждой категории
    const categoryNames = {
        recent: "Недавние",
        smileys: "Смайлики",
        emotions: "Эмоции",
        animals: "Животные",
        plants: "Растения",
        food: "Еда",
        objects: "Объекты"
    };
    
    Object.keys(emojiCategories).forEach((category, index) => {
        pickerHTML += `<div class="emoji-tab ${index === 0 ? 'active' : ''}" data-category="${category}">${categoryNames[category]}</div>`;
    });
    
    pickerHTML += '</div><div class="emoji-categories">';
    
    // Добавляем содержимое для каждой категории
    Object.keys(emojiCategories).forEach((category, index) => {
        pickerHTML += `<div class="emoji-category ${index === 0 ? 'active' : ''}" data-category="${category}">`;
        pickerHTML += `<div class="emoji-content">`;
        
        if (category === 'recent' && emojiCategories.recent.length === 0) {
            pickerHTML += '<div class="emoji-empty-message">Здесь будут отображаться ваши недавние эмодзи</div>';
        } else {
            emojiCategories[category].forEach(emoji => {
                pickerHTML += `<span class="emoji-item">${emoji}</span>`;
            });
        }
        
        pickerHTML += '</div></div>';
    });
    
    pickerHTML += '</div>';
    
    emojiPicker.innerHTML = pickerHTML;
    
    // Обработчик клика на вкладки категорий
    emojiPicker.querySelectorAll('.emoji-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            
            // Делаем активной нужную вкладку
            emojiPicker.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Показываем соответствующую категорию
            emojiPicker.querySelectorAll('.emoji-category').forEach(cat => {
                cat.classList.remove('active');
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.add('active');
                }
            });
        });
    });
    
    // Обработчик клика на эмодзи
    emojiPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-item')) {
            const emoji = e.target.textContent;
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            
            textarea.value = textBefore + emoji + textAfter;
            const newPos = cursorPos + emoji.length;
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
            textarea.focus();
            
            // Добавляем выбранный эмодзи в историю
            addToRecentEmojis(emoji);
        }
    });
    
    // Добавляем стили для эмодзи-пикера
    const style = document.createElement('style');
    style.textContent = `
      
    `;
    document.head.appendChild(style);
    
    container.appendChild(emojiButton);
    container.appendChild(emojiPicker);
    emojiPicker.style.display = "none";
    
    emojiButton.addEventListener('click', (event) => {
        event.stopPropagation();
        emojiPicker.style.display = (emojiPicker.style.display === "none") ? "flex" : "none";
    });
    
    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) {
            emojiPicker.style.display = "none";
        }
    });
}
