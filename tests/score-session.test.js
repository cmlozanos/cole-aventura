import test from 'node:test';
import assert from 'node:assert/strict';
import { createScoreSession } from '../src/score-session.js';

const key = 'cole-aventura-session-v1';
const hour = 3600000;

function mockHost({ storage = 'enabled', cookies = 'enabled', pathname = '/cole-aventura/', protocol = 'https:' } = {}) {
  const data = new Map();
  const jar = new Map();
  const writes = [];
  let time = 10000000;
  const host = {
    location: { pathname, protocol },
    document: {
      get cookie() {
        if (cookies === 'throw') throw new Error('Cookie bloqueada');
        return [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
      },
      set cookie(value) {
        writes.push(value);
        if (cookies === 'throw') throw new Error('Cookie bloqueada');
        if (cookies === 'ignore') return;
        const [name, content] = value.split(';')[0].split('=');
        jar.set(name, content);
      },
    },
    get localStorage() {
      if (storage === 'getter') throw new Error('Storage bloqueado');
      return {
        getItem(name) {
          if (storage === 'read') throw new Error('Lectura bloqueada');
          return data.get(name) ?? null;
        },
        setItem(name, value) {
          if (storage === 'write') throw new Error('Escritura bloqueada');
          if (storage !== 'ignore') data.set(name, value);
        },
      };
    },
  };
  return { host, data, jar, writes, now: () => time, advance(ms) { time += ms; } };
}

const stored = (mock) => JSON.parse(mock.data.get(key));

test('score: snapshot aislado, persistencia y continuación tras recarga sin borrar datos antiguos', () => {
  const mock = mockHost();
  mock.data.set('cole-aventura-state', 'progreso anterior');
  const session = createScoreSession(mock.host, mock.now);
  const initial = session.read();
  assert.deepEqual(initial, { id: initial.id, points: 0, lastActive: mock.now(), persistent: true });
  assert.equal(typeof initial.id, 'string');
  assert.ok(initial.id.length);
  const awarded = session.award('q1');
  assert.equal(awarded.points, 1);
  awarded.points = 99;
  assert.equal(session.read().points, 1);
  assert.deepEqual(createScoreSession(mock.host, mock.now).read(), session.read());
  assert.equal(mock.data.get('cole-aventura-state'), 'progreso anterior');
  assert.equal(mock.writes.length, 0);
});

test('score: read no extiende actividad; exactamente una hora conserva y +1 ms reinicia', () => {
  const mock = mockHost();
  const session = createScoreSession(mock.host, mock.now);
  const first = session.award('q1');
  const raw = mock.data.get(key);
  mock.advance(hour);
  assert.deepEqual(session.read(), first);
  assert.equal(mock.data.get(key), raw);
  mock.advance(1);
  const expired = session.read();
  assert.notEqual(expired.id, first.id);
  assert.equal(expired.points, 0);
  assert.equal(expired.lastActive, mock.now());
});

for (const action of ['touch', 'award']) {
  test(`score: ${action} reevalúa un hueco oculto sin intervalos`, () => {
    const mock = mockHost();
    mock.host.setInterval = () => assert.fail('No debe crear intervalos');
    const session = createScoreSession(mock.host, mock.now);
    const initial = session.award('q1');
    mock.host.document.hidden = true;
    mock.advance(hour + 1);
    mock.host.document.hidden = false;
    const resumed = session[action]('q1');
    assert.notEqual(resumed.id, initial.id);
    assert.equal(resumed.points, action === 'award' ? 1 : 0);
    assert.equal(resumed.lastActive, mock.now());
  });
}

test('score: touch y reintento actualizan actividad, award suma una sola vez por pregunta', () => {
  const mock = mockHost();
  const session = createScoreSession(mock.host, mock.now);
  session.award('q1');
  mock.advance(100);
  assert.equal(session.touch().lastActive, mock.now());
  mock.advance(100);
  assert.equal(session.award('q1').lastActive, mock.now());
  assert.equal(session.read().points, 1);
  assert.equal(createScoreSession(mock.host, mock.now).award('q1').points, 1);
  assert.equal(session.award('q2').points, 2);
});

test('score: deduplicación persistida limitada a las últimas 128 preguntas', () => {
  const mock = mockHost();
  const session = createScoreSession(mock.host, mock.now);
  for (let index = 0; index < 129; index++) session.award(`q${index}`);
  assert.equal(stored(mock).awardedIds.length, 128);
  assert.equal(stored(mock).awardedIds[0], 'q1');
  const reloaded = createScoreSession(mock.host, mock.now);
  assert.equal(reloaded.award('q128').points, 129);
  assert.equal(reloaded.award('q0').points, 130);
});

test('score: reset manual cambia id, limpia puntos y deduplicación y se observa entre instancias', () => {
  const mock = mockHost();
  const first = createScoreSession(mock.host, mock.now);
  const second = createScoreSession(mock.host, mock.now);
  const previous = first.award('q1');
  assert.equal(second.read().points, 1);
  const reset = second.reset();
  assert.notEqual(reset.id, previous.id);
  assert.equal(reset.points, 0);
  assert.deepEqual(first.read(), reset);
  assert.equal(first.award('q1').points, 1);
});

test('score: dos instancias reconcilian antes de leer, tocar y premiar sin sobreescritura obsoleta', () => {
  const mock = mockHost();
  const first = createScoreSession(mock.host, mock.now);
  const second = createScoreSession(mock.host, mock.now);
  first.read();
  second.read();
  first.award('q1');
  assert.equal(second.award('q2').points, 2);
  assert.equal(first.award('q2').points, 2);
  assert.equal(second.touch().points, 2);
  assert.equal(first.read().points, 2);
});

for (const storage of ['getter', 'read', 'write', 'ignore']) {
  test(`score: cookie fallback con storage ${storage} y continuación`, () => {
    const mock = mockHost({ storage });
    const session = createScoreSession(mock.host, mock.now);
    const awarded = session.award('q1');
    assert.equal(awarded.persistent, true);
    assert.equal(awarded.points, 1);
    assert.deepEqual(createScoreSession(mock.host, mock.now).read(), awarded);
    assert.match(mock.writes.at(-1), /; Path=\/cole-aventura\/; SameSite=Lax; Max-Age=604800; Secure$/);
    assert.equal(JSON.parse(decodeURIComponent(mock.jar.get(key))).points, 1);
  });
}

for (const pathname of ['/cole-aventura/', '/cole-aventura/index.html', '/index.html', '/']) {
  test(`score: cookie Path de directorio en ${pathname}, sin Secure en HTTP`, () => {
    const mock = mockHost({ storage: 'getter', pathname, protocol: 'http:' });
    createScoreSession(mock.host, mock.now).touch();
    const path = pathname.startsWith('/cole-aventura') ? '/cole-aventura/' : '/';
    assert.ok(mock.writes[0].includes(`; Path=${path};`));
    assert.ok(!mock.writes[0].includes('Secure'));
  });
}

for (const cookies of ['throw', 'ignore']) {
  test(`score: memoria si storage y cookie ${cookies} están bloqueados`, () => {
    const mock = mockHost({ storage: 'getter', cookies });
    const session = createScoreSession(mock.host, mock.now);
    const first = session.award('q1');
    assert.equal(first.persistent, false);
    assert.equal(session.award('q1').points, 1);
    mock.advance(100);
    assert.equal(session.touch().points, 1);
    assert.equal(session.read().lastActive, mock.now());
    assert.notEqual(session.reset().id, first.id);
    assert.equal(session.read().points, 0);
  });
}

test('score: host vacío y crypto bloqueado usan ids distintos sin Math.random global', () => {
  const host = { get crypto() { throw new Error('Crypto bloqueada'); } };
  const first = createScoreSession(host, () => 0);
  const second = createScoreSession(host, () => 0);
  assert.equal(first.read().persistent, false);
  assert.notEqual(first.read().id, second.read().id);
  assert.notEqual(first.reset().id, first.reset().id);
});

test('score: utiliza randomUUID del host cuando está disponible', () => {
  const mock = mockHost();
  mock.host.crypto = { randomUUID: () => 'host-uuid' };
  assert.equal(createScoreSession(mock.host, mock.now).read().id, 'host-uuid');
});

test('score: cookie válida recupera localStorage corrupto y cookie corrupta no lanza', () => {
  const mock = mockHost({ storage: 'getter' });
  const previous = createScoreSession(mock.host, mock.now).award('q1');
  const enabled = mockHost();
  enabled.data.set(key, '{');
  enabled.jar.set(key, mock.jar.get(key));
  assert.deepEqual(createScoreSession(enabled.host, enabled.now).read(), previous);
  mock.jar.set(key, '%invalid');
  assert.equal(createScoreSession(mock.host, mock.now).read().points, 0);
});

test('score: esquema corrupto, contadores inseguros y timestamps futuros crean sesión nueva', () => {
  const mock = mockHost();
  const valid = { id: 'previous', points: 1, lastActive: mock.now(), awardedIds: ['q1'] };
  for (const value of [null, [], {}, { ...valid, id: '' }, { ...valid, points: -1 },
    { ...valid, points: 0.5 }, { ...valid, points: Number.MAX_SAFE_INTEGER + 1 },
    { ...valid, lastActive: -1 }, { ...valid, lastActive: 1.5 },
    { ...valid, lastActive: Number.MAX_SAFE_INTEGER + 1 }, { ...valid, lastActive: mock.now() + 1 },
    { ...valid, awardedIds: null }, { ...valid, awardedIds: ['q1', 'q1'] },
    { ...valid, awardedIds: [1] }, { ...valid, awardedIds: [''] },
    { ...valid, awardedIds: Array.from({ length: 129 }, (_, index) => `q${index}`) }]) {
    mock.data.set(key, JSON.stringify(value));
    const snapshot = createScoreSession(mock.host, mock.now).read();
    assert.notEqual(snapshot.id, 'previous');
    assert.equal(snapshot.points, 0);
    assert.equal(snapshot.lastActive, mock.now());
  }
});

test('score: no desborda puntos seguros ni premia ids inválidos', () => {
  const mock = mockHost();
  mock.data.set(key, JSON.stringify({ id: 'max', points: Number.MAX_SAFE_INTEGER, lastActive: mock.now(), awardedIds: [] }));
  const session = createScoreSession(mock.host, mock.now);
  assert.equal(session.award('q1').points, Number.MAX_SAFE_INTEGER);
  session.reset();
  for (const id of [undefined, null, '', 1, {}, []]) assert.equal(session.award(id).points, 0);
});

test('score: una recarga tras más de una hora no recupera puntos caducados', () => {
  const mock = mockHost();
  const previous = createScoreSession(mock.host, mock.now).award('q1');
  mock.advance(hour + 1);
  const current = createScoreSession(mock.host, mock.now).read();
  assert.notEqual(current.id, previous.id);
  assert.equal(current.points, 0);
  assert.equal(current.lastActive, mock.now());
});

test('score: memoria mantiene exactamente una hora y caduca después sin actividad', () => {
  const mock = mockHost({ storage: 'getter', cookies: 'ignore' });
  const session = createScoreSession(mock.host, mock.now);
  const previous = session.award('q1');
  mock.advance(hour);
  assert.deepEqual(session.read(), previous);
  mock.advance(1);
  const current = session.read();
  assert.notEqual(current.id, previous.id);
  assert.equal(current.points, 0);
  assert.equal(current.persistent, false);
});
