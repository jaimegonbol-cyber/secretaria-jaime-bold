// Service Worker mínimo — necessário para o Android completar a instalação do app
// (Adicionar à tela inicial / Instalar app). Não faz cache agressivo, só repassa
// as requisições direto para a rede, para não interferir no funcionamento normal
// do sistema (que depende de dados sempre atualizados do Supabase).

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Passa direto para a rede — sem cache — já que o sistema precisa sempre
  // dos dados mais recentes do banco (alunos, turmas, frequência etc.)
  event.respondWith(fetch(event.request));
});
