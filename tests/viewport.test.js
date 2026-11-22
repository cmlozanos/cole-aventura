import test from 'node:test';
import assert from 'node:assert/strict';
import {trackViewport} from '../src/viewport.js';
import {topicIcon} from '../src/topic-icons.js';
function mock(){
 const values={},events={},vEvents={};
 const host={innerHeight:800,document:{documentElement:{style:{setProperty:(k,v)=>values[k]=v}}},visualViewport:{height:704,scale:1,addEventListener:(k,v)=>vEvents[k]=v,removeEventListener:k=>delete vEvents[k]},requestAnimationFrame:f=>{host.frame=f;return 1;},cancelAnimationFrame:()=>host.frame=null,addEventListener:(k,v)=>events[k]=v,removeEventListener:k=>delete events[k]};
 return{host,values,events,vEvents};
}
test('visible viewport bars keyboard orientation and cleanup',()=>{
 const {host,values,events,vEvents}=mock();const cleanup=trackViewport(host);assert.equal(values['--app-height'],'704px');
 host.visualViewport.height=350;vEvents.resize();assert.equal(values['--app-height'],'350px');
 host.innerHeight=600;host.visualViewport.height=900;events.orientationchange();assert.equal(values['--app-height'],'600px');
 host.visualViewport.scale=2;host.visualViewport.height=300;events.resize();assert.equal(values['--app-height'],'600px');
 cleanup();assert.deepEqual(events,{});assert.deepEqual(vEvents,{});
});
test('viewport API absent works without modern CSS units',()=>{const {host,values}=mock();delete host.visualViewport;trackViewport(host);assert.equal(values['--app-height'],'800px');});
test('semantic title icons cover all seven activities and are decorative',()=>{for(const t of ['numbers','compare','addition','subtraction','problems','shapes','stories']){const svg=topicIcon(t);assert.ok(svg.includes(`data-topic-icon="${t}"`));assert.ok(svg.includes('aria-hidden="true"'));assert.ok(svg.includes('viewBox="0 0 24 24"'));}});
