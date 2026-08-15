import React from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Target } from 'lucide-react';

export default function HUD({
  levelConfig,
  timeLeft,
  totalTime,
  lives,
  maxLives = 3,
  score,
  multiplier = 1,
  soundEnabled,
  onToggleSound,
  onPause,
  isMobile,
}) {
  const progressRatio = Math.max(0, Math.min(1, timeLeft / totalTime));
  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="game-hud">
      {/* Left section: Level & Title */}
      <div className="hud-section hud-left">
        <div className="hud-level-badge">
          <span className="lvl-prefix">LEVEL</span>
          <span className="lvl-num">{levelConfig.level}</span>
        </div>
        <div className="hud-title-info">
          <div className="lvl-title">{levelConfig.title}</div>
          <div className="lvl-sub">Objective: Dodge Arrows</div>
        </div>
      </div>

      {/* Center section: Survival Timer Gauge & Score */}
      <div className="hud-section hud-center">
        {/* Circular Survival Timer */}
        <div className="timer-container">
          <svg className="timer-svg" width="56" height="56" viewBox="0 0 56 56">
            <circle
              className="timer-bg"
              cx="28"
              cy="28"
              r={circleRadius}
              strokeWidth="4"
            />
            <circle
              className="timer-progress"
              cx="28"
              cy="28"
              r={circleRadius}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              stroke={progressRatio < 0.25 ? '#ff0055' : progressRatio < 0.5 ? '#ffaa00' : '#00f0ff'}
            />
          </svg>
          <div className="timer-text">
            <span className="timer-val">{Math.ceil(timeLeft)}</span>
            <span className="timer-sec">s</span>
          </div>
        </div>

        {/* Score & Multiplier */}
        <div className="score-container">
          <div className="score-label">SCORE</div>
          <div className="score-val">{score.toLocaleString()}</div>
          {multiplier > 1 && (
            <div className="multiplier-badge">
              <Zap size={11} /> {multiplier.toFixed(1)}x
            </div>
          )}
        </div>
      </div>

      {/* Right section: Lives & Controls */}
      <div className="hud-section hud-right">
        {/* Lives Indicator */}
        <div className="lives-container" title={`${lives} lives remaining`}>
          {Array.from({ length: maxLives }).map((_, idx) => {
            const isAlive = idx < lives;
            return (
              <div
                key={idx}
                className={`life-pip ${isAlive ? 'alive' : 'lost'}`}
              >
                <Shield size={16} fill={isAlive ? '#00f0ff' : 'transparent'} />
              </div>
            );
          })}
        </div>

        {/* Audio Toggle Button */}
        <button
          className="hud-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Pause Button */}
        <button
          className="hud-btn pause-btn"
          onClick={onPause}
          title="Pause Game (P)"
          aria-label="Pause Game"
        >
          <Pause size={18} />
        </button>
      </div>
    </div>
  );
}
