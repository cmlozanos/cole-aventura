import test from 'node:test';
import assert from 'node:assert/strict';
import {activityBadge} from '../src/art.js';
test('badge decorativo neutro de cuaderno/libro sin texto operadores cantidades ni formas de respuesta',()=>{
 for(const reading of [true,false]){
  const html=activityBadge(reading);
  assert.match(html,/class="activity-badge" aria-hidden="true"/);
  assert.match(html,/<svg/);
  assert.doesNotMatch(html,/<text|<circle|<polygon|data-answer/);
  assert.equal(html.replace(/<[^>]*>/g,''),'');
 }
 assert.notEqual(activityBadge(),activityBadge(true));
});
