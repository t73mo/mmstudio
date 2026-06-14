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
  var unreadCount = 0;
  var lastSeenTime = parseInt(localStorage.getItem('chat_lastSeen') || '0');
  var watchInited = false;
  var myId = null;

  function getAdminId() {
    var u = localStorage.getItem("admin_user");
    return u ? u.toLowerCase() : null;
  }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtTime(ts) { return ts ? new Date(ts).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) : ''; }

  function getPartnerName() {
    var id = getAdminId();
    var other = id === 'telman' ? 'anastasia' : 'telman';
    return NAMES[other] || other;
  }

  function init() {
    myId = getAdminId();
    if (!myId) return;
    if (typeof firebase === 'undefined') { setTimeout(init, 500); return; }
    try {
      if (!firebase.apps.length) firebase.initializeApp(CFG);
      db = firebase.database();
    } catch(e) { return; }
    buildUI();
    setupPresence();
    watchMessages();
  }

  function setupPresence() {
    db.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === true) {
        db.ref('presence/' + myId).set({online:true, ts:Date.now()});
        db.ref('presence/' + myId).onDisconnect().set({online:false, ts:Date.now()});
      }
    });
    var otherId = myId === 'telman' ? 'anastasia' : 'telman';
    db.ref('presence/' + otherId).on('value', function(snap) {
      var v = snap.val();
      var dot = document.getElementById('chat-online-dot');
      if (dot) dot.className = 'chat-online-dot ' + (v && v.online ? 'online' : 'offline');
    });
  }

  function watchMessages() {
    db.ref('messages').orderByChild('time').on('value', function(snap) {
      var box = document.getElementById('chat-popup-messages');
      if (!box) return;
      var msgs = [];
      snap.forEach(function(ch) { msgs.push(Object.assign({id:ch.key}, ch.val())); });
      if (!msgs.length) {
        box.innerHTML = '<div class="chat-empty-msg">Нет сообщений</div>';
        return;
      }
      var html = '';
      var lastDate = '';
      for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        var d = new Date(m.time);
        var dateStr = d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
        if (dateStr !== lastDate) {
          html += '<div class="chat-date-sep">' + dateStr + '</div>';
          lastDate = dateStr;
        }
        var isMe = m.user === myId;
        var cls = isMe ? 'chat-msg chat-me' : 'chat-msg chat-other';
        var editedTag = m.edited ? ' <span class="msg-edited">(ред.)</span>' : '';
        var checkHtml = '';
        if (isMe) {
          checkHtml = m.read ? '<span class="msg-check msg-read">&#10003;&#10003;</span>' : '<span class="msg-check">&#10003;</span>';
        }
        var imgHtml = '';
        if (m.image) imgHtml = '<img class="chat-msg-img" src="' + esc(m.image) + '" loading="lazy" onclick="window.open(this.src)">';
        html += '<div class="' + cls + '" data-msg-id="' + m.id + '" data-user="' + m.user + '">';
        if (!isMe) html += '<div class="chat-msg-name">' + esc(m.name) + '</div>';
        if (imgHtml) html += imgHtml;
        html += '<div class="chat-msg-body">';
        if (m.text) html += '<div class="chat-msg-text">' + esc(m.text) + editedTag + '</div>';
        html += '<div class="chat-msg-footer"><span class="chat-msg-time">' + fmtTime(m.time) + '</span>' + checkHtml + '</div>';
        html += '</div></div>';
      }
      box.innerHTML = html;
      box.scrollTop = box.scrollHeight;

      var lastTime = msgs[msgs.length - 1].time;
      if (!watchInited) {
        lastSeenTime = lastTime;
        localStorage.setItem('chat_lastSeen', lastSeenTime);
        watchInited = true;
        markRead();
      } else if (lastTime > lastSeenTime) {
        if (!chatOpen) {
          var last = msgs[msgs.length - 1];
          if (last && last.user !== myId) {
            unreadCount++;
            updateBadge();
          }
        }
        lastSeenTime = lastTime;
        localStorage.setItem('chat_lastSeen', lastSeenTime);
        markRead();
      }
    });
  }

  function markRead() {
    if (!myId || !db) return;
    db.ref('messages').once('value', function(snap) {
      var updates = {};
      snap.forEach(function(ch) {
        var m = ch.val();
        if (m.user !== myId && !m.read) updates[ch.key + '/read'] = true;
      });
      if (Object.keys(updates).length) db.ref('messages').update(updates);
    });
  }

  function updateBadge() {
    var badge = document.getElementById('chatBadge');
    if (badge) {
      if (unreadCount > 0) { badge.textContent = unreadCount; badge.classList.add('show'); }
      else { badge.textContent = ''; badge.classList.remove('show'); }
    }
    if (unreadCount > 0) document.title = '(' + unreadCount + ') ' + document.title.replace(/^\(\d+\)\s*/, '');
    else document.title = document.title.replace(/^\(\d+\)\s*/, '');
  }

  function buildUI() {
    if (document.getElementById('chat-popup')) return;

    var header = document.querySelector('.main-header');
    if (!header) return;

    var btn = document.createElement('button');
    btn.id = 'chat-toggle-btn';
    btn.innerHTML = '&#9993;<span class="notif-badge" id="chatBadge"></span>';
    btn.title = 'Чат';
    btn.onclick = function() { toggleChat(); };
    header.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'chat-popup';
    panel.innerHTML =
      '<div class="chat-popup-header">' +
        '<div class="chat-popup-title"><span id="chat-online-dot" class="chat-online-dot offline"></span><span>' + esc(getPartnerName()) + '</span></div>' +
        '<button class="chat-popup-close" onclick="MMChat.toggleChat()">&#10005;</button>' +
      '</div>' +
      '<div class="chat-popup-messages" id="chat-popup-messages"></div>' +
      '<div class="chat-popup-input">' +
        '<input type="text" id="chatPopupInput" placeholder="Сообщение..." maxlength="1000" autocomplete="off"/>' +
        '<button class="chat-popup-send" id="chatPopupSend">&#10148;</button>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById('chatPopupInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        sendMsg(this.value); this.value = '';
      }
    });
    document.getElementById('chatPopupSend').addEventListener('click', function() {
      var inp = document.getElementById('chatPopupInput');
      if (inp.value.trim()) { sendMsg(inp.value); inp.value = ''; }
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    var p = document.getElementById('chat-popup');
    if (p) p.classList.toggle('open', chatOpen);
    if (chatOpen) {
      unreadCount = 0;
      updateBadge();
      markRead();
      document.getElementById('chatPopupInput').focus();
    }
  }

  function sendMsg(text) {
    if (!myId || !db || !text.trim()) return;
    db.ref('messages').push({user:myId, name:NAMES[myId]||myId, text:text.trim(), time:Date.now(), read:false});
  }

  return { init: init, toggleChat: toggleChat };
})();

document.addEventListener('DOMContentLoaded', MMChat.init);
if (document.readyState !== 'loading') MMChat.init();
