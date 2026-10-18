(function (root) {
  "use strict";

  const WORDS = {
    easy: [
      ["cat", "A small feline companion", "Animals"], ["dog", "A loyal barking companion", "Animals"],
      ["moon", "Our natural satellite", "Space"], ["pizza", "A cheesy slice of happiness", "Food"],
      ["cloud", "A fluffy shape in the sky", "Nature"], ["beach", "Sand meets the sea", "Places"],
      ["robot", "A machine that can perform tasks", "Technology"], ["music", "Rhythm and melody", "Art"],
      ["apple", "A fruit that keeps the doctor away", "Food"], ["river", "Fresh water that flows", "Nature"],
      ["panda", "A black-and-white bear", "Animals"], ["stars", "Twinkling lights in the sky", "Space"],
      ["plant", "A living thing with roots", "Nature"], ["train", "Travels on railway tracks", "Transport"],
      ["ocean", "Vast body of salt water", "Nature"], ["clock", "It tells the time", "Objects"],
      ["smile", "A happy facial expression", "People"], ["dance", "Move along with music", "Art"],
      ["bread", "Fresh from the bakery", "Food"], ["light", "The opposite of darkness", "Nature"],
      ["chair", "A seat with a back", "Objects"], ["dream", "A story while you sleep", "Mind"],
      ["lemon", "A sour yellow fruit", "Food"], ["tiger", "A striped big cat", "Animals"]
    ],
    medium: [
      ["adventure", "An exciting journey", "Experiences"], ["galaxy", "A vast system of stars", "Space"],
      ["harmony", "Things working beautifully together", "Concepts"], ["mystery", "Something yet to be explained", "Concepts"],
      ["lantern", "A portable source of light", "Objects"], ["whisper", "Speak very quietly", "Actions"],
      ["sunrise", "The first light of day", "Nature"], ["library", "A home for thousands of books", "Places"],
      ["journey", "Travel from one place to another", "Experiences"], ["origami", "The art of folding paper", "Art"],
      ["volcano", "A mountain that can erupt", "Nature"], ["crystal", "A naturally ordered solid", "Nature"],
      ["rainbow", "Colors after the rain", "Nature"], ["compass", "Shows which way is north", "Objects"],
      ["balance", "A state of equilibrium", "Concepts"], ["bicycle", "Two wheels and pedals", "Transport"],
      ["circuit", "A path for electric current", "Technology"], ["gravity", "Keeps your feet on the ground", "Science"],
      ["festival", "A celebration with events", "Experiences"], ["marathon", "A long-distance race", "Sports"],
      ["treasure", "Something precious hidden away", "Objects"], ["starlight", "Light from a distant sun", "Space"],
      ["keyboard", "Used to type characters", "Technology"], ["portrait", "A picture of a person", "Art"]
    ],
    hard: [
      ["kaleidoscope", "A tube of shifting colorful patterns", "Objects"],
      ["constellation", "A recognizable pattern of stars", "Space"],
      ["architecture", "The art and science of building design", "Art"],
      ["photosynthesis", "How plants turn light into energy", "Science"],
      ["metamorphosis", "A dramatic transformation in form", "Science"],
      ["cryptography", "The science of secret messages", "Technology"],
      ["serendipity", "Finding good things by chance", "Concepts"],
      ["bioluminescence", "Light produced by living organisms", "Nature"],
      ["extraterrestrial", "Originating outside Earth", "Space"],
      ["synchronization", "Things happening at the same time", "Concepts"],
      ["entrepreneur", "A person who starts businesses", "People"],
      ["improvisation", "Creating without preparation", "Art"],
      ["reminiscence", "Remembering past experiences", "Mind"],
      ["transformation", "A major change in appearance", "Concepts"],
      ["equilibrium", "A balanced state", "Science"],
      ["choreography", "The design of dance movements", "Art"],
      ["astronomical", "Relating to celestial bodies", "Space"],
      ["perseverance", "Persistence despite difficulty", "Mind"],
      ["extraordinary", "Far beyond what is usual", "Concepts"],
      ["unpredictable", "Impossible to know in advance", "Concepts"]
    ]
  };

  const SYMBOLS = ["✦", "☾", "◆", "❀", "♠", "☀", "♫", "♥", "⚡", "♣", "☁", "✿", "★", "♦"];

  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickWord(difficulty, previousWord = "", random = Math.random) {
    const list = WORDS[difficulty] || WORDS.easy;
    const choices = list.filter(([word]) => word !== previousWord);
    const [word, hint, category] = choices[Math.floor(random() * choices.length)];
    return { word, hint, category };
  }

  function evaluateWord(word, letters, maxMistakes = 6) {
    const guessed = new Set([...letters].map(letter => String(letter).toLowerCase()));
    const unique = new Set(word.toLowerCase().split(""));
    const mistakes = [...guessed].filter(letter => !unique.has(letter)).length;
    const won = [...unique].every(letter => guessed.has(letter));
    return { mistakes, remaining: Math.max(0, maxMistakes - mistakes), won, lost: !won && mistakes >= maxMistakes };
  }

  function createDeck(pairs, random = Math.random) {
    const count = Math.max(1, Math.min(SYMBOLS.length, Math.floor(pairs)));
    const values = SYMBOLS.slice(0, count).flatMap((symbol, pairId) => [
      { id: `${pairId}-a`, pairId, symbol },
      { id: `${pairId}-b`, pairId, symbol }
    ]);
    return shuffle(values, random);
  }

  const api = { WORDS, SYMBOLS, shuffle, pickWord, evaluateWord, createDeck };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.PixelEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
