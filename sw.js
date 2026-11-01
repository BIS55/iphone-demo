// Cache the mock for offline use without freezing old balances or site updates.
const CACHE = "wallet-mock-v5";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon.svg","./online-icon-180.png"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  if(event.request.mode==="navigate") {
    event.respondWith(
      fetch(event.request).then(response=>{
        if(response.ok){
          const clone=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,clone));
        }
        return response;
      }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html")))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});