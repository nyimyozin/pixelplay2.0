const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../engine.js");

test("all hangman word lists are lowercase alphabetical with valid metadata", () => {
  for (const [difficulty, words] of Object.entries(engine.WORDS)) {
    assert.equal(words.length, 60, `${difficulty} has 60 curated words`);
    for (const [word, hint, category] of words) {
      assert.match(word, /^[a-z]+$/);
      assert.ok(hint.length > 5);
      assert.ok(category.length > 2);
    }
    assert.equal(new Set(words.map(row => row[0])).size, words.length);
  }
});

test("expanded hangman bank has distinct words across difficulties and accessible easy words", () => {
  const words = Object.values(engine.WORDS).flat().map(row => row[0]);
  assert.equal(words.length, 180);
  assert.equal(new Set(words).size, words.length);
  assert.ok(engine.WORDS.easy.every(([word]) => word.length <= 5));
  for (const difficulty of Object.keys(engine.WORDS)) {
    const last = engine.WORDS[difficulty].at(-1);
    assert.equal(engine.pickWord(difficulty, "", () => 0.999999).word, last[0]);
    const other = engine.pickWord(difficulty, last[0], () => 0.999999);
    assert.notEqual(other.word, last[0]);
  }
});

test("new word does not repeat previous word", () => {
  const first = engine.pickWord("easy", "", () => 0);
  const second = engine.pickWord("easy", first.word, () => 0);
  assert.notEqual(first.word, second.word);
});

test("correct guesses reveal unique letters, including repeated letters", () => {
  assert.equal(engine.evaluateWord("letter", ["l", "e", "t", "r"]).won, true);
  assert.equal(engine.evaluateWord("letter", ["l", "e", "x", "x"]).mistakes, 1);
});

test("six wrong letters cause loss and remaining never drops below zero", () => {
  const result = engine.evaluateWord("cat", ["b", "d", "e", "f", "g", "h", "i"]);
  assert.equal(result.mistakes, 7);
  assert.equal(result.remaining, 0);
  assert.equal(result.lost, true);
});

test("memory decks contain exactly two of each symbol", () => {
  for (const size of [6, 8, 10]) {
    const deck = engine.createDeck(size);
    assert.equal(deck.length, size * 2);
    assert.equal(new Set(deck.map(card => card.id)).size, size * 2);
    for (const id of new Set(deck.map(card => card.pairId))) {
      assert.equal(deck.filter(card => card.pairId === id).length, 2);
    }
  }
});

test("shuffle preserves all items and uses supplied randomness", () => {
  const values = [1, 2, 3, 4];
  const result = engine.shuffle(values, () => 0);
  assert.deepEqual([...result].sort(), values);
  assert.notStrictEqual(values, result);
  assert.deepEqual(values, [1, 2, 3, 4]);
});

