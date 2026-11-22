import { trackViewport } from './viewport.js';
trackViewport(window);
import { observeSyllables } from './syllables.js';
observeSyllables(document.body);
const loader = document.querySelector('#boot-loader');
try {
  await import('./app.js');
  loader.remove();
} catch {
  loader.innerHTML = '<span aria-hidden="true">↻</span><p>No se ha podido abrir el juego.</p><button id="retry-boot">Reintentar</button>';
  document.querySelector('#retry-boot').addEventListener('click', () => location.reload());
}
