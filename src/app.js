import { activities } from './catalog.js';
import { createSession } from './exercises.js';
import { shapeSvg } from './art.js';
import { renderLearningVisual } from './learning-visuals.js';
import { createAudio } from './audio.js';
import { createMotion } from './motion.js';
import { createScoreSession } from './score-session.js';

const main = document.querySelector('#main');
const controls = document.querySelector('.controls');
const audio = createAudio(window);
const motion = createMotion(window);
const scores = createScoreSession(window);
const options = document.querySelector('#options');
let scene = 'home';
let topicMode = 'mixed';
let questionId = '';
let questionNumber = 0;
const runId = window.crypto?.randomUUID?.().slice(0,12) || String(Date.now());
const topics = activities[0].topics.map(topic => topic.id);
const shapes = { 'Círculo':'circle', 'Cuadrado':'square', 'Rectángulo':'rectangle', 'Triángulo':'triangle' };
const icons = {
  home:'<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  pause:'<path d="M9 5v14M15 5v14"/>',
  play:'<path d="m9 5 11 7-11 7Z"/>',
  voice:'<path d="M5 10v4h4l5 4V6l-5 4Z"/><path d="M18 8q5 4 0 8"/>',
  effects:'<path d="M9 17V5l10-2v12M9 8l10-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="16" cy="16" rx="3" ry="2"/>'
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let question;
let previousSignature = '';
let previousTopic = '';
let solved = false;
let assisted = false;
let paused = false;
let selected = null;
let timer = null;
let generation = 0;
let feedback = '';
let counted = [];
let updatePending = false;

function icon(name, muted = false) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}${muted ? '<path class="mute-slash" d="M3 3l18 18"/>' : ''}</svg>`;
}
function control(action, label, glyph, pressed, muted = false) {
  return `<button data-action="${action}" aria-label="${label}" title="${label}" aria-pressed="${pressed}">${icon(glyph,muted)}</button>`;
}
function renderControls() {
  const snapshot = scores.read();
  document.querySelector('#score strong').textContent = snapshot.points;
  document.querySelector('#score').setAttribute('aria-label',`${snapshot.points} puntos de esta sesión`);
  controls.innerHTML = control('home','Inicio','home',scene === 'home') + control('pause',paused ? 'Continuar' : 'Pausar',paused ? 'play' : 'pause',paused)
    + control('voice',audio.voice ? 'Desactivar voz' : 'Activar voz','voice',audio.voice,!audio.voice)
    + control('effects',audio.effects ? 'Desactivar efectos de sonido' : 'Activar efectos de sonido','effects',audio.effects,!audio.effects)
    + control('options','Opciones','settings',options.open);
  controls.querySelector('[data-action="pause"]').disabled = scene === 'home';
}
function render() {
  renderControls();
  main.classList.toggle('paused',paused && scene === 'game');
  main.classList.toggle('home-screen',scene === 'home');
  if (scene === 'home') {
    main.innerHTML = `<div class="home-heading"><span class="home-mascot" aria-hidden="true">✦</span><h1>¡Elige tu aventura!</h1><p>1.º de Primaria · Todo disponible</p></div><div class="game-grid"><button class="game-tile random-tile" data-game="mixed"><span aria-hidden="true">⤨</span><strong>¡Sorpresa!</strong></button>${activities[0].topics.map(topic=>`<button class="game-tile" data-game="${topic.id}"><span aria-hidden="true">${esc(topic.symbol)}</span><strong>${esc(topic.title)}</strong></button>`).join('')}</div>`;
    return;
  }
  main.innerHTML = `<h1>${esc(question.prompt)}</h1><section class="picture" aria-label="Dibujos del reto">${question.visual.kind === 'shape' && !assisted && !solved ? '<div class="shape-cue" aria-hidden="true">?</div>' : renderLearningVisual(question,assisted,solved)}</section><div class="answers" role="group" aria-label="Elige una respuesta">${question.choices.map(choice => `<button data-answer="${esc(choice)}" aria-label="${esc(choice)}" class="answer ${selected === choice ? (solved ? 'correct' : 'retry') : ''}" ${solved || paused ? 'disabled' : ''}>${question.visual.kind === 'shape' ? `<span class="choice-shape" style="transform:rotate(${question.angle}deg)">${shapeSvg(shapes[choice],true)}</span>` : esc(choice)}</button>`).join('')}</div><div class="celebration" aria-hidden="true">${solved ? '<i>★</i>'.repeat(7) : ''}</div><p class="feedback ${solved ? 'success' : ''}" role="status" aria-live="polite">${paused ? 'Pausa' : esc(feedback)}</p><p class="sr-only" id="audio-status" role="status"></p>`;
  main.querySelectorAll('[data-counter]').forEach(counter => {
    const active = counted.includes(counter.dataset.counter);
    counter.setAttribute('aria-pressed',String(active));
    counter.classList.toggle('counted',active);
    counter.disabled = paused;
  });
}
function cancelAdvance() { clearTimeout(timer); timer = null; }
function nextQuestion() {
  cancelAdvance(); audio.stop(); generation++;
  if (updatePending) { location.reload(); return; }
  const pool = topics.filter(topic => topic !== previousTopic);
  const topic = topicMode === 'mixed' ? pool[Math.floor(Math.random() * pool.length)] : topicMode;
  let candidate;
  let signature;
  for (let attempt=0; attempt<8; attempt++) {
    candidate = createSession(topic,1)[0];
    signature = JSON.stringify([candidate.prompt,candidate.visual]);
    if (signature !== previousSignature) break;
  }
  questionId = `${runId}-${++questionNumber}`;
  question = {...candidate, angle: Math.round(Math.random()*30)-15};
  previousTopic = topic; previousSignature = signature;
  solved = false; assisted = false; selected = null; feedback = ''; counted = [];
  document.documentElement.style.setProperty('--accent',`hsl(${Math.floor(Math.random()*360)} 62% 42%)`);
  render(); motion.enter(main);
  main.focus({preventScroll:true});
  audio.speak(question.prompt);
}
function scheduleAdvance() {
  cancelAdvance();
  if (!solved || paused || document.hidden) return;
  const token = generation;
  timer = setTimeout(() => {
    if (token === generation && !paused && !document.hidden) nextQuestion();
  },3500);
}
function showHome() {
  cancelAdvance(); audio.stop(); motion.stop(); generation++;
  scene = 'home'; paused = false;
  if (updatePending) { location.reload(); return; }
  render(); motion.enter(main); main.focus({preventScroll:true});
}
function startGame(mode) {
  topicMode = mode; scene = 'game'; paused = false;
  scores.touch(); nextQuestion();
}
function openOptions() {
  if (scene === 'game') { paused = true; cancelAdvance(); audio.stop(); motion.stop(); render(); }
  options.innerHTML = `<h2 id="options-title">Opciones</h2><p>1 punto por reto resuelto. Sin perder puntos por pedir ayuda.</p><div class="manual-actions"><button data-action="continue">▶ Continuar</button><button data-action="new-question" ${scene === 'home' ? 'disabled' : ''}>↻ Otro reto</button><button data-action="reset-score">☆ Reiniciar puntos</button><button data-action="motion" aria-pressed="${motion.enabled}">${motion.enabled ? 'Desactivar' : 'Activar'} animaciones</button><button data-action="close-options">Cerrar</button></div><p class="options-note">Tras más de una hora sin jugar, los puntos vuelven a cero al regresar.</p>`;
  options.showModal(); renderControls();
}
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;
  if (target.dataset.game) { startGame(target.dataset.game); return; }
  if (action === 'home') { showHome(); return; }
  if (action === 'options') { openOptions(); return; }
  if (action === 'close-options') { options.close(); renderControls(); return; }
  if (action === 'motion') { motion.toggle(); target.textContent = `${motion.enabled ? 'Desactivar' : 'Activar'} animaciones`; target.setAttribute('aria-pressed',String(motion.enabled)); return; }
  if (action === 'reset-score') { if (window.confirm('¿Reiniciar a cero los puntos de esta sesión?')) { scores.reset(); renderControls(); } return; }
  if (action === 'new-question') { options.close(); paused = false; scores.touch(); nextQuestion(); return; }
  if (action === 'continue') { options.close(); if (scene === 'home') startGame('mixed'); else { paused = false; scores.touch(); render(); if (solved) scheduleAdvance(); else audio.speak(question.prompt); } return; }
  if (action === 'pause') {
    paused = !paused; cancelAdvance(); audio.stop(); motion.stop(); render();
    controls.querySelector('[data-action="pause"]').focus();
    if (!paused) { scores.touch(); if (solved) scheduleAdvance(); else audio.speak(question.prompt); }
    return;
  }
  if (action === 'voice') {
    audio.toggleVoice(); renderControls();
    controls.querySelector('[data-action="voice"]').focus();
    if (audio.voice && !paused && scene === 'game') audio.speak(question.prompt);
    return;
  }
  if (action === 'effects') {
    audio.toggleEffects(); renderControls();
    controls.querySelector('[data-action="effects"]').focus();
    return;
  }
  if (scene !== 'game' || paused || solved) return;
  if (target.hasAttribute('data-counter')) {
    scores.touch(); renderControls();
    const active = !counted.includes(target.dataset.counter);
    counted = active ? [...counted,target.dataset.counter] : counted.filter(id=>id !== target.dataset.counter);
    target.setAttribute('aria-pressed',String(active)); target.classList.toggle('counted',active);
    return;
  }
  if (target.hasAttribute('data-answer')) {
    selected = target.dataset.answer;
    solved = selected === question.answer;
    assisted = assisted || !solved;
    feedback = solved ? `✓ ${question.explanation}` : `↻ ${question.hint}`;
    if (solved) scores.award(questionId); else scores.touch();
    render(); motion.feedback(main,solved); audio.effect(solved); audio.speak(solved ? question.explanation : question.hint);
    if (solved) { controls.querySelector('[data-action="pause"]').focus(); scheduleAdvance(); }
    else main.querySelector(`[data-answer="${CSS.escape(selected)}"]`)?.focus();
  }
});
options.addEventListener('close',renderControls);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (scene === 'game') paused = true; cancelAdvance(); audio.stop(); motion.stop(); render(); } else { renderControls(); }
});
window.addEventListener('pagehide', () => { cancelAdvance(); audio.stop(); motion.stop(); });
window.addEventListener('storage', event => { if (event.key === 'cole-aventura-session-v1') renderControls(); });
render(); motion.enter(main);
if ('serviceWorker' in navigator) {
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; }
    // Finish the current question before replacing the app's cached version.
    updatePending = true;
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
