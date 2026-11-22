const storageKey = 'cole-aventura-session-v1';
const inactivityLimit = 3600000;
const isCount = value => Number.isSafeInteger(value) && value >= 0;
const isId = value => typeof value === 'string' && value.length > 0;
let nextId = 0;

function parseSession(raw, time) {
  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || !isId(value.id) || !isCount(value.points)
      || !isCount(value.lastActive) || value.lastActive > time
      || !Array.isArray(value.awardedIds) || value.awardedIds.length > 128
      || !value.awardedIds.every(isId) || new Set(value.awardedIds).size !== value.awardedIds.length
      || value.awardedIds.length > value.points) return null;
    return { id: value.id, points: value.points, lastActive: value.lastActive, awardedIds: [...value.awardedIds] };
  } catch {
    return null;
  }
}

export function createScoreSession(host = globalThis, now = Date.now) {
  let session;
  let persistent = false;
  let preferCookie = false;

  function fresh(time) {
    let id;
    try { id = host.crypto?.randomUUID(); } catch { /* Fall back when crypto is unavailable. */ }
    return { id: id || `${time}-${++nextId}`, points: 0, lastActive: time, awardedIds: [] };
  }

  function readCookie() {
    try {
      const cookie = host.document.cookie.split(';').map(part => part.trim())
        .find(part => part.startsWith(`${storageKey}=`));
      return cookie ? decodeURIComponent(cookie.slice(storageKey.length + 1)) : null;
    } catch {
      return null;
    }
  }

  function load(time) {
    if (!preferCookie) {
      try {
        const stored = parseSession(host.localStorage.getItem(storageKey), time);
        if (stored) return stored;
      } catch { /* Reading the localStorage getter can also throw. */ }
    }
    return parseSession(readCookie(), time);
  }

  function save() {
    const raw = JSON.stringify(session);
    try {
      host.localStorage.setItem(storageKey, raw);
      if (host.localStorage.getItem(storageKey) === raw) {
        persistent = true;
        preferCookie = false;
        return;
      }
    } catch { /* Try a scoped cookie before falling back to memory. */ }
    preferCookie = true;
    persistent = false;
    try {
      const pathname = host.location?.pathname || '/';
      const path = pathname.slice(0, pathname.lastIndexOf('/') + 1) || '/';
      const secure = host.location?.protocol === 'https:' ? '; Secure' : '';
      host.document.cookie = `${storageKey}=${encodeURIComponent(raw)}; Path=${path}; SameSite=Lax; Max-Age=604800${secure}`;
      persistent = readCookie() === raw;
    } catch { /* A blocked or silently rejected cookie leaves the session in memory. */ }
  }

  function reconcile(time) {
    const stored = load(time);
    if (stored) {
      session = stored;
      persistent = true;
    }
    if (!session || session.lastActive > time || time - session.lastActive > inactivityLimit) {
      session = fresh(time);
      save();
    }
  }

  function snapshot() {
    const { id, points, lastActive } = session;
    return { id, points, lastActive, persistent };
  }

  function read() {
    reconcile(now());
    return snapshot();
  }

  function touch() {
    const time = now();
    reconcile(time);
    session.lastActive = time;
    save();
    return snapshot();
  }

  function award(questionId) {
    const time = now();
    reconcile(time);
    session.lastActive = time;
    if (isId(questionId) && !session.awardedIds.includes(questionId) && session.points < Number.MAX_SAFE_INTEGER) {
      session.points += 1;
      session.awardedIds = [...session.awardedIds, questionId].slice(-128);
    }
    save();
    return snapshot();
  }

  function reset() {
    session = fresh(now());
    save();
    return snapshot();
  }

  return { read, touch, award, reset };
}
