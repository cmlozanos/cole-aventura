import { activities } from './catalog.js';

const topicIds = activities[0].topics.map(({ id }) => id);
const shapes = [
  { shape: 'circle', name: 'Círculo', description: 'Es redondo y no tiene lados ni esquinas.' },
  { shape: 'square', name: 'Cuadrado', description: 'Tiene cuatro lados iguales y cuatro esquinas rectas.' },
  { shape: 'rectangle', name: 'Rectángulo', description: 'Tiene cuatro esquinas rectas y dos lados largos y dos cortos.' },
  { shape: 'triangle', name: 'Triángulo', description: 'Tiene tres lados y tres esquinas.' },
];

function shuffle(values, rng) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function questionFor(topicId, rng) {
  const integer = (max) => Math.floor(rng() * (max + 1));
  if (topicId === 'numbers') {
    const count = integer(9) + 1;
    return {
      prompt: '¿Cuántos elementos hay?', answer: String(count),
      explanation: `Al contar de uno en uno llegamos a ${count}.`,
      hint: 'Señala cada elemento una sola vez mientras cuentas.',
      visual: { kind: 'count', count },
    };
  }
  if (topicId === 'compare') {
    const a = integer(9) + 1;
    const b = ((a - 1 + integer(8) + 1) % 10) + 1;
    const greater = rng() < 0.5;
    const answer = String(greater ? Math.max(a, b) : Math.min(a, b));
    return {
      prompt: `¿Qué número es ${greater ? 'mayor' : 'menor'}: ${a} o ${b}?`, answer,
      choices: [String(a), String(b)],
      explanation: `${answer} es ${greater ? 'mayor' : 'menor'} que ${answer === String(a) ? b : a}.`,
      hint: greater ? 'El mayor representa más cantidad.' : 'El menor representa menos cantidad.',
      visual: { kind: 'compare', a, b },
    };
  }
  if (topicId === 'shapes') {
    const selected = shapes[integer(shapes.length - 1)];
    return {
      prompt: `Toca: ${selected.name.toLowerCase()}.`, answer: selected.name,
      choices: shapes.map(({ name }) => name), explanation: selected.description,
      hint: 'Fíjate en sus lados y sus esquinas.',
      visual: { kind: 'shape', shape: selected.shape },
    };
  }
  const addition = topicId === 'addition' || (topicId === 'problems' && rng() < 0.5);
  const a = integer(10);
  const b = integer(addition ? 10 - a : a);
  const operator = addition ? '+' : '−';
  const answer = String(addition ? a + b : a - b);
  const name = ['Ana', 'Leo', 'Eva', 'Hugo'][integer(3)];
  const prompt = topicId === 'problems'
    ? addition
      ? `${name} tiene ${a} pegatinas y recibe ${b} más. ¿Cuántas tiene ahora?`
      : `${name} tiene ${a} pegatinas y regala ${b}. ¿Cuántas le quedan?`
    : `¿Cuánto es ${a} ${operator} ${b}?`;
  return {
    prompt, answer,
    explanation: `${a} ${operator} ${b} = ${answer}. ${addition ? 'Al juntar' : 'Al quitar'} contamos ${answer}.`,
    hint: addition ? `Empieza en ${a} y cuenta ${b} más.` : `Empieza en ${a} y cuenta ${b} hacia atrás.`,
    visual: { kind: 'operation', a, b, operator },
  };
}

export function createSession(topicId = 'mixed', count = 5, rng = Math.random) {
  if ((!topicIds.includes(topicId) && topicId !== 'mixed') || !Number.isSafeInteger(count) || count <= 0) return [];
  const questions = [];
  let cycle = [];
  for (let i = 0; i < count; i += 1) {
    if (topicId === 'mixed' && i % topicIds.length === 0) cycle = shuffle(topicIds, rng);
    const currentTopic = topicId === 'mixed' ? cycle[i % topicIds.length] : topicId;
    const question = questionFor(currentTopic, rng);
    let choices = question.choices;
    if (!choices) {
      const minimum = currentTopic === 'numbers' ? 1 : 0;
      const distractors = Array.from({ length: 11 - minimum }, (_, n) => String(n + minimum))
        .filter((value) => value !== question.answer);
      choices = [question.answer, ...shuffle(distractors, rng).slice(0, 3)];
    }
    questions.push({ ...question, id: `${currentTopic}-${i + 1}`, topicId: currentTopic, choices: shuffle(choices, rng) });
  }
  return questions;
}
