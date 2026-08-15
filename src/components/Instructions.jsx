import React from 'react';
import { ArrowLeft, Play, Compass, Shield, Zap, Crosshair, Award } from 'lucide-react';

export default function Instructions({ onBack, onPlay }) {
  return (
    <div className="instructions-container">
      <div className="instructions-card card-glow">
        <div className="instructions-header">
          <button className="back-btn" onClick={onBack} title="Back">
            <ArrowLeft size={20} />
            <span>BACK</span>
          </button>
          <h1 className="instructions-title">HOW TO PLAY</h1>
          <div className="instructions-subtitle">Master the Art of Evasion</div>
        </div>

        <div className="instructions-content">
          {/* Mission Objective */}
          <section className="guide-section">
            <h2 className="guide-section-title">
              <Compass size={18} />
              <span>Objective</span>
            </h2>
            <p className="guide-text">
              Pilot your energy vessel inside the neon arena. Arrows continuously spawn from all directions.
              Survive until the timer expires to complete the sector and unlock the next level across all <strong>100 levels</strong>!
            </p>
          </section>

          {/* Controls */}
          <section className="guide-section">
            <h2 className="guide-section-title">
              <Crosshair size={18} />
              <span>Controls</span>
            </h2>
            <div className="controls-grid">
              <div className="control-box">
                <div className="key-badges">
                  <span className="key-badge">W</span>
                  <span className="key-badge">A</span>
                  <span className="key-badge">S</span>
                  <span className="key-badge">D</span>
                </div>
                <div className="control-desc">Desktop Movement</div>
              </div>

              <div className="control-box">
                <div className="key-badges">
                  <span className="key-badge">▲</span>
                  <span className="key-badge">◀</span>
                  <span className="key-badge">▼</span>
                  <span className="key-badge">▶</span>
                </div>
                <div className="control-desc">Arrow Keys Movement</div>
              </div>

              <div className="control-box">
                <div className="key-badges">
                  <span className="key-badge">P</span>
                  <span className="key-badge">ESC</span>
                </div>
                <div className="control-desc">Pause Game</div>
              </div>

              <div className="control-box">
                <div className="touch-icon">🕹️</div>
                <div className="control-desc">Touch & Drag (Mobile)</div>
              </div>
            </div>
          </section>

          {/* Arrow Catalog */}
          <section className="guide-section">
            <h2 className="guide-section-title">
              <Zap size={18} />
              <span>Arrow Threat Matrix</span>
            </h2>
            <div className="arrow-types-grid">
              <div className="arrow-type-card">
                <div className="arrow-badge cyan-badge">Standard</div>
                <div className="arrow-spec">Straight trajectory. Predictable but deadly in numbers.</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge yellow-badge">Fast Laser</div>
                <div className="arrow-spec">High velocity piercing arrow. Watch the spawn flash!</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge green-badge">Sine Wave</div>
                <div className="arrow-spec">Oscillates side to side while traveling across the arena.</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge magenta-badge">Homing</div>
                <div className="arrow-spec">Tracks your coordinates. Evade with sharp lateral cuts.</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge purple-badge">Splitter</div>
                <div className="arrow-spec">Fractures into 3 mini-shards mid-flight.</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge orange-badge">Orbital</div>
                <div className="arrow-spec">Curves in a vortex arc to trap your movement.</div>
              </div>

              <div className="arrow-type-card">
                <div className="arrow-badge cyan-badge" style={{ background: 'rgba(0, 255, 255, 0.2)', color: '#00ffff' }}>Sniper Beam</div>
                <div className="arrow-spec">Ultra high-speed lightning shot with pinpoint trajectory.</div>
              </div>
            </div>
          </section>

          {/* Tactical Tips */}
          <section className="guide-section">
            <h2 className="guide-section-title">
              <Award size={18} />
              <span>Pro Survival Tips</span>
            </h2>
            <ul className="tips-list">
              <li><strong>Center Control:</strong> Avoid lingering right on the border walls where arrows spawn.</li>
              <li><strong>Near-Miss Multipliers:</strong> Skimming close to arrows without touching boosts your score multiplier.</li>
              <li><strong>Shield Invulnerability:</strong> When hit, you have 1.2 seconds of invulnerability to safely reposition.</li>
              <li><strong>Star Ratings:</strong> Finish a sector with 3 lives intact to earn a prestigious 3-Star rating!</li>
            </ul>
          </section>
        </div>

        <div className="instructions-actions">
          <button className="neon-btn neon-btn-primary action-btn-large" onClick={onPlay}>
            <Play size={18} />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
}
