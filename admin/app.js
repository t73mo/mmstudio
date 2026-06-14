
var USERS = {"Telman":"Kn0pKa78","Anastasia":"mm2026"};

function login(){
  var u=document.getElementById("usernameInput").value;
  var p=document.getElementById("passwordInput").value;
  if(USERS[u]&&USERS[u]===p){
    document.getElementById("loginScreen").style.display="none";
    document.getElementById("adminPanel").style.display="flex";
    localStorage.setItem("admin_auth","1");
    localStorage.setItem("admin_user",u);
    showUser();
  }else{document.getElementById("loginError").style.display="block";}
}
function logout(){localStorage.removeItem("admin_auth");localStorage.removeItem("admin_user");window.location.href="index.html";}
function showUser(){var u=localStorage.getItem("admin_user");document.querySelectorAll(".user-name").forEach(function(e){e.textContent=u||"";});}
function toggleAcc(el){el.parentElement.classList.toggle("open");}
function toggleItem(el){el.parentElement.classList.toggle("open");}
function copyText(el){
  var t=el.textContent||el.innerText;
  if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){toast(t.substring(0,30));});}else{
    var r=document.createRange();r.selectNode(el);window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand("copy");toast(t.substring(0,30));
  }
}
function toast(t){var tip=document.getElementById("toast");tip.textContent="\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e: "+t;tip.style.opacity="1";setTimeout(function(){tip.style.opacity="0";},1500);}
function expandAll(){document.querySelectorAll(".acc-group").forEach(function(g){g.classList.add("open");});}
function collapseAll(){document.querySelectorAll(".acc-group, .acc-item").forEach(function(e){e.classList.remove("open");});}
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open");}
function escHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function deleteItem(section,idx){
  if(confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c?")){
    var dels=JSON.parse(localStorage.getItem("mm_del_"+section)||"[]");
    if(dels.indexOf(idx)===-1){dels.push(idx);localStorage.setItem("mm_del_"+section,JSON.stringify(dels));}
    renderAccordion(section);
  }
}
function editItem(section,idx){
  var title=prompt("\u041d\u043e\u0432\u043e\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435:");
  if(title&&title.trim()){
    var edits=JSON.parse(localStorage.getItem("mm_edit_"+section)||"{}");
    edits[idx]=title.trim();
    localStorage.setItem("mm_edit_"+section,JSON.stringify(edits));
    renderAccordion(section);
  }
}
if(localStorage.getItem("admin_auth")==="1"){
  var ls=document.getElementById("loginScreen");if(ls)ls.style.display="none";
  var ap=document.getElementById("adminPanel");if(ap)ap.style.display="flex";
  showUser();
}
(function(){var si=document.getElementById("usernameInput");var pi=document.getElementById("passwordInput");if(si)si.addEventListener("keydown",function(e){if(e.key==="Enter")login();});if(pi)pi.addEventListener("keydown",function(e){if(e.key==="Enter")login();});})();

function itemTitle(row,idx){
  var edits=JSON.parse(localStorage.getItem("mm_edit_"+window._section)||"{}");
  if(edits[idx])return edits[idx];
  for(var i=0;i<row.length;i++){var v=row[i];if(v&&v.trim()&&v!=="-")return v.substring(0,80);}
  return "\u0417\u0430\u043f\u0438\u0441\u044c "+(idx+1);
}
function renderAccordion(sectionId){
  window._section=sectionId;
  var sec=APP_DATA[sectionId];
  var container=document.getElementById("accordionContainer");
  if(!sec||!container)return;
  var rows=sec.rows,hdrs=sec.headers,groups={},cur="";
  for(var i=0;i<rows.length;i++){
    var del=JSON.parse(localStorage.getItem("mm_del_"+sectionId)||"[]");
    if(del.indexOf(i)!==-1)continue;
    var k=(rows[i][0]&&rows[i][0].trim())?rows[i][0]:cur;
    if(rows[i][0]&&rows[i][0].trim())cur=k;
    if(!groups[k])groups[k]=[];groups[k].push({idx:i,row:rows[i]});
  }
  var html="";
  for(var gn in groups){
    var its=groups[gn];
    html+='<div class="acc-group" data-section="'+sectionId+'"><div class="acc-group-header" onclick="toggleAcc(this)"><span class="acc-arrow">\u25b6</span><span class="acc-group-title">'+(gn?escHtml(gn):"")+'</span><span class="acc-group-count">'+its.length+'</span></div><div class="acc-group-body">';
    for(var j=0;j<its.length;j++){
      var it=its[j],title=itemTitle(it.row,it.idx);
      html+='<div class="acc-item"><div class="acc-item-header" onclick="toggleItem(this)"><span class="acc-item-title">'+escHtml(title)+'</span><span class="acc-item-actions"><button class="btn-icon" onclick="event.stopPropagation();editItem(\u0027'+sectionId+'\u0027,'+it.idx+')" title="\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c">\u270f</button><button class="btn-icon btn-del" onclick="event.stopPropagation();deleteItem(\u0027'+sectionId+'\u0027,'+it.idx+')" title="\u0423\u0434\u0430\u043b\u0438\u0442\u044c">\u2715</button></span><span class="acc-item-arrow">\u25be</span></div><div class="acc-item-body"><div class="acc-item-details">';
      for(var k2=0;k2<it.row.length;k2++){
        var cv=it.row[k2];if(cv==null||cv==="")continue;
        if(k2<hdrs.length&&hdrs[k2]){html+='<div class="detail-row"><span class="detail-label">'+escHtml(hdrs[k2])+'</span><span class="detail-value" onclick="copyText(this)">'+escHtml(cv)+'</span></div>';}
        else{html+='<div class="detail-row"><span class="detail-value" onclick="copyText(this)">'+escHtml(cv)+'</span></div>';}
      }
      html+='</div></div></div>';
    }
    html+='</div></div>';
  }
  container.innerHTML=html||'<p class="empty-state">\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445</p>';
}

function doSearch(q){
  var r=document.getElementById("searchResults");
  if(!q||q.length<2){if(r)r.style.display="none";return;}
  var lower=q.toLowerCase(),found=[];
  for(var sid in APP_DATA){
    if(found.length>=30)break;
    var sec=APP_DATA[sid];var rows=sec.rows;
    for(var i=0;i<rows.length;i++){
      if(found.length>=30)break;
      var text="";for(var j=0;j<rows[i].length;j++)text+=rows[i][j]+" ";
      text=text.toLowerCase();
      var title2="";for(var j=0;j<rows[i].length;j++){if(rows[i][j]){title2=rows[i][j];break;}}
      if(text.indexOf(lower)!==-1)found.push({href:sid+".html",tab:sec.label,title:title2});
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
