import {test,expect} from '@playwright/test';

async function fit(page){
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(350);
 return page.evaluate(()=>{
  const height=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-height'))||innerHeight;
  const targets=[...document.querySelectorAll('header button,.theme-switch,#score,main h1,main .answer,main [data-game],main [data-word],main .story-footer button')].filter(n=>n.getClientRects().length);
  const outside=targets.filter(n=>{const r=n.getBoundingClientRect();return r.top<-.5||r.left<-.5||r.bottom>height+1||r.right>innerWidth+1;}).map(n=>n.getAttribute('data-game')||n.tagName);
  return {outside,scroll:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1,headerOverlap:document.querySelector('header').getBoundingClientRect().bottom>document.querySelector('main').getBoundingClientRect().top+1};
 });
}
test('Tab4 tablet viewport orientations home all topics stories and title icons',async({page})=>{
 test.setTimeout(120000);
 await page.context().setExtraHTTPHeaders({});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await page.waitForSelector('header button');
 for(const viewport of [{width:1280,height:752},{width:1280,height:640},{width:800,height:1180},{width:600,height:900},{width:960,height:540},{width:600,height:375}]){
  await page.setViewportSize(viewport);await page.getByRole('button',{name:'Inicio',exact:true}).click();
  expect(await fit(page),JSON.stringify(viewport)+' home').toEqual({outside:[],scroll:false,headerOverlap:false});
  for(const id of ['numbers','compare','addition','subtraction','problems','shapes']){
   await page.locator(`[data-game="${id}"]`).click();
   await expect(page.locator('h1 svg')).toHaveAttribute('data-topic-icon',id);
   expect(await fit(page),JSON.stringify(viewport)+' '+id).toEqual({outside:[],scroll:false,headerOverlap:false});
   await page.getByRole('button',{name:'Inicio',exact:true}).click();
  }
  await page.locator('[data-game="stories"]').click();
  await expect(page.locator('h1 svg')).toHaveAttribute('data-topic-icon','stories');
  expect(await fit(page),JSON.stringify(viewport)+' story').toEqual({outside:[],scroll:false,headerOverlap:false});
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
 }
 expect(errors).toEqual([]);
});

test('legacy toolbar and keyboard visual viewport height without clipping',async({page})=>{
 await page.addInitScript(()=>{
  const visual=new EventTarget();visual.height=704;visual.scale=1;
  Object.defineProperty(window,'visualViewport',{configurable:true,value:visual});
  window.setVisibleHeight=height=>{visual.height=height;visual.dispatchEvent(new Event('resize'));};
 });
 await page.setViewportSize({width:1280,height:800});await page.goto('./');await page.waitForSelector('header button');
 await expect.poll(()=>page.evaluate(()=>document.body.getBoundingClientRect().height)).toBe(704);
 expect(await fit(page)).toEqual({outside:[],scroll:false,headerOverlap:false});
 await page.evaluate(()=>window.setVisibleHeight(640));
 expect(await fit(page)).toEqual({outside:[],scroll:false,headerOverlap:false});
 await page.getByRole('button',{name:'Para adultos',exact:true}).click();
 await page.evaluate(()=>window.setVisibleHeight(350));await page.waitForTimeout(100);
 expect(await page.locator('#options').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=350&&n.scrollHeight<=n.clientHeight+1;})).toBe(true);
 await page.keyboard.press('Escape');await page.evaluate(()=>window.setVisibleHeight(800));
 await expect.poll(()=>page.evaluate(()=>document.body.getBoundingClientRect().height)).toBe(800);
 expect(await fit(page)).toEqual({outside:[],scroll:false,headerOverlap:false});
});
