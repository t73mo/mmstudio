import {setupPresence, watchPresence, sendMessage, watchMessages, getAdminId, ADMIN_NAMES} from "./firebase-config.js";

let chatOpen = false;
let presenceData = {};

function buildChatUI() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  const onlineDot = document.createElement('div');
  onlineDot.id = 'online-status';
  onlineDot.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:auto;font-size:0.82rem;color:var(--muted);';
  header.appendChild(onlineDot);

  const chatPanel = document.createElement('div');
  chatPanel.id = 'chat-panel';
  chatPanel.innerHTML = `
    <div class="chat-header">
      <span class="chat-title">Чат</span>
      <button class="chat-close" onclick="toggleChat()">&#10005;</button>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-input-row">
      <input type="text" id="chat-input" placeholder="Сообщение..." maxlength="500" autocomplete="off"/>
      <button class="chat-send" id="chat-send-btn">&#10148;</button>
    </div>
  `;
  document.body.appendChild(chatPanel);

  const chatBtn = document.createElement('button');
  chatBtn.id = 'chat-toggle-btn';
  chatBtn.innerHTML = '&#9993;';
  chatBtn.title = 'Открыть чат';
  chatBtn.onclick = () => toggleChat();
  header.appendChild(chatBtn);

  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const inp = document.getElementById('chat-input');
      if (inp.value.trim()) {
        sendMessage(inp.value);
        inp.value = '';
      }
    }
  });
  document.getElementById('chat-send-btn').addEventListener('click', () => {
    const inp = document.getElementById('chat-input');
    if (inp.value.trim()) {
      sendMessage(inp.value);
      inp.value = '';
    }
  });
}

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chat-panel');
  if (panel) panel.classList.toggle('open', chatOpen);
  if (chatOpen) {
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

function updateOnlineStatus() {
  const el = document.getElementById('online-status');
  if (!el) return;
  const myId = getAdminId();
  const otherId = myId === 'telman' ? 'anastasia' : 'telman';
  const other = presenceData[otherId];
  const isOnline = other && other.online;
  el.innerHTML = isOnline
    ? `<span class="online-dot"></span>${ADMIN_NAMES[otherId]} в сети`
    : `<span class="offline-dot"></span>${ADMIN_NAMES[otherId]} не в сети`;
}

function renderMessages(msgs) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const myId = getAdminId();
  container.innerHTML = msgs.map(m => {
    const isMe = m.user === myId;
    return `<div class="chat-msg ${isMe ? 'chat-me' : 'chat-other'}">
      <div class="chat-msg-name">${m.name}</div>
      <div class="chat-msg-text">${escapeHtml(m.text)}</div>
      <div class="chat-msg-time">${formatTime(m.time)}</div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
}

function initChat() {
  buildChatUI();
  setupPresence();
  watchPresence((data) => {
    presenceData = data;
    updateOnlineStatus();
  });
  watchMessages(renderMessages);
}

if (getAdminId()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
}
