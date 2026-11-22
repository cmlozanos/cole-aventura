import test from 'node:test';
import assert from 'node:assert/strict';
import { syllableLexicon } from '../src/syllable-lexicon.js';
import { activities, courses } from '../src/catalog.js';
import { createSession } from '../src/exercises.js';
import { createStory } from '../src/reading.js';

// Finite inventory of user-facing sentences, not arbitrary JS strings (IDs,
// selectors, SVG paths, CSS classes and event names are not Spanish vocabulary).
// Include accessible names, speech, fallback and the native confirm's message;
// rendering that confirm with styled syllables is the controller's concern.
const sentences = {
  app: [
    'puntos de esta sesión', 'Aspecto', 'Día, noche o sistema', 'Sistema', 'Día', 'Noche',
    'Inicio', 'Para adultos', '¡Elige tu aventura!', '¡Sorpresa!', 'Cuentos',
    'Dibujos del reto', 'Elige una respuesta', 'Página 1 de 3', 'Pregunta',
    'Siguiente página', 'Adultos', 'Cerrar', 'Voz', 'Sonidos', 'Animaciones',
    'Otro reto', 'Reiniciar puntos', 'Resultado de la multiplicación', 'Entrar',
    'Inténtalo de nuevo', '¿Confirmar reinicio?', '¿Reiniciar a cero los puntos de esta sesión?', '¡Bien!',
  ],
  exercises: [
    '¿Cuántos?', 'Al contar de uno en uno llegamos a 10.',
    'Señala cada elemento una sola vez mientras cuentas.',
    '¿Cuál es mayor?', '¿Cuál es menor?', '10 es mayor que 1.', '1 es menor que 10.',
    'El mayor representa más cantidad.', 'El menor representa menos cantidad.',
    'Toca: círculo.', 'Toca: cuadrado.', 'Toca: rectángulo.', 'Toca: triángulo.',
    'Es redondo y no tiene lados ni esquinas.',
    'Tiene cuatro lados iguales y cuatro esquinas rectas.',
    'Tiene cuatro esquinas rectas y dos lados largos y dos cortos.',
    'Tiene tres lados y tres esquinas.', 'Fíjate en sus lados y sus esquinas.',
    'Ana tiene 1. Recibe 2. ¿Cuántas hay?', 'Leo tiene 3. Regala 1. ¿Cuántas quedan?',
    'Eva tiene 1.', 'Hugo tiene 1.', 'Al juntar contamos 3.', 'Al quitar contamos 2.',
    'Empieza en 1 y cuenta 2 más.', 'Empieza en 3 y cuenta 1 hacia atrás.',
  ],
  visuals: [
    'Ninguno', 'Contar objeto 1', 'Objeto que quitamos', 'Recta del 0 al 10.',
    'Resultado: 3', 'Sigue los saltos para contar', 'Objetos para contar',
    'Cantidad 1', 'Primer grupo', 'más', 'Segundo grupo', 'Quitamos los objetos tachados',
    'Un pequeño jardín donde crecen números y formas',
    'Una línea curva cerrada, sin lados rectos ni esquinas.',
    'Cuatro lados iguales y cuatro esquinas rectas.',
    'Cuatro esquinas rectas, dos lados largos y dos cortos.',
    'Tres lados rectos y tres esquinas.',
  ],
  bootstrap: ['No se ha podido abrir el juego.', 'Reintentar'],
  index: [
    'Matemáticas visuales y aleatorias para primero de Primaria. Sin anuncios ni cuentas.',
    'Cole Aventura · Primero de Primaria', 'Preparando la aventura…', '0 puntos',
    'Controles del juego', 'Reto resuelto. Siguiente reto', 'Puntos de sesión', '¡Bien!',
    'Siguiente reto',
  ],
};
const words = text => text.toLowerCase().match(/[a-záéíóúüñ]+/gu) || [];
function assertCovered(text) {
  for (const word of words(text)) {
    assert.ok(Object.hasOwn(syllableLexicon, word), `Missing ${word} in: ${text}`);
  }
}

test('reviewed lowercase entries reconstruct every word without losing accents', () => {
  for (const [word, syllables] of Object.entries(syllableLexicon)) {
    assert.equal(word, word.toLowerCase());
    assert.match(word, /^\p{L}+$/u);
    assert.ok(Array.isArray(syllables) && syllables.length > 0, word);
    for (const syllable of syllables) assert.match(syllable, /^\p{L}+$/u, word);
    assert.equal(syllables.join(''), word);
  }
});

test('exact reviewed diphthongs, hiatuses, digraphs and consonant clusters', () => {
  const expected = {
    números: ['nú', 'me', 'ros'], geométricas: ['ge', 'o', 'mé', 'tri', 'cas'],
    triángulo: ['trián', 'gu', 'lo'], círculo: ['cír', 'cu', 'lo'],
    confirmar: ['con', 'fir', 'mar'], reinicio: ['rei', 'ni', 'cio'],
    reiniciar: ['rei', 'ni', 'ciar'], sesión: ['se', 'sión'], día: ['dí', 'a'],
    cuentos: ['cuen', 'tos'], aventura: ['a', 'ven', 'tu', 'ra'],
    leo: ['le', 'o'], línea: ['lí', 'ne', 'a'], aleatorias: ['a', 'le', 'a', 'to', 'rias'],
    patio: ['pa', 'tio'], cuenta: ['cuen', 'ta'], iguales: ['i', 'gua', 'les'],
    siguiente: ['si', 'guien', 'te'], parque: ['par', 'que'],
    llegamos: ['lle', 'ga', 'mos'], cerrada: ['ce', 'rra', 'da'],
    pequeños: ['pe', 'que', 'ños'], rectángulo: ['rec', 'tán', 'gu', 'lo'],
    multiplicación: ['mul', 'ti', 'pli', 'ca', 'ción'],
  };
  for (const [word, syllables] of Object.entries(expected)) {
    assert.deepEqual(syllableLexicon[word], syllables, word);
  }
  // Unknown words have no guessed segmentation.
  assert.equal(syllableLexicon.palabrainventada, undefined);
});

test('finite UI, hint, error, loading and confirm sentence inventory is covered', () => {
  for (const group of Object.values(sentences)) group.forEach(assertCovered);
});

test('current catalog labels, titles and descriptions are covered', () => {
  for (const course of courses) [course.label, course.shortLabel, course.stage].forEach(assertCovered);
  for (const activity of activities) {
    [activity.subject, activity.title, activity.description].forEach(assertCovered);
    for (const topic of activity.topics) [topic.title, topic.description].forEach(assertCovered);
  }
});

test('generated math prompts, choices, explanations and hints use reviewed words', () => {
  for (const topic of activities[0].topics) {
    for (let seed = 0; seed < 100; seed += 1) {
      let state = seed;
      const rng = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
      const [question] = createSession(topic.id, 1, rng);
      [question.prompt, ...question.choices, question.hint, question.explanation].forEach(assertCovered);
    }
  }
});

test('all 64 stories include reviewed titles, questions, answers and identical syllables', () => {
  for (let character = 0; character < 4; character += 1) {
    for (let object = 0; object < 4; object += 1) {
      for (let setting = 0; setting < 4; setting += 1) {
        const values = [character, object, setting].map(index => (index + 0.5) / 4);
        const story = createStory(() => values.shift());
        [story.title, story.question.prompt, ...story.question.choices].forEach(assertCovered);
        for (const page of story.pages) {
          for (const token of page) {
            assertCovered(token.text);
            assert.deepEqual(syllableLexicon[words(token.text)[0]], token.syllables);
          }
        }
      }
    }
  }
});
