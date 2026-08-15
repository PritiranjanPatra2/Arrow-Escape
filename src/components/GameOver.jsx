import React from 'react';
import { RotateCcw, Grid, Home, AlertOctagon, HelpCircle } from 'lucide-react';

const LEVEL_TIPS = [
  "Small circular movements around the center give you maximum reaction time.",
  "Avoid hugging the outer walls where arrows spawn suddenly!",
  "Homing arrows curve slowly: make sharp perpendicular cuts to evade them.",
  "Fast beam arrows fly straight: watch the entry trajectory early.",
  "Sine-wave arrows oscillate: step through their valley points.",
  "When multiple arrows cross, find the safest expanding corridor.",
];

export default function GameOver({
  levelConfig,
  score,
  timeSurvived,
  totalTime,
  onRestart,
  onLevelSelect,
  onMainMenu,
}) {
  const percentComplete = Math.min(100, Math.round((timeSurvived / totalTime) * 100));
  const tipIndex = (levelConfig.level * 3) % LEVEL_TIPS.length;
  const tip = LEVEL_TIPS[tipIndex];

  return (
    <div className="modal-backdrop">
      <div className="gameover-modal card-glow card-glow-danger">
        <div className="gameover-header">
          <div className="danger-badge">
            <AlertOctagon size={18} />
            <span>VESSEL DESTROYED</span>
          </div>
          <h1 className="gameover-title">GAME OVER</h1>
          <div className="gameover-sub">Sector {levelConfig.level}: {levelConfig.title}</div>
        </div>

        {/* Progress Bar */}
        <div className="survival-progress-card">
          <div className="progress-header">
            <span>Survival Progress</span>
            <span className="percent-val">{percentComplete}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="progress-details">
            <span>{timeSurvived.toFixed(1)}s survived</span>
            <span>Target: {totalTime}s</span>
          </div>
        </div>

        <div className="gameover-stats">
          <div className="gameover-stat-item">
            <span className="stat-name">Score Earned</span>
            <span className="stat-val highlight-gold">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Tactical Tip */}
        <div className="tactical-tip">
          <div className="tip-header">
            <HelpCircle size={14} />
            <span>TACTICAL TIP</span>
          </div>
          <p className="tip-text">{tip}</p>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="neon-btn neon-btn-primary action-btn-large" onClick={onRestart}>
            <RotateCcw size={18} />
            <span>TRY AGAIN</span>
          </button>

          <div className="btn-row">
            <button className="neon-btn neon-btn-outline" onClick={onLevelSelect}>
              <Grid size={16} />
              <span>LEVEL SELECT</span>
            </button>
            <button className="neon-btn neon-btn-outline" onClick={onMainMenu}>
              <Home size={16} />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
