import test from 'node:test';
import assert from 'node:assert/strict';
import { createStory, renderWord } from '../src/reading.js';

const characters = ['Luna', 'Lola', 'Pepe', 'Lolo'];
const objects = ['pelota', 'cometa', 'muñeca', 'paloma'];
const settings = ['el patio', 'el parque', 'la casa', 'la plaza'];
const lexicon = {
  luna: ['lu', 'na'], lola: ['lo', 'la'], pepe: ['pe', 'pe'], lolo: ['lo', 'lo'],
  ve: ['ve'], una: ['u', 'na'], la: ['la'], el: ['el'], está: ['es', 'tá'],
  en: ['en'], mira: ['mi', 'ra'], pelota: ['pe', 'lo', 'ta'],
  cometa: ['co', 'me', 'ta'], muñeca: ['mu', 'ñe', 'ca'], paloma: ['pa', 'lo', 'ma'],
  patio: ['pa', 'tio'], parque: ['par', 'que'], casa: ['ca', 'sa'], plaza: ['pla', 'za'],
};
const clean = text => text.replace(/[^\p{L}\p{M}]/gu, '').toLowerCase();
const sentence = page => page.map(token => token.text).join(' ');
const rng = (seed = 42) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
function combination(character, object, setting) {
  const values = [character, object, setting].map(index => (index + 0.5) / 4);
  return createStory(() => values.shift());
}
function checkStory(story) {
  assert.deepEqual(Object.keys(story).sort(), ['id', 'pages', 'question', 'symbol', 'title']);
  for (const key of ['id', 'title', 'symbol']) {
    assert.equal(typeof story[key], 'string');
    assert.ok(story[key].length > 0);
  }
  assert.doesNotMatch(story.title, /<|>|_|—/);
  assert.equal(story.pages.length, 3);
  for (const page of story.pages) {
    assert.ok(page.length > 0 && page.length <= 10);
    assert.match(sentence(page), /^[A-ZÁÉÍÓÚÑ][^.?!]*\.$/u);
    for (const token of page) {
      assert.deepEqual(Object.keys(token).sort(), ['syllables', 'text']);
      assert.equal(token.syllables.join('').toLowerCase(), clean(token.text));
      assert.deepEqual(token.syllables, lexicon[clean(token.text)]);
      assert.ok(token.syllables.every(syllable => /^\p{L}+$/u.test(syllable)));
      assert.doesNotMatch(token.text, /[-_]/);
    }
  }
  assert.deepEqual(story.question.choices, objects);
  assert.equal(story.question.choices.filter(choice => choice === story.question.answer).length, 1);
  const character = story.pages[0][0].text;
  assert.equal(story.question.prompt, `¿Qué ve ${character}?`);
  assert.equal(story.question.answer, clean(story.pages[0].at(-1).text));
}

test('64 combinaciones de personajes, objetos y lugares: tres frases cortas coherentes', () => {
  const ids = new Set();
  const stories = new Set();
  for (let c = 0; c < 4; c += 1) {
    for (let o = 0; o < 4; o += 1) {
      for (let s = 0; s < 4; s += 1) {
        const story = combination(c, o, s);
        checkStory(story);
        assert.deepEqual(story.pages.map(sentence), [
          `${characters[c]} ve una ${objects[o]}.`,
          `La ${objects[o]} está en ${settings[s]}.`,
          `${characters[c]} mira la ${objects[o]}.`,
        ]);
        ids.add(story.id);
        stories.add(story.pages.map(sentence).join(' '));
      }
    }
  }
  assert.equal(ids.size, 64);
  assert.equal(stories.size, 64);
});

test('RNG con semillas reproducibles, extremos y valor por defecto', () => {
  const ids = new Set();
  for (let seed = 0; seed < 4096; seed += 1) {
    const story = createStory(rng(seed));
    assert.deepEqual(story, createStory(rng(seed)));
    checkStory(story);
    ids.add(story.id);
  }
  assert.equal(ids.size, 64);
  for (const value of [0, 1 - Number.EPSILON]) checkStory(createStory(() => value));
  checkStory(createStory());
});

test('cada historia entrega tokens, sílabas, páginas y opciones independientes', () => {
  const story = combination(0, 0, 0);
  const expected = structuredClone(story);
  story.pages[0][0].syllables[0] = 'otra';
  story.pages[0][0].text = 'Otra';
  story.pages[0].push({ text: 'más', syllables: ['más'] });
  story.question.choices.reverse();
  assert.deepEqual(story.pages[2][0], expected.pages[2][0]);
  assert.deepEqual(story.pages[2].at(-1).syllables, expected.pages[2].at(-1).syllables);
  assert.deepEqual(combination(0, 0, 0), expected);
});

test('renderWord: botón nativo, sílabas alternas, mayúscula, tilde y puntuación sin separadores', () => {
  for (const [text, syllables, visible] of [
    ['Pelota.', ['pe', 'lo', 'ta'], ['Pe', 'lo', 'ta']],
    ['está', ['es', 'tá'], ['es', 'tá']],
    ['patio.', ['pa', 'tio'], ['pa', 'tio']],
    ['parque.', ['par', 'que'], ['par', 'que']],
  ]) {
    const token = Object.freeze({ text, syllables: Object.freeze(syllables) });
    const html = renderWord(token, 7);
    assert.match(html, /^<button type="button" class="reading-word syllabic-word" data-syllabified="story" data-syllables="[^"]+" data-word="7"/);
    assert.ok(html.includes(`aria-label="${text.replace('.', '')}"`));
    assert.ok(html.includes(`data-syllables="${syllables.join('|')}"`));
    assert.doesNotMatch(html, /<span/);
    assert.equal(html.replace(/<[^>]+>/g, ''), text);
    assert.ok(html.endsWith(`${text.endsWith('.') ? '.' : ''}</button>`));
    assert.doesNotMatch(html.replace(/<[^>]+>/g, ''), /[-_]/);
    assert.deepEqual(token, { text, syllables });
  }
});

test('renderWord escapa texto, sílabas y atributos sin permitir inyección', () => {
  const text = '<img src="x" onerror=\'alert(1)\'>&';
  const token = { text, syllables: [text] };
  const before = structuredClone(token);
  const html = renderWord(token, '0" onclick="alert(1)');
  assert.doesNotMatch(html, /<img|<script|" onclick="|" onerror="/);
  assert.ok(html.includes('&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;&amp;'));
  assert.ok(html.includes('data-word="0&quot; onclick=&quot;alert(1)"'));
  assert.deepEqual(token, before);
});
