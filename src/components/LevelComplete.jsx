import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Grid, Star, Trophy, ArrowRight, Zap } from 'lucide-react';

export default function LevelComplete({
  levelConfig,
  score,
  livesRemaining = 3,
  timeSurvived,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) {
  const currentLevel = levelConfig.level;
  const isFinalLevel = currentLevel >= 100;
  const nextLevel = currentLevel + 1;

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff0055', '#00ff88', '#ffaa00', '#ffffff'],
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00f0ff', '#00ff88'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0055', '#ffaa00'],
        });
      }, 300);
      return () => clearTimeout(timeout);
    } catch (e) {}
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="complete-modal card-glow">
        <div className="complete-header">
          <div className="victory-badge">
            <Trophy size={18} className="trophy-icon" />
            <span>MISSION SUCCESS</span>
          </div>
          <h1 className="complete-title">LEVEL {currentLevel} COMPLETE!</h1>
          {!isFinalLevel ? (
            <div className="unlock-alert">
              <span className="unlock-pulse">🔓</span>
              <span>Level {nextLevel} Unlocked!</span>
            </div>
          ) : (
            <div className="unlock-alert grand-champion">
              <span>👑 ALL 100 LEVELS CONQUERED! YOU ARE THE ESCAPE MASTER!</span>
            </div>
          )}
        </div>

        {/* 3 Stars Rating based on surviving lives */}
        <div className="stars-row">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= livesRemaining;
            return (
              <div
                key={starIndex}
                className={`star-wrapper ${isEarned ? 'earned' : 'empty'}`}
                style={{ animationDelay: `${starIndex * 0.15}s` }}
              >
                <Star
                  size={36}
                  fill={isEarned ? '#ffaa00' : 'none'}
                  stroke={isEarned ? '#ffaa00' : '#4a5568'}
                  className="star-icon"
                />
              </div>
            );
          })}
        </div>

        {/* Stats summary panel */}
        <div className="complete-stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">Survival Time</div>
            <div className="stat-card-val highlight-cyan">{timeSurvived.toFixed(1)}s</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Lives Remaining</div>
            <div className="stat-card-val highlight-green">{livesRemaining} / 3</div>
          </div>
          <div className="stat-card full-span">
            <div className="stat-card-label">Total Score</div>
            <div className="stat-card-val highlight-gold">{score.toLocaleString()} PTS</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="modal-actions">
          {!isFinalLevel ? (
            <button className="neon-btn neon-btn-primary action-btn-large" onClick={onNextLevel}>
              <span>NEXT LEVEL {nextLevel}</span>
              <ArrowRight size={20} />
            </button>
          ) : null}

          <div className="btn-row">
            <button className="neon-btn neon-btn-secondary" onClick={onReplay}>
              <RotateCcw size={16} />
              <span>REPLAY</span>
            </button>
            <button className="neon-btn neon-btn-outline" onClick={onLevelSelect}>
              <Grid size={16} />
              <span>ALL LEVELS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
