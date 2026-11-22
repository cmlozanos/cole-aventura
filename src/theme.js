const storageKey = 'cole-aventura-theme-v1';
const validMode = mode => mode === 'system' || mode === 'light' || mode === 'dark';

export function createTheme(host = globalThis) {
  const root = host.document?.documentElement;
  let mode = 'system';
  let resolved;
  let media;
  let removeListener;

  try {
    const stored = host.localStorage?.getItem(storageKey);
    if (validMode(stored)) mode = stored;
  } catch { /* A blocked storage getter must not interrupt play. */ }
  try {
    media = host.matchMedia?.('(prefers-color-scheme: dark)');
  } catch { /* Without system preferences, default to light. */ }

  function apply() {
    resolved = mode === 'system' ? (media?.matches ? 'dark' : 'light') : mode;
    if (root) {
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    }
  }

  function change() {
    if (mode === 'system') apply();
  }

  try {
    if (media?.addEventListener) {
      media.addEventListener('change', change);
      removeListener = () => media.removeEventListener('change', change);
    } else if (media?.addListener) {
      media.addListener(change);
      removeListener = () => media.removeListener(change);
    }
  } catch { /* Manual preferences still work if subscription is unavailable. */ }
  apply();

  return {
    get mode() { return mode; },
    get resolved() { return resolved; },
    set(next) {
      if (!validMode(next)) return;
      mode = next;
      apply();
      try {
        host.localStorage?.setItem(storageKey, mode);
      } catch { /* Keep the preference in memory when storage is blocked. */ }
    },
    destroy() {
      try { removeListener?.(); } catch { /* Cleanup must not interrupt play. */ }
      removeListener = null;
    },
  };
}
