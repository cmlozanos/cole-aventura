import test from 'node:test';
import assert from 'node:assert/strict';
import { courses, activities } from '../src/catalog.js';
import { createSession } from '../src/exercises.js';
import { loadState, saveState, recordSession, createProfile } from '../src/storage.js';

const topicIds = ['numbers', 'compare', 'addition', 'subtraction', 'problems', 'shapes'];
const activityId = 'mates-1-u1-u2';
const rng = (seed = 42) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const memory = (initial = null) => {
  let value = initial;
  return { getItem: () => value, setItem: (key, next) => { value = next; } };
};
const initial = () => loadState(memory());
const result = (overrides = {}) => ({ profileId: 'explorer-1', activityId, topicId: 'addition', correct: 3, total: 5, helped: 2, ...overrides });

function checkQuestion(question) {
  for (const key of ['id', 'topicId', 'prompt', 'answer', 'explanation', 'hint']) {
    assert.equal(typeof question[key], 'string');
    assert.ok(question[key].trim());
  }
  assert.ok(topicIds.includes(question.topicId));
  assert.ok(question.choices.length >= 2);
  assert.equal(new Set(question.choices).size, question.choices.length);
  assert.ok(question.choices.every((choice) => typeof choice === 'string'));
  assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1);
  const visual = question.visual;
  if (question.topicId === 'numbers') {
    assert.equal(visual.kind, 'count');
    assert.ok(Number.isInteger(visual.count) && visual.count >= 1 && visual.count <= 10);
    assert.equal(question.answer, String(visual.count));
  } else if (question.topicId === 'compare') {
    assert.equal(visual.kind, 'compare');
    for (const n of [visual.a, visual.b]) assert.ok(Number.isInteger(n) && n >= 1 && n <= 10);
    assert.notEqual(visual.a, visual.b);
    assert.equal(question.answer, String(question.prompt.includes('mayor') ? Math.max(visual.a, visual.b) : Math.min(visual.a, visual.b)));
  } else if (question.topicId === 'shapes') {
    assert.equal(visual.kind, 'shape');
    assert.equal(question.answer, { circle: 'Círculo', square: 'Cuadrado', rectangle: 'Rectángulo', triangle: 'Triángulo' }[visual.shape]);
  } else {
    assert.equal(visual.kind, 'operation');
    for (const n of [visual.a, visual.b]) assert.ok(Number.isInteger(n) && n >= 0 && n <= 10);
    assert.ok(['+', '−'].includes(visual.operator));
    const answer = visual.operator === '+' ? visual.a + visual.b : visual.a - visual.b;
    assert.ok(answer >= 0 && answer <= 10);
    assert.equal(question.answer, String(answer));
    if (question.topicId === 'addition') assert.equal(visual.operator, '+');
    if (question.topicId === 'subtraction') assert.equal(visual.operator, '−');
  }
  if (!['shapes', 'compare'].includes(question.topicId)) {
    assert.ok(question.choices.every((choice) => /^(?:[0-9]|10)$/.test(choice)));
  }
}

test('catálogo: seis cursos españoles y un pack declarativo con seis temas', () => {
  assert.deepEqual(courses, Array.from({ length: 6 }, (_, i) => ({ id: `primaria-${i + 1}`, label: `${i + 1}.º de Primaria`, shortLabel: `${i + 1}.º`, stage: 'Primaria' })));
  assert.equal(activities.length, 1);
  const pack = activities[0];
  assert.equal(pack.id, activityId);
  assert.equal(pack.courseId, courses[0].id);
  assert.equal(pack.subject, 'Matemáticas');
  assert.deepEqual(pack.topics.map(({ id }) => id), topicIds);
  for (const item of [pack, ...pack.topics]) {
    for (const key of ['title', 'description']) assert.ok(item[key]?.trim());
  }
  for (const topic of pack.topics) {
    assert.ok(topic.symbol?.trim());
    assert.ok(topic.color?.trim());
  }
});

test('sesión por defecto, determinismo, mezcla equilibrada e identificadores únicos', () => {
  assert.equal(createSession().length, 5);
  const session = createSession('mixed', 12, rng());
  assert.deepEqual(session, createSession('mixed', 12, rng()));
  assert.notDeepEqual(session, createSession('mixed', 12, rng(7)));
  assert.equal(new Set(session.map(({ id }) => id)).size, 12);
  for (const topicId of topicIds) assert.equal(session.filter((q) => q.topicId === topicId).length, 2);
  session.forEach(checkQuestion);
});

for (const topicId of topicIds) {
  test(`generador ${topicId}: respuestas y visuales válidos en 100 semillas y RNG extremos`, () => {
    const positions = new Set();
    const answers = new Set();
    for (let seed = 0; seed < 100; seed += 1) {
      const session = createSession(topicId, 12, rng(seed));
      assert.equal(session.length, 12);
      assert.equal(new Set(session.map(({ id }) => id)).size, 12);
      for (const question of session) {
        checkQuestion(question);
        assert.equal(question.topicId, topicId);
        positions.add(question.choices.indexOf(question.answer));
        answers.add(question.answer);
        if (topicId === 'problems') {
          assert.ok(question.prompt.length < 160);
          assert.doesNotMatch(question.prompt, /@|https?:|1[.º ]+C/);
        }
      }
    }
    assert.ok(positions.size > 1, 'La respuesta no ocupa siempre el mismo lugar');
    assert.ok(answers.size > 1, 'El contenido cambia');
    for (const value of [0, 1 - Number.EPSILON]) createSession(topicId, 12, () => value).forEach(checkQuestion);
  });
}

test('entradas inválidas del generador no producen sesiones', () => {
  for (const topicId of ['unknown', '__proto__', '', null, 1]) assert.deepEqual(createSession(topicId, 5, rng()), []);
  for (const count of [0, -1, 1.5, NaN, Infinity, '5', null]) assert.deepEqual(createSession('mixed', count, rng()), []);
});

test('estado inicial independiente, guardado booleano y lectura de la misma clave', () => {
  const state = initial();
  assert.deepEqual(state, { version: 1, profiles: [{ id: 'explorer-1', name: 'Explorador 1' }], activeProfileId: 'explorer-1', progress: {} });
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(saveState(state, storage), true);
  assert.equal(values.size, 1);
  assert.deepEqual(loadState(storage), state);
  state.profiles[0].name = 'Otro';
  assert.equal(initial().profiles[0].name, 'Explorador 1');
});

test('corrupción, versión desconocida y almacenamiento bloqueado recuperan estado', () => {
  for (const value of ['{', 'null', '[]', '42', '{}', '{"version":2}']) assert.deepEqual(loadState(memory(value)), initial());
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(loadState(blocked), initial());
  assert.equal(saveState(initial(), blocked), false);
  assert.deepEqual(loadState(null), initial());
  assert.equal(saveState(initial(), null), false);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    assert.deepEqual(loadState(), initial());
    assert.equal(saveState(initial()), false);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('recordSession acumula sin mutar y aísla actividad, tema y perfil', () => {
  const state = initial();
  const before = structuredClone(state);
  const once = recordSession(state, result());
  assert.deepEqual(state, before);
  assert.deepEqual(once.progress['explorer-1'][activityId], { sessions: 1, answered: 5, correct: 3, helped: 2, topics: { addition: { sessions: 1, correct: 3, total: 5 } } });
  const twice = recordSession(once, result({ correct: 5, helped: 0 }));
  assert.equal(once.progress['explorer-1'][activityId].sessions, 1);
  assert.equal(twice.progress['explorer-1'][activityId].answered, 10);
  assert.deepEqual(twice.progress['explorer-1'][activityId].topics.addition, { sessions: 2, correct: 8, total: 10 });
  const withProfile = createProfile(twice);
  const other = recordSession(withProfile, result({ profileId: withProfile.activeProfileId, topicId: 'mixed' }));
  assert.deepEqual(other.progress['explorer-1'], twice.progress['explorer-1']);
  assert.equal(other.progress[withProfile.activeProfileId][activityId].topics.mixed.sessions, 1);
  const storage = memory();
  assert.equal(saveState(other, storage), true);
  assert.deepEqual(loadState(storage), other);
});

test('sesiones inválidas no modifican ni sustituyen el estado', () => {
  const state = recordSession(initial(), result());
  const before = structuredClone(state);
  const invalid = [null, {}, ...[
    { profileId: 'missing' }, { profileId: '__proto__' }, { activityId: 'missing' }, { activityId: '__proto__' },
    { topicId: 'missing' }, { topicId: '__proto__' }, { total: 0 }, { total: -1 }, { total: 1.5 }, { total: '5' },
    { correct: -1 }, { correct: 6 }, { correct: 1.5 }, { correct: NaN }, { correct: Infinity },
    { helped: -1 }, { helped: 6 }, { helped: true }, { helped: 0.5 }, { total: Number.MAX_SAFE_INTEGER + 1 },
  ].map(result)];
  for (const session of invalid) {
    assert.strictEqual(recordSession(state, session), state);
    assert.deepEqual(state, before);
  }
});

test('createProfile devuelve estado nuevo activo, genérico y con máximo seis perfiles', () => {
  let state = initial();
  for (let n = 2; n <= 6; n += 1) {
    const before = structuredClone(state);
    const next = createProfile(state);
    assert.deepEqual(state, before);
    assert.equal(next.activeProfileId, `explorer-${n}`);
    assert.deepEqual(next.profiles.at(-1), { id: `explorer-${n}`, name: `Explorador ${n}` });
    assert.deepEqual(next.progress, state.progress);
    state = next;
  }
  assert.strictEqual(createProfile(state), state);
});

test('lectura sanea perfiles duplicados, referencias y progreso corrupto sin perder datos válidos', () => {
  const state = recordSession(initial(), result());
  state.profiles.push({ id: 'explorer-1', name: 'Duplicado' }, null, { id: '__proto__', name: 'No' });
  state.activeProfileId = 'missing';
  state.progress.missing = state.progress['explorer-1'];
  state.progress['explorer-1'].unknown = { sessions: 1 };
  state.progress['explorer-1'][activityId].topics.unknown = { sessions: 1, correct: 0, total: 1 };
  const clean = loadState(memory(JSON.stringify(state)));
  assert.deepEqual(clean, recordSession(initial(), result()));
  for (const field of ['sessions', 'answered', 'correct', 'helped']) {
    const broken = recordSession(initial(), result());
    broken.progress['explorer-1'][activityId][field] = -1;
    assert.deepEqual(loadState(memory(JSON.stringify(broken))).progress, {});
  }
});

test('lectura limita perfiles, repara temas rotos y rechaza acumulaciones inseguras', () => {
  const state = recordSession(initial(), result());
  state.profiles = Array.from({ length: 8 }, (_, i) => ({ id: `explorer-${i + 1}`, name: `Explorador ${i + 1}` }));
  state.activeProfileId = 'explorer-8';
  state.progress['explorer-1'][activityId].topics.addition.correct = 99;
  const clean = loadState(memory(JSON.stringify(state)));
  assert.equal(clean.profiles.length, 6);
  assert.equal(clean.activeProfileId, 'explorer-1');
  assert.deepEqual(clean.progress['explorer-1'][activityId].topics, {});
  const full = recordSession(initial(), result({ total: Number.MAX_SAFE_INTEGER, correct: 0, helped: 0 }));
  assert.strictEqual(recordSession(full, result()), full);
});

test('mixto con results reparte temas una vez por sesión y conserva el reparto al persistir', () => {
  const results = createSession('mixed', 12, rng()).map(({ topicId }, index) => ({ topicId, correct: index % 2 === 0, helped: index % 2 !== 0 }));
  const session = result({ topicId: 'mixed', total: 12, correct: 6, helped: 6, results });
  const state = recordSession(initial(), result());
  const before = structuredClone(state);
  const input = structuredClone(session);
  const next = recordSession(state, session);
  assert.deepEqual(state, before);
  assert.deepEqual(session, input);
  const stats = next.progress['explorer-1'][activityId];
  assert.equal(stats.sessions, 2);
  assert.equal(stats.answered, 17);
  assert.equal(stats.correct, 9);
  assert.equal(stats.helped, 8);
  assert.deepEqual(stats.topics.mixed, { sessions: 1, correct: 6, total: 12 });
  for (const topicId of topicIds) {
    const correct = results.filter((entry) => entry.topicId === topicId && entry.correct).length;
    assert.deepEqual(stats.topics[topicId], { sessions: topicId === 'addition' ? 2 : 1, correct: correct + (topicId === 'addition' ? 3 : 0), total: topicId === 'addition' ? 7 : 2 });
  }
  const twice = recordSession(next, session);
  assert.equal(twice.progress['explorer-1'][activityId].topics.shapes.sessions, 2);
  const storage = memory();
  assert.equal(saveState(twice, storage), true);
  assert.deepEqual(loadState(storage), twice);
});

test('results en tema individual no duplica contadores y mixto parcial solo añade temas presentes', () => {
  const results = [{ topicId: 'addition', correct: true, helped: false }, { topicId: 'addition', correct: false, helped: true }];
  const next = recordSession(initial(), result({ total: 2, correct: 1, helped: 1, results }));
  assert.deepEqual(next.progress['explorer-1'][activityId].topics, { addition: { sessions: 1, correct: 1, total: 2 } });
  const mixed = recordSession(initial(), result({ topicId: 'mixed', total: 2, correct: 1, helped: 1, results }));
  assert.deepEqual(mixed.progress['explorer-1'][activityId].topics, { mixed: { sessions: 1, correct: 1, total: 2 }, addition: { sessions: 1, correct: 1, total: 2 } });
});

test('results inválidos rechazan toda la sesión sin modificar datos', () => {
  const state = recordSession(initial(), result());
  const before = structuredClone(state);
  const entry = { topicId: 'addition', correct: true, helped: false };
  const session = result({ topicId: 'mixed', total: 1, correct: 1, helped: 0 });
  for (const results of [null, {}, 'invalid', [], [entry, entry], [null], [1], new Array(1),
    [{ ...entry, topicId: 'mixed' }], [{ ...entry, topicId: 'unknown' }], [{ ...entry, topicId: '__proto__' }],
    [{ ...entry, correct: 1 }], [{ ...entry, helped: 0 }], [{ topicId: 'addition', correct: true }],
    [{ ...entry, correct: false }], [{ ...entry, helped: true }]]) {
    assert.strictEqual(recordSession(state, { ...session, results }), state);
    assert.deepEqual(state, before);
  }
  assert.strictEqual(recordSession(state, { ...session, topicId: 'subtraction', results: [entry] }), state);
});

test('saneamiento mantiene el límite de sesiones por tema', () => {
  const state = recordSession(initial(), result());
  state.progress['explorer-1'][activityId].topics.addition.sessions = 2;
  assert.deepEqual(loadState(memory(JSON.stringify(state))).progress['explorer-1'][activityId].topics, {});
});

test('persistencia funciona sin Object.hasOwn como en Chrome 95', () => {
  const original = Object.hasOwn;
  try {
    Object.hasOwn = undefined;
    const state = recordSession(initial(), result());
    const storage = memory();
    assert.equal(saveState(state, storage), true);
    assert.deepEqual(loadState(storage), state);
  } finally {
    Object.hasOwn = original;
  }
});
