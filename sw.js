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
  var title = payload.notification.title || 'MM Studio';
  var options = {
    body: payload.notification.body || '',
    icon: '/mmstudio/assets/favicon.svg',
    badge: '/mmstudio/assets/favicon.svg',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data.url || '/mmstudio/admin/chat.html';
  event.waitUntil(clients.matchAll({type: 'window'}).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url.indexOf('mmstudio') !== -1 && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
