export function createParentChallenge(rng = Math.random, previous = null) {
  const a = 2 + Math.floor(rng() * 8);
  let b = 2 + Math.floor(rng() * 8);
  if (previous && a === previous.a && b === previous.b) {
    b = b === 9 ? 2 : b + 1;
  }
  return { a, b };
}

export function verifyParentAnswer(challenge, input) {
  if (typeof input !== 'string') return false;
  const answer = input.trim();
  return /^[0-9]+$/.test(answer) && Number(answer) === challenge.a * challenge.b;
}
