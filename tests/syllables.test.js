import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syllableLexicon} from '../src/syllable-lexicon.js';
import {activities} from '../src/catalog.js';
import {createSession} from '../src/exercises.js';
import {createStory} from '../src/reading.js';

test('todo el contenido pedagógico generado y títulos tiene segmentación explícita',()=>{
  const texts=activities[0].topics.map(t=>t.title);
  for(const topic of activities[0].topics){
    for(let i=0;i<100;i++)for(const q of createSession(topic.id,1))texts.push(q.prompt,q.hint,q.explanation,...q.choices);
  }
  for(let i=0;i<100;i++){const s=createStory();texts.push(s.title,s.question.prompt,...s.question.choices,...s.pages.flat().map(t=>t.text));}
  const words=new Set(texts.join(' ').toLocaleLowerCase('es').match(/\p{L}[\p{L}\p{M}]*/gu));
  const missing=[...words].filter(word=>!syllableLexicon[word]);
  assert.deepEqual(missing,[]);
});
test('decorador no utiliza innerHTML ni altera atributos y carga por bootstrap',()=>{
  const source=readFileSync(new URL('../src/syllables.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\.innerHTML\s*=/);
  assert.match(source,/createTextNode/);
  assert.match(source,/observer\.disconnect\(\)/);
  assert.match(readFileSync(new URL('../src/bootstrap.js',import.meta.url),'utf8'),/observeSyllables\(document.body\)/);
});
