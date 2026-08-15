import React from 'react';
import { Play, RotateCcw, Grid, Home, Volume2, VolumeX } from 'lucide-react';

export default function PauseMenu({
  levelConfig,
  score,
  timeLeft,
  soundEnabled,
  onToggleSound,
  onResume,
  onRestart,
  onLevelSelect,
  onMainMenu,
}) {
  return (
    <div className="modal-backdrop">
      <div className="pause-modal card-glow">
        <div className="modal-header">
          <div className="paused-badge">SYSTEM PAUSED</div>
          <h2 className="modal-title">Sector {levelConfig.level}: {levelConfig.title}</h2>
        </div>

        <div className="pause-stats">
          <div className="pause-stat-item">
            <span className="stat-name">Current Score</span>
            <span className="stat-val">{score.toLocaleString()}</span>
          </div>
          <div className="pause-stat-item">
            <span className="stat-name">Time Remaining</span>
            <span className="stat-val">{timeLeft.toFixed(1)}s</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="neon-btn neon-btn-primary" onClick={onResume}>
            <Play size={18} />
            <span>RESUME (P)</span>
          </button>

          <button className="neon-btn neon-btn-secondary" onClick={onRestart}>
            <RotateCcw size={18} />
            <span>RESTART LEVEL</span>
          </button>

          <div className="btn-row">
            <button className="neon-btn neon-btn-outline" onClick={onLevelSelect}>
              <Grid size={16} />
              <span>LEVELS</span>
            </button>
            <button className="neon-btn neon-btn-outline" onClick={onMainMenu}>
              <Home size={16} />
              <span>MENU</span>
            </button>
          </div>

          <button
            className={`audio-toggle-btn ${soundEnabled ? 'active' : 'muted'}`}
            onClick={onToggleSound}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Sound FX: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
