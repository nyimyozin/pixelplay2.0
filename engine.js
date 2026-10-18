(function (root) {
  "use strict";

  // Curated word bank: 60 entries per difficulty; kept local for instant, offline play.
  const WORDS = {
    easy: [
      ["cat","A small feline companion","Animals"],
      ["dog","A loyal barking companion","Animals"],
      ["moon","Our natural satellite","Space"],
      ["pizza","A cheesy slice of happiness","Food"],
      ["cloud","A fluffy shape in the sky","Nature"],
      ["beach","Sand meets the sea","Places"],
      ["robot","A machine that can perform tasks","Technology"],
      ["music","Rhythm and melody","Art"],
      ["apple","A fruit that keeps the doctor away","Food"],
      ["river","Fresh water that flows","Nature"],
      ["panda","A black-and-white bear","Animals"],
      ["stars","Twinkling lights in the sky","Space"],
      ["plant","A living thing with roots","Nature"],
      ["train","Travels on railway tracks","Transport"],
      ["ocean","Vast body of salt water","Nature"],
      ["clock","It tells the time","Objects"],
      ["smile","A happy facial expression","People"],
      ["dance","Move along with music","Art"],
      ["bread","Fresh from the bakery","Food"],
      ["light","The opposite of darkness","Nature"],
      ["chair","A seat with a back","Objects"],
      ["dream","A story while you sleep","Mind"],
      ["lemon","A sour yellow fruit","Food"],
      ["tiger","A striped big cat","Animals"],
      ["bird","A feathered animal that can often fly","Animals"],
      ["fish","An animal that breathes through gills","Animals"],
      ["frog","An amphibian that begins life as a tadpole","Animals"],
      ["duck","A water bird with a broad flat bill","Animals"],
      ["lion","A large cat whose males have a mane","Animals"],
      ["bear","A large mammal with thick fur and strong claws","Animals"],
      ["horse","An animal often ridden with a saddle","Animals"],
      ["mouse","A small rodent with a long thin tail","Animals"],
      ["sheep","A farm animal raised for its wool","Animals"],
      ["whale","A huge mammal that lives in the sea","Animals"],
      ["peach","A soft fruit with fuzzy skin and a stone","Food"],
      ["grape","A small fruit that grows in bunches on vines","Food"],
      ["mango","A tropical fruit with sweet golden flesh","Food"],
      ["melon","A large fruit with juicy flesh and many seeds","Food"],
      ["rice","A grain often served in a bowl with curry","Food"],
      ["soup","A liquid dish often eaten with a spoon","Food"],
      ["cake","A baked dessert often served on birthdays","Food"],
      ["honey","A sweet substance made by bees","Food"],
      ["milk","A drink produced by mammals for their young","Food"],
      ["water","The clear liquid essential for life","Nature"],
      ["rain","Drops that fall from clouds","Nature"],
      ["snow","Frozen flakes that fall in cold weather","Nature"],
      ["wind","Air moving across the land","Nature"],
      ["leaf","The flat green part of a plant","Nature"],
      ["tree","A tall plant with a woody trunk","Nature"],
      ["grass","The short green plants that cover a lawn","Nature"],
      ["stone","A small piece of solid rock","Nature"],
      ["shell","A hard outer covering found on many sea creatures","Nature"],
      ["book","A set of pages bound together for reading","Objects"],
      ["lamp","An object that lights a room","Objects"],
      ["spoon","A utensil with a shallow bowl at its end","Objects"],
      ["brush","A tool with bristles for cleaning or painting","Objects"],
      ["shirt","A piece of clothing worn on the upper body","Objects"],
      ["shoe","A covering worn on a foot","Objects"],
      ["boat","A small vessel that travels on water","Transport"],
      ["plane","A vehicle with wings used for air travel","Transport"]
    ],
    medium: [
      ["adventure","An exciting journey","Experiences"],
      ["galaxy","A vast system of stars","Space"],
      ["harmony","Things working beautifully together","Concepts"],
      ["mystery","Something yet to be explained","Concepts"],
      ["lantern","A portable source of light","Objects"],
      ["whisper","Speak very quietly","Actions"],
      ["sunrise","The first light of day","Nature"],
      ["library","A home for thousands of books","Places"],
      ["journey","Travel from one place to another","Experiences"],
      ["origami","The art of folding paper","Art"],
      ["volcano","A mountain that can erupt","Nature"],
      ["crystal","A naturally ordered solid","Nature"],
      ["rainbow","Colors after the rain","Nature"],
      ["compass","Shows which way is north","Objects"],
      ["balance","A state of equilibrium","Concepts"],
      ["bicycle","Two wheels and pedals","Transport"],
      ["circuit","A path for electric current","Technology"],
      ["gravity","Keeps your feet on the ground","Science"],
      ["festival","A celebration with events","Experiences"],
      ["marathon","A long-distance race","Sports"],
      ["treasure","Something precious hidden away","Objects"],
      ["starlight","Light from a distant sun","Space"],
      ["keyboard","Used to type characters","Technology"],
      ["portrait","A picture of a person","Art"],
      ["dolphin","An intelligent marine mammal that uses clicks","Animals"],
      ["penguin","A flightless seabird that swims with flippers","Animals"],
      ["giraffe","A tall African animal with a very long neck","Animals"],
      ["octopus","A sea animal with eight arms","Animals"],
      ["squirrel","A bushy-tailed rodent that stores nuts","Animals"],
      ["flamingo","A long-legged bird often colored pink","Animals"],
      ["avocado","A green fruit with a large central stone","Food"],
      ["coconut","A tropical fruit with a hard fibrous shell","Food"],
      ["pumpkin","A large orange squash often carved in autumn","Food"],
      ["spinach","A leafy green vegetable often eaten cooked","Food"],
      ["noodles","Long thin strips of dough served in many dishes","Food"],
      ["yogurt","A tangy food made by fermenting milk","Food"],
      ["glacier","A large mass of ice that slowly moves","Nature"],
      ["waterfall","A river dropping over a steep edge","Nature"],
      ["thunder","The loud sound that follows lightning","Nature"],
      ["meadow","An open field covered with grass and flowers","Nature"],
      ["orchard","Land planted with fruit trees","Places"],
      ["desert","A dry region that receives very little rain","Places"],
      ["island","A piece of land surrounded by water","Places"],
      ["harbor","A sheltered place where ships can anchor","Places"],
      ["museum","A place that displays art or historical objects","Places"],
      ["theater","A building where live plays are performed","Places"],
      ["blanket","A warm covering used on a bed","Objects"],
      ["backpack","A bag carried with straps over the shoulders","Objects"],
      ["scissors","A cutting tool with two pivoting blades","Objects"],
      ["telescope","An instrument for viewing distant objects","Science"],
      ["magnet","An object that attracts certain metals","Science"],
      ["battery","A device that stores chemical energy for electricity","Technology"],
      ["browser","Software used to visit websites","Technology"],
      ["software","Programs and instructions run by a computer","Technology"],
      ["satellite","An object that orbits a planet or another body","Space"],
      ["asteroid","A rocky body orbiting the Sun","Space"],
      ["badminton","A racket sport played with a shuttlecock","Sports"],
      ["swimming","Moving through water using the arms and legs","Sports"],
      ["pottery","The craft of making objects from clay","Art"],
      ["sculpture","A work of art shaped in three dimensions","Art"]
    ],
    hard: [
      ["kaleidoscope","A tube of shifting colorful patterns","Objects"],
      ["constellation","A recognizable pattern of stars","Space"],
      ["architecture","The art and science of building design","Art"],
      ["photosynthesis","How plants turn light into energy","Science"],
      ["metamorphosis","A dramatic transformation in form","Science"],
      ["cryptography","The science of secret messages","Technology"],
      ["serendipity","Finding good things by chance","Concepts"],
      ["bioluminescence","Light produced by living organisms","Nature"],
      ["extraterrestrial","Originating outside Earth","Space"],
      ["synchronization","Things happening at the same time","Concepts"],
      ["entrepreneur","A person who starts businesses","People"],
      ["improvisation","Creating without preparation","Art"],
      ["reminiscence","Remembering past experiences","Mind"],
      ["transformation","A major change in appearance","Concepts"],
      ["equilibrium","A balanced state","Science"],
      ["choreography","The design of dance movements","Art"],
      ["astronomical","Relating to celestial bodies","Space"],
      ["perseverance","Persistence despite difficulty","Mind"],
      ["extraordinary","Far beyond what is usual","Concepts"],
      ["unpredictable","Impossible to know in advance","Concepts"],
      ["biodiversity","The variety of living things in an environment","Nature"],
      ["camouflage","Colors or patterns that help something blend in","Nature"],
      ["hibernation","A state of greatly reduced activity during winter","Nature"],
      ["pollination","The transfer of pollen that helps plants reproduce","Nature"],
      ["deforestation","The widespread removal of trees from an area","Nature"],
      ["ecosystem","Organisms and their surroundings interacting as a system","Nature"],
      ["amphibian","An animal class that includes frogs and salamanders","Animals"],
      ["invertebrate","An animal without a backbone","Animals"],
      ["rhinoceros","A large thick-skinned mammal with a horn on its nose","Animals"],
      ["hippopotamus","A large African mammal that spends much time in rivers","Animals"],
      ["archaeology","The study of the past through material remains","Science"],
      ["paleontology","The study of ancient life through fossils","Science"],
      ["meteorology","The scientific study of weather and the atmosphere","Science"],
      ["seismology","The scientific study of earthquakes","Science"],
      ["thermodynamics","The study of heat and its relationship to energy","Science"],
      ["electromagnetism","The interaction of electric and magnetic phenomena","Science"],
      ["chromosome","A threadlike structure carrying genetic information","Science"],
      ["microorganism","A living thing too small to see without magnification","Science"],
      ["neuroscience","The scientific study of the nervous system","Science"],
      ["acceleration","The rate at which velocity changes over time","Science"],
      ["algorithm","A sequence of steps for solving a problem","Technology"],
      ["authentication","The process of verifying a claimed identity","Technology"],
      ["semiconductor","A material with conductivity between a conductor and an insulator","Technology"],
      ["microprocessor","A small chip that performs a computer's central calculations","Technology"],
      ["virtualization","Creating a simulated version of computing resources","Technology"],
      ["interoperability","The ability of different systems to work together","Technology"],
      ["observatory","A place equipped for studying celestial objects","Space"],
      ["gravitational","Relating to the attraction between objects with mass","Space"],
      ["supernova","The powerful explosion of a star","Space"],
      ["interstellar","Located or occurring between stars","Space"],
      ["calligraphy","The art of decorative handwriting","Art"],
      ["cinematography","The art of photographing moving images","Art"],
      ["juxtaposition","Placing things side by side to highlight their relationship","Art"],
      ["onomatopoeia","A word whose sound imitates what it describes","Language"],
      ["palindrome","A sequence that reads the same forwards and backwards","Language"],
      ["alliteration","Repetition of the same starting sound in nearby words","Language"],
      ["resilience","The ability to recover after difficulty","Mind"],
      ["conscientious","Careful to do work thoroughly and responsibly","People"],
      ["collaboration","Working together to achieve a shared goal","Concepts"],
      ["sustainability","Meeting present needs while preserving resources for the future","Concepts"]
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

