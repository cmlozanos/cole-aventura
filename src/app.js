import { createTheme } from './theme.js';
import { createStory, renderWord } from './reading.js';
import { activities } from './catalog.js';
import { createSession } from './exercises.js';
import { shapeSvg, activityBadge } from './art.js';
import { renderLearningVisual } from './learning-visuals.js';
import { createAudio } from './audio.js';
import { createMotion } from './motion.js';
import { createScoreSession } from './score-session.js';
import { createParentChallenge, verifyParentAnswer } from './parent-gate.js';

const main = document.querySelector('#main');
const controls = document.querySelector('.controls');
const audio = createAudio(window);
const motion = createMotion(window);
const theme = createTheme(window);
let story = null;
let storyPage = 0;
let storyQuestion = false;
const scores = createScoreSession(window);
const options = document.querySelector('#options');
const transition = document.querySelector('#transition');
let parentChallenge = null;
let parentUnlocked = false;
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
  controls.innerHTML = `<select class="theme-switch" aria-label="Aspecto" title="Día, noche o sistema">${[['system','◐','Sistema'],['light','☀','Día'],['dark','☾','Noche']].map(([mode,symbol,label])=>`<option value="${mode}" aria-label="${label}" ${theme.mode === mode ? 'selected' : ''}>${symbol}</option>`).join('')}</select>` + control('home','Inicio','home',scene === 'home')
    + control('options','Para adultos','settings',options.open);
}
function render() {
  renderControls();
  main.classList.toggle('paused',paused && scene !== 'home');
  main.classList.toggle('home-screen',scene === 'home');
  main.classList.toggle('reading-screen',scene === 'story');
  if (scene === 'home') {
    main.innerHTML = `<div class="home-heading"><span class="home-mascot" aria-hidden="true">✦</span><h1>¡Elige tu aventura!</h1></div><div class="game-grid"><button class="game-tile random-tile" data-game="mixed"><span aria-hidden="true">⤨</span><strong>¡Sorpresa!</strong></button><button class="game-tile" data-game="stories"><span aria-hidden="true">▤</span><strong>Cuentos</strong></button>${activities[0].topics.map(topic=>`<button class="game-tile" data-game="${topic.id}"><span aria-hidden="true">${esc(topic.symbol)}</span><strong>${esc(topic.title)}</strong></button>`).join('')}</div>`;
    return;
  }
  if (scene === 'story') { renderStory(); return; }
  main.innerHTML = `<h1 class="exercise-heading">${activityBadge()}<span>${esc(question.prompt)}</span></h1><section class="picture" aria-label="Dibujos del reto">${question.visual.kind === 'shape' && !assisted && !solved ? '<div class="shape-cue" aria-hidden="true"></div>' : renderLearningVisual(question,assisted,solved)}</section><div class="answers" role="group" aria-label="Elige una respuesta">${question.choices.map(choice => `<button data-answer="${esc(choice)}" aria-label="${esc(choice)}" class="answer ${selected === choice ? (solved ? 'correct' : 'retry') : ''}" ${solved || paused ? 'disabled' : ''}>${question.visual.kind === 'shape' ? `<span class="choice-shape" style="transform:rotate(${question.angle}deg)">${shapeSvg(shapes[choice],true)}</span>` : esc(choice)}</button>`).join('')}</div><div class="celebration" aria-hidden="true">${solved ? '<i>★</i>'.repeat(7) : ''}</div><p class="feedback ${solved ? 'success' : ''}" role="status" aria-live="polite">${esc(feedback)}</p><p class="sr-only" id="audio-status" role="status"></p>`;
  main.querySelectorAll('[data-counter]').forEach(counter => {
    const active = counted.includes(counter.dataset.counter);
    counter.setAttribute('aria-pressed',String(active));
    counter.classList.toggle('counted',active);
    counter.disabled = paused;
  });
}
function cancelAdvance() { clearTimeout(timer); timer = null; }
function nextQuestion() {
  closeTransition();
  cancelAdvance(); audio.stop(); generation++;
  if (updatePending) { location.reload(); return; }
  if (topicMode === 'stories') { startStory(); return; }
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
  if (!paused) audio.speak(question.prompt);
}
function scheduleAdvance() {
  cancelAdvance();
  if (!solved || paused || document.hidden) return;
  const token = generation;
  timer = setTimeout(() => {
    if (token === generation && !paused && !document.hidden) nextQuestion();
  },650);
}
function showHome() {
  closeTransition(); cancelAdvance(); audio.stop(); motion.stop(); generation++;
  scene = 'home'; paused = false;
  if (updatePending) { location.reload(); return; }
  render(); motion.enter(main); main.focus({preventScroll:true});
}
function startGame(mode) {
  topicMode = mode; scene = mode === 'stories' ? 'story' : 'game'; paused = document.hidden;
  scores.touch(); nextQuestion();
}
function startStory() {
  audio.stop(); generation++; questionId = `${runId}-${++questionNumber}`;
  const previous = story?.id;
  for (let attempt=0;attempt<6;attempt++) { story=createStory(); if (story.id !== previous) break; }
  for (let i=story.question.choices.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [story.question.choices[i],story.question.choices[j]]=[story.question.choices[j],story.question.choices[i]]; }
  storyPage = 0; storyQuestion = false;
  scene = 'story'; solved = false; assisted = false; selected = null; feedback = '';
  render(); motion.enter(main); main.focus({preventScroll:true});
}
function renderStory() {
  const content = storyQuestion
    ? `<h1 class="exercise-heading">${activityBadge(true)}<span>${esc(story.question.prompt)}</span></h1><div class="story-answers">${story.question.choices.map(choice=>`<button class="answer" data-story-answer="${esc(choice)}" ${paused || solved ? 'disabled' : ''}>${esc(choice)}</button>`).join('')}</div>`
    : `<h1 class="exercise-heading">${activityBadge(true)}<span>${esc(story.title)}</span></h1><div class="story-page" role="group" aria-label="Página ${storyPage+1} de ${story.pages.length}">${story.pages[storyPage].map((token,index)=>renderWord(token,index)).join(' ')}</div>`;
  main.innerHTML = `<div class="story-scene" aria-hidden="true">${story.symbol}</div>${content}<div class="story-footer"><span class="page-dots" aria-label="${storyQuestion ? 'Pregunta' : `Página ${storyPage+1} de ${story.pages.length}`}">${story.pages.map((_,i)=>`<i class="${i === storyPage && !storyQuestion ? 'active' : ''}"></i>`).join('')}</span>${!storyQuestion ? `<button data-action="story-next" aria-label="Siguiente página" ${paused ? 'disabled' : ''}>→</button>` : ''}</div><p class="feedback" role="status">${esc(feedback)}</p>`;
  main.querySelectorAll('[data-word]').forEach(node=>{node.disabled=paused;});
}
function closeTransition() {
  if (transition.open) transition.close();
  main.removeAttribute('aria-busy');
}
function showTransition() {
  motion.stop();
  const points = scores.read().points;
  transition.querySelector('.transition-score').textContent = `★ ${points}`;
  transition.querySelector('.transition-score').setAttribute('aria-label',`${points} puntos de esta sesión`);
  transition.classList.toggle('no-motion',!motion.enabled);
  main.setAttribute('aria-busy','true');
  if (!transition.open) transition.showModal();
  transition.querySelector('.transition-card').focus({preventScroll:true});
}
function renderParentOptions() {
  options.innerHTML = `<div class="dialog-heading"><h2 id="options-title">Adultos</h2><button class="close-dialog" data-action="close-options" aria-label="Cerrar">×</button></div><div class="manual-actions"><button data-action="voice" aria-pressed="${audio.voice}">${icon('voice',!audio.voice)} Voz</button><button data-action="effects" aria-pressed="${audio.effects}">${icon('effects',!audio.effects)} Sonidos</button><button data-action="motion" aria-pressed="${motion.enabled}">✦ Animaciones</button><button data-action="new-question" ${scene === 'home' ? 'disabled' : ''}>↻ Otro reto</button><button data-action="reset-score">☆ Reiniciar puntos</button></div>`;
}
function openOptions() {
  if (transition.open) return;
  if (scene !== 'home') { paused = true; cancelAdvance(); audio.stop(); motion.stop(); render(); }
  parentUnlocked = false;
  parentChallenge = createParentChallenge(Math.random,parentChallenge);
  options.innerHTML = `<div class="dialog-heading"><h2 id="options-title">Adultos</h2><button class="close-dialog" data-action="close-options" aria-label="Cerrar">×</button></div><form id="parent-form" autocomplete="off"><label for="parent-answer" class="parent-challenge">${parentChallenge.a} × ${parentChallenge.b} = ?</label><input id="parent-answer" name="answer" inputmode="numeric" pattern="[0-9]+" aria-label="Resultado de la multiplicación" required><button class="gate-submit" type="submit" aria-label="Entrar">→</button><span id="parent-error" role="status"></span></form>`;
  options.showModal(); renderControls();
}
options.addEventListener('submit',event=>{
  event.preventDefault();
  if (event.target.id !== 'parent-form') return;
  if (!verifyParentAnswer(parentChallenge,options.querySelector('input').value)) {
    options.querySelector('#parent-error').textContent='Inténtalo de nuevo';
    options.querySelector('input').value=''; options.querySelector('input').focus(); return;
  }
  parentUnlocked = true; renderParentOptions();
  options.querySelector('[data-action="voice"]').focus();
});
transition.addEventListener('cancel',event=>event.preventDefault());
transition.addEventListener('keydown',event=>{ if (['Escape','Tab','Enter',' '].includes(event.key)) event.preventDefault(); });
controls.addEventListener('change',event=>{
  if (event.target.matches('.theme-switch') && !transition.open) theme.set(event.target.value);
});
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (transition.open) return;
  const action = target.dataset.action;
  if (['voice','effects','motion','reset-score','new-question'].includes(action) && (!parentUnlocked || !options.open)) return;
  if (target.dataset.game) { startGame(target.dataset.game); return; }
  if (action === 'home') { showHome(); return; }
  if (action === 'options') { openOptions(); return; }
  if (action === 'close-options') { options.close(); renderControls(); return; }
  if (action === 'motion') { motion.toggle(); target.setAttribute('aria-pressed',String(motion.enabled)); return; }
  if (action === 'reset-score') {
    if (target.dataset.confirm === 'true') { scores.reset(); renderControls(); target.dataset.confirm='false'; target.textContent='☆ Reiniciar puntos'; }
    else { target.dataset.confirm='true'; target.textContent='¿Confirmar reinicio?'; }
    return;
  }
  if (action === 'new-question') { options.dataset.next = 'true'; options.close(); return; }
  if (action === 'voice') {
    audio.toggleVoice(); target.setAttribute('aria-pressed',String(audio.voice)); target.innerHTML = `${icon('voice',!audio.voice)} Voz`;
    if (audio.voice && !paused && scene === 'game') audio.speak(question.prompt);
    return;
  }
  if (action === 'effects') {
    audio.toggleEffects(); target.setAttribute('aria-pressed',String(audio.effects)); target.innerHTML = `${icon('effects',!audio.effects)} Sonidos`;
    return;
  }
  if (paused || solved || scene === 'home') return;
  if (scene === 'story') {
    if (target.hasAttribute('data-word')) {
      scores.touch(); renderControls();
      main.querySelectorAll('[data-word]').forEach(node=>node.classList.remove('speaking-word'));
      target.classList.add('speaking-word');
      const token = story.pages[storyPage][Number(target.dataset.word)];
      if (audio.voice) audio.speak(token.text.replace(/[.,!?¿¡]/g,''));
      else { feedback='🔇'; main.querySelector('.feedback').textContent=feedback; }
    }
    if (action === 'story-next') {
      audio.stop(); scores.touch(); feedback='';
      if (storyPage < story.pages.length-1) storyPage++; else storyQuestion=true;
      render(); motion.enter(main);
    }
    if (target.hasAttribute('data-story-answer')) {
      solved = target.dataset.storyAnswer === story.question.answer;
      feedback = solved ? '✓' : '↻';
      if (solved) { scores.award(questionId); render(); showTransition(); scheduleAdvance(); }
      else { scores.touch(); render(); }
    }
    return;
  }
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
    feedback = solved ? '✓' : '↻';
    if (solved) scores.award(questionId); else scores.touch();
    render(); motion.feedback(main,solved); audio.effect(solved); audio.speak(solved ? '¡Bien!' : question.hint);
    if (solved) { showTransition(); scheduleAdvance(); }
    else main.querySelector(`[data-answer="${CSS.escape(selected)}"]`)?.focus();
  }
});
options.addEventListener('close',()=>{
  if (options.open) return;
  const requestNext = options.dataset.next === 'true'; delete options.dataset.next;
  parentUnlocked = false; options.innerHTML='';
  if (requestNext) { paused = document.hidden; scores.touch(); nextQuestion(); return; }
  if (scene !== 'home' && !document.hidden) { paused = false; scores.touch(); render(); if (solved) scheduleAdvance(); else if (scene === 'game') audio.speak(question.prompt); }
  else renderControls();
  controls.querySelector('[data-action="options"]').focus();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (scene !== 'home' && !transition.open) paused = true; cancelAdvance(); audio.stop(); motion.stop(); if (!transition.open) render(); } else {
    if (scene !== 'home' && !options.open) { paused = false; render(); if (solved) scheduleAdvance(); } else renderControls();
  }
});
window.addEventListener('pageshow',event=>{
  if (event.persisted && !document.hidden && scene !== 'home' && !options.open) { paused = false; render(); if (solved) scheduleAdvance(); }
});
window.addEventListener('pagehide', () => { cancelAdvance(); audio.stop(); motion.stop(); });
window.addEventListener('storage', event => { if (event.key === 'cole-aventura-session-v1') renderControls(); });
startGame('mixed');
if ('serviceWorker' in navigator) {
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; }
    // Finish the current question before replacing the app's cached version.
    updatePending = true;
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
