import { courses, activities } from './catalog.js';
import { createSession } from './exercises.js';
import { loadState, saveState, recordSession, createProfile } from './storage.js';
import { shapeSvg } from './art.js';
import { renderLearningVisual, renderChoice } from './learning-visuals.js';

const main = document.querySelector('#main');
let state = loadState();
let advanceTimer = null;
let narration = true;
let speechUnlocked = false;
let speechGeneration = 0;
let view = 'home';
let session = null;
let installPrompt = null;
let storageWarning = false;
let activity = activities[0];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile = () => state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
const progress = () => state.progress[profile().id]?.[activity.id];
function persist() { storageWarning = !saveState(state); }
function button(text, action, kind = 'primary') { return `<button class="button ${kind}" data-action="${action}">${text}</button>`; }
function render(focus = false) {
  document.querySelector('#profile-label').textContent = profile().name;
  document.querySelector('.avatar').textContent = `E${state.profiles.indexOf(profile()) + 1}`;
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === view));
  main.innerHTML = view === 'family' ? familyView() : session ? exerciseView() : homeView();
  if (session?.counted) main.querySelectorAll('[data-counter]').forEach(counter => { const counted = session.counted.includes(counter.dataset.counter); counter.classList.toggle('counted',counted); counter.setAttribute('aria-pressed',String(counted)); });
  if (storageWarning) main.insertAdjacentHTML('afterbegin','<p class="storage-warning" role="status">El navegador no permite guardar. Puedes practicar, pero el progreso no se conservará al cerrar.</p>');
  if (focus) { main.focus(); window.scrollTo(0, 0); }
}
function homeView() {
  return `<section class="child-home"><p class="course-label">1.º de Primaria · Matemáticas</p><div class="welcome-mascot" aria-hidden="true">✦</div><h1>¡Vamos a descubrir!</h1><p class="home-invitation">Toca y aprende jugando.</p>${button('<span aria-hidden="true">▶</span> ¡Empezar!', 'mixed')}<div class="section-heading"><h2>O elige un juego</h2></div><div class="topic-grid">${activity.topics.map(t => `<button class="topic-card" data-topic="${t.id}"><span class="topic-symbol" aria-hidden="true">${esc(t.symbol)}</span><strong>${esc(t.title)}</strong></button>`).join('')}</div><p class="home-note">Retos cortitos. Tú puedes parar cuando quieras.</p></section>`;
}
function familyView() {
  const stats = progress();
  return `<section class="family-view"><p class="eyebrow">ACOMPAÑAR, NO COMPARAR</p><h1>Aprender juntos.</h1><p class="lead">Un espacio sencillo para practicar lo que llega del cole.</p><div class="family-grid"><article class="activity-card"><h2>${esc(profile().name)}</h2><p>El progreso solo se guarda en este navegador. No se sincroniza entre dispositivos.</p><div class="family-stats"><strong>${stats?.sessions || 0} aventuras</strong><span>${stats?.correct || 0} aciertos iniciales de ${stats?.answered || 0} preguntas</span><span>${stats?.helped || 0} preguntas con pista o reintento</span></div><h3>${esc(activity.subject)} · ${esc(courses.find(c => c.id === activity.courseId)?.label)}</h3><ul class="topic-progress">${activity.topics.map(t => { const p = stats?.topics?.[t.id]; return `<li><span>${esc(t.title)}</span><span>${p ? `${p.correct} / ${p.total} al primer intento` : 'Por descubrir'}</span></li>`; }).join('')}</ul><p class="small muted">Practicar no equivale a una evaluación escolar. El repaso se inspira en los temas indicados, no reproduce un examen.</p>${button('Elegir explorador','profiles','secondary')}</article><div class="family-side"><article class="note-card"><h2>Un ratito es suficiente</h2><p>Leed juntos si hace falta. Usad objetos, los dedos o la recta numérica. Celebrad el esfuerzo y parad cuando apetezca.</p><p>El botón «Escuchar» usa la voz del dispositivo. Puede necesitar conexión o no estar disponible.</p></article><article class="install-card"><h2>Llévalo a la pantalla de inicio</h2><p>En Android, abre el menú del navegador y elige «Instalar aplicación». En iPad o iPhone: Compartir → Añadir a pantalla de inicio.</p>${installPrompt ? button('Instalar aplicación','install') : ''}<p class="small muted">Para usarla sin conexión, ábrela primero con internet y espera a que aparezca «Lista sin conexión».</p></article></div></div></section>`;
}
function exerciseView() {
  if (session.finished) return summaryView();
  const q = session.questions[session.index];
  const title = activity.topics.find(t => t.id === q.topicId)?.title || 'Repaso';
  return `<section class="practice"><div class="practice-top"><button class="text-button" data-action="exit">← Mis juegos</button><span class="subject-badge">${esc(title)}</span><button class="text-button" data-action="narration" aria-pressed="${narration}">${narration ? 'Voz activada' : 'Voz desactivada'}</button></div><div class="practice-progress"><label for="session-progress">Reto ${session.index + 1} de ${session.questions.length}</label><progress id="session-progress" max="${session.questions.length}" value="${session.index + Number(session.solved)}"></progress></div><article class="question-card"><div class="question-toolbar"><button class="text-button" data-action="speak">Escuchar otra vez <span aria-hidden="true">◖))</span></button></div><h1>${esc(q.prompt)}</h1>${q.visual.kind !== 'shape' || session.showHint || session.solved ? renderLearningVisual(q,session.showHint,session.solved) : '<p class="shape-instruction">Escucha y busca la figura.</p>'}<div class="answers" role="group" aria-label="Toca tu respuesta">${q.choices.map(c => `<button class="answer ${session.selected === c ? (session.solved ? 'chosen' : 'try-again') : ''}" data-answer="${esc(c)}" aria-label="${esc(c)}" ${session.solved ? 'disabled' : ''}>${q.visual.kind === 'shape' ? shapeSvg(({'Círculo':'circle','Cuadrado':'square','Rectángulo':'rectangle','Triángulo':'triangle'})[c],true) : renderChoice(c,q)}</button>`).join('')}</div><div class="feedback ${session.feedback ? (session.solved ? 'success' : 'retry') : ''}" role="status" aria-live="polite">${session.feedback ? `<strong>${session.solved ? '¡Muy bien! ✦' : 'Prueba otra vez'}</strong><p>${esc(session.solved ? q.explanation : q.hint)}</p>` : `<p>${q.visual.kind === 'shape' ? 'Escucha el nombre y toca la figura.' : q.visual.kind === 'compare' ? 'Mira los dos grupos y elige.' : 'Toca las estrellas para contar. Después, elige.'}</p>`}</div>${session.showHint && !session.feedback ? `<p class="hint" role="status">${esc(q.hint)}</p>` : ''}<p id="speech-status" class="small muted" role="status"></p><div class="question-actions">${session.solved ? `<button class="text-button" data-action="pause" aria-pressed="${session.paused}">${session.paused ? 'Continuar' : 'Pausar'}</button>${button(session.index + 1 === session.questions.length ? 'Terminar →' : 'Siguiente →','next')}` : '<button class="button secondary" data-action="hint">Ayúdame</button>'}</div></article></section>`;
}
function summaryView() {
  return `<section class="summary"><div class="summary-star" aria-hidden="true">✦</div><h1>¡Lo has conseguido!</h1><p>Has descubierto ${session.questions.length} retos.</p><div class="completed-stars" aria-label="${session.questions.length} retos practicados">${'✦ '.repeat(session.questions.length)}</div><div class="summary-actions">${button('Jugar otra vez ▶','again')}${button('Mis juegos','home','secondary')}</div><p class="small muted">También puedes descansar.</p>${storageWarning ? '<p role="status">No se ha podido guardar el progreso.</p>' : ''}</section>`;
}
function start(topicId) {
  clearAdvance(); stopSpeech();
  view = 'home';
  session = {profileId:profile().id,topicId,questions:createSession(topicId,topicId === 'mixed' ? 6 : 5),index:0,selected:null,solved:false,feedback:false,showHint:false,attempts:0,correct:0,helped:0,results:[],paused:false,counted:[]};
  speechUnlocked = true;
  render(true);
  narrateQuestion();
}
function clearAdvance() { clearTimeout(advanceTimer); advanceTimer = null; }
function speak(text) {
  if (!narration || !speechUnlocked) return;
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { const status = document.querySelector('#speech-status'); if (status) status.textContent = 'Este navegador no tiene voz. Puedes jugar con los dibujos.'; return; }
  stopSpeech();
  const generation = speechGeneration;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES'; utterance.rate = .8;
  utterance.onerror = () => { if (generation !== speechGeneration) return; const status = document.querySelector('#speech-status'); if (status) status.textContent = 'La voz no está disponible. Mira los dibujos o pide ayuda.'; };
  window.speechSynthesis.speak(utterance);
}
function narrateQuestion() { if (session && !session.finished) speak(session.questions[session.index].prompt); }
function scheduleNext() {
  clearAdvance();
  if (!session?.solved || session.paused || document.hidden) return;
  advanceTimer = setTimeout(() => {
    if (narration && window.speechSynthesis?.speaking && Date.now() - session.feedbackAt < 20000) scheduleNext();
    else advance();
  }, 4500);
}
function advance() {
  if (!session?.solved || session.finished) return;
  clearAdvance(); stopSpeech();
  if (++session.index === session.questions.length) {
    session.finished = true;
    if (!storageWarning) state = loadState();
    state = recordSession(state,{profileId:session.profileId,activityId:activity.id,topicId:session.topicId,correct:session.correct,total:session.questions.length,helped:session.helped,results:session.results});
    persist();
    render(true); speak('¡Aventura completada! Muy buen trabajo.');
  } else {
    Object.assign(session,{selected:null,solved:false,feedback:false,showHint:false,attempts:0,paused:false,counted:[]});
    render(true); narrateQuestion();
  }
}
function stopSpeech() { speechGeneration++; if (window.speechSynthesis) window.speechSynthesis.cancel(); }
function openProfiles() {
  if (session && !session.finished && !window.confirm('¿Salir de esta aventura? Las preguntas sin terminar no se guardarán.')) return;
  clearAdvance(); stopSpeech();
  if (session) { session = null; render(); }
  const dialog = document.querySelector('#profile-dialog');
  document.querySelector('#profile-list').innerHTML = state.profiles.map(p => `<button class="profile-choice ${p.id === profile().id ? 'selected' : ''}" data-profile="${esc(p.id)}">${esc(p.name)} <span>${p.id === profile().id ? 'Actual' : 'Elegir'}</span></button>`).join('');
  document.querySelector('#add-profile').disabled = state.profiles.length >= 6;
  document.querySelector('#profile-message').textContent = state.profiles.length >= 6 ? 'Ya hay seis exploradores en este navegador.' : 'Sin nombres, sin cuentas, sin datos personales.';
  if (!dialog.open) dialog.showModal();
}
document.addEventListener('click', async event => {
  const target = event.target.closest('button, a.brand');
  if (!target) return;
  if (target.matches('a.brand') || target.dataset.nav) {
    event.preventDefault();
    if (session && !session.finished && !window.confirm('¿Salir de esta aventura? Las preguntas sin terminar no se guardarán.')) return;
    clearAdvance(); stopSpeech(); session = null; view = target.dataset.nav || 'home'; render(true); return;
  }
  if (target.dataset.topic) { start(target.dataset.topic); return; }
  if (target.hasAttribute('data-counter')) {
    const counted = target.getAttribute('aria-pressed') !== 'true';
    target.setAttribute('aria-pressed', String(counted));
    target.classList.toggle('counted',counted);
    session.counted = counted ? [...session.counted,target.dataset.counter] : session.counted.filter(id=>id!==target.dataset.counter);
    return;
  }
  if (target.hasAttribute('data-answer')) {
    if (!session || session.solved) return;
    session.selected = target.dataset.answer;
    const q = session.questions[session.index];
    session.attempts++; session.feedback = true;
    if (session.selected === q.answer) {
      session.solved = true;
      const independent = session.attempts === 1 && !session.showHint;
      session.correct += Number(independent); session.helped += Number(!independent);
      session.results.push({topicId:q.topicId,correct:independent,helped:!independent});
    } else session.showHint = true;
    render();
    speak(session.solved ? `¡Muy bien! ${q.explanation}` : `Prueba otra vez. ${q.hint}`);
    main.querySelector(session.solved ? '[data-action="pause"]' : `[data-answer="${CSS.escape(session.selected)}"]`)?.focus();
    if (session.solved) { session.feedbackAt = Date.now(); scheduleNext(); }
    return;
  }
  if (target.dataset.profile) { if (!storageWarning) state = loadState(); state.activeProfileId = target.dataset.profile; persist(); document.querySelector('#profile-dialog').close(); render(); return; }
  const action = target.dataset.action;
  if (action === 'profiles' || target.id === 'profile-button') { openProfiles(); return; }
  if (target.id === 'close-profiles') { document.querySelector('#profile-dialog').close(); return; }
  if (target.id === 'add-profile') { if (!storageWarning) state = loadState(); state = createProfile(state); persist(); openProfiles(); render(); return; }
  if (action === 'mixed') start('mixed');
  if (action === 'hint') { session.showHint = true; render(); speak(session.questions[session.index].hint); main.querySelector('[data-action="hint"]')?.focus(); }
  if (action === 'next') advance();
  if (action === 'pause' && session?.solved) { session.paused = !session.paused; clearAdvance(); render(); main.querySelector('[data-action="pause"]')?.focus(); if (!session.paused) scheduleNext(); }
  if (action === 'narration') { narration = !narration; stopSpeech(); render(); if (narration) narrateQuestion(); }
  if (action === 'again') start(session.topicId);
  if (action === 'exit' || action === 'home') {
    if (!session?.finished && !window.confirm('¿Salir de esta aventura? Las preguntas sin terminar no se guardarán.')) return;
    clearAdvance(); stopSpeech(); session = null; render(true);
  }
  if (action === 'speak') { speechUnlocked = true; narration = true; narrateQuestion(); }
  if (action === 'install' && installPrompt) { await installPrompt.prompt(); installPrompt = null; render(); }
});
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; if (view === 'family') render(); });
window.addEventListener('storage', event => {
  if (event.key === 'cole-aventura-state' && !session && !document.querySelector('#profile-dialog').open) { state = loadState(); render(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearAdvance(); stopSpeech(); if (session?.solved && !session.finished) { session.paused = true; render(); } } });
window.addEventListener('pagehide',() => { clearAdvance(); stopSpeech(); });
render();
if ('serviceWorker' in navigator) {
  let wasControlled = Boolean(navigator.serviceWorker.controller);
  let updatePending = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!wasControlled) { wasControlled = true; return; }
    if (session && !session.finished) updatePending = true;
    else window.location.reload();
  });
  document.addEventListener('click', event => { if (updatePending && event.target.closest('[data-action="home"], [data-nav], a.brand') && !session) window.location.reload(); });
  navigator.serviceWorker.register('./sw.js').then(async () => { await navigator.serviceWorker.ready; document.querySelector('#connection-status').textContent = 'Lista sin conexión'; }).catch(() => { document.querySelector('#connection-status').textContent = 'Modo sin conexión no disponible'; });
}
