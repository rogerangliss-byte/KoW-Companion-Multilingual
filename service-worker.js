const CACHE='kow-v4.3.27-planname-fix2';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './background-portrait.jpg',
  './background-landscape.jpg',
  './officers.csv',
  './officers.json',
  './USER-GUIDE.md',
  './lang/en.js',
  './lang/it.js',
  './lang/fr.js',
  './lang/de.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));});
