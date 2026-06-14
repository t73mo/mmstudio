importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",
  authDomain: "mmstudio-86917.firebaseapp.com",
  databaseURL: "https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mmstudio-86917",
  storageBucket: "mmstudio-86917.firebasestorage.app",
  messagingSenderId: "466384625481",
  appId: "1:466384625481:web:fb4bb7144d0d329be8c498"
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  var data = payload.data || {};
  var title = data.title || 'MM Studio';
  var body = data.body || 'Новое сообщение';
  self.registration.showNotification(title, {
    body: body,
    icon: '../assets/favicon.svg',
    badge: '../assets/favicon.svg',
    tag: 'chat-msg',
    data: { url: data.url || 'admin/chat.html' }
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || 'admin/chat.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf('admin') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
