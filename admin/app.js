
var USERS={"Telman":"Kn0pKa78","Anastasia":"mm2026"};
var USERS_FB=null;
var EDIT={section:null,origIdx:-1};

function login(){
  var u=document.getElementById("usernameInput").value;
  var p=document.getElementById("passwordInput").value;
  if(USERS[u]&&USERS[u]===p){
    doLoginLocal(u);
  }else{
    try{if(!firebase.apps.length)firebase.initializeApp({apiKey:"AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",authDomain:"mmstudio-86917.firebaseapp.com",databaseURL:"https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",projectId:"mmstudio-86917",storageBucket:"mmstudio-86917.firebasestorage.app",messagingSenderId:"466384625481",appId:"1:466384625481:web:fb4bb7144d0d329be8c498"});}catch(e){}
    firebase.database().ref("settings/"+u.toLowerCase()+"/password").once("value",function(snap){
      if(snap.val()===p)doLoginLocal(u);
      else document.getElementById("loginError").style.display="block";
    });
  }
}
function doLoginLocal(u){
  document.getElementById("loginScreen").style.display="none";
  document.getElementById("adminPanel").style.display="flex";
  localStorage.setItem("admin_auth","1");localStorage.setItem("admin_user",u);
  showUser();
}
function logout(){localStorage.removeItem("admin_auth");localStorage.removeItem("admin_user");window.location.href="index.html";}
function showUser(){var u=localStorage.getItem("admin_user");document.querySelectorAll(".user-name").forEach(function(e){if(u)e.textContent=u;});}
function toggleAcc(el){el.parentElement.classList.toggle("open");}
function toggleItem(el){el.parentElement.classList.toggle("open");}
function copyText(el){
  var t=el.textContent||el.innerText;
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast(t.substring(0,30));});
  else{var r=document.createRange();r.selectNode(el);window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");toast(t.substring(0,30));}
}
function toast(t){var d=document.getElementById("toast");d.textContent="\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e: "+t;d.style.opacity="1";setTimeout(function(){d.style.opacity="0";},1500);}
function expandAll(){document.querySelectorAll(".acc-group").forEach(function(g){g.classList.add("open");});}
function collapseAll(){document.querySelectorAll(".acc-group, .acc-item").forEach(function(e){e.classList.remove("open");});}
function toggleNavGroup(el){el.classList.toggle("open");}
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open");var o=document.getElementById("sidebarOverlay");if(o)o.classList.toggle("open");}
function closeSidebar(){document.getElementById("sidebar").classList.remove("open");var o=document.getElementById("sidebarOverlay");if(o)o.classList.remove("open");}
function goBack(){if(window.history.length>1){window.history.back();}else{window.location.href="index.html";}}
function toggleTheme(){document.documentElement.classList.toggle("dark");var isDark=document.documentElement.classList.contains("dark");localStorage.setItem("mm_theme",isDark?"dark":"light");updateThemeIcon();}
function updateThemeIcon(){var isDark=document.documentElement.classList.contains("dark");var ic=document.getElementById("themeIcon");var lb=document.getElementById("themeLabel");if(ic)ic.textContent=isDark?"light_mode":"dark_mode";if(lb)lb.textContent=isDark?"Светлая тема":"Тёмная тема";}
function applyTheme(){var t=localStorage.getItem("mm_theme");if(t==="dark"){document.documentElement.classList.add("dark");}else if(!t){autoTheme();}updateThemeIcon();}
function autoTheme(){if(window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}updateThemeIcon();}
if(window.matchMedia){window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change",function(){if(!localStorage.getItem("mm_theme"))autoTheme();});}
function escHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

function getUrlParam(name){
  var m=window.location.search.match(new RegExp("[?&]"+name+"=([^&]*)"));
  return m?decodeURIComponent(m[1]):null;
}
function getStorageKey(section,type){return "mm_"+type+"_"+section;}

function getMergedRows(sectionId){
  var sec=APP_DATA[sectionId];if(!sec)return[];
  var original=sec.rows;
  var rows=[];
  for(var i=0;i<original.length;i++)rows.push({origIdx:i,row:original[i].slice(),isNew:false});
  var edits=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"edit"))||"{}");
  for(var k in edits){var ki=parseInt(k);if(!isNaN(ki)&&ki>=0&&ki<rows.length)rows[ki].row=edits[k];}
  var dels=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"del"))||"[]");
  rows=rows.filter(function(r){return dels.indexOf(r.origIdx)===-1;});
  var news=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"new"))||"[]");
  var delNews=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"del_new"))||"[]");
  for(var ni=0;ni<news.length;ni++){
    if(delNews.indexOf(ni)===-1)rows.push({origIdx:-1-ni,row:news[ni].slice(),isNew:true});
  }
  return rows;
}

function openEditModal(sectionId,origIdx){
  EDIT.section=sectionId;EDIT.origIdx=origIdx;
  var sec=APP_DATA[sectionId];if(!sec)return;
  var rows=getMergedRows(sectionId);
  var hdrs=sec.headers;
  var vals=null;
  for(var i=0;i<rows.length;i++){if(rows[i].origIdx===origIdx){vals=rows[i].row;break;}}
  if(!vals)vals=[];

  var isNew=origIdx<0;
  var html="<h3>"+(isNew?"\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c":"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c")+"</h3>";
  var maxLen=Math.max(hdrs.length,vals.length,1);
  for(var i=0;i<maxLen;i++){
    var label=hdrs[i]&&hdrs[i].trim()?"\u041f\u043e\u043b\u0435 "+(i+1)+": "+escHtml(hdrs[i]):"\u041f\u043e\u043b\u0435 "+(i+1);
    var val=i<vals.length?escHtml(vals[i]):"";
    html+='<div class="modal-field"><label>'+label+'</label><textarea data-idx="'+i+'">'+val+'</textarea></div>';
  }
  html+='<div class="modal-actions">';
  if(!isNew)html+='<button class="modal-delete" onclick="deleteOrigItem(EDIT.section,EDIT.origIdx)">\u0423\u0434\u0430\u043b\u0438\u0442\u044c</button>';
  html+='<button class="modal-cancel" onclick="closeEditModal()">\u041e\u0442\u043c\u0435\u043d\u0430</button>';
  html+='<button class="modal-save" onclick="saveEditModal()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>';
  document.getElementById("modalBody").innerHTML=html;
  document.getElementById("editModal").style.display="flex";
}
function closeEditModal(){document.getElementById("editModal").style.display="none";EDIT.section=null;EDIT.origIdx=-1;}
function saveEditModal(){
  var fields=document.querySelectorAll("#modalBody textarea");
  var vals=[];for(var i=0;i<fields.length;i++)vals.push(fields[i].value);
  var sid=EDIT.section,idx=EDIT.origIdx;
  if(idx>=0){
    var edits=JSON.parse(localStorage.getItem(getStorageKey(sid,"edit"))||"{}");
    edits[idx]=vals;localStorage.setItem(getStorageKey(sid,"edit"),JSON.stringify(edits));
  }else{
    var news=JSON.parse(localStorage.getItem(getStorageKey(sid,"new"))||"[]");
    news.push(vals);localStorage.setItem(getStorageKey(sid,"new"),JSON.stringify(news));
  }
  closeEditModal();renderAccordion(sid);
}
function addNewItem(sectionId){openEditModal(sectionId,-1);}
function deleteOrigItem(sectionId,origIdx){
  if(!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c?"))return;
  if(origIdx>=0){
    var dels=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"del"))||"[]");
    if(dels.indexOf(origIdx)===-1){dels.push(origIdx);localStorage.setItem(getStorageKey(sectionId,"del"),JSON.stringify(dels));}
  }else{
    var delNews=JSON.parse(localStorage.getItem(getStorageKey(sectionId,"del_new"))||"[]");
    var newIdx=(-origIdx)-1;
    if(delNews.indexOf(newIdx)===-1){delNews.push(newIdx);localStorage.setItem(getStorageKey(sectionId,"del_new"),JSON.stringify(delNews));}
  }
  closeEditModal();renderAccordion(sectionId);
}

function renderAccordion(sectionId){
  var sec=APP_DATA[sectionId];
  var container=document.getElementById("accordionContainer");
  if(!sec||!container)return;
  var hdrs=sec.headers,rows=getMergedRows(sectionId);
  var groups={},cur="";
  for(var i=0;i<rows.length;i++){
    var r=rows[i];
    var k=(r.row[0]&&r.row[0].trim())?r.row[0]:cur;
    if(r.row[0]&&r.row[0].trim())cur=k;
    if(!groups[k])groups[k]=[];groups[k].push(r);
  }
  var openIdx=parseInt(getUrlParam("open"));
  var html="";
  for(var gn in groups){
    var its=groups[gn];
    var groupOpen=openIdx>=0&&its.some(function(it){return it.origIdx===openIdx;});
    html+='<div class="acc-group'+(groupOpen?" open":"")+'"><div class="acc-group-header" onclick="toggleAcc(this)"><span class="acc-arrow">\u25b6</span><span class="acc-group-title">'+(gn?escHtml(gn):"")+'</span><span class="acc-group-count">'+its.length+'</span></div><div class="acc-group-body">';
    for(var j=0;j<its.length;j++){
      var it=its[j];
      var title="";for(var t=0;t<it.row.length;t++){if(it.row[t]&&it.row[t].trim()){title=it.row[t];break;}}
      if(!title)title="\u0417\u0430\u043f\u0438\u0441\u044c "+(it.origIdx+1);
      var itemOpen=openIdx===it.origIdx;
      html+='<div class="acc-item'+(itemOpen?" open":"")+'" data-orig="'+it.origIdx+'"><div class="acc-item-header" onclick="toggleItem(this)"><span class="acc-item-title">'+escHtml(title.substring(0,80))+'</span><span class="acc-item-actions"><button class="btn-icon" onclick="event.stopPropagation();openEditModal(\u0027'+sectionId+'\u0027,'+it.origIdx+')" title="\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c">\u270f</button><button class="btn-icon btn-del" onclick="event.stopPropagation();deleteOrigItem(\u0027'+sectionId+'\u0027,'+it.origIdx+')" title="\u0423\u0434\u0430\u043b\u0438\u0442\u044c">\u2715</button></span><span class="acc-item-arrow">\u25be</span></div><div class="acc-item-body"><div class="acc-item-details">';
      for(var k2=0;k2<it.row.length;k2++){
        var cv=it.row[k2];if(cv==null||cv==="")continue;
        if(k2<hdrs.length&&hdrs[k2])html+='<div class="detail-row"><span class="detail-label">'+escHtml(hdrs[k2])+'</span><span class="detail-value" onclick="copyText(this)">'+escHtml(cv)+'</span></div>';
        else html+='<div class="detail-row"><span class="detail-value" onclick="copyText(this)">'+escHtml(cv)+'</span></div>';
      }
      html+='</div></div></div>';
    }
    html+='</div></div>';
  }
  container.innerHTML=html||'<p class="empty-state">\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445</p>';
  if(openIdx>=0){var el=container.querySelector(".acc-item.open");if(el)setTimeout(function(){el.scrollIntoView({behavior:"smooth",block:"center"});},100);}
}

function doSearch(q){
  var r=document.getElementById("searchResults");
  if(!q||q.length<2){if(r)r.style.display="none";return;}
  var lower=q.toLowerCase(),found=[];
  for(var sid in APP_DATA){
    var sec=APP_DATA[sid];var rows=sec.rows;
    for(var i=0;i<rows.length;i++){
      if(found.length>=30)break;
      var text="";for(var j=0;j<rows[i].length;j++)text+=rows[i][j]+" ";
      text=text.toLowerCase();
      var title2="";for(var j=0;j<rows[i].length;j++)if(rows[i][j]){title2=rows[i][j];break;}
      if(text.indexOf(lower)!==-1)found.push({href:sid+".html?open="+i,tab:sec.label,title:title2});
    }
  }
  if(!r)return;
  if(found.length===0){r.innerHTML='<div class="search-result"><span class="sr-text">\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e</span></div>';r.style.display="block";return;}
  var html="";
  for(var j=0;j<found.length;j++){
    var f=found[j];var qe=q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    var t=f.title.replace(new RegExp("("+qe+")","gi"),"<mark>$1</mark>");
    html+='<a class="search-result" href="'+f.href+'"><span class="sr-tab">'+escHtml(f.tab)+'</span><span class="sr-text">'+t+'</span></a>';
  }
  r.innerHTML=html;r.style.display="block";
}

document.addEventListener("click",function(e){
  var sr=document.getElementById("searchResults");var si=document.getElementById("searchInput");
  if(sr&&si&&!sr.contains(e.target)&&e.target!==si&&!si.contains(e.target))sr.style.display="none";
});

/* === POPUP MESSENGER === */
var POPUP_CFG={apiKey:"AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",authDomain:"mmstudio-86917.firebaseapp.com",databaseURL:"https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",projectId:"mmstudio-86917",storageBucket:"mmstudio-86917.firebasestorage.app",messagingSenderId:"466384625481",appId:"1:466384625481:web:fb4bb7144d0d329be8c498"};
var POPUP_NAMES={telman:"Тельман",anastasia:"Анастасия"};
var popupDb=null,popupMyId=null,popupMyName="",popupActiveContact=null;

function initPopupChat(){
  var u=(localStorage.getItem("admin_user")||"").toLowerCase();
  if(!u)return;
  popupMyId=u;popupMyName=POPUP_NAMES[u]||u;
  try{if(typeof firebase==="undefined")return;if(!firebase.apps.length)firebase.initializeApp(POPUP_CFG);popupDb=firebase.database();}catch(e){return;}
  popupDb.ref(".info/connected").on("value",function(snap){
    if(snap.val()===true){popupDb.ref("presence/"+popupMyId).set({online:true,ts:Date.now()});popupDb.ref("presence/"+popupMyId).onDisconnect().set({online:false,ts:Date.now()});}
  });
}

function togglePopupChat(){
  var popup=document.getElementById("msPopup");
  if(!popup)return;
  popup.classList.toggle("open");
  if(popup.classList.contains("open")){
    if(!popupDb)initPopupChat();
    var chatList=popup.querySelector(".ms-popup-chat-list");
    var chatWindow=popup.querySelector(".ms-popup-chat");
    if(chatList)chatList.style.display="";
    if(chatWindow)chatWindow.classList.remove("open");
    popupActiveContact=null;
    loadPopupContacts();
  }
}

function loadPopupContacts(){
  if(!popupDb||!popupMyId)return;
  var container=document.querySelector(".ms-popup-list");
  if(!container)return;
  var users=Object.keys(POPUP_NAMES).filter(function(u){return u!==popupMyId;});
  var html='';
  for(var i=0;i<users.length;i++){
    var uid=users[i];var name=POPUP_NAMES[uid];
    html+='<div class="ms-popup-contact" onclick="openPopupChatWith(\''+uid+'\')">';
    html+='<div class="ms-popup-contact-avatar">'+name.charAt(0)+'</div>';
    html+='<div><div class="ms-popup-contact-name">'+name+'</div>';
    html+='<div class="ms-popup-contact-last" id="p-last-'+uid+'">Загрузка...</div></div></div>';
  }
  container.innerHTML=html;
  for(var j=0;j<users.length;j++){
    (function(uid){
      popupDb.ref("messages").orderByChild("time").limitToLast(1).on("value",function(snap){
        var last=null;
        snap.forEach(function(ch){var m=ch.val();if(m.user===uid||m.user===popupMyId)last=m;});
        var el=document.getElementById("p-last-"+uid);
        if(el&&last)el.textContent=(last.user===popupMyId?"Вы: ":"")+((last.text||"Фото").substring(0,30));
      });
    })(users[j]);
  }
}

function openPopupChatWith(uid){
  popupActiveContact=uid;
  var name=POPUP_NAMES[uid]||uid;
  document.querySelector(".ms-popup-chat-list").style.display="none";
  var chat=document.querySelector(".ms-popup-chat");
  chat.classList.add("open");
  chat.querySelector(".name").textContent=name;
  chat.querySelector(".ms-popup-messages").innerHTML="";
  loadPopupMessages(uid);
}

function closePopupChat(){
  document.querySelector(".ms-popup-chat-list").style.display="";
  document.querySelector(".ms-popup-chat").classList.remove("open");
  popupActiveContact=null;
}

function loadPopupMessages(uid){
  if(!popupDb)return;
  popupDb.ref("messages").orderByChild("time").on("value",function(snap){
    var container=document.querySelector(".ms-popup-messages");
    if(!container)return;
    var html="";
    snap.forEach(function(ch){
      var m=ch.val();
      if(m.user!==uid&&m.user!==popupMyId)return;
      var isMe=m.user===popupMyId;
      var cls=isMe?"ms-msg ms-msg-me":"ms-msg ms-msg-other";
      var imgHtml="";if(m.image)imgHtml='<img src="'+escHtml(m.image)+'" style="max-width:160px;max-height:120px;border-radius:6px;cursor:pointer" loading="lazy">';
      html+='<div class="'+cls+'" style="max-width:85%;padding:6px 10px;font-size:0.78rem;border-radius:10px;word-break:break-word">';
      if(!isMe)html+='<div style="font-size:0.58rem;font-weight:700;opacity:.6;margin-bottom:1px">'+escHtml(m.name)+'</div>';
      if(imgHtml)html+=imgHtml;
      if(m.text)html+='<div style="white-space:pre-wrap">'+escHtml(m.text)+'</div>';
      html+='<div style="text-align:right;margin-top:2px"><span style="font-size:0.52rem;opacity:.4">'+new Date(m.time).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})+'</span></div>';
      html+='</div>';
    });
    container.innerHTML=html||'<div style="text-align:center;color:var(--muted);font-size:0.8rem;padding:20px">Нет сообщений</div>';
    container.scrollTop=container.scrollHeight;
  });
}

function sendPopupMsg(){
  var inp=document.querySelector(".ms-popup-input input");
  var text=inp.value.trim();
  if(!text||!popupActiveContact||!popupDb)return;
  popupDb.ref("messages").push({user:popupMyId,name:popupMyName,text:text,time:Date.now(),read:false});
  inp.value="";
}

if(localStorage.getItem("admin_auth")==="1"){
  var ls=document.getElementById("loginScreen");if(ls)ls.style.display="none";
  var ap=document.getElementById("adminPanel");if(ap)ap.style.display="flex";
  showUser();
}
applyTheme();
(function(){var si=document.getElementById("usernameInput");var pi=document.getElementById("passwordInput");if(si)si.addEventListener("keydown",function(e){if(e.key==="Enter")login();});if(pi)pi.addEventListener("keydown",function(e){if(e.key==="Enter")login();});})();
