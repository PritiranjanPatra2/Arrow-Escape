import React, { useEffect, useRef } from 'react';
import { Play, Grid, HelpCircle, Volume2, VolumeX, Shield, Trophy, Flame } from 'lucide-react';

export default function Menu({
  saveData,
  soundEnabled,
  onToggleSound,
  onPlay,
  onLevelSelect,
  onInstructions,
}) {
  const bgCanvasRef = useRef(null);
  const highestUnlocked = saveData.highestUnlockedLevel || 1;
  const highScore = saveData.highScore || 0;

  // Background animated ambient floating arrows and sparks
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const arrows = Array.from({ length: 18 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      angle: 0,
      size: 14 + Math.random() * 12,
      color: ['#00f0ff', '#ff0055', '#00ff88', '#ffaa00'][Math.floor(Math.random() * 4)],
      alpha: 0.15 + Math.random() * 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      arrows.forEach((a) => {
        a.x += a.vx;
        a.y += a.vy;
        a.angle = Math.atan2(a.vy, a.vx);

        if (a.x < -50) a.x = canvas.width + 50;
        if (a.x > canvas.width + 50) a.x = -50;
        if (a.y < -50) a.y = canvas.height + 50;
        if (a.y > canvas.height + 50) a.y = -50;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.globalAlpha = a.alpha;
        ctx.fillStyle = a.color;
        ctx.shadowColor = a.color;
        ctx.shadowBlur = 8;

        // Draw sleek arrow
        ctx.beginPath();
        ctx.moveTo(a.size, 0);
        ctx.lineTo(-a.size * 0.7, -a.size * 0.5);
        ctx.lineTo(-a.size * 0.3, 0);
        ctx.lineTo(-a.size * 0.7, a.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="menu-container">
      <canvas ref={bgCanvasRef} className="menu-bg-canvas" />

      {/* Cyber Grid Scanline Overlay */}
      <div className="scanline-overlay" />

      {/* Top right quick settings */}
      <div className="menu-top-bar">
        <button
          className="audio-icon-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <div className="menu-content">
        {/* Title & Logo */}
        <div className="title-block">
          <div className="title-logo-icon">
            <svg viewBox="0 0 100 100" width="68" height="68">
              <polygon points="50,10 90,85 50,65 10,85" fill="#00f0ff" />
              <polygon points="50,22 80,80 50,65 20,80" fill="#0b0d17" />
              <circle cx="50" cy="52" r="6" fill="#ff0055" />
            </svg>
          </div>
          <h1 className="game-main-title">
            <span className="title-neon-cyan">ARROW</span>
            <span className="title-neon-pink">ESCAPE</span>
          </h1>
          <div className="game-tagline">100 LEVELS OF HYPER-ARCADE EVASION</div>
        </div>

        {/* Action Buttons */}
        <div className="menu-buttons">
          <button className="neon-btn neon-btn-primary menu-action-btn" onClick={() => onPlay(highestUnlocked)}>
            <Play size={22} className="btn-icon" />
            <div className="btn-text-group">
              <span className="btn-main-text">PLAY GAME</span>
              <span className="btn-sub-text">
                {highestUnlocked === 1 ? 'Start Level 1' : `Continue Level ${highestUnlocked}`}
              </span>
            </div>
          </button>

          <button className="neon-btn neon-btn-secondary menu-action-btn" onClick={onLevelSelect}>
            <Grid size={20} className="btn-icon" />
            <div className="btn-text-group">
              <span className="btn-main-text">LEVEL SELECT</span>
              <span className="btn-sub-text">Browse 100 Levels</span>
            </div>
          </button>

          <button className="neon-btn neon-btn-outline menu-action-btn" onClick={onInstructions}>
            <HelpCircle size={20} className="btn-icon" />
            <div className="btn-text-group">
              <span className="btn-main-text">HOW TO PLAY</span>
              <span className="btn-sub-text">Rules & Threat Matrix</span>
            </div>
          </button>
        </div>

        {/* Stats Preview Widget */}
        <div className="menu-stats-widget card-glow">
          <div className="stat-widget-item">
            <Shield size={16} className="stat-widget-icon cyan" />
            <div className="stat-widget-info">
              <span className="stat-w-label">CURRENT SECTOR</span>
              <span className="stat-w-val">Level {highestUnlocked} / 100</span>
            </div>
          </div>
          <div className="stat-widget-divider" />
          <div className="stat-widget-item">
            <Trophy size={16} className="stat-widget-icon gold" />
            <div className="stat-widget-info">
              <span className="stat-w-label">HIGH SCORE</span>
              <span className="stat-w-val">{highScore.toLocaleString()} PTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-footer">
        <span>WASD / Arrow Keys or Virtual Joystick to Move &bull; P to Pause</span>
      </div>
    </div>
  );
}
