import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Explicit owned files only; no cleanup of unrelated paths.
const files = ['index.html','manifest.webmanifest','src/app.js','src/audio.js','src/art.js','src/learning-visuals.js','src/catalog.js','src/exercises.js','src/storage.js','src/child.css','public/icons/icon.svg','public/icons/icon-192.png','public/icons/icon-512.png'];
const hash = createHash('sha256');
hash.update(await readFile(new URL(import.meta.url)));
for (const file of files) hash.update(await readFile(file));
const version = hash.digest('hex').slice(0, 16);
await mkdir('dist', { recursive: true });
for (const file of files) { await mkdir(`dist/${file.split('/').slice(0,-1).join('/')}`, {recursive:true}); await cp(file, `dist/${file}`); }
const assets = ['./', ...files.map(f => `./${f}`)];
const worker = `const CACHE = 'cole-aventura-${version}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('cole-aventura-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match(new URL('./index.html', self.registration.scope)).then(hit => hit || fetch(event.request)));
  } else {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
  }
});
`;
await writeFile('dist/sw.js', worker);
console.log(`Built ${files.length} assets; offline cache cole-aventura-${version}`);
