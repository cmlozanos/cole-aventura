import {test,expect} from '@playwright/test';

test('una dos tres y cuatro respuestas centradas sin cambiar tamaños',async({page})=>{
 await page.goto('./');await page.waitForSelector('[data-answer]');await page.evaluate(()=>document.fonts.ready);
 for(const viewport of [{width:360,height:640},{width:1280,height:800},{width:667,height:375}]){
  await page.setViewportSize(viewport);
  await expect.poll(()=>page.evaluate(()=>parseInt(document.documentElement.style.getPropertyValue('--app-height')))).toBe(viewport.height);
  for(const count of [1,2,3,4]){
   await page.locator('.answers').evaluate((n,count)=>{n.innerHTML=Array.from({length:count},(_,i)=>`<button class="answer">${i+1}</button>`).join('');},count);
   const geometry=await page.locator('.answers').evaluate(n=>{
    const parent=n.getBoundingClientRect();const boxes=[...n.children].map(e=>e.getBoundingClientRect());
    const rows=new Map();for(const box of boxes){const key=Math.round(box.top);if(!rows.has(key))rows.set(key,[]);rows.get(key).push(box);}
    return {offsets:[...rows.values()].map(row=>Math.abs((Math.min(...row.map(r=>r.left))+Math.max(...row.map(r=>r.right)))/2-(parent.left+parent.right)/2)),width:boxes[0].width,scroll:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight};
   });
   expect(geometry.offsets.every(v=>v<1),`${viewport.width} ${count}`).toBe(true);
   expect(geometry.width).toBeGreaterThan(44);expect(geometry.scroll).toBe(false);
  }
 }
});
