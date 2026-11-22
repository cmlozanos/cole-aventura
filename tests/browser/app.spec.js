import { test, expect } from '@playwright/test';

async function answer(page, wrong = false) {
  const correct = await page.evaluate(async () => {
    const { createSession } = await import('./src/exercises.js');
    // UI RNG is seeded before navigation; independently reconstruct the session.
    let seed = 77;
    const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const topic = document.querySelector('.practice-top .subject-badge').textContent;
    const { activities } = await import('./src/catalog.js');
    const id = activities[0].topics.find(t => t.title === topic).id;
    const position = Number(document.querySelector('label[for="session-progress"]').textContent.match(/\d+/)[0]) - 1;
    return createSession(id,5,rng)[position].answer;
  });
  const options = page.locator('[data-answer]');
  if (wrong) {
    const values = await options.evaluateAll(nodes => nodes.map(n => n.dataset.answer));
    await page.getByRole('button',{name:values.find(v => v !== correct),exact:true}).click();
  } else await page.getByRole('button',{name:correct,exact:true}).click();

}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 77;
    Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  });
});

test('inicio infantil de primero, seis juegos y respuesta en un toque', async ({page}) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');
  await expect(page.getByText('1.º de Primaria · Matemáticas')).toBeVisible();
  await expect(page.locator('[data-course]')).toHaveCount(0);
  await expect(page.locator('[data-topic]')).toHaveCount(6);
  for (const id of ['numbers','compare','addition','subtraction','problems','shapes']) {
    await page.reload(); await page.locator(`[data-topic="${id}"]`).click();
    await expect(page.getByRole('button',{name:'Comprobar',exact:true})).toHaveCount(0);
    await answer(page);
    await expect(page.getByText('¡Muy bien! ✦',{exact:true})).toBeVisible();
    page.once('dialog', d=>d.accept()); await page.locator('[data-action="exit"]').click();
  }
  expect(errors).toEqual([]);
});

test('error, pista, resumen y persistencia aislada por explorador',async ({page}) => {
  await page.goto('./'); await page.locator('[data-topic="addition"]').click();
  await answer(page,true);
  await expect(page.getByText('Prueba otra vez')).toBeVisible();
  await answer(page);
  await page.getByRole('button',{name:'Siguiente →',exact:true}).click();
  for (let i=1;i<5;i++) { await answer(page); await page.getByRole('button',{name:i===4?'Terminar →':'Siguiente →',exact:true}).click(); }
  await expect(page.getByText('¡Lo has conseguido!')).toBeVisible();
  await expect(page.locator('.completed-stars')).toBeVisible();
  await page.locator('[data-action="home"]').click();
  await page.reload();
  await page.locator('[data-nav="family"]').click();
  await expect(page.locator('.family-stats')).toContainText('4 aciertos iniciales de 5 preguntas');
  await page.locator('[data-nav="home"]').click();
  await page.getByRole('button',{name:'Cambiar explorador',exact:true}).first().click();
  await page.getByRole('button',{name:'Añadir explorador',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Explorador 2');
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await expect(page.locator('#profile-label')).toHaveText('Explorador 2');

  await page.locator('[data-nav="family"]').click();
  await expect(page.getByText('Aprender juntos.',{exact:true})).toBeVisible();
});

test('repaso mixto cubre todos los temas y finaliza',async ({page}) => {
  await page.goto('./'); await page.getByRole('button',{name:'¡Empezar!',exact:false}).click();
  const questions = await page.evaluate(async () => {
    const {createSession} = await import('./src/exercises.js');
    let seed=77; const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    return createSession('mixed',6,rng);
  });
  for (let i=0;i<6;i++) {
    await page.getByRole('button',{name:questions[i].answer,exact:true}).click();

    await expect(page.getByText('¡Muy bien! ✦')).toBeVisible();
    await page.getByRole('button',{name:i===5?'Terminar →':'Siguiente →',exact:true}).click();
  }
  await expect(page.getByText('¡Lo has conseguido!')).toBeVisible();
  await page.locator('[data-action="home"]').click();
  await page.locator('[data-nav="family"]').click();
  await expect(page.locator('.topic-progress')).not.toContainText('Por descubrir');
});

test('responsive, teclado, offline real y caché aislada', async ({page,context,browserName}) => {
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(()=>caches.open('otro-juego-no-borrar'));
  for (const width of [360,768,1280]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await expect(page.locator('[data-topic="shapes"]')).toBeVisible();
  }
  await page.setViewportSize({width:360,height:800});
  await page.locator('[data-topic="numbers"]').focus(); await page.keyboard.press('Enter');
  await page.locator('[data-answer]').first().focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.feedback')).not.toBeEmpty();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  if (browserName === 'chromium') {
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-topic]')).toHaveCount(6);
    await page.locator('[data-topic="shapes"]').click();
    await expect(page.locator('.answer svg')).toHaveCount(4);
    await context.setOffline(false);
  } else {
    test.info().annotations.push({type:'limitation',description:'WebKit runtime offline navigation fails natively; cache inventory verified, real offline reload covered in Chromium only.'});
    const cached = await page.evaluate(async()=> {const keys=await caches.keys();const cache=await caches.open(keys.find(k=>k.startsWith('cole-aventura-')));return (await cache.keys()).map(r=>new URL(r.url).pathname);});
    expect(cached.some(p=>p.endsWith('/index.html'))).toBe(true);
    expect(cached.some(p=>p.endsWith('/src/exercises.js'))).toBe(true);
  }
  expect(await page.evaluate(()=>caches.keys())).toContain('otro-juego-no-borrar');
});

test('almacenamiento bloqueado no rompe la práctica', async ({page}) => {
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
  await page.goto('./');
  await page.getByRole('button',{name:'Cambiar explorador',exact:true}).first().click();
  await page.getByRole('button',{name:'Añadir explorador'}).click();
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await expect(page.getByText('El navegador no permite guardar.',{exact:false})).toBeVisible();
  await page.locator('[data-topic="numbers"]').click();
  await expect(page.locator('[data-answer]')).toHaveCount(4);
});

test('foco, alternativas accesibles y cambios entre pestañas',async ({page,context})=>{
  await page.goto('./');
  await page.locator('[data-topic="numbers"]').click();
  const counter=page.locator('[data-counter]').first();
  await expect(counter).toBeVisible(); await counter.click();
  await expect(counter).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Ayúdame',exact:true}).click();
  await expect(page.getByRole('button',{name:'Ayúdame',exact:true})).toBeFocused();
  page.once('dialog',d=>d.accept()); await page.locator('[data-action="exit"]').click();
  const other=await context.newPage(); await other.goto('./');
  // Keep a stale dialog open in the second tab while the first creates a profile.
  await other.locator('#profile-button').click();
  await page.locator('#profile-button').click();
  await page.getByRole('button',{name:'Añadir explorador'}).click();
  await other.locator('[data-profile="explorer-1"]').click();
  await page.reload();
  await page.locator('#profile-button').click();
  await expect(page.locator('[data-profile]')).toHaveCount(2);
  await other.close();
});


test('avance automático, pausa y ausencia de avance tras error',async ({page})=>{
  await page.goto('./'); await page.locator('[data-topic="addition"]').click();
  await page.locator('[data-action="narration"]').click();
  await answer(page,true);
  await page.waitForTimeout(4700);
  await expect(page.locator('label[for="session-progress"]')).toHaveText('Reto 1 de 5');
  await answer(page);
  await page.getByRole('button',{name:'Pausar',exact:true}).click();
  await page.waitForTimeout(4700);
  await expect(page.locator('label[for="session-progress"]')).toHaveText('Reto 1 de 5');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.locator('label[for="session-progress"]')).toHaveText('Reto 2 de 5',{timeout:6500});
  page.once('dialog',d=>d.accept()); await page.locator('[data-action="exit"]').click();
  await page.waitForTimeout(4700);
  await expect(page.getByRole('heading',{name:'¡Vamos a descubrir!'})).toBeVisible();
});

test('voz automática tras empezar, silencio y alternativa sin voz',async ({page})=>{
  await page.addInitScript(()=>{
    window.spoken=[];
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){window.spoken.push(u.text);}},configurable:true});
  });
  await page.goto('./');
  expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
  await page.locator('[data-topic="addition"]').click();
  expect(await page.evaluate(()=>window.spoken.length)).toBe(1);
  await page.locator('[data-action="narration"]').click();
  const before=await page.evaluate(()=>window.spoken.length);
  await answer(page);
  expect(await page.evaluate(()=>window.spoken.length)).toBe(before);
  await page.locator('[data-action="speak"]').click();
  expect(await page.evaluate(()=>window.spoken.length)).toBeGreaterThan(before);
});

test('sin síntesis de voz y contadores conservados tras pedir ayuda',async ({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});});
  await page.goto('./'); await page.locator('[data-topic="numbers"]').click();
  await page.locator('[data-counter]').first().click();
  await page.locator('[data-action="hint"]').click();
  await expect(page.locator('[data-counter]').first()).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-answer]')).toHaveCount(4);
});
