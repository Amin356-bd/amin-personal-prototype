const V="amin-proto-v5",SHELL=["./","index.html","css/app.css","manifest.webmanifest","js/app.js","js/perf.js","js/idb.js","js/prayer.js","js/s-hub.js","js/s-today.js","js/s-family.js","js/s-path.js","js/s-prayer.js","js/s-fonts.js","js/s-glass.js","js/s-learn.js","js/s-icons.js","js/s-print.js","js/boot.js","js/core/repo.js","js/core/backup.js","js/core/sync-adapter.js","js/s-settings.js","js/s-data.js","js/s-notes.js","js/s-install.js","js/s-share.js","js/s-bauth.js","js/s-bai.js","js/s-bpdf.js","js/s-bremind.js","js/fb.js","js/ics.js","js/firebase-config.js","data/prayer-dhaka.json","data/districts.json","fonts/Poppins-Regular.ttf","fonts/Poppins-Medium.ttf","fonts/Poppins-Bold.ttf","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/favicon-32.png","icons/favicon-48.png","icons/icon-any.svg","icons/notification-mono-96.png","icons/apple-touch-icon-180.png","logo/lockup-356-dark.png","logo/madrasa-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=="gfonts"&&x!=="remind"&&x!=="remind-log").map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){ // runtime-cache third-party fonts after first online load
    e.respondWith(caches.open("gfonts").then(async c=>{const hit=await c.match(e.request);const net=fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
  if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(h=>h||fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match("index.html"))));
});

// ---- reminders test (Stage 0a খ-৪) ----
const logFire=async(id,method)=>{const c=await caches.open("remind-log");const r=await c.match("/log.json");const l=r?await r.json():[];l.push({id,method,firedAt:Date.now()});await c.put("/log.json",new Response(JSON.stringify(l)))};
const fire=async(id,title,method)=>{await self.registration.showNotification(title,{tag:id,body:"SW থেকে ("+method+")",icon:"icons/icon-192.png",badge:"icons/notification-mono-96.png",vibrate:[200,100,200]});await logFire(id,method)};
self.addEventListener("message",e=>{const d=e.data||{};if(d.type==="sched"){const ms=Math.max(0,d.due-Date.now());e.waitUntil(new Promise(res=>setTimeout(async()=>{await fire(d.id,d.title,"sw-timer");res()},ms)))}});
self.addEventListener("periodicsync",e=>{if(e.tag!=="amin-remind")return;e.waitUntil((async()=>{const c=await caches.open("remind");const r=await c.match("/due.json");const l=r?await r.json():[];const rest=[];for(const x of l){if(x.due<=Date.now())await fire(x.id,x.title,"periodic-sync");else rest.push(x)}await c.put("/due.json",new Response(JSON.stringify(rest)))})())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window"}).then(l=>l[0]?l[0].focus():clients.openWindow("./#/bremind")))});
