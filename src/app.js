import { courses, activities } from './catalog.js';
import { createSession } from './exercises.js';
import { loadState, saveState, recordSession, createProfile } from './storage.js';
import { garden, shapeSvg } from './art.js';

const main = document.querySelector('#main');
let state = loadState();
let courseId = 'primaria-1';
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
  if (storageWarning) main.insertAdjacentHTML('afterbegin','<p class="storage-warning" role="status">El navegador no permite guardar. Puedes practicar, pero el progreso no se conservará al cerrar.</p>');
  if (focus) { main.focus(); window.scrollTo(0, 0); }
}
function homeView() {
  const stats = progress();
  const available = activities.filter(a => a.courseId === courseId);
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="tiny-star">✦</span> EL COLE, UN POCO MÁS CERCA</p><h1>Pequeños retos.<br><em>Grandes descubrimientos.</em></h1><p class="hero-description">Un ratito para practicar, descubrir y decir<br class="desktop-break"> «¡ahora sí lo entiendo!».</p><div class="hero-tags"><span>Sin prisas</span><span>A tu ritmo</span><span>También sin conexión</span></div></div><div class="hero-art">${garden}<span class="art-note">aprender es crecer</span></div></section>
  <section class="course-section" aria-labelledby="course-heading"><div class="section-heading"><div><p class="eyebrow">PASO A PASO</p><h2 id="course-heading">Tu próxima aventura</h2></div><span class="stage-label">Educación Primaria · España</span></div><div class="course-tabs" role="group" aria-label="Curso de Primaria">${courses.map(c => `<button data-course="${c.id}" class="course-tab ${c.id === courseId ? 'selected' : ''}" aria-pressed="${c.id === courseId}">${esc(c.shortLabel)}<span>Primaria</span></button>`).join('')}</div></section>
  ${available.length > 1 ? `<div class="pack-picker" role="group" aria-label="Actividad">${available.map(a => `<button class="button ${a.id === activity.id ? 'primary' : 'secondary'}" data-activity="${esc(a.id)}" aria-pressed="${a.id === activity.id}">${esc(a.title)}</button>`).join('')}</div>` : ''}
  ${available.length ? `<section class="activity-layout"><article class="activity-card"><div class="activity-top"><span class="subject-badge">${esc(activity.subject)}</span><span class="small muted">UNIDADES 1 Y 2</span></div><h2>${esc(activity.title)}</h2><p>${esc(activity.description)}<br>¿Qué te apetece practicar hoy?</p><div class="topic-grid">${activity.topics.map(t => `<button class="topic-card ${esc(t.color)}" data-topic="${t.id}"><span class="topic-symbol" aria-hidden="true">${esc(t.symbol)}</span><span><strong>${esc(t.title)}</strong><small>${esc(t.description)}</small></span><span class="topic-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><div class="activity-bottom"><span class="small muted">5 preguntas por aventura · Sin cronómetro</span>${button('Repasar todo <span aria-hidden="true">→</span>', 'mixed')}</div></article><aside class="side-column"><article class="progress-card"><div class="mini-icon" aria-hidden="true">✦</div><p class="eyebrow">CADA PASITO CUENTA</p><h3>Tu rincón de logros</h3><p>${stats ? '¡Ya has empezado a explorar!' : 'Las grandes aventuras empiezan con un pequeño paso.'}</p><div class="progress-numbers"><div><strong>${stats?.sessions || 0}</strong><span>aventuras</span></div><div><strong>${stats?.answered || 0}</strong><span>preguntas</span></div></div><p class="privacy-note">Solo en este navegador, para ${esc(profile().name)}.</p></article><article class="note-card"><span class="note-label">PARA APRENDER JUNTOS</span><h3>No hace falta acertar a la primera.</h3><p>Podemos contar con los dedos, pedir una pista y volver a intentarlo.</p><span class="note-doodle" aria-hidden="true">✳</span></article></aside></section>` : `<section class="empty-state"><span aria-hidden="true">✦</span><h2>Aquí crecerán nuevas aventuras</h2><p>Todavía no hay actividades para ${esc(courses.find(c => c.id === courseId)?.label)}.</p>${button('Ver 1.º de Primaria', 'first-course', 'secondary')}</section>`}
  <section class="bottom-note"><span aria-hidden="true">⌂</span><p><strong>Un espacio para toda la familia.</strong> Cada explorador aprende a su ritmo y guarda sus propios pasos.</p><button class="text-button" data-action="profiles">Cambiar explorador <span aria-hidden="true">→</span></button></section>`;
}
function familyView() {
  const stats = progress();
  return `<section class="family-view"><p class="eyebrow">ACOMPAÑAR, NO COMPARAR</p><h1>Aprender juntos.</h1><p class="lead">Un espacio sencillo para practicar lo que llega del cole.</p><div class="family-grid"><article class="activity-card"><h2>${esc(profile().name)}</h2><p>El progreso solo se guarda en este navegador. No se sincroniza entre dispositivos.</p><div class="family-stats"><strong>${stats?.sessions || 0} aventuras</strong><span>${stats?.correct || 0} aciertos iniciales de ${stats?.answered || 0} preguntas</span><span>${stats?.helped || 0} preguntas con pista o reintento</span></div><h3>${esc(activity.subject)} · ${esc(courses.find(c => c.id === activity.courseId)?.label)}</h3><ul class="topic-progress">${activity.topics.map(t => { const p = stats?.topics?.[t.id]; return `<li><span>${esc(t.title)}</span><span>${p ? `${p.correct} / ${p.total} al primer intento` : 'Por descubrir'}</span></li>`; }).join('')}</ul><p class="small muted">Practicar no equivale a una evaluación escolar. El repaso se inspira en los temas indicados, no reproduce un examen.</p>${button('Elegir explorador','profiles','secondary')}</article><div class="family-side"><article class="note-card"><h2>Un ratito es suficiente</h2><p>Leed juntos si hace falta. Usad objetos, los dedos o la recta numérica. Celebrad el esfuerzo y parad cuando apetezca.</p><p>El botón «Escuchar» usa la voz del dispositivo. Puede necesitar conexión o no estar disponible.</p></article><article class="install-card"><h2>Llévalo a la pantalla de inicio</h2><p>En Android, abre el menú del navegador y elige «Instalar aplicación». En iPad o iPhone: Compartir → Añadir a pantalla de inicio.</p>${installPrompt ? button('Instalar aplicación','install') : ''}<p class="small muted">Para usarla sin conexión, ábrela primero con internet y espera a que aparezca «Lista sin conexión».</p></article></div></div></section>`;
}
function visual(q) {
  const v = q.visual;
  if (!v) return '';
  if (v.kind === 'shape') return `<div class="shape-visual">${shapeSvg(v.shape)}</div>`;
  if (v.kind === 'count') return `<div class="counters" aria-label="Colección para contar">${Array.from({length:v.count},(_,i) => `<span class="counter" role="img" aria-label="Un elemento"><span aria-hidden="true">${i % 2 ? '✿' : '●'}</span></span>`).join('')}</div>`;
  if (v.kind === 'compare') return `<div class="equation" aria-hidden="true"><span>${v.a}</span><span class="equation-sign">o</span><span>${v.b}</span></div>`;
  if (v.kind === 'operation') return `<div class="equation" aria-hidden="true"><span>${v.a}</span><span class="equation-sign">${esc(v.operator)}</span><span>${v.b}</span><span class="equation-sign">=</span><span class="question-mark">?</span></div>`;
  return '';
}
function exerciseView() {
  if (session.finished) return summaryView();
  const q = session.questions[session.index];
  const title = activity.topics.find(t => t.id === q.topicId)?.title || 'Repaso';
  return `<section class="practice"><div class="practice-top"><button class="text-button" data-action="exit">← Volver a las actividades</button><span class="subject-badge">${esc(title)}</span></div><div class="practice-progress"><label for="session-progress">Pregunta ${session.index + 1} de ${session.questions.length}</label><progress id="session-progress" max="${session.questions.length}" value="${session.index}"></progress></div><article class="question-card"><div class="question-toolbar"><span class="eyebrow">PIENSA, PRUEBA, DESCUBRE</span><button class="text-button" data-action="speak">Escuchar <span aria-hidden="true">◖))</span></button></div><h1>${esc(q.prompt)}</h1>${visual(q)}<div class="answers" role="group" aria-label="Elige una respuesta">${q.choices.map(c => `<button class="answer ${session.selected === c ? 'chosen' : ''}" data-answer="${esc(c)}" aria-pressed="${session.selected === c}" ${session.solved ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div><div class="feedback ${session.feedback ? (session.solved ? 'success' : 'retry') : ''}" role="status" aria-live="polite">${session.feedback ? `<strong>${session.solved ? '¡Lo has descubierto!' : 'Vamos a pensarlo otra vez.'}</strong><p>${esc(session.solved ? q.explanation : q.hint)}</p>` : '<p>Sin prisa. Puedes usar los dedos o contar en voz alta.</p>'}</div>${session.showHint && !session.feedback ? `<p class="hint" role="status">${esc(q.hint)}</p>` : ''}<p id="speech-status" class="small muted" role="status"></p><div class="question-actions"><button class="text-button" data-action="hint">Dame una pista</button>${session.solved ? button(session.index + 1 === session.questions.length ? 'Ver mis pasos →' : 'Siguiente →','next') : `<button class="button primary" data-action="check" ${session.selected === null ? 'disabled' : ''}>Comprobar</button>`}</div></article><p class="practice-footnote">Equivocarse también es aprender.</p></section>`;
}
function summaryView() {
  return `<section class="summary"><div class="summary-star" aria-hidden="true">✦</div><p class="eyebrow">UN PASITO MÁS</p><h1>¡Aventura completada!</h1><p>Has practicado ${session.questions.length} preguntas.<br>Quédate con lo que has descubierto.</p><div class="summary-stats"><div><strong>${session.correct}</strong><span>al primer intento</span></div><div><strong>${session.helped}</strong><span>con ayuda o reintento</span></div></div><p class="small muted">${storageWarning ? 'No se ha podido guardar el progreso.' : 'Tus pasos se han guardado en este navegador.'}</p><div class="summary-actions">${button('Otra aventura →','again')}${button('Volver a mis actividades','home','secondary')}</div><p class="small muted">También es un buen momento para descansar.</p></section>`;
}
function start(topicId) {
  view = 'home';
  session = {profileId:profile().id,topicId,questions:createSession(topicId,topicId === 'mixed' ? 12 : 5),index:0,selected:null,solved:false,feedback:false,showHint:false,attempts:0,correct:0,helped:0,results:[]};
  render(true);
}
function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
function openProfiles() {
  if (session && !session.finished && !window.confirm('¿Salir de esta aventura? Las preguntas sin terminar no se guardarán.')) return;
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
    stopSpeech(); session = null; view = target.dataset.nav || 'home'; render(true); return;
  }
  if (target.dataset.course) { courseId = target.dataset.course; activity = activities.find(a => a.courseId === courseId) || activity; render(); main.querySelector(`[data-course="${courseId}"]`)?.focus(); return; }
  if (target.dataset.activity) { activity = activities.find(a => a.id === target.dataset.activity) || activity; render(); return; }
  if (target.dataset.topic) { start(target.dataset.topic); return; }
  if (target.hasAttribute('data-answer')) { session.selected = target.dataset.answer; render(); main.querySelector(`[data-answer="${CSS.escape(session.selected)}"]`)?.focus(); return; }
  if (target.dataset.profile) { if (!storageWarning) state = loadState(); state.activeProfileId = target.dataset.profile; persist(); document.querySelector('#profile-dialog').close(); render(); return; }
  const action = target.dataset.action;
  if (action === 'profiles' || target.id === 'profile-button') { openProfiles(); return; }
  if (target.id === 'close-profiles') { document.querySelector('#profile-dialog').close(); return; }
  if (target.id === 'add-profile') { if (!storageWarning) state = loadState(); state = createProfile(state); persist(); openProfiles(); render(); return; }
  if (action === 'first-course') { courseId = 'primaria-1'; activity = activities.find(a => a.courseId === courseId); render(); }
  if (action === 'mixed') start('mixed');
  if (action === 'hint') { session.showHint = true; render(); main.querySelector('[data-action="hint"]')?.focus(); }
  if (action === 'check' && session && !session.solved && session.selected !== null) {
    const q = session.questions[session.index];
    session.attempts++; session.feedback = true;
    if (session.selected === q.answer) {
      session.solved = true;
      const independent = session.attempts === 1 && !session.showHint;
      session.correct += Number(independent); session.helped += Number(!independent);
      session.results.push({topicId:q.topicId,correct:independent,helped:!independent});
    } else session.showHint = true;
    render();
    main.querySelector(session.solved ? '[data-action="next"]' : '.answer')?.focus();
  }
  if (action === 'next' && session?.solved) {
    stopSpeech();
    if (++session.index === session.questions.length) {
      session.finished = true;
      if (!storageWarning) state = loadState();
      state = recordSession(state,{profileId:session.profileId,activityId:activity.id,topicId:session.topicId,correct:session.correct,total:session.questions.length,helped:session.helped,results:session.results});
      persist();
    } else Object.assign(session,{selected:null,solved:false,feedback:false,showHint:false,attempts:0});
    render(true);
  }
  if (action === 'again') start(session.topicId);
  if (action === 'exit' || action === 'home') {
    if (!session?.finished && !window.confirm('¿Salir de esta aventura? Las preguntas sin terminar no se guardarán.')) return;
    stopSpeech(); session = null; render(true);
  }
  if (action === 'speak') {
    const status = document.querySelector('#speech-status');
    if (!('speechSynthesis' in window)) { status.textContent = 'Este navegador no dispone de lectura en voz alta.'; return; }
    stopSpeech(); const q = session.questions[session.index];
    const alternative = q.visual?.kind === 'shape' ? main.querySelector('.shape-visual svg')?.getAttribute('aria-label') : q.visual?.kind === 'count' ? Array(q.visual.count).fill('Un elemento.').join(' ') : '';
    const utterance = new SpeechSynthesisUtterance(`${q.prompt} ${alternative}`); utterance.lang = 'es-ES'; utterance.rate = .85;
    utterance.onerror = () => { if (status.isConnected) status.textContent = 'La voz no está disponible. Podéis leer la pregunta juntos.'; };
    window.speechSynthesis.speak(utterance);
  }
  if (action === 'install' && installPrompt) { await installPrompt.prompt(); installPrompt = null; render(); }
});
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; if (view === 'family') render(); });
window.addEventListener('storage', event => {
  if (event.key === 'cole-aventura-state' && !session && !document.querySelector('#profile-dialog').open) { state = loadState(); render(); }
});
window.addEventListener('pagehide',stopSpeech);
render();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(async () => { await navigator.serviceWorker.ready; document.querySelector('#connection-status').textContent = 'Lista sin conexión'; }).catch(() => { document.querySelector('#connection-status').textContent = 'Modo sin conexión no disponible'; });
}
