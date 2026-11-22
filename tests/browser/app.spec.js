import { test, expect } from '@playwright/test';

async function prepare(page) {
  await page.addInitScript(() => {
    let seed=77;
    Math.random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    window.audioCalls={speech:0,contexts:0};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(){window.audioCalls.speech++;}},configurable:true});
    window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
    window.AudioContext=class {
      constructor(){window.audioCalls.contexts++;this.currentTime=0;this.state='running';this.destination={};}
      createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){}};}
      createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}
      close(){this.state='closed';return Promise.resolve();} resume(){return Promise.resolve();}
    };
  });
  await page.goto('./');
  return page.evaluate(async()=>{
    const {createSession}=await import('./src/exercises.js');
    const {activities}=await import('./src/catalog.js');
    const topics=activities[0].topics.map(t=>t.id);
    let seed=77;const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    let previous='';const questions=[];
    for(let i=0;i<20;i++){
      const pool=topics.filter(t=>t!==previous);const topic=pool[Math.floor(rng()*pool.length)];
      questions.push(createSession(topic,1,rng)[0]);previous=topic;rng();rng();
    }
    return questions;
  });
}

async function unlockParents(page) {
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  const expression=await page.locator('.parent-challenge').textContent();
  const [a,b]=expression.match(/\d+/g).map(Number);
  await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill(String(a*b));
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
}

test('juego aleatorio, inicio accesible y audio silencioso',async({page})=>{
  const [q]=await prepare(page);
  await expect(page.getByRole('heading',{level:1})).toHaveText(q.prompt);
  await expect(page.locator('header button')).toHaveCount(2);
  await expect(page.locator('[data-nav],[data-topic],.summary')).toHaveCount(0);
  await expect(page.locator('[data-action="voice"],[data-action="effects"]')).toHaveCount(0);
  expect(await page.evaluate(()=>window.audioCalls)).toEqual({speech:0,contexts:0});
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('.feedback')).toContainText('✓');
  expect(await page.evaluate(()=>window.audioCalls)).toEqual({speech:0,contexts:0});
});

test('audio solo tras multiplicación y apagado de nuevo al recargar',async({page})=>{
  await prepare(page); await unlockParents(page);
  await expect(page.getByRole('button',{name:'Voz',exact:true})).toHaveAttribute('aria-pressed','false');
  await expect(page.getByRole('button',{name:'Sonidos',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Voz',exact:true}).click();
  await expect(page.getByRole('button',{name:'Voz',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>window.audioCalls.contexts)).toBe(0);
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.reload(); await unlockParents(page);
  await expect(page.getByRole('button',{name:'Voz',exact:true})).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(()=>window.audioCalls)).toEqual({speech:0,contexts:0});
});

test('error no avanza y acierto cubre toda la ventana sin interacción',async({page})=>{
  const questions=await prepare(page);const q=questions[0];
  await page.getByRole('button',{name:q.choices.find(c=>c!==q.answer),exact:true}).click();
  await expect(page.locator('#transition')).not.toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('h1')).toHaveText(q.prompt);
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#transition')).toBeVisible();
  await expect(page.locator('#transition button,#transition input')).toHaveCount(0);
  expect(await page.locator('#transition').evaluate(n=>{const r=n.getBoundingClientRect();return r.top===0&&r.left===0&&r.width===innerWidth&&r.height===innerHeight;})).toBe(true);
  await expect(page.locator('.transition-score')).toContainText('1');
  await page.keyboard.press('Escape');await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  await expect(page.locator('#transition')).not.toBeVisible({timeout:1800});
  await expect(page.locator('h1')).toHaveText(questions[1].prompt);
  await expect(page.locator('#main')).not.toHaveAttribute('aria-busy','true');
});

test('todos los tipos y ayudas caben sin scroll ni contenido cortado',async({page})=>{
  test.setTimeout(120000);
  const questions=await prepare(page);
  const viewports=[{width:360,height:640},{width:320,height:568},{width:768,height:1024},{width:1024,height:768},{width:667,height:375}];
  const checked=new Set();
  // Advance real UI through seeded random questions, testing max-size aids too.
  for(let i=0;i<20 && checked.size<6;i++){
    const q=questions[i];
    await expect(page.locator('h1')).toHaveText(q.prompt,{timeout:5000});
    if(!checked.has(q.topicId)){
      checked.add(q.topicId);
      await page.getByRole('button',{name:q.choices.find(c=>c!==q.answer),exact:true}).click();
      for(const viewport of viewports){
        await page.setViewportSize(viewport);
        const layout=await page.evaluate(()=>{
          const boxes=[...document.querySelectorAll('h1,.lv-visual,.answer,.feedback,header button')].map(n=>n.getBoundingClientRect());
          const picture=document.querySelector('.picture').getBoundingClientRect();
          const visual=document.querySelector('.lv-visual')?.getBoundingClientRect();
          return {scroll:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1,clipped:boxes.some(b=>b.top<0||b.left<0||b.bottom>innerHeight+1||b.right>innerWidth+1)||Boolean(visual&&(visual.top<picture.top-1||visual.bottom>picture.bottom+1))};
        });
        expect(layout,`${q.topicId} ${viewport.width}x${viewport.height}`).toEqual({scroll:false,clipped:false});
      }
    }
    await page.getByRole('button',{name:q.answer,exact:true}).click();
    if(i<19) await expect(page.locator('h1')).toHaveText(questions[i+1].prompt,{timeout:5000});
  }
  expect(checked.size).toBe(6);
});

test('offline real Chromium y no borra progreso antiguo',async({page,context,browserName})=>{
  await prepare(page);
  await page.evaluate(()=>localStorage.setItem('cole-aventura-state','{"legacy":"keep"}'));
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  if(browserName==='chromium'){
    await context.setOffline(true);await page.reload();await expect(page.locator('[data-answer]')).toHaveCount(4);await context.setOffline(false);
  }else test.info().annotations.push({type:'limitation',description:'WebKit offline navigation unavailable in this runtime; Chromium tests real offline.'});
  expect(await page.evaluate(()=>localStorage.getItem('cole-aventura-state'))).toBe('{"legacy":"keep"}');
});

test('límites visuales 10 objetos, ayudas y problemas largos sin scroll',async({page})=>{
  await prepare(page);
  for(const viewport of [{width:320,height:568},{width:360,height:640},{width:667,height:375}]){
    await page.setViewportSize(viewport);
    for(const v of [{kind:'operation',a:10,b:0,operator:'+'},{kind:'operation',a:10,b:10,operator:'−'},{kind:'compare',a:10,b:9},{kind:'count',count:10}]){
      await page.evaluate(async visual=>{
        const {renderLearningVisual}=await import('./src/learning-visuals.js');
        document.querySelector('h1').textContent='Hugo tiene 10 pegatinas y regala 10. ¿Cuántas le quedan?';
        document.querySelector('.picture').innerHTML=renderLearningVisual({visual},true,false);
        document.querySelector('.feedback').textContent='↻ Empieza en 10 y cuenta 10 hacia atrás.';
      },v);
      expect(await page.evaluate(()=>{
        const p=document.querySelector('.picture').getBoundingClientRect();const v=document.querySelector('.lv-visual').getBoundingClientRect();
        return document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1&&v.top>=p.top-1&&v.bottom<=p.bottom+1;
      }),`${viewport.width} ${v.kind}`).toBe(true);
    }
  }
});


test('inicio desbloqueado, puntos por reto una vez y opciones manuales',async({page})=>{
  const [q]=await prepare(page);
  await expect(page.locator('#score strong')).toHaveText('0');
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#score strong')).toHaveText('1');
  await expect(page.locator('#transition')).not.toBeVisible({timeout:5000});
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await expect(page.locator('[data-game]')).toHaveCount(7);
  await expect(page.locator('[data-game]:disabled')).toHaveCount(0);
  await expect(page.locator('#score strong')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#score strong')).toHaveText('1');
  await unlockParents(page);
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Reiniciar puntos',exact:false}).click();
  await expect(page.locator('#score strong')).toHaveText('0');
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  for(const viewport of [{width:320,height:568},{width:667,height:375},{width:768,height:1024}]){
    await page.setViewportSize(viewport);
    const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1,outside:[...document.querySelectorAll('[data-game],header button,#score')].some(n=>{const b=n.getBoundingClientRect();return b.left<0||b.right>innerWidth+1||b.top<0||b.bottom>innerHeight+1;})}));
    expect(layout).toEqual({scroll:false,outside:false});
  }
});

test('loader real, reduced motion y expiración tras más de una hora',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const [q]=await prepare(page);
  await expect(page.locator('#boot-loader')).toHaveCount(0);
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#score strong')).toHaveText('1');
  await page.evaluate(()=>{const key='cole-aventura-session-v1';const data=JSON.parse(localStorage.getItem(key));data.lastActive=Date.now()-3600001;localStorage.setItem(key,JSON.stringify(data));document.cookie=key+'=; Max-Age=0; Path='+location.pathname;});
  await expect(page.locator('#transition')).not.toBeVisible({timeout:5000});
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await expect(page.locator('#score strong')).toHaveText('0');
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
});

test('cookie de respaldo real y juego sin almacenamiento',async({page,context})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
  const [q]=await prepare(page);
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#score strong')).toHaveText('1');
  const cookies=await context.cookies();
  expect(cookies.find(c=>c.name==='cole-aventura-session-v1')?.sameSite).toBe('Lax');
  await page.reload();
  await expect(page.locator('#score strong')).toHaveText('1');
});

test('loader solo durante carga real',async({page})=>{
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  await page.route('**/src/app.js',async route=>{await gate;await route.continue();});
  const navigation=page.goto('./',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#boot-loader')).toBeVisible();
  release();await navigation;
  await expect(page.locator('#boot-loader')).toHaveCount(0);
  await page.unroute('**/src/app.js');
});


test('fallo de módulo muestra reintento sin loader eterno',async({page})=>{
  await page.route('**/src/app.js',route=>route.abort());
  await page.goto('./');
  await expect(page.getByText('No se ha podido abrir el juego.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Reintentar',exact:true})).toBeVisible();
});


test('puerta de adultos bloquea configuración y se renueva tras cerrar',async({page})=>{
  await prepare(page);
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  const previous=await page.locator('.parent-challenge').textContent();
  await expect(page.locator('[data-action="reset-score"],[data-action="voice"],[data-action="effects"]')).toHaveCount(0);
  await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill('1');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.locator('#parent-error')).toHaveText('Inténtalo de nuevo');
  await expect(page.locator('[data-action="reset-score"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  expect(await page.locator('.parent-challenge').textContent()).not.toBe(previous);
  const [a,b]=(await page.locator('.parent-challenge').textContent()).match(/\d+/g).map(Number);
  await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill(String(a*b));
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.locator('[data-action="reset-score"]')).toBeVisible();
  await expect(page.locator('#options')).not.toContainText('1 punto');
  await expect(page.locator('#options')).not.toContainText('Tras más de');
  await expect(page.locator('#options')).not.toContainText('Continuar');
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  await expect(page.locator('#parent-form')).toBeVisible();
});

test('puerta y controles adultos caben en móvil y horizontal; escapar no desbloquea',async({page})=>{
  await prepare(page);
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  for(const viewport of [{width:320,height:568},{width:667,height:375}]){
    await page.setViewportSize(viewport);
    expect(await page.locator('#options').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&n.scrollHeight<=n.clientHeight+1;})).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#options')).not.toBeVisible();
  await unlockParents(page);
  for(const viewport of [{width:320,height:568},{width:667,height:375}]){
    await page.setViewportSize(viewport);
    expect(await page.locator('#options').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&n.scrollHeight<=n.clientHeight+1;})).toBe(true);
  }
});

test('transición respeta movimiento reducido y no puede dar puntos duplicados',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const [q]=await prepare(page);
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#transition')).toBeVisible();
  await page.evaluate(()=>document.querySelector('[data-answer]').click());
  await expect(page.locator('.transition-score')).toHaveText('★ 1');
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  await expect(page.locator('#transition')).not.toBeVisible({timeout:5000});
});


test('sorpresa automática, dos iconos y transición menor de un segundo',async({page})=>{
  const questions=await prepare(page);
  await expect(page.locator('header button')).toHaveCount(2);
  await expect(page.getByRole('button',{name:'Pausar',exact:true})).toHaveCount(0);
  await expect(page.getByText('Pausa',{exact:true})).toHaveCount(0);
  await expect(page.locator('[data-game]')).toHaveCount(0);
  for(let i=0;i<3;i++){
    const before=Date.now();
    await page.getByRole('button',{name:questions[i].answer,exact:true}).click();
    await expect(page.locator('h1')).toHaveText(questions[i+1].prompt,{timeout:1800});
    expect(Date.now()-before).toBeLessThan(1600);
    expect(questions[i].topicId).not.toBe(questions[i+1].topicId);
  }
});

test('cerrar adultos y volver visible reanudan sin botón de pausa',async({page})=>{
  const [q]=await prepare(page);
  await page.getByRole('button',{name:'Para adultos',exact:true}).click();
  await expect(page.locator('[data-answer]').first()).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-answer]').first()).toBeEnabled();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('[data-answer]').first()).toBeDisabled();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('[data-answer]').first()).toBeEnabled();
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.locator('#transition')).not.toBeVisible({timeout:1800});
});

test('BFCache reanuda transición y otro reto manual solo genera una pregunta',async({page})=>{
  const questions=await prepare(page);
  await page.getByRole('button',{name:questions[0].answer,exact:true}).click();
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));const e=new Event('pageshow');Object.defineProperty(e,'persisted',{value:true});window.dispatchEvent(e);});
  await expect(page.locator('#transition')).not.toBeVisible({timeout:1800});
  await expect(page.locator('h1')).toHaveText(questions[1].prompt);
  await unlockParents(page);
  await page.getByRole('button',{name:'Otro reto',exact:false}).click();
  await expect(page.locator('#options')).not.toBeVisible();
  await expect(page.locator('[data-answer]').first()).toBeEnabled();
  await expect(page.getByText('Pausa',{exact:true})).toHaveCount(0);
});
