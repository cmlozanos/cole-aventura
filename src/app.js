import { activities } from './catalog.js';
import { createSession } from './exercises.js';
import { shapeSvg } from './art.js';
import { renderLearningVisual } from './learning-visuals.js';
import { createAudio } from './audio.js';

const main = document.querySelector('#main');
const controls = document.querySelector('.controls');
const audio = createAudio(window);
const topics = activities[0].topics.map(topic => topic.id);
const shapes = { 'Círculo':'circle', 'Cuadrado':'square', 'Rectángulo':'rectangle', 'Triángulo':'triangle' };
const icons = {
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
  controls.innerHTML = control('pause',paused ? 'Continuar' : 'Pausar',paused ? 'play' : 'pause',paused)
    + control('voice',audio.voice ? 'Desactivar voz' : 'Activar voz','voice',audio.voice,!audio.voice)
    + control('effects',audio.effects ? 'Desactivar efectos de sonido' : 'Activar efectos de sonido','effects',audio.effects,!audio.effects);
}
function render() {
  renderControls();
  main.classList.toggle('paused',paused);
  main.innerHTML = `<h1>${esc(question.prompt)}</h1><section class="picture" aria-label="Dibujos del reto">${question.visual.kind === 'shape' && !assisted && !solved ? '<div class="shape-cue" aria-hidden="true">?</div>' : renderLearningVisual(question,assisted,solved)}</section><div class="answers" role="group" aria-label="Elige una respuesta">${question.choices.map(choice => `<button data-answer="${esc(choice)}" aria-label="${esc(choice)}" class="answer ${selected === choice ? (solved ? 'correct' : 'retry') : ''}" ${solved || paused ? 'disabled' : ''}>${question.visual.kind === 'shape' ? `<span class="choice-shape" style="transform:rotate(${question.angle}deg)">${shapeSvg(shapes[choice],true)}</span>` : esc(choice)}</button>`).join('')}</div><p class="feedback ${solved ? 'success' : ''}" role="status" aria-live="polite">${paused ? 'Pausa' : esc(feedback)}</p><p class="sr-only" id="audio-status" role="status"></p>`;
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
  const topic = pool[Math.floor(Math.random() * pool.length)];
  let candidate;
  let signature;
  for (let attempt=0; attempt<8; attempt++) {
    candidate = createSession(topic,1)[0];
    signature = JSON.stringify([candidate.prompt,candidate.visual]);
    if (signature !== previousSignature) break;
  }
  question = {...candidate, angle: Math.round(Math.random()*30)-15};
  previousTopic = topic; previousSignature = signature;
  solved = false; assisted = false; selected = null; feedback = ''; counted = [];
  document.documentElement.style.setProperty('--accent',`hsl(${Math.floor(Math.random()*360)} 62% 42%)`);
  render();
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
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'pause') {
    paused = !paused; cancelAdvance(); audio.stop(); render();
    controls.querySelector('[data-action="pause"]').focus();
    if (!paused) { if (solved) scheduleAdvance(); else audio.speak(question.prompt); }
    return;
  }
  if (action === 'voice') {
    audio.toggleVoice(); renderControls();
    controls.querySelector('[data-action="voice"]').focus();
    if (audio.voice && !paused) audio.speak(question.prompt);
    return;
  }
  if (action === 'effects') {
    audio.toggleEffects(); renderControls();
    controls.querySelector('[data-action="effects"]').focus();
    return;
  }
  if (paused || solved) return;
  if (target.hasAttribute('data-counter')) {
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
    render(); audio.effect(solved); audio.speak(solved ? question.explanation : question.hint);
    if (solved) { controls.querySelector('[data-action="pause"]').focus(); scheduleAdvance(); }
    else main.querySelector(`[data-answer="${CSS.escape(selected)}"]`)?.focus();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { paused = true; cancelAdvance(); audio.stop(); render(); }
});
window.addEventListener('pagehide', () => { cancelAdvance(); audio.stop(); });
nextQuestion();
if ('serviceWorker' in navigator) {
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; }
    // Finish the current question before replacing the app's cached version.
    updatePending = true;
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
