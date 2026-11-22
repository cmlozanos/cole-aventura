import { activities } from './catalog.js';

const storageKey = 'cole-aventura-state';
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
const initialState = () => ({
  version: 1,
  profiles: [{ id: 'explorer-1', name: 'Explorador 1' }],
  activeProfileId: 'explorer-1',
  progress: {},
});
const topicExists = (activity, topicId) => topicId === 'mixed' || activity.topics.some(({ id }) => id === topicId);

function validTotals(value, totalKey) {
  return isRecord(value) && isCount(value.sessions) && isCount(value.correct)
    && isCount(value[totalKey]) && value.correct <= value[totalKey]
    && value.sessions <= value[totalKey];
}

function sanitize(value) {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.profiles)) return initialState();
  const profiles = [];
  for (const profile of value.profiles) {
    if (!isRecord(profile) || typeof profile.id !== 'string' || !/^explorer-[1-9]\d*$/.test(profile.id)
      || !Number.isSafeInteger(Number(profile.id.slice(9))) || typeof profile.name !== 'string'
      || !profile.name.trim() || profiles.some(({ id }) => id === profile.id)) continue;
    profiles.push({ id: profile.id, name: profile.name.trim() });
    if (profiles.length === 6) break;
  }
  if (!profiles.length) return initialState();
  const state = {
    version: 1, profiles,
    activeProfileId: profiles.some(({ id }) => id === value.activeProfileId) ? value.activeProfileId : profiles[0].id,
    progress: {},
  };
  if (!isRecord(value.progress)) return state;
  for (const { id: profileId } of profiles) {
    if (!Object.prototype.hasOwnProperty.call(value.progress, profileId) || !isRecord(value.progress[profileId])) continue;
    const progress = {};
    for (const activity of activities) {
      const stored = value.progress[profileId][activity.id];
      if (!validTotals(stored, 'answered') || !isCount(stored.helped) || stored.helped > stored.answered) continue;
      const topics = {};
      if (isRecord(stored.topics)) {
        for (const topicId of ['mixed', ...activity.topics.map(({ id }) => id)]) {
          if (!Object.prototype.hasOwnProperty.call(stored.topics, topicId)) continue;
          const topic = stored.topics[topicId];
          if (validTotals(topic, 'total') && topic.sessions <= stored.sessions
            && topic.correct <= stored.correct && topic.total <= stored.answered) {
            topics[topicId] = { sessions: topic.sessions, correct: topic.correct, total: topic.total };
          }
        }
      }
      progress[activity.id] = { sessions: stored.sessions, answered: stored.answered, correct: stored.correct, helped: stored.helped, topics };
    }
    if (Object.keys(progress).length) state.progress[profileId] = progress;
  }
  return state;
}

// Resolve localStorage inside try: even reading its getter can throw SecurityError.
export function loadState(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    return sanitize(JSON.parse(target.getItem(storageKey)));
  } catch {
    return initialState();
  }
}

export function saveState(state, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    target.setItem(storageKey, JSON.stringify(sanitize(state)));
    return true;
  } catch {
    return false;
  }
}

export function recordSession(state, session) {
  if (!isRecord(session)) return state;
  const { profileId, activityId, topicId, correct, total, helped, results } = session;
  const activity = activities.find(({ id }) => id === activityId);
  if (!state.profiles.some(({ id }) => id === profileId) || !activity || !topicExists(activity, topicId)
    || !isCount(total) || total === 0 || !isCount(correct) || correct > total
    || !isCount(helped) || helped > total) return state;
  const totals = { [topicId]: { correct, total } };
  if (results !== undefined) {
    if (!Array.isArray(results) || results.length !== total) return state;
    let resultCorrect = 0;
    let resultHelped = 0;
    for (const entry of results) {
      if (!isRecord(entry) || !activity.topics.some(({ id }) => id === entry.topicId)
        || (topicId !== 'mixed' && entry.topicId !== topicId)
        || typeof entry.correct !== 'boolean' || typeof entry.helped !== 'boolean') return state;
      resultCorrect += Number(entry.correct);
      resultHelped += Number(entry.helped);
      if (topicId === 'mixed') {
        const topic = totals[entry.topicId] || { correct: 0, total: 0 };
        totals[entry.topicId] = { correct: topic.correct + Number(entry.correct), total: topic.total + 1 };
      }
    }
    if (resultCorrect !== correct || resultHelped !== helped) return state;
  }
  const profileProgress = state.progress[profileId] || {};
  const previous = profileProgress[activityId] || { sessions: 0, answered: 0, correct: 0, helped: 0, topics: {} };
  const topics = { ...previous.topics };
  for (const [id, totalsForTopic] of Object.entries(totals)) {
    const previousTopic = topics[id] || { sessions: 0, correct: 0, total: 0 };
    const topic = {
      sessions: previousTopic.sessions + 1,
      correct: previousTopic.correct + totalsForTopic.correct,
      total: previousTopic.total + totalsForTopic.total,
    };
    if (!Object.values(topic).every(isCount)) return state;
    topics[id] = topic;
  }
  const progress = {
    sessions: previous.sessions + 1, answered: previous.answered + total,
    correct: previous.correct + correct, helped: previous.helped + helped,
  };
  if (!Object.values(progress).every(isCount)) return state;
  return {
    ...state,
    progress: {
      ...state.progress,
      [profileId]: { ...profileProgress, [activityId]: { ...progress, topics } },
    },
  };
}

export function createProfile(state) {
  if (state.profiles.length >= 6) return state;
  let number = 1;
  while (state.profiles.some(({ id }) => id === `explorer-${number}`)) number += 1;
  const profile = { id: `explorer-${number}`, name: `Explorador ${number}` };
  return { ...state, profiles: [...state.profiles, profile], activeProfileId: profile.id };
}
