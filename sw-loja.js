// Service Worker — Casa & Charme
// Só trata do "shell" da aplicação (para poder instalar e abrir mesmo
// com fraca ligação). Os dados da loja vêm sempre em direto do Supabase,
// por isso os pedidos à API nunca são guardados em cache.

const CACHE_NOME = "casacharme-shell-v1";
const FICHEIROS_SHELL = [
  "./CasaCharme-Loja.html",
  "./manifest-loja.json",
  "./icon-loja-192.png",
  "./icon-loja-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(FICHEIROS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);

  // Nunca guardar em cache pedidos a outros domínios (Supabase, fontes, etc.)
  if (url.origin !== self.location.origin) return;

  // Para ficheiros do próprio site: tenta a rede primeiro, cai para a cache se offline
  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
        return resposta;
      })
      .catch(() => caches.match(evento.request))
  );
});
