import React, { useRef, useEffect, useState, useCallback } from 'react';
import HUD from './HUD';
import PauseMenu from './PauseMenu';
import LevelComplete from './LevelComplete';
import GameOver from './GameOver';
import VirtualJoystick from './VirtualJoystick';
import { getLevelConfig } from '../game/levels';
import { checkPlayerArrowCollision } from '../game/collision';
import { ParticleSystem } from '../game/particles';
import { soundManager } from '../game/audio';
import { saveGameProgress } from '../game/storage';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

export default function Game({
  levelNumber = 1,
  soundEnabled,
  onToggleSound,
  onLevelCompleteNext,
  onLevelSelect,
  onMainMenu,
  onProgressUpdated,
}) {
  const levelConfig = getLevelConfig(levelNumber);

  // React State for Overlays
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER'
  const [timeLeft, setTimeLeft] = useState(levelConfig.survivalTime);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [lives, setLives] = useState(levelConfig.playerLives || 3);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Canvas and Game Loop references
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(null);
  const spawnTimerRef = useRef(0);

  // Mutable Game Entities in Ref to prevent re-render lags in 60fps loop
  const gameStateRef = useRef({
    state: 'PLAYING',
    levelConfig,
    timeLeft: levelConfig.survivalTime,
    totalTime: levelConfig.survivalTime,
    timeSurvived: 0,
    score: 0,
    multiplier: 1,
    multiplierTimer: 0,
    lives: 3,
    shake: 0,
    player: {
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: 16,
      angle: 0,
      invulnerable: false,
      invulnerableTimer: 0,
      flash: false,
    },
    arrows: [],
    particles: new ParticleSystem(),
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
    },
    joystickVector: { x: 0, y: 0, magnitude: 0 },
  });

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
      setIsMobile(isTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync state between React and game loop
  useEffect(() => {
    gameStateRef.current.state = gameState;
  }, [gameState]);

  // Reset or Start Level
  const initLevel = useCallback((lvlNum) => {
    const cfg = getLevelConfig(lvlNum);
    const g = gameStateRef.current;
    g.levelConfig = cfg;
    g.timeLeft = cfg.survivalTime;
    g.totalTime = cfg.survivalTime;
    g.timeSurvived = 0;
    g.score = 0;
    g.multiplier = 1;
    g.multiplierTimer = 0;
    g.lives = 3;
    g.shake = 0;
    g.player.x = ARENA_WIDTH / 2;
    g.player.y = ARENA_HEIGHT / 2;
    g.player.vx = 0;
    g.player.vy = 0;
    g.player.angle = -Math.PI / 2;
    g.player.invulnerable = false;
    g.player.invulnerableTimer = 0;
    g.arrows = [];
    g.particles.clear();
    spawnTimerRef.current = 0;

    setTimeLeft(cfg.survivalTime);
    setScore(0);
    setMultiplier(1);
    setLives(3);
    setTimeSurvived(0);
    setGameState('PLAYING');
    // Immediately launch initial attacker wave
    setTimeout(() => {
      if (gameStateRef.current.state === 'PLAYING') {
        const initTypes = cfg.allowedTypes;
        const count = Math.min(4, Math.max(2, Math.floor(cfg.maxArrows * 0.35)));
        for (let k = 0; k < count; k++) {
          const t = initTypes[Math.floor(Math.random() * initTypes.length)];
          spawnArrow(t);
        }
      }
    }, 100);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code;
      // Prevent browser scroll for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(code)) {
        e.preventDefault();
      }

      if (code === 'KeyP' || code === 'Escape') {
        soundManager.playButtonClick();
        setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
        return;
      }

      if (gameStateRef.current.keys.hasOwnProperty(code)) {
        gameStateRef.current.keys[code] = true;
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (gameStateRef.current.keys.hasOwnProperty(code)) {
        gameStateRef.current.keys[code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle Joystick input
  const handleJoystickMove = useCallback((vec) => {
    gameStateRef.current.joystickVector = vec;
  }, []);

  // Helper to spawn a single arrow
  const spawnArrow = (type = 'standard', customOrigin = null, customTarget = null, customSpeed = null) => {
    const g = gameStateRef.current;
    const cfg = g.levelConfig;
    const speedMult = type === 'sniper' ? 2.2 : type === 'fast' ? 1.65 : type === 'orbital' ? 0.9 : 1.0;
    const speed = customSpeed || cfg.arrowSpeed * speedMult;

    let startX = 0;
    let startY = 0;
    let targetX = g.player.x + (Math.random() - 0.5) * 80;
    let targetY = g.player.y + (Math.random() - 0.5) * 80;

    if (customOrigin) {
      startX = customOrigin.x;
      startY = customOrigin.y;
    } else {
      // Pick random boundary edge: 0=top, 1=right, 2=bottom, 3=left
      const edge = Math.floor(Math.random() * 4);
      const margin = 20;
      if (edge === 0) {
        startX = Math.random() * ARENA_WIDTH;
        startY = -margin;
      } else if (edge === 1) {
        startX = ARENA_WIDTH + margin;
        startY = Math.random() * ARENA_HEIGHT;
      } else if (edge === 2) {
        startX = Math.random() * ARENA_WIDTH;
        startY = ARENA_HEIGHT + margin;
      } else {
        startX = -margin;
        startY = Math.random() * ARENA_HEIGHT;
      }
    }

    if (customTarget) {
      targetX = customTarget.x;
      targetY = customTarget.y;
    }

    const angle = Math.atan2(targetY - startY, targetX - startX);

    // Color theme for arrow types
    let color = '#ff0055';
    if (type === 'fast') color = '#ffaa00';
    if (type === 'sine') color = '#00ff88';
    if (type === 'homing') color = '#ff00aa';
    if (type === 'splitter') color = '#a855f7';
    if (type === 'orbital') color = '#00f0ff';
    if (type === 'sniper') color = '#00ffff';

    const arrow = {
      id: Math.random(),
      type,
      x: startX,
      y: startY,
      startX,
      startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      angle,
      length: type === 'sniper' ? 46 : type === 'fast' ? 38 : 28,
      width: type === 'sniper' ? 7 : type === 'fast' ? 8 : 12,
      color,
      distTraveled: 0,
      sinePhase: Math.random() * Math.PI * 2,
      splitTimer: type === 'splitter' ? 0.9 + Math.random() * 0.4 : 0,
      hasSplit: false,
      nearMissed: false,
    };

    g.arrows.push(arrow);
    soundManager.playSpawnSound(type);
  };

  // Wave Spawner
  const triggerSpawnWave = () => {
    const g = gameStateRef.current;
    const cfg = g.levelConfig;
    if (g.arrows.length >= cfg.maxArrows) return;

    // Pick arrow type according to allowed pool
    const types = cfg.allowedTypes;
    const type = types[Math.floor(Math.random() * types.length)];

    // Pick formation
    const formations = cfg.allowedFormations;
    const formation = formations[Math.floor(Math.random() * formations.length)];

    if (formation === 'single') {
      spawnArrow(type);
    } else if (formation === 'double') {
      spawnArrow(type);
      setTimeout(() => {
        if (gameStateRef.current.state === 'PLAYING') spawnArrow(type);
      }, 120);
    } else if (formation === 'crossfire') {
      // Opposite walls
      spawnArrow(type, { x: -20, y: ARENA_HEIGHT * 0.35 }, { x: ARENA_WIDTH, y: ARENA_HEIGHT * 0.65 });
      spawnArrow(type, { x: ARENA_WIDTH + 20, y: ARENA_HEIGHT * 0.65 }, { x: 0, y: ARENA_HEIGHT * 0.35 });
    } else if (formation === 'burst') {
      // Fan burst from one corner
      const cornerX = Math.random() > 0.5 ? -20 : ARENA_WIDTH + 20;
      const cornerY = Math.random() > 0.5 ? -20 : ARENA_HEIGHT + 20;
      for (let i = -1; i <= 1; i++) {
        const targetX = g.player.x + i * 75;
        const targetY = g.player.y + i * 75;
        spawnArrow(type, { x: cornerX, y: cornerY }, { x: targetX, y: targetY });
      }
    } else if (formation === 'surround') {
      // 4 cardinals
      const midX = ARENA_WIDTH / 2;
      const midY = ARENA_HEIGHT / 2;
      spawnArrow(type, { x: midX, y: -20 }, { x: midX, y: midY });
      spawnArrow(type, { x: midX, y: ARENA_HEIGHT + 20 }, { x: midX, y: midY });
      spawnArrow(type, { x: -20, y: midY }, { x: midX, y: midY });
      spawnArrow(type, { x: ARENA_WIDTH + 20, y: midY }, { x: midX, y: midY });
    } else if (formation === 'pincer') {
      // Dual flank ambush
      spawnArrow(type, { x: -20, y: -20 }, { x: g.player.x, y: g.player.y });
      spawnArrow(type, { x: ARENA_WIDTH + 20, y: -20 }, { x: g.player.x, y: g.player.y });
    } else if (formation === 'vortex') {
      // Rapid sequential 4-edge flurry
      const edges = [
        { x: ARENA_WIDTH * 0.25, y: -20 },
        { x: ARENA_WIDTH + 20, y: ARENA_HEIGHT * 0.25 },
        { x: ARENA_WIDTH * 0.75, y: ARENA_HEIGHT + 20 },
        { x: -20, y: ARENA_HEIGHT * 0.75 },
      ];
      edges.forEach((pt, idx) => {
        setTimeout(() => {
          if (gameStateRef.current.state === 'PLAYING') {
            spawnArrow(type, pt, { x: g.player.x, y: g.player.y });
          }
        }, idx * 75);
      });
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    initLevel(levelNumber);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta
      lastTime = now;

      const g = gameStateRef.current;

      if (g.state === 'PLAYING') {
        // 1. Update Survival Timer
        g.timeLeft = Math.max(0, g.timeLeft - dt);
        g.timeSurvived += dt;

        // Score ticks
        g.score += Math.round(dt * 100 * g.multiplier * g.levelConfig.scoreMultiplier);

        // Throttle React state updates to 10Hz (every 100ms) to prevent 60fps React re-render lag
        if (!gameStateRef.current.lastSync || now - gameStateRef.current.lastSync > 100) {
          gameStateRef.current.lastSync = now;
          setTimeLeft(g.timeLeft);
          setTimeSurvived(g.timeSurvived);
          setScore(g.score);
        }

        // Multiplier Decay
        if (g.multiplierTimer > 0) {
          g.multiplierTimer -= dt;
          if (g.multiplierTimer <= 0) {
            g.multiplier = 1;
            setMultiplier(1);
          }
        }

        // Screen shake decay
        if (g.shake > 0) {
          g.shake = Math.max(0, g.shake - dt * 25);
        }

        // 2. Check Level Completion
        if (g.timeLeft <= 0) {
          g.state = 'LEVEL_COMPLETE';
          soundManager.playLevelCompleteSound();
          const finalScore = g.score + g.lives * 1500;
          setScore(finalScore);
          setTimeLeft(0);
          const updated = saveGameProgress(levelNumber, finalScore, g.timeSurvived, g.lives);
          if (onProgressUpdated && updated) onProgressUpdated(updated);
          setGameState('LEVEL_COMPLETE');
        }

        // 3. Arrow Spawner logic
        if (g.state === 'PLAYING') {
          spawnTimerRef.current += dt * 1000;
          if (spawnTimerRef.current >= g.levelConfig.spawnRate) {
            spawnTimerRef.current = 0;
            triggerSpawnWave();
          }
        }

        // 4. Update Player Physics
        const { keys, joystickVector, player } = g;
        let inputX = 0;
        let inputY = 0;

        if (keys.ArrowUp || keys.KeyW) inputY -= 1;
        if (keys.ArrowDown || keys.KeyS) inputY += 1;
        if (keys.ArrowLeft || keys.KeyA) inputX -= 1;
        if (keys.ArrowRight || keys.KeyD) inputX += 1;

        // Joystick blend
        if (joystickVector.magnitude > 0.1) {
          inputX = joystickVector.x;
          inputY = joystickVector.y;
        } else {
          // Normalize keyboard diagonal
          const len = Math.hypot(inputX, inputY);
          if (len > 0) {
            inputX /= len;
            inputY /= len;
          }
        }

        const accel = 1.1;
        const maxSpeed = 6.2;
        const friction = 0.88;

        player.vx += inputX * accel;
        player.vy += inputY * accel;

        // Clamp speed
        const curSpeed = Math.hypot(player.vx, player.vy);
        if (curSpeed > maxSpeed) {
          player.vx = (player.vx / curSpeed) * maxSpeed;
          player.vy = (player.vy / curSpeed) * maxSpeed;
        }

        player.vx *= friction;
        player.vy *= friction;

        player.x += player.vx;
        player.y += player.vy;

        // Arena Boundaries Clamping
        player.x = Math.max(player.radius + 10, Math.min(ARENA_WIDTH - player.radius - 10, player.x));
        player.y = Math.max(player.radius + 10, Math.min(ARENA_HEIGHT - player.radius - 10, player.y));

        if (curSpeed > 0.2) {
          player.angle = Math.atan2(player.vy, player.vx);
          // Emit thruster particle trail lightly
          if (Math.random() > 0.3) {
            g.particles.emitPlayerTrail(player.x, player.y, player.vx, player.vy, g.levelConfig.theme.primary);
          }
        }

        // Invulnerability frame update
        if (player.invulnerable) {
          player.invulnerableTimer -= dt;
          player.flash = Math.floor(player.invulnerableTimer * 10) % 2 === 0;
          if (player.invulnerableTimer <= 0) {
            player.invulnerable = false;
            player.flash = false;
          }
        }

        // 5. Update Arrows & Check Collisions
        for (let i = g.arrows.length - 1; i >= 0; i--) {
          const arrow = g.arrows[i];

          // Type-specific motion
          if (arrow.type === 'homing') {
            // Gradually curve towards player
            const targetAngle = Math.atan2(player.y - arrow.y, player.x - arrow.x);
            let angleDiff = targetAngle - arrow.angle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

            const turnRate = 0.038;
            arrow.angle += Math.sign(angleDiff) * Math.min(turnRate, Math.abs(angleDiff));
            arrow.vx = Math.cos(arrow.angle) * arrow.speed;
            arrow.vy = Math.sin(arrow.angle) * arrow.speed;
          } else if (arrow.type === 'sine') {
            // Undulating wave
            arrow.sinePhase += dt * 7;
            const lateralOffset = Math.sin(arrow.sinePhase) * 2.2;
            const perpAngle = arrow.angle + Math.PI / 2;
            arrow.x += Math.cos(perpAngle) * lateralOffset;
            arrow.y += Math.sin(perpAngle) * lateralOffset;
          } else if (arrow.type === 'orbital') {
            arrow.angle += 0.024;
            arrow.vx = Math.cos(arrow.angle) * arrow.speed;
            arrow.vy = Math.sin(arrow.angle) * arrow.speed;
          } else if (arrow.type === 'splitter' && !arrow.hasSplit) {
            arrow.splitTimer -= dt;
            if (arrow.splitTimer <= 0) {
              arrow.hasSplit = true;
              // Split into two sibling mini arrows
              for (const offset of [-0.35, 0.35]) {
                const subAngle = arrow.angle + offset;
                g.arrows.push({
                  ...arrow,
                  id: Math.random(),
                  angle: subAngle,
                  vx: Math.cos(subAngle) * arrow.speed * 1.25,
                  vy: Math.sin(subAngle) * arrow.speed * 1.25,
                  length: 18,
                  width: 8,
                  hasSplit: true,
                  type: 'standard',
                  color: '#ffffff',
                });
              }
            }
          }

          arrow.x += arrow.vx;
          arrow.y += arrow.vy;
          arrow.distTraveled += arrow.speed;

          // Emit contrail lightly
          if (Math.random() > 0.75) {
            g.particles.emitArrowContrail(arrow.x, arrow.y, arrow.angle, arrow.color);
          }

          // Check Collision with player
          const { collided, nearMiss, hitPoint } = checkPlayerArrowCollision(player, arrow);

          if (collided) {
            // Player takes hit
            soundManager.playHitSound();
            g.shake = 12;
            g.lives = Math.max(0, g.lives - 1);
            setLives(g.lives);

            // Trigger hit particle burst
            g.particles.emitHitExplosion(hitPoint.x, hitPoint.y, arrow.color);

            // Remove hit arrow
            g.arrows.splice(i, 1);

            // Invulnerability buffer
            player.invulnerable = true;
            player.invulnerableTimer = 1.25;

            // Check Game Over
            if (g.lives <= 0) {
              g.state = 'GAME_OVER';
              soundManager.playGameOverSound();
              setGameState('GAME_OVER');
              break;
            }
            continue;
          }

          // Near miss bonus
          if (nearMiss && !arrow.nearMissed) {
            arrow.nearMissed = true;
            g.score += 150;
            g.multiplier = Math.min(3.0, Number((g.multiplier + 0.2).toFixed(1)));
            g.multiplierTimer = 2.5; // lasts 2.5s
            setScore(g.score);
            setMultiplier(g.multiplier);
            g.particles.emitNearMissSparks(arrow.x, arrow.y, '#00ff88');
          }

          // Remove arrows out of bounds
          const bounds = 80;
          if (
            arrow.x < -bounds ||
            arrow.x > ARENA_WIDTH + bounds ||
            arrow.y < -bounds ||
            arrow.y > ARENA_HEIGHT + bounds
          ) {
            g.arrows.splice(i, 1);
          }
        }

        // 6. Update Particles
        g.particles.update(dt);
      }

      // 7. RENDER FRAME
      ctx.save();

      // Screen Shake offset
      if (g.shake > 0) {
        const dx = (Math.random() - 0.5) * g.shake;
        const dy = (Math.random() - 0.5) * g.shake;
        ctx.translate(dx, dy);
      }

      // Background Clear
      ctx.fillStyle = '#0b0d17';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Draw Grid Matrix Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= ARENA_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= ARENA_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
      }

      // Draw Arena Bounding Neon Perimeter
      ctx.strokeStyle = g.levelConfig.theme.primary;
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, ARENA_WIDTH - 12, ARENA_HEIGHT - 12);

      // Draw Particles
      g.particles.draw(ctx);

      // Draw Arrows (Optimized for smooth 60fps)
      g.arrows.forEach((arrow) => {
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);

        ctx.fillStyle = arrow.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        const len = arrow.length;
        const halfW = arrow.width / 2;

        ctx.beginPath();
        ctx.moveTo(len / 2, 0); // Tip
        ctx.lineTo(-len / 2, -halfW); // Top barb
        ctx.lineTo(-len / 4, 0); // Inner notch
        ctx.lineTo(-len / 2, halfW); // Bottom barb
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arrow core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(len / 4, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw Player
      const { player } = g;
      if (!player.flash) {
        ctx.save();
        ctx.translate(player.x, player.y);

        // Invulnerability Shield Aura
        if (player.invulnerable) {
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Outer Neon Glow Ring
        ctx.strokeStyle = g.levelConfig.theme.primary;
        ctx.lineWidth = 2;
        ctx.shadowColor = g.levelConfig.theme.primary;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Core Vessel
        ctx.fillStyle = '#101528';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Directional pointer arrowhead on player
        ctx.save();
        ctx.rotate(player.angle);
        ctx.fillStyle = g.levelConfig.theme.primary;
        ctx.beginPath();
        ctx.moveTo(player.radius - 2, 0);
        ctx.lineTo(-4, -6);
        ctx.lineTo(0, 0);
        ctx.lineTo(-4, 6);
        ctx.closePath();
        ctx.fill();

        // Glowing center orb
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();
      }

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    animFrameIdRef.current = animationId;

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [levelNumber, initLevel]);

  return (
    <div className="game-container">
      {/* Top HUD */}
      <HUD
        levelConfig={levelConfig}
        timeLeft={timeLeft}
        totalTime={levelConfig.survivalTime}
        lives={lives}
        score={score}
        multiplier={multiplier}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onPause={() => {
          soundManager.playButtonClick();
          setGameState('PAUSED');
        }}
        isMobile={isMobile}
      />

      {/* Arena Canvas Wrapper */}
      <div className="arena-wrapper">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="game-canvas"
        />
      </div>

      {/* Mobile Virtual Joystick placed in bottom control zone */}
      {isMobile && gameState === 'PLAYING' && (
        <div className="mobile-controls-area">
          <VirtualJoystick onMove={handleJoystickMove} />
        </div>
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          levelConfig={levelConfig}
          score={score}
          timeLeft={timeLeft}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onResume={() => {
            soundManager.playButtonClick();
            setGameState('PLAYING');
          }}
          onRestart={() => {
            soundManager.playButtonClick();
            initLevel(levelNumber);
          }}
          onLevelSelect={() => {
            soundManager.playButtonClick();
            onLevelSelect();
          }}
          onMainMenu={() => {
            soundManager.playButtonClick();
            onMainMenu();
          }}
        />
      )}

      {/* LEVEL COMPLETE MODAL */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelComplete
          levelConfig={levelConfig}
          score={score}
          livesRemaining={lives}
          timeSurvived={timeSurvived}
          onNextLevel={() => {
            soundManager.playButtonClick();
            onLevelCompleteNext(levelNumber + 1);
          }}
          onReplay={() => {
            soundManager.playButtonClick();
            initLevel(levelNumber);
          }}
          onLevelSelect={() => {
            soundManager.playButtonClick();
            onLevelSelect();
          }}
        />
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOver
          levelConfig={levelConfig}
          score={score}
          timeSurvived={timeSurvived}
          totalTime={levelConfig.survivalTime}
          onRestart={() => {
            soundManager.playButtonClick();
            initLevel(levelNumber);
          }}
          onLevelSelect={() => {
            soundManager.playButtonClick();
            onLevelSelect();
          }}
          onMainMenu={() => {
            soundManager.playButtonClick();
            onMainMenu();
          }}
        />
      )}
    </div>
  );
}
