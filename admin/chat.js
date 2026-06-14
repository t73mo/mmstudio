var MMChat = (function() {
  var CFG = {
    apiKey: "AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",
    authDomain: "mmstudio-86917.firebaseapp.com",
    databaseURL: "https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mmstudio-86917",
    storageBucket: "mmstudio-86917.firebasestorage.app",
    messagingSenderId: "466384625481",
    appId: "1:466384625481:web:fb4bb7144d0d329be8c498"
  };

  var ADMIN_NAMES = {telman:"Тельман", anastasia:"Анастасия"};
  var db = null;
  var chatOpen = false;
  var presenceData = {};

  function getAdminId() {
    var u = localStorage.getItem("admin_user");
    if (!u) return null;
    return u.toLowerCase();
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
  }

  function init() {
    if (!getAdminId()) return;
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded');
      return;
    }
    try {
      var app = firebase.initializeApp(CFG);
      db = firebase.database();
    } catch(e) {
      console.warn('Firebase init failed:', e.message);
      return;
    }
    buildChatUI();
    setupPresence();
    watchPresence();
    watchMessages();
  }

  function buildChatUI() {
    var header = document.querySelector('.main-header');
    if (!header) return;

    var onlineDot = document.createElement('div');
    onlineDot.id = 'online-status';
    onlineDot.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--muted);';
    header.appendChild(onlineDot);

    var chatBtn = document.createElement('button');
    chatBtn.id = 'chat-toggle-btn';
    chatBtn.innerHTML = '&#9993;';
    chatBtn.title = 'Открыть чат';
    chatBtn.onclick = function() { toggleChat(); };
    header.appendChild(chatBtn);

    var chatPanel = document.createElement('div');
    chatPanel.id = 'chat-panel';
    chatPanel.innerHTML =
      '<div class="chat-header">' +
        '<span class="chat-title">Чат</span>' +
        '<button class="chat-close" onclick="MMChat.toggleChat()">&#10005;</button>' +
      '</div>' +
      '<div class="chat-messages" id="chat-messages"></div>' +
      '<div class="chat-input-row">' +
        '<input type="text" id="chat-input" placeholder="Сообщение..." maxlength="500" autocomplete="off"/>' +
        '<button class="chat-send" id="chat-send-btn">&#10148;</button>' +
      '</div>';
    document.body.appendChild(chatPanel);

    document.getElementById('chat-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var inp = document.getElementById('chat-input');
        if (inp.value.trim()) {
          sendMsg(inp.value);
          inp.value = '';
        }
      }
    });
    document.getElementById('chat-send-btn').addEventListener('click', function() {
      var inp = document.getElementById('chat-input');
      if (inp.value.trim()) {
        sendMsg(inp.value);
        inp.value = '';
      }
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    var panel = document.getElementById('chat-panel');
    if (panel) panel.classList.toggle('open', chatOpen);
    if (chatOpen) {
      var msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }
  }

  function setupPresence() {
    var id = getAdminId();
    if (!id || !db) return;
    var presRef = db.ref('presence/' + id);
    var connectedRef = db.ref('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        presRef.set({online: true, lastSeen: Date.now()});
        presRef.onDisconnect().set({online: false, lastSeen: Date.now()});
      }
    });
  }

  function watchPresence() {
    if (!db) return;
    db.ref('presence').on('value', function(snap) {
      presenceData = snap.val() || {};
      updateOnlineStatus();
    });
  }

  function updateOnlineStatus() {
    var el = document.getElementById('online-status');
    if (!el) return;
    var myId = getAdminId();
    var otherId = myId === 'telman' ? 'anastasia' : 'telman';
    var other = presenceData[otherId];
    var isOnline = other && other.online;
    el.innerHTML = isOnline
      ? '<span class="online-dot"></span>' + ADMIN_NAMES[otherId] + ' в сети'
      : '<span class="offline-dot"></span>' + ADMIN_NAMES[otherId] + ' не в сети';
  }

  function sendMsg(text) {
    var id = getAdminId();
    if (!id || !db || !text.trim()) return;
    db.ref('messages').push({
      user: id,
      name: ADMIN_NAMES[id] || id,
      text: text.trim(),
      time: Date.now()
    });
  }

  function watchMessages() {
    if (!db) return;
    db.ref('messages').orderByChild('time').on('value', function(snap) {
      var container = document.getElementById('chat-messages');
      if (!container) return;
      var myId = getAdminId();
      var msgs = [];
      snap.forEach(function(child) { msgs.push(child.val()); });
      container.innerHTML = msgs.map(function(m) {
        var isMe = m.user === myId;
        return '<div class="chat-msg ' + (isMe ? 'chat-me' : 'chat-other') + '">' +
          '<div class="chat-msg-name">' + escapeHtml(m.name || '') + '</div>' +
          '<div class="chat-msg-text">' + escapeHtml(m.text || '') + '</div>' +
          '<div class="chat-msg-time">' + formatTime(m.time) + '</div>' +
        '</div>';
      }).join('');
      container.scrollTop = container.scrollHeight;
    });
  }

  return {
    init: init,
    toggleChat: toggleChat
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MMChat.init);
} else {
  MMChat.init();
}
