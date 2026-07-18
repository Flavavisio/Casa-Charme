// Service Worker — Dashboard Vendas Live
// Só trata do "shell" da aplicação. Os dados (produtos, vendas, encomendas)
// vêm sempre em direto do Supabase, por isso os pedidos à API nunca são
// guardados em cache — evita mostrares dados desatualizados por engano.

const CACHE_NOME = "vendaslive-shell-v1";
const FICHEIROS_SHELL = [
  "./DASHBOARDVENDAS.html",
  "./manifest-dashboard.json",
  "./icon-dashboard-192.png",
  "./icon-dashboard-512.png",
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
