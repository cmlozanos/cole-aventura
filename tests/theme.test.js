import test from 'node:test';
import assert from 'node:assert/strict';
import { createTheme } from '../src/theme.js';

const storageKey = 'cole-aventura-theme-v1';

function mockHost({ dark = false, stored = null, legacy = false } = {}) {
  const values = new Map(stored === null ? [] : [[storageKey, stored]]);
  const listeners = new Set();
  const root = { dataset: {}, style: {} };
  const media = { matches: dark };
  if (legacy) {
    media.addListener = listener => listeners.add(listener);
    media.removeListener = listener => listeners.delete(listener);
  } else {
    media.addEventListener = (name, listener) => {
      assert.equal(name, 'change');
      listeners.add(listener);
    };
    media.removeEventListener = (name, listener) => {
      assert.equal(name, 'change');
      listeners.delete(listener);
    };
  }
  const host = {
    document: { documentElement: root },
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    matchMedia(query) {
      assert.equal(query, '(prefers-color-scheme: dark)');
      return media;
    },
  };
  return {
    host, root, values, listeners,
    change(matches) {
      media.matches = matches;
      for (const listener of listeners) listener({ matches });
    },
  };
}

function assertTheme(theme, mock, mode, resolved) {
  assert.equal(theme.mode, mode);
  assert.equal(theme.resolved, resolved);
  assert.equal(mock.root.dataset.theme, resolved);
  assert.equal(mock.root.style.colorScheme, resolved);
}

test('tema: sistema por defecto, aplica inmediatamente y sigue cambios en vivo', () => {
  for (const dark of [false, true]) {
    const mock = mockHost({ dark });
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, 'system', dark ? 'dark' : 'light');
    assert.equal(mock.values.size, 0);
    mock.change(!dark);
    assertTheme(theme, mock, 'system', dark ? 'light' : 'dark');
    theme.destroy();
  }
});

test('tema: restaura y persiste los tres modos sin tocar otros datos', () => {
  for (const mode of ['system', 'light', 'dark']) {
    const mock = mockHost({ dark: true, stored: mode });
    mock.values.set('cole-aventura-session-v1', 'keep');
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, mode, mode === 'light' ? 'light' : 'dark');
    for (const next of ['light', 'dark', 'system']) {
      theme.set(next);
      assert.equal(mock.values.get(storageKey), next);
      assertTheme(theme, mock, next, next === 'light' ? 'light' : 'dark');
    }
    assert.equal(mock.values.get('cole-aventura-session-v1'), 'keep');
    const restored = createTheme(mock.host);
    assert.equal(restored.mode, 'system');
    theme.destroy();
    restored.destroy();
  }
});

test('tema: modo explícito ignora cambios hasta volver a sistema', () => {
  const mock = mockHost();
  const theme = createTheme(mock.host);
  theme.set('light');
  mock.change(true);
  assertTheme(theme, mock, 'light', 'light');
  theme.set('system');
  assertTheme(theme, mock, 'system', 'dark');
  theme.set('dark');
  mock.change(false);
  assertTheme(theme, mock, 'dark', 'dark');
  theme.set('system');
  assertTheme(theme, mock, 'system', 'light');
  theme.destroy();
});

test('tema: valores inválidos no alteran estado, DOM ni persistencia', () => {
  const invalid = ['', 'auto', 'DARK', '"dark"', '__proto__', null, undefined, 0, {}, ['dark']];
  for (const stored of invalid) {
    const mock = mockHost({ stored });
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, 'system', 'light');
    theme.set('dark');
    for (const value of invalid) {
      assert.doesNotThrow(() => theme.set(value));
      assertTheme(theme, mock, 'dark', 'dark');
      assert.equal(mock.values.get(storageKey), 'dark');
    }
    theme.destroy();
  }
});

test('tema: almacenamiento ausente o bloqueado no impide aplicar preferencias', () => {
  for (const failure of ['missing', 'getter', 'read', 'write']) {
    const mock = mockHost({ dark: true });
    if (failure === 'missing') delete mock.host.localStorage;
    if (failure === 'getter') Object.defineProperty(mock.host, 'localStorage', {
      get() { throw new Error('SecurityError'); },
    });
    if (failure === 'read') mock.host.localStorage.getItem = () => { throw new Error('blocked'); };
    if (failure === 'write') mock.host.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, 'system', 'dark');
    assert.doesNotThrow(() => theme.set('light'));
    assertTheme(theme, mock, 'light', 'light');
    theme.destroy();
  }
});

test('tema: APIs ausentes o matchMedia bloqueado permiten modo manual', () => {
  assert.doesNotThrow(() => createTheme().destroy());
  assert.doesNotThrow(() => createTheme({}).destroy());
  for (const matchMedia of [undefined, () => { throw new Error('blocked'); }]) {
    const mock = mockHost();
    mock.host.matchMedia = matchMedia;
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, 'system', 'light');
    theme.set('dark');
    assertTheme(theme, mock, 'dark', 'dark');
    theme.destroy();
  }
});

test('tema: destroy elimina listener moderno o legacy y es idempotente', () => {
  for (const legacy of [false, true]) {
    const mock = mockHost({ legacy });
    const theme = createTheme(mock.host);
    assert.equal(mock.listeners.size, 1);
    mock.change(true);
    assertTheme(theme, mock, 'system', 'dark');
    theme.destroy();
    theme.destroy();
    assert.equal(mock.listeners.size, 0);
    mock.change(false);
    assertTheme(theme, mock, 'system', 'dark');
  }
});

test('tema: suscripción o limpieza bloqueadas no interrumpen preferencias manuales', () => {
  for (const phase of ['subscribe', 'cleanup']) {
    const mock = mockHost();
    mock.host.matchMedia = () => ({
      matches: true,
      addEventListener() { if (phase === 'subscribe') throw new Error('blocked'); },
      removeEventListener() { if (phase === 'cleanup') throw new Error('blocked'); },
    });
    const theme = createTheme(mock.host);
    assertTheme(theme, mock, 'system', 'dark');
    theme.set('light');
    assertTheme(theme, mock, 'light', 'light');
    assert.doesNotThrow(() => theme.destroy());
    assert.doesNotThrow(() => theme.destroy());
  }
});
