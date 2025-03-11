import{i as g,g as h,o as y,a as w}from"./index.esm2017-NZQW5Whv.js";let l=null,a=null,d=!1;document.addEventListener("DOMContentLoaded",()=>{if(l)return;console.log("Инициализация Firebase..."),l=g({apiKey:"AIzaSyB6N1n8dW95YGMMuTsZMRnJY1En7lK2s2M",authDomain:"dlk-diz.firebaseapp.com",projectId:"dlk-diz",storageBucket:"dlk-diz.firebasestorage.app",messagingSenderId:"209164982906",appId:"1:209164982906:web:0836fbb02e7effd80679c3"}),a=h(l),v(),x(),window.firebaseNotifications={showBrowserNotification:p,showModalNotification:b,requestNotificationPermission:f}});function v(){a&&y(a,e=>{var i,n,t,o,s,r;console.log("Получено сообщение в активном окне:",e),p(((i=e.notification)==null?void 0:i.title)||"Новое сообщение",((n=e.notification)==null?void 0:n.body)||"",e.data),b(((t=e.notification)==null?void 0:t.title)||"Новое сообщение",((o=e.notification)==null?void 0:o.body)||"",(s=e.data)==null?void 0:s.chatId,(r=e.data)==null?void 0:r.chatType),typeof u=="function"&&u()})}function x(){if(!("Notification"in window)){console.log("Этот браузер не поддерживает уведомления");return}const e=Notification.permission;console.log("Текущее разрешение для уведомлений:",e),e==="granted"?m():e!=="denied"&&k()}function k(){if(document.querySelector(".notification-permission-banner"))return;const e=document.createElement("div");e.className="notification-permission-banner",e.innerHTML=`
        <div class="notification-banner-content">
            <p>Разрешите уведомления, чтобы быть в курсе новых сообщений</p>
            <button id="allow-notifications" class="btn btn-primary">Разрешить</button>
            <button id="close-notification-banner" class="btn btn-secondary">Позже</button>
        </div>
    `,document.body.appendChild(e),document.getElementById("allow-notifications").addEventListener("click",()=>{f()}),document.getElementById("close-notification-banner").addEventListener("click",()=>{e.remove()})}function f(){"Notification"in window&&Notification.requestPermission().then(e=>{console.log("Пользователь "+(e==="granted"?"разрешил":"не разрешил")+" уведомления");const i=document.querySelector(".notification-permission-banner");i&&i.remove(),e==="granted"&&m()}).catch(e=>{console.error("Ошибка при запросе разрешения на уведомления:",e)})}function m(){if(!("serviceWorker"in navigator)){console.error("Service Worker не поддерживается в этом браузере");return}if(d){console.log("Токен уже был сохранен ранее");return}console.log("Регистрация Service Worker..."),navigator.serviceWorker.register("/firebase-messaging-sw.js").then(e=>(console.log("Service Worker зарегистрирован:",e.scope),w(a,{vapidKey:"BLf08mEO3lePyBvZCwTzaSNX9R981qwESUblCemdDVZUT_cs4G3GD2YY38CN8ELIcPmgVRZ92G7ePzY187d4Dh4",serviceWorkerRegistration:e}))).then(e=>{e?(console.log("Получен FCM токен:",e.substring(0,20)+"..."),S(e),d=!0):(console.error("Не удалось получить токен FCM"),Notification.permission!=="granted"&&console.error("Причина: не получено разрешение на уведомления"))}).catch(e=>{console.error("Ошибка при регистрации сервис-воркера или получении токена:",e)})}function S(e){d||fetch("/firebase/update-token",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({token:e})}).then(i=>{i.ok?(console.log("Токен успешно сохранен на сервере"),d=!0):console.error("Ошибка при сохранении токена на сервере")}).catch(i=>{console.error("Ошибка при отправке токена:",i)})}function p(e,i,n={}){if(!("Notification"in window)){console.log("Этот браузер не поддерживает уведомления");return}if(Notification.permission==="granted")try{const t=new Notification(e,{body:i,icon:"/storage/icon/notification-icon.png",badge:"/storage/icon/badge-icon.png",tag:`chat-${(n==null?void 0:n.chatId)||"general"}`,data:n,vibrate:[200,100,200],requireInteraction:!0,renotify:!0});return t.onclick=function(){if(window.focus(),n!=null&&n.chatId&&(n!=null&&n.chatType))if(window.location.pathname.includes("/chats")){const o=document.querySelector(`[data-chat-id="${n.chatId}"][data-chat-type="${n.chatType}"]`);o&&o.click()}else window.location.href=`/chats?chatId=${n.chatId}&chatType=${n.chatType}`;t.close()},t.onerror=function(o){console.error("Ошибка показа уведомления:",o)},t}catch(t){console.error("Ошибка при создании браузерного уведомления:",t)}else Notification.permission!=="denied"&&f()}function b(e,i,n,t){const o=document.createElement("div");if(o.classList.add("firebase-notification"),o.innerHTML=`
        <div class="notification-content">
            <div class="notification-header">
                <h4>${e}</h4>
                <button class="close-notification">&times;</button>
            </div>
            <div class="notification-body">
                <p>${i}</p>
            </div>
            <div class="notification-footer">
                <button class="view-message-btn">Перейти к сообщению</button>
            </div>
        </div>
    `,document.body.appendChild(o),!document.getElementById("firebase-notification-styles")){const c=document.createElement("style");c.id="firebase-notification-styles",c.textContent=`
            .firebase-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 320px;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
                overflow: hidden;
                border-left: 4px solid #4285F4;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .notification-content {
                padding: 15px;
            }
            
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .notification-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }
            
            .close-notification {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                padding: 0;
            }
            
            .notification-body p {
                margin: 0 0 15px 0;
                color: #555;
                font-size: 14px;
            }
            
            .view-message-btn {
                background-color: #4285F4;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                transition: background-color 0.2s;
            }
            
            .view-message-btn:hover {
                background-color: #3367D6;
            }
            
            .notification-permission-banner {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                width: 90%;
                max-width: 500px;
            }
            .notification-permission-banner .notification-banner-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            .notification-permission-banner p {
                margin: 0 0 10px 0;
                flex: 100%;
            }
            .notification-permission-banner .btn {
                margin-right: 10px;
                padding: 5px 15px;
                border-radius: 3px;
                cursor: pointer;
            }
            .btn-primary {
                background-color: #007bff;
                color: white;
                border: none;
            }
            .btn-secondary {
                background-color: #6c757d;
                color: white;
                border: none;
            }
        `,document.head.appendChild(c)}o.querySelector(".close-notification").addEventListener("click",()=>{o.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>o.remove(),300)}),o.querySelector(".view-message-btn").addEventListener("click",()=>{if(window.location.pathname.includes("/chats")){if(n&&t){const c=document.querySelector(`[data-chat-id="${n}"][data-chat-type="${t}"]`);c&&c.click()}}else{let c="/chats";n&&t&&(c+=`?chatId=${n}&chatType=${t}`),window.location.href=c}o.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>o.remove(),300)}),setTimeout(()=>{document.body.contains(o)&&(o.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>{document.body.contains(o)&&o.remove()},300))},8e3)}function u(){var i;const e=(i=document.querySelector('meta[name="csrf-token"]'))==null?void 0:i.getAttribute("content");e&&fetch("/chats/unread-counts",{method:"GET",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":e}}).then(n=>{if(!n.ok)throw new Error("Network response was not ok");return n.json()}).then(n=>{if(n.unread_counts&&n.unread_counts.length>0){const t=document.querySelector(".header-messages-counter");if(t){const o=n.unread_counts.reduce((s,r)=>s+r.unread_count,0);t.textContent=o,t.style.display=o>0?"inline-block":"none"}n.unread_counts.forEach(o=>{const s=document.querySelector(`[data-chat-id="${o.id}"][data-chat-type="${o.type}"]`);if(s){let r=s.querySelector(".unread-count");if(!r&&o.unread_count>0){r=document.createElement("span"),r.className="unread-count";const c=s.querySelector("h5");c&&c.appendChild(r)}r&&(o.unread_count>0?(r.textContent=o.unread_count,r.style.display="inline-block"):r.remove())}})}}).catch(n=>console.error("Ошибка при обновлении счетчиков сообщений:",n))}
