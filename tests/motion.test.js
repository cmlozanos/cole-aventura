import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotion} from '../src/motion.js';
test('movimiento reducido no crea animaciones y toggle permite desactivar',()=>{
  let calls=0;
  const host={matchMedia:()=>({matches:true})};
  const node={animate(){calls++;},querySelectorAll:()=>[],querySelector:()=>null};
  const motion=createMotion(host);motion.enter(node);motion.feedback(node,true);assert.equal(calls,0);
  host.matchMedia=()=>({matches:false});motion.toggle();motion.enter(node);assert.equal(calls,0);
});
test('animaciones se cancelan al cambiar escena o parar',()=>{
  let cancelled=0;
  const node={animate(){return {finished:new Promise(()=>{}),cancel(){cancelled++;}};},querySelectorAll:()=>[],querySelector:()=>null};
  const motion=createMotion({matchMedia:()=>({matches:false})});motion.enter(node);motion.stop();assert.equal(cancelled,1);
  motion.enter(node);motion.toggle();assert.equal(cancelled,2);
});
