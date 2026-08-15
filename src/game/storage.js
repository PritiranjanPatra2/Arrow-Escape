/**
 * LocalStorage persistence manager for Arrow Escape
 */

const STORAGE_KEY = 'ARROW_ESCAPE_SAVE_DATA_V1';

const defaultState = {
  highestUnlockedLevel: 1,
  completedLevels: {}, // level: { score, timeSurvived, stars, date }
  highScore: 0,
  soundEnabled: true,
  soundVolume: 0.5,
};

export function loadSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      highestUnlockedLevel: Math.max(1, parsed.highestUnlockedLevel || 1),
    };
  } catch (err) {
    console.error('Error loading save data from localStorage', err);
    return { ...defaultState };
  }
}

export function saveGameProgress(level, score, timeSurvived, livesRemaining = 3) {
  try {
    const current = loadSaveData();
    const currentLevel = Number(level);
    
    // Calculate stars: 3 stars if 3 lives left, 2 if 2 lives, 1 if 1 life
    const stars = Math.max(1, Math.min(3, livesRemaining));
    
    const existing = current.completedLevels[currentLevel] || { score: 0, timeSurvived: 0, stars: 0 };
    const bestScore = Math.max(existing.score, score);
    const bestStars = Math.max(existing.stars, stars);

    const updatedCompleted = {
      ...current.completedLevels,
      [currentLevel]: {
        score: bestScore,
        timeSurvived: Math.max(existing.timeSurvived, timeSurvived),
        stars: bestStars,
        date: Date.now(),
      }
    };

    // Unlock next level (up to 100)
    const nextLevel = Math.min(100, Math.max(current.highestUnlockedLevel, currentLevel + 1));
    const newHighScore = Math.max(current.highScore, score);

    const updated = {
      ...current,
      highestUnlockedLevel: nextLevel,
      completedLevels: updatedCompleted,
      highScore: newHighScore,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving game progress to localStorage', err);
    return null;
  }
}

export function saveSoundSetting(enabled, volume = 0.5) {
  try {
    const current = loadSaveData();
    const updated = { ...current, soundEnabled: enabled, soundVolume: volume };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving audio setting', err);
    return null;
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ...defaultState };
  } catch (err) {
    return { ...defaultState };
  }
}
