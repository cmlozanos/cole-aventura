import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLearningVisual, renderChoice } from '../src/learning-visuals.js';
import { createSession } from '../src/exercises.js';
import { shapeSvg } from '../src/art.js';

const question = visual => ({ visual });
const occurrences = (html, text) => html.split(text).length - 1;
const operation = (a, b, operator) => question({ kind: 'operation', a, b, operator });

for (let count = 0; count <= 10; count += 1) {
  test(`conteo ${count}: objetos SVG tocables, nombres y filas de cinco`, () => {
    const html = renderLearningVisual(question({ kind: 'count', count }));
    assert.equal(occurrences(html, '<button '), count);
    assert.equal(occurrences(html, 'class="lv-sticker"'), count);
    assert.equal(occurrences(html, 'aria-pressed="false"'), count);
    assert.equal(occurrences(html, 'class="lv-row"'), Math.ceil(count / 5));
    for (let n = 1; n <= count; n += 1) {
      assert.ok(html.includes(`data-counter="${n}" aria-label="Contar objeto ${n}"`));
    }
    for (const row of html.matchAll(/<div class="lv-row">(.*?)<\/div>/g)) {
      assert.ok(occurrences(row[1], '<button ') <= 5);
    }
    assert.doesNotMatch(html, /<text|style=|Resultado|lv-result/);
    if (!count) assert.match(html, />Ninguno</);
  });
}

test('sumas y restas: todas las combinaciones válidas 0–10, sin etiquetas que den la respuesta', () => {
  for (let a = 0; a <= 10; a += 1) {
    for (let b = 0; b <= 10; b += 1) {
      for (const operator of ['+', '−']) {
        const answer = operator === '+' ? a + b : a - b;
        if (answer < 0 || answer > 10) continue;
        const html = renderLearningVisual(operation(a, b, operator));
        assert.equal(occurrences(html, 'class="lv-sticker"'), operator === '+' ? a + b : a);
        assert.equal(occurrences(html, 'lv-removed'), operator === '+' ? 0 : b);
        assert.equal(occurrences(html, '<button '), answer);
        assert.equal(occurrences(html, 'aria-label="Objeto que quitamos"'), operator === '+' ? 0 : b);
        assert.equal(occurrences(html, 'role="group"'), operator === '+' ? 2 : 1);
        assert.doesNotMatch(html, /role="group" aria-label="[^"]*\d|Resultado|lv-result/);
        if (operator === '+') {
          assert.match(html, /class="lv-sign" aria-label="más">\+</);
          const ids = [...html.matchAll(/data-counter="(\d+)"/g)].map(match => Number(match[1]));
          assert.deepEqual(ids, Array.from({ length: answer }, (_, i) => i + 1));
        } else {
          assert.equal(occurrences(html, 'M7 7L41 41M41 7L7 41'), b);
          const items = [...html.matchAll(/class="lv-(counter|object lv-removed)"/g)].map(match => match[1]);
          assert.deepEqual(items, [...Array(a - b).fill('counter'), ...Array(b).fill('object lv-removed')]);
        }
        if (!a) assert.match(html, />Ninguno</);
      }
    }
  }
});

test('comparación: dos paneles con cifras y sus cantidades', () => {
  const html = renderLearningVisual(question({ kind: 'compare', a: 0, b: 10 }));
  assert.equal(occurrences(html, 'class="lv-group"'), 2);
  assert.equal(occurrences(html, 'class="lv-sticker"'), 10);
  assert.match(html, /class="lv-value">0<.*Ninguno/);
  assert.match(html, /class="lv-value">10</);
  assert.doesNotMatch(html, /<button/);
});

test('pista: recta 0–10 y saltos en posiciones coherentes; resultado solo al resolver', () => {
  for (const [a, b, operator] of [[0, 10, '+'], [10, 0, '+'], [10, 10, '−'], [10, 0, '−'], [3, 4, '+'], [8, 3, '−']]) {
    const q = operation(a, b, operator);
    const end = operator === '+' ? a + b : a - b;
    assert.doesNotMatch(renderLearningVisual(q), /lv-number-line/);
    const hint = renderLearningVisual(q, true);
    assert.equal(occurrences(hint, 'class="lv-jump"'), b);
    for (let n = 0; n <= 10; n += 1) {
      assert.match(hint, new RegExp(`data-position="${n}"><circle cx="${20 + 32 * n}"`));
    }
    assert.match(hint, new RegExp(`lv-start[^\"]*" data-position="${a}"`));
    assert.doesNotMatch(hint, /Resultado:|lv-result|= \d/);
    const solved = renderLearningVisual(q, false, true);
    assert.match(solved, new RegExp(`lv-result" data-position="${end}"`));
    assert.match(solved, new RegExp(`Resultado: ${end}`));
    if (b) {
      const direction = operator === '+' ? 1 : -1;
      assert.match(hint, new RegExp(`data-from="${a}" data-to="${a + direction}"`));
      assert.match(hint, new RegExp(`data-from="${end - direction}" data-to="${end}"`));
    }
  }
  const count = question({ kind: 'count', count: 10 });
  assert.equal(occurrences(renderLearningVisual(count, true), 'class="lv-jump"'), 10);
  assert.doesNotMatch(renderLearningVisual(count, true), /Resultado:|lv-result/);
  assert.match(renderLearningVisual(count, true, true), /lv-result" data-position="10"/);
});

test('figuras: pregunta reutiliza art.js y respuestas solo texto, sin pistas visuales triviales', () => {
  for (const shape of ['circle', 'square', 'rectangle', 'triangle']) {
    const q = question({ kind: 'shape', shape });
    assert.ok(renderLearningVisual(q).includes(shapeSvg(shape)));
    for (const choice of ['Círculo', 'Cuadrado', 'Rectángulo', 'Triángulo']) {
      assert.equal(renderChoice(choice, q), choice);
    }
  }
});

test('respuestas numéricas: cifra accesible, cantidades decorativas y sin botones anidados', () => {
  for (let n = 0; n <= 10; n += 1) {
    const html = renderChoice(String(n), question({ kind: 'count', count: 5 }));
    assert.match(html, new RegExp(`class="lv-choice-number">${n}</span>`));
    assert.equal(occurrences(html, 'class="lv-sticker"'), n);
    assert.match(html, /class="lv-choice-objects" aria-hidden="true"/);
    assert.doesNotMatch(html, /<button|data-counter/);
  }
});

test('escaping y visuales desconocidos: ningún contenido interpolado se convierte en HTML', () => {
  const unsafe = `<img src=x onerror="alert('x')">&`;
  const expected = '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;';
  assert.equal(renderChoice(unsafe, question({ kind: 'shape' })), expected);
  assert.equal(renderChoice(unsafe, {}), expected);
  for (const visual of [{ kind: unsafe }, { kind: 'shape', shape: unsafe }, { kind: 'count', count: unsafe }, { kind: 'count', count: Infinity }, { kind: 'count', count: -1 }, { kind: 'count', count: 1.5 }, { kind: 'operation', a: 3, b: 2, operator: unsafe }, { kind: 'operation', a: 10, b: 10, operator: '+' }, { kind: 'operation', a: 0, b: 10, operator: '−' }]) {
    assert.equal(renderLearningVisual(question(visual), true, true), '');
  }
  assert.equal(renderLearningVisual({}), '');
  assert.equal(renderLearningVisual(null), '');
});

test('contrato real: todos los temas renderizan sin mutar las preguntas', () => {
  for (const value of [0, 0.5, 1 - Number.EPSILON]) {
    for (const q of createSession('mixed', 12, () => value)) {
      const before = structuredClone(q);
      for (const [hint, solved] of [[false, false], [true, false], [true, true]]) {
        assert.match(renderLearningVisual(q, hint, solved), /lv-visual/);
        for (const choice of q.choices) assert.ok(renderChoice(choice, q));
      }
      assert.deepEqual(q, before);
    }
  }
});
