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
  var unreadCount = 0;
  var lastSeenTime = 0;
  var editingMsgId = null;

  function getAdminId() {
    var u = localStorage.getItem("admin_user");
    return u ? u.toLowerCase() : null;
  }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtTime(ts) { return ts ? new Date(ts).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) : ''; }

  function init() {
    var id = getAdminId();
    if (!id) return;
    if (typeof firebase === 'undefined') { setTimeout(init, 500); return; }
    try {
      if (!firebase.apps.length) firebase.initializeApp(CFG);
      db = firebase.database();
    } catch(e) { return; }
    buildUI();
    setupPresence(id);
    watchMessages(id);
  }

  function setupPresence(id) {
    db.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === true) {
        db.ref('presence/' + id).set({online:true, ts:Date.now()});
        db.ref('presence/' + id).onDisconnect().set({online:false, ts:Date.now()});
      }
    });
    var otherId = id === 'telman' ? 'anastasia' : 'telman';
    db.ref('presence/' + otherId).on('value', function(snap) {
      var v = snap.val();
      var dot = document.getElementById('online-dot');
      if (dot) dot.className = (v && v.online) ? 'online-dot' : 'offline-dot';
    });
  }

  function watchMessages(myId) {
    db.ref('messages').orderByChild('time').on('value', function(snap) {
      var box = document.getElementById('chatMessages');
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
          if (m.read) checkHtml = '<span class="msg-check msg-read">&#10003;&#10003;</span>';
          else checkHtml = '<span class="msg-check">&#10003;</span>';
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
      if (!chatOpen) {
        var last = msgs[msgs.length - 1];
        if (last.user !== myId && (!lastSeenTime || last.time > lastSeenTime)) {
          unreadCount++;
          updateBadge();
        }
      }
      if (msgs.length) lastSeenTime = msgs[msgs.length - 1].time;
      if (chatOpen) markRead();
    });
  }

  function markRead() {
    var myId = getAdminId();
    if (!myId || !db) return;
    db.ref('messages').orderByChild('time').once('value', function(snap) {
      var updates = {};
      snap.forEach(function(ch) {
        var m = ch.val();
        if (m.user !== myId && !m.read) {
          updates[ch.key + '/read'] = true;
        }
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
    var sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar || document.getElementById('chatSection')) return;

    var chatSection = document.createElement('div');
    chatSection.id = 'chatSection';
    chatSection.className = 'chat-sidebar-section';
    chatSection.innerHTML =
      '<div class="chat-sidebar-header">' +
        '<span class="nav-section-title" style="padding-left:14px">Чат</span>' +
        '<div id="online-dot" class="offline-dot" style="margin-right:14px"></div>' +
      '</div>' +
      '<div class="chat-sidebar-messages" id="chatMessages"></div>' +
      '<div class="chat-sidebar-input">' +
        '<input type="text" id="chatInput" placeholder="Сообщение..." maxlength="1000" autocomplete="off"/>' +
        '<button class="chat-sidebar-send" id="chatSendBtn">&#10148;</button>' +
      '</div>';
    sidebar.appendChild(chatSection);

    var inp = document.getElementById('chatInput');
    var btn = document.getElementById('chatSendBtn');
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    });
    btn.addEventListener('click', sendMsg);

    var badge = document.createElement('span');
    badge.id = 'chatBadge';
    badge.className = 'notif-badge';
    var chatNavItem = document.querySelector('a[href="chat.html"]');
    if (chatNavItem) chatNavItem.style.position = 'relative';
    if (chatNavItem) chatNavItem.appendChild(badge);

    document.addEventListener('click', function(e) {
      var msg = e.target.closest('.chat-msg');
      if (!msg) return;
      var myId = getAdminId();
      var userId = msg.getAttribute('data-user');
      var msgId = msg.getAttribute('data-msg-id');
      if (userId === myId && msgId) {
        if (confirm('Редактировать сообщение?')) editMsg(msgId);
      }
    });

    document.addEventListener('dblclick', function(e) {
      var msgBody = e.target.closest('.chat-msg-body');
      if (!msgBody) return;
      var msg = msgBody.closest('.chat-msg');
      var myId = getAdminId();
      var userId = msg.getAttribute('data-user');
      var msgId = msg.getAttribute('data-msg-id');
      if (userId === myId && msgId) editMsg(msgId);
    });
  }

  function sendMsg() {
    var id = getAdminId();
    if (!id || !db) return;
    var inp = document.getElementById('chatInput');
    var text = inp.value.trim();
    if (!text) return;
    if (editingMsgId) {
      db.ref('messages/' + editingMsgId).update({text: text, edited: true});
      editingMsgId = null;
      document.getElementById('chatInput').placeholder = 'Сообщение...';
    } else {
      db.ref('messages').push({user:id, name:NAMES[id]||id, text:text, time:Date.now(), read:false});
    }
    inp.value = '';
  }

  function editMsg(msgId) {
    db.ref('messages/' + msgId).once('value', function(snap) {
      var m = snap.val();
      if (!m) return;
      editingMsgId = msgId;
      var inp = document.getElementById('chatInput');
      inp.value = m.text || '';
      inp.placeholder = 'Редактировать...';
      inp.focus();
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    unreadCount = 0;
    updateBadge();
    if (chatOpen) markRead();
  }

  return { init: init, toggleChat: toggleChat };
})();

document.addEventListener('DOMContentLoaded', MMChat.init);
if (document.readyState !== 'loading') MMChat.init();
