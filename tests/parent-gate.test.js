import test from 'node:test';
import assert from 'node:assert/strict';
import { createParentChallenge, verifyParentAnswer } from '../src/parent-gate.js';

test('reto: extremos del RNG y valor por defecto dentro de 2–9', () => {
  assert.deepEqual(createParentChallenge(() => 0), { a: 2, b: 2 });
  assert.deepEqual(createParentChallenge(() => 0.999), { a: 9, b: 9 });
  assert.deepEqual(createParentChallenge(() => 1 - Number.EPSILON), { a: 9, b: 9 });
  const challenge = createParentChallenge();
  assert.deepEqual(Object.keys(challenge).sort(), ['a', 'b']);
  for (const value of Object.values(challenge)) {
    assert.ok(Number.isInteger(value) && value >= 2 && value <= 9);
  }
});

test('reto: los 64 pares son deterministas, nuevos y no exponen solución', () => {
  for (let a = 2; a <= 9; a += 1) {
    for (let b = 2; b <= 9; b += 1) {
      const generate = () => {
        let calls = 0;
        return createParentChallenge(() => (++calls === 1 ? a - 2 : b - 2) / 8);
      };
      const first = generate();
      assert.deepEqual(first, { a, b });
      assert.deepEqual(generate(), first);
      assert.notEqual(generate(), first);
      assert.deepEqual(Object.keys(first).sort(), ['a', 'b']);
      assert.equal(verifyParentAnswer(first, String(a * b)), true);
      assert.equal(verifyParentAnswer(first, String(a * b + 1)), false);
    }
  }
});

test('reto: fallback acotado evita repetir cualquiera de los 64 pares sin mutarlos', () => {
  for (let a = 2; a <= 9; a += 1) {
    for (let b = 2; b <= 9; b += 1) {
      const previous = Object.freeze({ a, b });
      let calls = 0;
      const next = createParentChallenge(() => {
        calls += 1;
        assert.ok(calls <= 2, 'El RNG no necesita reintentos');
        return (calls === 1 ? a - 2 : b - 2) / 8;
      }, previous);
      assert.equal(calls, 2);
      assert.deepEqual(next, { a, b: b === 9 ? 2 : b + 1 });
      assert.notDeepEqual(next, previous);
    }
  }
});

test('reto: conserva un par distinto y compara el orden de los operandos', () => {
  const previous = Object.freeze({ a: 9, b: 2 });
  let calls = 0;
  assert.deepEqual(createParentChallenge(() => calls++ === 0 ? 0 : 0.999, previous), { a: 2, b: 9 });
  assert.deepEqual(createParentChallenge(() => 0, previous), { a: 2, b: 2 });
});

test('respuesta: multiplicación exacta en cadena entera con espacios exteriores', () => {
  const challenge = Object.freeze({ a: 2, b: 9 });
  for (const input of ['18', ' 18 ', '\t18\n', '018']) {
    assert.equal(verifyParentAnswer(challenge, input), true);
  }
  for (const input of ['11', '17', '19', '0']) {
    assert.equal(verifyParentAnswer(challenge, input), false);
  }
});

test('respuesta: rechaza vacíos, negativos, decimales, exponentes y formatos malformados', () => {
  const challenge = { a: 2, b: 9 };
  for (const input of ['', ' ', '\n\t', '-18', '+18', '18.0', '18,0', '1.8e1', '18e0',
    '0x12', '0b10010', '18abc', '18 0', '1 8', '18\n0', 'Infinity', 'NaN', '１８']) {
    assert.equal(verifyParentAnswer(challenge, input), false, JSON.stringify(input));
  }
});

test('respuesta: no convierte tipos ni ejecuta coerciones de objetos', () => {
  const challenge = { a: 2, b: 9 };
  const noCoercion = { toString() { throw new Error('No convertir objetos'); } };
  for (const input of [18, 18n, null, undefined, true, false, ['18'], {}, noCoercion, Symbol('18')]) {
    assert.equal(verifyParentAnswer(challenge, input), false);
  }
});
