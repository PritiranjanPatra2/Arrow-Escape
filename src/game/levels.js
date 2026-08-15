/**
 * Dynamic Level Generator and Configuration for Levels 1 to 100
 */

// Milestone titles for visual prestige
const MILESTONE_TITLES = {
  1: "First Steps",
  5: "Quickening Pulse",
  10: "Gale Force",
  15: "Crossfire Alley",
  20: "Velocity Rush",
  25: "Homing Nightmare",
  30: "Neon Tempest",
  40: "Fracture Horizon",
  50: "Cyber Maelstrom",
  60: "Supercharged",
  70: "Orbital Vortex",
  80: "Bullet Storm",
  90: "Event Horizon",
  99: "The Gatekeeper",
  100: "Singularity Overlord",
};

/**
 * Returns configuration parameters for a specific level (1-100)
 */
export function getLevelConfig(lvl) {
  const level = Math.max(1, Math.min(100, Math.floor(lvl)));
  const progress = (level - 1) / 99; // 0.0 to 1.0

  // 1. Survival time: 15s at lvl 1 -> 50s at lvl 100
  let survivalTime = Math.round(15 + progress * 30 + (level % 10 === 0 ? 5 : 0));
  if (level === 100) survivalTime = 60; // Grand finale

  // 2. Base arrow speed: 3.8 at lvl 1 -> 9.6 at lvl 100 (high velocity feel)
  const arrowSpeed = Number((3.8 + progress * 5.4 + (level % 10 === 0 ? 0.5 : 0)).toFixed(2));

  // 3. Spawn rate: 480ms at lvl 1 down to 110ms at lvl 100 (rapid continuous assault)
  const spawnRate = Math.max(110, Math.round(480 * Math.pow(0.24, progress)));

  // 4. Max concurrent arrows: 9 at lvl 1 -> 45 at lvl 100
  const maxArrows = Math.min(48, Math.round(9 + progress * 36));

  // 5. Unlocked Arrow Types (multiple dynamic threats starting from Level 1)
  const allowedTypes = ['standard', 'fast', 'sine'];
  if (level >= 3) allowedTypes.push('homing');
  if (level >= 6) allowedTypes.push('splitter');
  if (level >= 10) allowedTypes.push('orbital');
  if (level >= 15) allowedTypes.push('sniper');

  // 6. Spawn wave formations (aggressive patterns right from the beginning)
  const allowedFormations = ['single', 'double', 'crossfire'];
  if (level >= 3) allowedFormations.push('burst');
  if (level >= 5) allowedFormations.push('surround');
  if (level >= 8) allowedFormations.push('pincer');
  if (level >= 12) allowedFormations.push('vortex');

  // 7. Special level flags
  const isBossLevel = level % 10 === 0 || level === 100;
  const title = MILESTONE_TITLES[level] || `Sector ${level}`;

  // 8. Visual theme color accents for variety every 10 levels
  const themeIndex = Math.floor((level - 1) / 10) % 10;
  const themeColors = [
    { primary: '#00f0ff', accent: '#ff0055', bgGlow: 'rgba(0, 240, 255, 0.08)' }, // 1-10 Cyan
    { primary: '#00ff88', accent: '#00f0ff', bgGlow: 'rgba(0, 255, 136, 0.08)' }, // 11-20 Emerald
    { primary: '#ffaa00', accent: '#ff0055', bgGlow: 'rgba(255, 170, 0, 0.08)' }, // 21-30 Amber
    { primary: '#ff0055', accent: '#00f0ff', bgGlow: 'rgba(255, 0, 85, 0.08)' },  // 31-40 Neon Red/Pink
    { primary: '#a855f7', accent: '#00ff88', bgGlow: 'rgba(168, 85, 247, 0.08)' }, // 41-50 Purple
    { primary: '#3b82f6', accent: '#f43f5e', bgGlow: 'rgba(59, 130, 246, 0.08)' }, // 51-60 Electric Blue
    { primary: '#eab308', accent: '#ec4899', bgGlow: 'rgba(234, 179, 8, 0.08)' },  // 61-70 Gold
    { primary: '#06b6d4', accent: '#8b5cf6', bgGlow: 'rgba(6, 182, 212, 0.08)' },  // 71-80 Teal
    { primary: '#f97316', accent: '#00f0ff', bgGlow: 'rgba(249, 115, 22, 0.08)' }, // 81-90 Plasma Orange
    { primary: '#ff0077', accent: '#00ffff', bgGlow: 'rgba(255, 0, 119, 0.12)' }, // 91-100 Singularity Violet
  ];

  return {
    level,
    title,
    isBossLevel,
    survivalTime,
    arrowSpeed,
    spawnRate,
    maxArrows,
    allowedTypes,
    allowedFormations,
    theme: themeColors[themeIndex],
    playerLives: 3,
    scoreMultiplier: 1 + Math.floor(level / 5) * 0.25,
  };
}

/**
 * Returns all 100 levels basic summary list
 */
export function getAllLevelsSummary() {
  const list = [];
  for (let i = 1; i <= 100; i++) {
    list.push(getLevelConfig(i));
  }
  return list;
}
