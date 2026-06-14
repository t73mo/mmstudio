(function(){
  var CFG={apiKey:"AIzaSyD3XHJ3xdeJC_ALeIK4nOf1EASO39W3Gh0",authDomain:"mmstudio-86917.firebaseapp.com",databaseURL:"https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app",projectId:"mmstudio-86917",storageBucket:"mmstudio-86917.firebasestorage.app",messagingSenderId:"466384625481",appId:"1:466384625481:web:fb4bb7144d0d329be8c498"};
  if(typeof firebase==="undefined")return;
  try{if(!firebase.apps.length)firebase.initializeApp(CFG);}catch(e){return;}
  var db=firebase.database();
  var page=document.documentElement.getAttribute("data-cms-page");
  if(!page)return;

  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

  function applyTexts(texts){
    if(!texts)return;
    document.querySelectorAll("[data-cms]").forEach(function(el){
      var key=el.getAttribute("data-cms");
      if(texts[key])el.textContent=texts[key];
    });
    document.querySelectorAll("[data-cms-html]").forEach(function(el){
      var key=el.getAttribute("data-cms-html");
      if(texts[key])el.innerHTML=texts[key];
    });
    document.querySelectorAll("[data-cms-placeholder]").forEach(function(el){
      var key=el.getAttribute("data-cms-placeholder");
      if(texts[key])el.setAttribute("placeholder",texts[key]);
    });
  }

  function renderPortfolio(items){
    if(!items||!items.length)return;
    var container=document.querySelector("[data-cms-portfolio]");
    if(!container)return;
    container.innerHTML="";
    items.forEach(function(it){
      var card=document.createElement("article");
      card.className="portfolio-card";
      card.innerHTML='<div class="portfolio-visual"><img class="portfolio-image" src="'+esc(it.image||"")+'" alt="'+esc(it.title||"")+'"></div><div class="portfolio-content"><div class="portfolio-meta"><span>'+esc(it.type||"")+'</span><span>'+esc(it.meta||"")+'</span></div><div class="portfolio-copy"><h2>'+esc(it.title||"")+'</h2><p>'+esc(it.desc||"")+'</p></div><div class="portfolio-details"><p><strong>Задача:</strong> '+esc(it.task||"")+'</p><p><strong>Решение:</strong> '+esc(it.solution||"")+'</p></div></div>';
      container.appendChild(card);
    });
  }

  function renderContacts(c){
    if(!c)return;
    var phoneEls=document.querySelectorAll("[data-cms-contact='phone']");
    phoneEls.forEach(function(el){el.textContent=c.phone||"";if(el.tagName==="A")el.href="tel:"+(c.phone||"").replace(/[^0-9+]/g,"");});
    var emailEls=document.querySelectorAll("[data-cms-contact='email']");
    emailEls.forEach(function(el){el.textContent=c.email||"";if(el.tagName==="A")el.href="mailto:"+(c.email||"");});
    var cityEls=document.querySelectorAll("[data-cms-contact='city']");
    cityEls.forEach(function(el){el.textContent=c.city||"";});
    var scheduleEls=document.querySelectorAll("[data-cms-contact='schedule']");
    scheduleEls.forEach(function(el){el.textContent=c.schedule||"";});
    var tgLinks=document.querySelectorAll("[data-cms-social='telegram']");
    tgLinks.forEach(function(el){if(c.telegram&&c.telegram!=="#")el.href=c.telegram;});
    var waLinks=document.querySelectorAll("[data-cms-social='whatsapp']");
    waLinks.forEach(function(el){if(c.whatsapp&&c.whatsapp!=="#")el.href=c.whatsapp;});
    var igLinks=document.querySelectorAll("[data-cms-social='instagram']");
    igLinks.forEach(function(el){if(c.instagram&&c.instagram!=="#")el.href=c.instagram;});
  }

  db.ref("site/texts/"+page).on("value",function(snap){applyTexts(snap.val());});
  if(page==="portfolio"){
    db.ref("site/portfolio").on("value",function(snap){renderPortfolio(snap.val());});
  }
  db.ref("site/contacts").on("value",function(snap){renderContacts(snap.val());});

  var ogDesc=document.querySelector('meta[property="og:description"]');
  db.ref("site/texts/"+page).once("value",function(snap){
    var t=snap.val();
    if(t&&t.title){document.title=t.title.split("|")[0].trim()+" | MM Studio";}
    if(t&&t.lead&&ogDesc){ogDesc.setAttribute("content",t.lead);}
  });
})();
