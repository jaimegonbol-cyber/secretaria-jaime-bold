// Service worker do Ponto da Cozinha: guarda a página e o reconhecimento facial para funcionar SEM internet.
const VERSAO = 'ponto-v5';
const ARQUIVOS = [
  './ponto.html',
  './ponto.webmanifest',
  './ponto-icone-192.png',
  './ponto-icone-512.png',
  './face-api.js',
  './tiny_face_detector_model-weights_manifest.json',
  './tiny_face_detector_model.bin',
  './face_landmark_68_model-weights_manifest.json',
  './face_landmark_68_model.bin',
  './face_recognition_model-weights_manifest.json',
  './face_recognition_model.bin',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(chaves => Promise.all(chaves.filter(k => k.startsWith('ponto-') && k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // chamadas ao Supabase passam direto
  const caminho = './' + url.pathname.split('/').slice(-1)[0];
  const dentroVendor = url.pathname.includes('/vendor-face/');
  const ehNosso = ARQUIVOS.some(a => a.endsWith(url.pathname.split('/').slice(-1)[0]) && (dentroVendor === a.includes('vendor-face')));
  if(!ehNosso) return;
  // Página: mostra a cópia guardada na hora e atualiza em segundo plano quando houver internet.
  e.respondWith(
    caches.open(VERSAO).then(async (cache) => {
      const guardado = await cache.match(req, { ignoreSearch: true });
      const rede = fetch(req).then(resp => { if(resp && resp.ok) cache.put(req, resp.clone()); return resp; }).catch(() => null);
      if(guardado){ e.waitUntil(rede); return guardado; }
      const resp = await rede;
      return resp || new Response('Sem conexão e arquivo não guardado.', { status: 503 });
    })
  );
});
