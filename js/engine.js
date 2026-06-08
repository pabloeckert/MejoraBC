// Battle Cats XorShift32 RNG — matches game implementation exactly
function advanceSeed(s) {
  s = s >>> 0;
  s ^= (s << 13) >>> 0;
  s ^= (s >>> 17) >>> 0;
  s ^= (s << 5) >>> 0;
  return s >>> 0;
}

// slot 0–9999: 0–7499=normal, 7500–9199=rare, 9200–9749=super, 9750–9999=uber
function seedToRarity(seed) {
  const slot = Math.floor((seed >>> 0) / 4294967295 * 10000);
  if (slot >= 9750) return 'uber';
  if (slot >= 9200) return 'super';
  if (slot >= 7500) return 'rare';
  return 'normal';
}

function seedToSlot(seed) {
  return Math.floor((seed >>> 0) / 4294967295 * 10000);
}

// Generate count pulls from startSeed
// Each pull: advance once for result, advance again for track alternation
function generatePulls(startSeed, count = 100) {
  const results = [];
  let seed = startSeed >>> 0;
  for (let i = 0; i < count; i++) {
    seed = advanceSeed(seed);
    const rarity = seedToRarity(seed);
    results.push({
      pull: i + 1,
      seed: seed,
      rarity: rarity,
      track: i % 2 === 0 ? 'A' : 'B',
      catFood: (i + 1) * 150
    });
    seed = advanceSeed(seed);
  }
  return results;
}

// Brute-force seed finder from 2–4 consecutive known pull rarities
// Runs in async chunks to avoid blocking UI
// onProgress(0–100), onFound(candidates[])
function findSeedFromPulls(knownPulls, onProgress, onFound) {
  const CHUNK = 400000;
  let current = 0;
  const MAX = 4294967295;
  const candidates = [];

  function processChunk() {
    const end = Math.min(current + CHUNK, MAX);
    for (let s = current; s < end; s++) {
      let testSeed = s >>> 0;
      let matches = true;
      for (let p = 0; p < knownPulls.length; p++) {
        testSeed = advanceSeed(testSeed);
        if (seedToRarity(testSeed) !== knownPulls[p]) {
          matches = false;
          break;
        }
        testSeed = advanceSeed(testSeed);
      }
      if (matches) candidates.push(s >>> 0);
    }
    current = end;
    onProgress(Math.min(99, Math.floor(current / MAX * 100)));
    if (current < MAX) {
      setTimeout(processChunk, 0);
    } else {
      onProgress(100);
      onFound(candidates);
    }
  }

  processChunk();
}

export { advanceSeed, seedToRarity, seedToSlot, generatePulls, findSeedFromPulls };
