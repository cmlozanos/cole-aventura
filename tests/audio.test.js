import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';

function mockHost(state = 'running') {
  const contexts = [];
  const spoken = [];
  let cancelled = 0;
  const host = {
    speechSynthesis: {
      cancel() { cancelled += 1; },
      speak(utterance) { spoken.push(utterance); },
    },
    SpeechSynthesisUtterance: class {
      constructor(text) { this.text = text; }
    },
    AudioContext: class {
      constructor() {
        this.state = state;
        this.currentTime = 10;
        this.destination = {};
        this.oscillators = [];
        this.gains = [];
        this.closed = 0;
        this.resumed = 0;
        contexts.push(this);
      }
      createOscillator() {
        const oscillator = {
          frequency: { setValueAtTime(value, time) { oscillator.frequencyValue = value; oscillator.frequencyTime = time; } },
          connect(target) { this.target = target; },
          disconnect() { this.disconnected = true; },
          start(time) { this.started = time; },
          stops: [],
          stop(time) { this.stops.push(time); },
        };
        this.oscillators.push(oscillator);
        return oscillator;
      }
      createGain() {
        const gain = {
          values: [],
          gain: {
            setValueAtTime(value, time) { gain.values.push([value, time]); },
            exponentialRampToValueAtTime(value, time) { gain.values.push([value, time]); },
          },
          connect(target) { this.target = target; },
          disconnect() { this.disconnected = true; },
        };
        this.gains.push(gain);
        return gain;
      }
      resume() { this.resumed += 1; this.state = 'running'; return Promise.resolve(); }
      close() { this.closed += 1; this.state = 'closed'; return Promise.resolve(); }
    },
  };
  return { host, contexts, spoken, get cancelled() { return cancelled; } };
}

const flush = () => new Promise(resolve => setImmediate(resolve));

test('audio: comienza apagado, sin APIs ni almacenamiento al cargar', async () => {
  const mock = mockHost();
  Object.defineProperty(mock.host, 'localStorage', { get() { assert.fail('No debe persistir preferencias'); } });
  const audio = createAudio(mock.host);
  assert.equal(audio.voice, false);
  assert.equal(audio.effects, false);
  audio.speak('Hola');
  await audio.effect(true);
  assert.equal(mock.contexts.length, 0);
  assert.equal(mock.spoken.length, 0);
  assert.equal(mock.cancelled, 0);
  audio.toggleVoice();
  audio.toggleEffects();
  const fresh = createAudio(mock.host);
  assert.equal(fresh.voice, false);
  assert.equal(fresh.effects, false);
  assert.equal(mock.contexts.length, 0);
});

test('audio: toggles independientes; silenciar voz cancela sin tocar efectos', async () => {
  const mock = mockHost();
  const audio = createAudio(mock.host);
  assert.equal(audio.toggleVoice(), true);
  audio.speak('Hola');
  assert.equal(mock.spoken[0].text, 'Hola');
  assert.equal(audio.effects, false);
  assert.equal(mock.contexts.length, 0);
  assert.equal(audio.toggleEffects(), true);
  await audio.effect(true);
  const before = mock.cancelled;
  assert.equal(audio.toggleVoice(), false);
  assert.equal(mock.cancelled, before + 1);
  assert.equal(audio.effects, true);
  assert.equal(mock.contexts[0].closed, 0);
  audio.speak('No se escucha');
  assert.equal(mock.spoken.length, 1);
  audio.stop();
});

test('audio: contexto lazy, tonos breves distintos y rampas positivas conectadas', async () => {
  const mock = mockHost();
  const audio = createAudio(mock.host);
  audio.toggleEffects();
  assert.equal(mock.contexts.length, 0);
  await audio.effect(true);
  await audio.effect(false);
  assert.equal(mock.contexts.length, 1);
  const context = mock.contexts[0];
  assert.equal(context.oscillators.length, 2);
  assert.notEqual(context.oscillators[0].frequencyValue, context.oscillators[1].frequencyValue);
  context.oscillators.forEach((oscillator, index) => {
    const gain = context.gains[index];
    assert.equal(oscillator.target, gain);
    assert.equal(gain.target, context.destination);
    assert.equal(oscillator.started, context.currentTime);
    assert.ok(oscillator.stops[0] > oscillator.started);
    assert.ok(oscillator.stops[0] - oscillator.started < 0.5);
    assert.equal(gain.values.length, 3);
    assert.ok(gain.values.every(([value]) => value > 0 && value <= 0.1));
    assert.ok(gain.values[1][0] > gain.values[0][0]);
    assert.ok(gain.values[2][0] < gain.values[1][0]);
    assert.ok(gain.values[2][1] <= oscillator.stops[0]);
    oscillator.onended();
    assert.equal(oscillator.disconnected, true);
    assert.equal(gain.disconnected, true);
  });
  audio.stop();
});

test('audio: mute efectos detiene sonidos y cierra sin cancelar voz', async () => {
  const mock = mockHost();
  const audio = createAudio(mock.host);
  audio.toggleVoice();
  audio.toggleEffects();
  await audio.effect(true);
  const context = mock.contexts[0];
  assert.equal(audio.toggleEffects(), false);
  assert.equal(context.closed, 1);
  assert.equal(context.oscillators[0].stops.length, 2);
  assert.equal(context.oscillators[0].disconnected, true);
  assert.equal(mock.cancelled, 0);
  assert.equal(audio.voice, true);
  await audio.effect(false);
  assert.equal(context.oscillators.length, 1);
  assert.equal(mock.contexts.length, 1);
});

test('audio: resume suspended antes del tono', async () => {
  const mock = mockHost('suspended');
  const audio = createAudio(mock.host);
  audio.toggleEffects();
  await audio.effect(true);
  assert.equal(mock.contexts[0].resumed, 1);
  assert.equal(mock.contexts[0].oscillators.length, 1);
  audio.stop();
});

for (const action of ['mute', 'stop']) {
  test(`audio: ${action} invalida tonos pendientes incluso tras reactivar`, async () => {
    const mock = mockHost('suspended');
    let resume;
    mock.host.AudioContext.prototype.resume = () => new Promise(resolve => { resume = resolve; });
    const audio = createAudio(mock.host);
    audio.toggleEffects();
    const pending = audio.effect(true);
    const context = mock.contexts[0];
    if (action === 'mute') {
      audio.toggleEffects();
      audio.toggleEffects();
    } else audio.stop();
    resume();
    await pending;
    assert.equal(context.closed, 1);
    assert.equal(context.oscillators.length, 0);
    assert.equal(audio.effects, true);
  });
}

test('audio: stop conserva preferencias, es repetible y permite nuevo contexto', async () => {
  const mock = mockHost();
  const audio = createAudio(mock.host);
  audio.toggleVoice();
  audio.toggleEffects();
  await audio.effect(true);
  audio.stop();
  audio.stop();
  assert.equal(audio.voice, true);
  assert.equal(audio.effects, true);
  assert.equal(mock.cancelled, 2);
  assert.equal(mock.contexts[0].closed, 1);
  await audio.effect(false);
  audio.speak('De vuelta');
  assert.equal(mock.contexts.length, 2);
  assert.equal(mock.spoken.length, 1);
  audio.stop();
});

test('audio: APIs ausentes o que lanzan no rompen el contrato', async () => {
  for (const host of [{}, { speechSynthesis: {} }, {
    AudioContext: class { constructor() { throw new Error('No disponible'); } },
    SpeechSynthesisUtterance: class { constructor() { throw new Error('Sin voz'); } },
    speechSynthesis: { cancel() { throw new Error('Cancel'); }, speak() { throw new Error('Speak'); } },
  }]) {
    const audio = createAudio(host);
    audio.toggleVoice();
    audio.toggleEffects();
    assert.doesNotThrow(() => audio.speak('Hola'));
    await assert.doesNotReject(async () => audio.effect(true));
    assert.doesNotThrow(() => audio.stop());
    assert.equal(audio.toggleVoice(), false);
    assert.equal(audio.toggleEffects(), false);
  }
});

test('audio: rechazos de resume/close se capturan sin promesas no manejadas', async () => {
  const mock = mockHost('suspended');
  mock.host.AudioContext.prototype.resume = () => Promise.reject(new Error('Resume bloqueado'));
  mock.host.AudioContext.prototype.close = () => Promise.reject(new Error('Close fallido'));
  const audio = createAudio(mock.host);
  audio.toggleEffects();
  audio.effect(true);
  await flush();
  assert.equal(mock.contexts[0].oscillators.length, 0);
  audio.toggleEffects();
  await flush();
});

test('audio: un resume antiguo rechazado no cierra el nuevo contexto', async () => {
  const mock = mockHost('suspended');
  let reject;
  mock.host.AudioContext.prototype.resume = function () {
    if (mock.contexts.length === 1) return new Promise((resolve, fail) => { reject = fail; });
    this.state = 'running';
    return Promise.resolve();
  };
  const audio = createAudio(mock.host);
  audio.toggleEffects();
  const pending = audio.effect(true);
  audio.toggleEffects();
  audio.toggleEffects();
  await audio.effect(false);
  reject(new Error('Resume antiguo'));
  await pending;
  assert.equal(mock.contexts[1].closed, 0);
  assert.equal(mock.contexts[1].oscillators.length, 1);
  audio.stop();
});
