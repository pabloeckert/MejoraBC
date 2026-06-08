import { generatePulls, seedToSlot } from './engine.js';
import { slotToUnit, RARITY_COLORS, RARITY_LABELS } from './units.js';

// Enrich raw pulls with unit names
function enrichPulls(rawPulls) {
  return rawPulls.map(p => {
    const slot = seedToSlot(p.seed);
    const unit = slotToUnit(slot);
    return { ...p, unit, slot };
  });
}

// Main recommendation given a seed and cat food budget
function getRecommendation(seed, budgetCF = 1500) {
  const totalPulls = 60;
  const maxAffordable = Math.floor(budgetCF / 150);
  const rawPulls = generatePulls(seed, totalPulls);
  const pulls = enrichPulls(rawPulls);

  const ubers = pulls.filter(p => p.rarity === 'uber');
  const firstUber = ubers[0] || null;
  const reachableUber = ubers.find(p => p.pull <= maxAffordable) || null;

  let status, message, highlight;
  if (reachableUber) {
    status = 'green';
    message = `¡Tirá ${reachableUber.pull} veces y conseguís un Uber Rare!`;
    highlight = reachableUber;
  } else if (firstUber) {
    const needed = firstUber.pull * 150;
    const missing = needed - budgetCF;
    status = 'amber';
    message = `El próximo Uber cae en el pull #${firstUber.pull} (${needed} CF). Te faltan ${missing} CF.`;
    highlight = firstUber;
  } else {
    status = 'red';
    message = `No hay Uber Rare en los próximos ${totalPulls} pulls. Guardá tu seed para otro evento.`;
    highlight = null;
  }

  return { pulls, firstUber, reachableUber, status, message, highlight, maxAffordable };
}

export { getRecommendation, enrichPulls };
