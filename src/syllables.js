import { syllableLexicon } from './syllable-lexicon.js';

// Decorate text nodes only: never attributes, input values, icons or spoken text.
export function decorateUnderline(element,parts) {
  // One text node: cursive joins/ligatures stay intact. Only the underline is segmented.
  const total=parts.join('').length;
  let offset=0;
  const stops=[];
  parts.forEach(part=>{
    const start=offset/total*100; offset+=part.length;
    const end=offset/total*100;
    stops.push(`currentColor ${start}% ${Math.max(start,end-2)}%`,`transparent ${Math.max(start,end-2)}% ${end}%`);
  });
  element.style.backgroundImage=`linear-gradient(to right,${stops.join(',')})`;
  element.classList.add('syllabic-word');
}
export function syllabifySurface(root) {
  const document = root.ownerDocument || root;
  const walker = document.createTreeWalker(root, 4);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest('[data-syllabified],.reading-syllable,.sr-only,script,style,textarea,option,svg,[aria-hidden="true"]')) continue;
    if ((node.textContent.match(/\p{L}[\p{L}\p{M}]*/gu)||[]).some(word=>syllableLexicon[word.toLocaleLowerCase('es')])) nodes.push(node);
  }
  const labels = new Set();
  for (const node of nodes) {
    const owner=node.parentElement.closest('button,h1,h2,p,label');
    if (owner && (!owner.hasAttribute('aria-label') || owner.dataset.syllableLabel)) labels.add(owner);
    const fragment = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\p{L}[\p{L}\p{M}]*)/u)) {
      const parts = syllableLexicon[part.toLocaleLowerCase('es')];
      if (!parts) { fragment.append(document.createTextNode(part)); continue; }
      const word = document.createElement('span');
      word.dataset.syllabified = part;
      word.className = 'syllabic-word';
      word.textContent = part;
      word.dataset.syllables = parts.join('|');
      decorateUnderline(word,parts);
      fragment.append(word);
    }
    node.replaceWith(fragment);
  }
  for (const owner of labels) { owner.setAttribute('aria-label',owner.textContent.trim()); owner.dataset.syllableLabel='true'; }
}
export function observeSyllables(root) {
  syllabifySurface(root);
  const observer = new MutationObserver(() => { observer.disconnect(); syllabifySurface(root); observer.observe(root,{childList:true,subtree:true,characterData:true}); });
  observer.observe(root,{childList:true,subtree:true,characterData:true});
  return () => observer.disconnect();
}
