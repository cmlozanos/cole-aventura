import { shapeSvg } from './art.js';

// Styling contract (no CSS here): lv-visual is the root; lv-operation and
// lv-compare arrange lv-group panels side by side, lv-sign separates operands.
// lv-objects contains at most two lv-row rows of five lv-counter/lv-object items.
// lv-sticker is the shared SVG; lv-removed has an SVG cross (not CSS-only).
// lv-empty names zero. lv-value labels compare panels; lv-shape holds shapeSvg.
// lv-hint/lv-number-line contain a responsive SVG (viewBox 0 0 360 96):
// lv-tick, lv-start, lv-jump and lv-result identify ticks, start, steps and the
// solved endpoint. lv-choice/lv-choice-number/lv-choice-objects are answer content,
// never buttons: the caller owns the wrapper and its numeric accessible name.
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isQuantity = value => Number.isInteger(value) && value >= 0 && value <= 10;

function sticker(removed = false) {
  return `<svg class="lv-sticker" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false"><path d="M24 4L30 16L44 18L34 28L36 43L24 36L12 43L14 28L4 18L18 16Z" fill="#e7b46b" stroke="#9e662a" stroke-width="2" stroke-linejoin="round"/>${removed ? '<path d="M7 7L41 41M41 7L7 41" fill="none" stroke="#993e37" stroke-width="4" stroke-linecap="round"/>' : ''}</svg>`;
}

function objects(count, { interactive = false, removed = 0, offset = 0 } = {}) {
  if (!count) return '<span class="lv-empty">Ninguno</span>';
  const rows = [];
  for (let start = 0; start < count; start += 5) {
    const items = [];
    for (let i = start; i < Math.min(start + 5, count); i += 1) {
      const crossed = i >= count - removed;
      if (interactive && !crossed) {
        items.push(`<button type="button" class="lv-counter" data-counter="${offset + i + 1}" aria-label="Contar objeto ${offset + i + 1}" aria-pressed="false">${sticker()}</button>`);
      } else {
        items.push(`<span class="lv-object${crossed ? ' lv-removed' : ''}"${crossed ? ' role="img" aria-label="Objeto que quitamos"' : ' aria-hidden="true"'}>${sticker(crossed)}</span>`);
      }
    }
    rows.push(`<div class="lv-row">${items.join('')}</div>`);
  }
  return `<div class="lv-objects">${rows.join('')}</div>`;
}

function group(content, label) {
  return `<div class="lv-group" role="group" aria-label="${label}">${content}</div>`;
}

function numberLine(start, end, solved) {
  const x = n => 20 + n * 32;
  const ticks = Array.from({ length: 11 }, (_, n) => `<g class="lv-tick${n === start ? ' lv-start' : ''}${solved && n === end ? ' lv-result' : ''}" data-position="${n}"><circle cx="${x(n)}" cy="56" r="${solved && n === end ? 8 : 4}" fill="${solved && n === end ? '#266c55' : '#9e662a'}"/><text x="${x(n)}" y="84" text-anchor="middle" fill="currentColor">${n}</text></g>`).join('');
  const direction = Math.sign(end - start);
  const jumps = Array.from({ length: Math.abs(end - start) }, (_, i) => {
    const from = start + direction * i;
    const to = from + direction;
    return `<path class="lv-jump" data-from="${from}" data-to="${to}" d="M${x(from)} 48Q${(x(from) + x(to)) / 2} 12 ${x(to)} 48L${x(to) - direction * 6} 40M${x(to)} 48L${x(to) + direction * 2} 38" fill="none" stroke="#266c55" stroke-width="2"/>`;
  }).join('');
  return `<div class="lv-hint"><svg class="lv-number-line" viewBox="0 0 360 96" role="img" aria-label="Recta del 0 al 10${solved ? `. Resultado: ${end}` : '. Sigue los saltos para contar'}"><path d="M20 56H340" stroke="#9e662a" stroke-width="2"/>${jumps}${ticks}</svg></div>`;
}

export function renderLearningVisual(q, showHint = false, solved = false) {
  const v = q?.visual;
  if (!v) return '';
  let content;
  let start = 0;
  let end;
  if (v.kind === 'shape') {
    if (!['circle', 'square', 'rectangle', 'triangle'].includes(v.shape)) return '';
    return `<div class="lv-visual lv-shape shape-visual">${shapeSvg(v.shape)}</div>`;
  }
  if (v.kind === 'count' && isQuantity(v.count)) {
    end = v.count;
    content = group(objects(v.count, { interactive: true }), 'Objetos para contar');
  } else if (v.kind === 'compare' && isQuantity(v.a) && isQuantity(v.b)) {
    content = `<div class="lv-compare">${[v.a, v.b].map(n => group(`<strong class="lv-value">${n}</strong>${objects(n)}`, `Cantidad ${n}`)).join('')}</div>`;
  } else if (v.kind === 'operation' && isQuantity(v.a) && isQuantity(v.b) && ['+', '−'].includes(v.operator)) {
    start = v.a;
    end = v.operator === '+' ? v.a + v.b : v.a - v.b;
    if (!isQuantity(end)) return '';
    content = v.operator === '+'
      ? `<div class="lv-operation">${group(objects(v.a, { interactive: true }), 'Primer grupo')}<span class="lv-sign" aria-label="más">+</span>${group(objects(v.b, { interactive: true, offset: v.a }), 'Segundo grupo')}</div>`
      : `<div class="lv-operation">${group(objects(v.a, { interactive: true, removed: v.b }), 'Quitamos los objetos tachados')}</div>`;
  } else return '';
  return `<div class="lv-visual">${content}${(showHint || solved) && end !== undefined ? numberLine(start, end, solved) : ''}</div>`;
}

export function renderChoice(choice, q) {
  const text = esc(choice);
  if (q?.visual?.kind === 'shape' || !/^(?:[0-9]|10)$/.test(String(choice))) return text;
  return `<span class="lv-choice"><span class="lv-choice-number">${text}</span><span class="lv-choice-objects" aria-hidden="true">${objects(Number(choice))}</span></span>`;
}
