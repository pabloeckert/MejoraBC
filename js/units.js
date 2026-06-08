// BCEN unit pool — slot-based assignment within each rarity tier
// Uber: slots 9750–9999 (250 slots total), Super: 9200–9749 (550 slots)
// Rare: 7500–9199 (1700 slots), Normal: 0–7499 (7500 slots)

const UBER_UNITS = [
  { id: 1,  name: "Bahamut Cat",        type: "standard" },
  { id: 2,  name: "King Dragon Cat",    type: "standard" },
  { id: 3,  name: "Mitama the Oracle",  type: "standard" },
  { id: 4,  name: "Hayabusa",           type: "standard" },
  { id: 5,  name: "Pai-Pai Z",          type: "standard" },
  { id: 6,  name: "Ururun Wolf",        type: "standard" },
  { id: 7,  name: "Li'l Valkyrie",      type: "standard" },
  { id: 8,  name: "Balaluga",           type: "standard" },
  { id: 9,  name: "Darkness Doron",     type: "standard" },
  { id: 10, name: "Idi:N",              type: "standard" },
  { id: 11, name: "Kasli the Bane",     type: "limited" },
  { id: 12, name: "Cala Maria",         type: "limited" },
  { id: 13, name: "Kasa Jizo",          type: "limited" },
  { id: 14, name: "Catman",             type: "limited" },
  { id: 15, name: "Togeluga",           type: "limited" },
];

const SUPER_UNITS = [
  { id: 16, name: "Momotaro",             type: "standard" },
  { id: 17, name: "Cat Machine Mk III",   type: "standard" },
  { id: 18, name: "Sanzo Cat",            type: "standard" },
  { id: 19, name: "Nurse Cat",            type: "standard" },
  { id: 20, name: "Mer-Cat",              type: "standard" },
  { id: 21, name: "Awakened Bahamut Cat", type: "standard" },
  { id: 22, name: "Superfeline",          type: "standard" },
  { id: 23, name: "Cyberpunk Cat",        type: "standard" },
];

const RARE_UNITS = [
  { id: 24, name: "Valkyrie Cat",   type: "standard" },
  { id: 25, name: "Dragon Cat",     type: "standard" },
  { id: 26, name: "Titan Cat",      type: "standard" },
  { id: 27, name: "Ninja Cat",      type: "standard" },
  { id: 28, name: "Samurai Cat",    type: "standard" },
  { id: 29, name: "Zombie Cat",     type: "standard" },
];

const NORMAL_UNITS = [
  { id: 30, name: "Cat",            type: "standard" },
  { id: 31, name: "Tank Cat",       type: "standard" },
  { id: 32, name: "Axe Cat",        type: "standard" },
  { id: 33, name: "Gross Cat",      type: "standard" },
  { id: 34, name: "Cow Cat",        type: "standard" },
];

// Map slot (0–9999) to a unit name
function slotToUnit(slot) {
  if (slot >= 9750) {
    const idx = Math.floor((slot - 9750) / 250 * UBER_UNITS.length);
    return { ...UBER_UNITS[Math.min(idx, UBER_UNITS.length - 1)], rarity: 'uber' };
  }
  if (slot >= 9200) {
    const idx = Math.floor((slot - 9200) / 550 * SUPER_UNITS.length);
    return { ...SUPER_UNITS[Math.min(idx, SUPER_UNITS.length - 1)], rarity: 'super' };
  }
  if (slot >= 7500) {
    const idx = Math.floor((slot - 7500) / 1700 * RARE_UNITS.length);
    return { ...RARE_UNITS[Math.min(idx, RARE_UNITS.length - 1)], rarity: 'rare' };
  }
  const idx = Math.floor(slot / 7500 * NORMAL_UNITS.length);
  return { ...NORMAL_UNITS[Math.min(idx, NORMAL_UNITS.length - 1)], rarity: 'normal' };
}

const RARITY_COLORS = {
  uber:   '#f5c518',
  super:  '#e87c3e',
  rare:   '#5b8dd9',
  normal: '#666677'
};

const RARITY_LABELS = {
  uber:   '★ Uber Rare',
  super:  'Super Rare',
  rare:   'Rare',
  normal: 'Normal'
};

export { slotToUnit, RARITY_COLORS, RARITY_LABELS, UBER_UNITS };
