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

  var NAMES = {telman:"Тельман", anastasia:"Анастасия"};
  var db = null;
  var chatOpen = false;
  var presenceData = {};

  function getAdminId() {
    var u = localStorage.getItem("admin_user");
    return u ? u.toLowerCase() : null;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmtTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
  }

  function init() {
    var id = getAdminId();
    if (!id) return;

    if (typeof firebase === 'undefined') {
      setTimeout(init, 500);
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(CFG);
      }
      db = firebase.database();
    } catch(e) {
      return;
    }

    buildUI();

    db.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === true) {
        db.ref('presence/' + id).set({online: true, ts: Date.now()});
        db.ref('presence/' + id).onDisconnect().set({online: false, ts: Date.now()});
      }
    });

    db.ref('presence').on('value', function(snap) {
      presenceData = snap.val() || {};
      var el = document.getElementById('online-status');
      if (!el) return;
      var other = id === 'telman' ? 'anastasia' : 'telman';
      var info = presenceData[other];
      if (info && info.online) {
        el.innerHTML = '<span class="online-dot"></span>' + NAMES[other] + ' в сети';
      } else {
        el.innerHTML = '<span class="offline-dot"></span>' + NAMES[other] + ' не в сети';
      }
    });

    db.ref('messages').orderByChild('time').on('value', function(snap) {
      var box = document.getElementById('chat-messages');
      if (!box) return;
      var msgs = [];
      snap.forEach(function(ch) { msgs.push(ch.val()); });
      box.innerHTML = msgs.map(function(m) {
        var mine = m.user === id;
        return '<div class="chat-msg ' + (mine ? 'chat-me' : 'chat-other') + '">' +
          '<div class="chat-msg-name">' + esc(m.name) + '</div>' +
          '<div class="chat-msg-text">' + esc(m.text) + '</div>' +
          '<div class="chat-msg-time">' + fmtTime(m.time) + '</div></div>';
      }).join('');
      box.scrollTop = box.scrollHeight;
    });
  }

  function buildUI() {
    if (document.getElementById('online-status')) return;

    var header = document.querySelector('.main-header');
    if (!header) return;

    var dot = document.createElement('div');
    dot.id = 'online-status';
    dot.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--muted);';
    header.appendChild(dot);

    var btn = document.createElement('button');
    btn.id = 'chat-toggle-btn';
    btn.innerHTML = '&#9993;';
    btn.title = 'Чат';
    btn.onclick = function() { toggleChat(); };
    header.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.innerHTML =
      '<div class="chat-header"><span class="chat-title">Чат</span>' +
      '<button class="chat-close" onclick="MMChat.toggleChat()">&#10005;</button></div>' +
      '<div class="chat-messages" id="chat-messages"></div>' +
      '<div class="chat-input-row">' +
      '<input type="text" id="chat-input" placeholder="Сообщение..." maxlength="500" autocomplete="off"/>' +
      '<button class="chat-send" id="chat-send-btn">&#10148;</button></div>';
    document.body.appendChild(panel);

    document.getElementById('chat-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        sendMsg(this.value); this.value = '';
      }
    });
    document.getElementById('chat-send-btn').addEventListener('click', function() {
      var inp = document.getElementById('chat-input');
      if (inp.value.trim()) { sendMsg(inp.value); inp.value = ''; }
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    var p = document.getElementById('chat-panel');
    if (p) p.classList.toggle('open', chatOpen);
  }

  function sendMsg(text) {
    var id = getAdminId();
    if (!id || !db) return;
    db.ref('messages').push({user: id, name: NAMES[id] || id, text: text.trim(), time: Date.now()});
  }

  return { init: init, toggleChat: toggleChat };
})();

document.addEventListener('DOMContentLoaded', MMChat.init);
if (document.readyState !== 'loading') MMChat.init();
