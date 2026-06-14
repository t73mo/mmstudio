import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getDatabase, ref, onValue, set, push, onDisconnect, serverTimestamp, update} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const CFG = {
  apiKey: "AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",
  authDomain: "mmstudio-86917.firebaseapp.com",
  databaseURL: "https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mmstudio-86917",
  storageBucket: "mmstudio-86917.firebasestorage.app",
  messagingSenderId: "466384625481",
  appId: "1:466384625481:web:fb4bb7144d0d329be8c498"
};

let app, db;
try {
  app = initializeApp(CFG);
  db = getDatabase(app);
} catch(e) {
  console.warn("Firebase init failed:", e.message);
}

const ADMIN_NAMES = {telman:"Тельман", anastasia:"Анастасия"};
const ADMIN_KEYS = {telman:"Telman", anastasia:"Anastasia"};

function getAdminId() {
  const u = localStorage.getItem("mm_user");
  if (!u) return null;
  return u.toLowerCase();
}

function setupPresence() {
  const id = getAdminId();
  if (!id || !db) return;
  const presenceRef = ref(db, "presence/" + id);
  const connectedRef = ref(db, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      set(presenceRef, {online: true, lastSeen: Date.now()});
      onDisconnect(presenceRef).set({online: false, lastSeen: Date.now()});
    }
  });
}

function watchPresence(callback) {
  if (!db) return;
  const presRef = ref(db, "presence");
  onValue(presRef, (snap) => {
    const data = snap.val() || {};
    callback(data);
  });
}

function sendMessage(text) {
  const id = getAdminId();
  if (!id || !db || !text.trim()) return;
  const msgs = ref(db, "messages");
  push(msgs, {
    user: id,
    name: ADMIN_NAMES[id] || id,
    text: text.trim(),
    time: Date.now()
  });
}

function watchMessages(callback) {
  if (!db) return;
  const msgs = ref(db, "messages");
  onValue(msgs, (snap) => {
    const data = snap.val() || {};
    const arr = Object.values(data).sort((a, b) => a.time - b.time);
    callback(arr);
  });
}

function clearOldMessages() {
  if (!db) return;
  const msgs = ref(db, "messages");
  onValue(msgs, (snap) => {
    const data = snap.val() || {};
    const keys = Object.keys(data);
    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    keys.forEach(k => {
      if (data[k].time && now - data[k].time > WEEK) {
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js").then(m => {
          m.remove(ref(db, "messages/" + k));
        });
      }
    });
  }, {onlyOnce: true});
}

export {setupPresence, watchPresence, sendMessage, watchMessages, clearOldMessages, getAdminId, ADMIN_NAMES, ADMIN_KEYS};
