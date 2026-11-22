const characters = ['Luna', 'Lola', 'Pepe', 'Lolo'];
const objects = ['pelota', 'cometa', 'muñeca', 'paloma'];
const settings = ['el patio', 'el parque', 'la casa', 'la plaza'];

// Curated Spanish syllables: keep accents, diphthongs and digraphs intact.
const lexicon = {
  luna: ['lu', 'na'], lola: ['lo', 'la'], pepe: ['pe', 'pe'], lolo: ['lo', 'lo'],
  ve: ['ve'], una: ['u', 'na'], la: ['la'], el: ['el'], está: ['es', 'tá'],
  en: ['en'], mira: ['mi', 'ra'], pelota: ['pe', 'lo', 'ta'],
  cometa: ['co', 'me', 'ta'], muñeca: ['mu', 'ñe', 'ca'], paloma: ['pa', 'lo', 'ma'],
  patio: ['pa', 'tio'], parque: ['par', 'que'], casa: ['ca', 'sa'], plaza: ['pla', 'za'],
};
const wordOnly = text => text.replace(/[^\p{L}\p{M}]/gu, '');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function page(sentence) {
  return sentence.split(' ').map(text => ({
    text, syllables: [...lexicon[wordOnly(text).toLowerCase()]],
  }));
}

export function createStory(rng = Math.random) {
  const character = characters[Math.floor(rng() * characters.length)];
  const object = objects[Math.floor(rng() * objects.length)];
  const setting = settings[Math.floor(rng() * settings.length)];
  return {
    id: `reading-${character.toLowerCase()}-${object}-${setting.replace(' ', '-')}`,
    title: `${character} y la ${object}`,
    pages: [
      page(`${character} ve una ${object}.`),
      page(`La ${object} está en ${setting}.`),
      page(`${character} mira la ${object}.`),
    ],
    question: { prompt: `¿Qué ve ${character}?`, choices: [...objects], answer: object },
    symbol: '📖',
  };
}

// Caller owns styles: reading-word wraps reading-syllable spans; use
// syllable-even / syllable-odd for alternating color and underline, not speech.
export function renderWord(token, index) {
  let offset = 0;
  const content = token.syllables.map((syllable, i) => {
    const text = token.text.slice(offset, offset + syllable.length);
    offset += syllable.length;
    return `<span class="reading-syllable syllable-${i % 2 ? 'odd' : 'even'}">${esc(text)}</span>`;
  }).join('');
  return `<button type="button" class="reading-word" data-word="${esc(index)}" aria-label="${esc(wordOnly(token.text))}">${content}${esc(token.text.slice(offset))}</button>`;
}
