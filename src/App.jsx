import React, { useState, useEffect } from 'react';
import Menu from './components/Menu';
import LevelSelect from './components/LevelSelect';
import Instructions from './components/Instructions';
import Game from './components/Game';
import { loadSaveData, saveSoundSetting } from './game/storage';
import { soundManager } from './game/audio';
import './App.css';

export default function App() {
  const [saveData, setSaveData] = useState(() => loadSaveData());
  const [currentScreen, setCurrentScreen] = useState('MENU'); // 'MENU' | 'LEVEL_SELECT' | 'INSTRUCTIONS' | 'GAME'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize sound settings from save data
  useEffect(() => {
    const loaded = loadSaveData();
    setSaveData(loaded);
    setSoundEnabled(loaded.soundEnabled !== false);
    soundManager.setEnabled(loaded.soundEnabled !== false);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
    const updated = saveSoundSetting(next);
    if (updated) setSaveData(updated);
    if (next) soundManager.playButtonClick();
  };

  const handleStartGame = (lvl = 1) => {
    soundManager.playButtonClick();
    setSelectedLevel(lvl);
    setCurrentScreen('GAME');
  };

  const handleNextLevel = (nextLvl) => {
    const validLevel = Math.min(100, Math.max(1, nextLvl));
    setSelectedLevel(validLevel);
    setCurrentScreen('GAME');
  };

  const handleSaveProgressUpdated = (updated) => {
    setSaveData(updated);
  };

  return (
    <div className="app-root">
      {currentScreen === 'MENU' && (
        <Menu
          saveData={saveData}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onPlay={(lvl) => handleStartGame(lvl || saveData.highestUnlockedLevel || 1)}
          onLevelSelect={() => {
            soundManager.playButtonClick();
            setCurrentScreen('LEVEL_SELECT');
          }}
          onInstructions={() => {
            soundManager.playButtonClick();
            setCurrentScreen('INSTRUCTIONS');
          }}
        />
      )}

      {currentScreen === 'LEVEL_SELECT' && (
        <LevelSelect
          saveData={saveData}
          onSelectLevel={(lvl) => handleStartGame(lvl)}
          onBack={() => {
            soundManager.playButtonClick();
            setCurrentScreen('MENU');
          }}
          onContinue={(lvl) => handleStartGame(lvl)}
        />
      )}

      {currentScreen === 'INSTRUCTIONS' && (
        <Instructions
          onBack={() => {
            soundManager.playButtonClick();
            setCurrentScreen('MENU');
          }}
          onPlay={() => handleStartGame(saveData.highestUnlockedLevel || 1)}
        />
      )}

      {currentScreen === 'GAME' && (
        <Game
          key={selectedLevel}
          levelNumber={selectedLevel}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onLevelCompleteNext={handleNextLevel}
          onLevelSelect={() => setCurrentScreen('LEVEL_SELECT')}
          onMainMenu={() => setCurrentScreen('MENU')}
          onProgressUpdated={handleSaveProgressUpdated}
        />
      )}
    </div>
  );
}
