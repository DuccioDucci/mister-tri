/* Service worker di Mister Tri: rende l’app installabile e la fa funzionare anche senza rete.
   Cambia VERSION a ogni pubblicazione, così i telefoni scaricano la versione nuova. */
const VERSION='mt-202611051658';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  /* intervals.icu e tutto ciò che non è una lettura passano sempre dalla rete */
  if(e.request.method!=='GET'||u.hostname.endsWith('intervals.icu'))return;
  const keep=r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));}return r;};
  if(u.origin===location.origin){
    /* prima la rete, così gli aggiornamenti arrivano subito; senza rete la copia salvata */
    e.respondWith(fetch(e.request).then(keep).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
  } else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(keep)));
  }
});
