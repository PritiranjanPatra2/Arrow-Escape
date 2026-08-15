import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Play, Trophy, Sparkles } from 'lucide-react';
import { getAllLevelsSummary } from '../game/levels';

const TIER_RANGES = [
  { label: 'All', start: 1, end: 100 },
  { label: '1 - 20', start: 1, end: 20 },
  { label: '21 - 40', start: 21, end: 40 },
  { label: '41 - 60', start: 41, end: 60 },
  { label: '61 - 80', start: 61, end: 80 },
  { label: '81 - 100', start: 81, end: 100 },
];

export default function LevelSelect({
  saveData,
  onSelectLevel,
  onBack,
  onContinue,
}) {
  const [selectedTier, setSelectedTier] = useState(0);
  const [lockedToast, setLockedToast] = useState(null);

  const allLevels = getAllLevelsSummary();
  const highestUnlocked = saveData.highestUnlockedLevel || 1;
  const completedMap = saveData.completedLevels || {};

  const totalCompleted = Object.keys(completedMap).length;
  let totalStars = 0;
  Object.values(completedMap).forEach((rec) => {
    totalStars += rec.stars || 0;
  });

  const tier = TIER_RANGES[selectedTier];
  const displayedLevels = allLevels.filter(
    (lvl) => lvl.level >= tier.start && lvl.level <= tier.end
  );

  const handleLevelClick = (lvlConfig) => {
    const lvlNum = lvlConfig.level;
    if (lvlNum <= highestUnlocked) {
      onSelectLevel(lvlNum);
    } else {
      // Trigger requirement message
      setLockedToast(`Complete Level ${lvlNum - 1} to unlock this level.`);
      setTimeout(() => {
        setLockedToast(null);
      }, 2500);
    }
  };

  return (
    <div className="level-select-container">
      {/* Toast Alert for Locked Level clicks */}
      {lockedToast && (
        <div className="locked-toast">
          <Lock size={16} />
          <span>{lockedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="level-select-header card-glow">
        <div className="header-top-row">
          <button className="back-btn" onClick={onBack} title="Back to Menu">
            <ArrowLeft size={20} />
            <span>MENU</span>
          </button>
          <div className="header-title-group">
            <h1 className="select-title">SECTOR ARCHIVES</h1>
            <div className="select-stats">
              <span className="stat-pill">
                <Trophy size={14} /> Completed: {totalCompleted}/100
              </span>
              <span className="stat-pill">
                <Star size={14} fill="#ffaa00" stroke="#ffaa00" /> Stars: {totalStars}/300
              </span>
            </div>
          </div>
          <button
            className="neon-btn neon-btn-primary continue-btn"
            onClick={() => onContinue(highestUnlocked)}
          >
            <Play size={16} />
            <span>CONTINUE LVL {highestUnlocked}</span>
          </button>
        </div>

        {/* Tier Filter Tabs */}
        <div className="tier-tabs">
          {TIER_RANGES.map((t, idx) => (
            <button
              key={t.label}
              className={`tier-tab ${selectedTier === idx ? 'active' : ''}`}
              onClick={() => setSelectedTier(idx)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 100 Levels Grid */}
      <div className="levels-grid-wrapper">
        <div className="levels-grid">
          {displayedLevels.map((lvl) => {
            const isUnlocked = lvl.level <= highestUnlocked;
            const completion = completedMap[lvl.level];
            const isCurrent = lvl.level === highestUnlocked;
            const stars = completion ? completion.stars : 0;

            return (
              <button
                key={lvl.level}
                className={`level-card ${isUnlocked ? 'unlocked' : 'locked'} ${
                  isCurrent ? 'current-active' : ''
                } ${lvl.isBossLevel ? 'boss-node' : ''}`}
                onClick={() => handleLevelClick(lvl)}
                title={
                  isUnlocked
                    ? `Level ${lvl.level}: ${lvl.title}`
                    : `Complete Level ${lvl.level - 1} to unlock`
                }
              >
                {/* Level Number & Boss Indicator */}
                <div className="level-card-top">
                  <span className="level-card-num">{lvl.level}</span>
                  {lvl.isBossLevel && <span className="boss-tag">BOSS</span>}
                </div>

                {/* Level Title */}
                <div className="level-card-title">{lvl.title}</div>

                {/* Status: Stars or Lock */}
                <div className="level-card-bottom">
                  {isUnlocked ? (
                    <div className="card-stars">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          size={12}
                          fill={starIdx <= stars ? '#ffaa00' : 'none'}
                          stroke={starIdx <= stars ? '#ffaa00' : '#4a5568'}
                        />
                      ))}
                      {completion && (
                        <span className="best-score-badge">
                          {completion.score.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="lock-indicator">
                      <Lock size={16} />
                    </div>
                  )}
                </div>

                {isCurrent && <div className="pulse-glow-border" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
