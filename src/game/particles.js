/**
 * High-performance canvas particle system for Arrow Escape
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 100;
  }

  emit(x, y, count = 10, options = {}) {
    const {
      color = '#00f0ff',
      speedMin = 1,
      speedMax = 4,
      sizeMin = 2,
      sizeMax = 5,
      lifeMin = 0.3,
      lifeMax = 0.7,
      angleMin = 0,
      angleMax = Math.PI * 2,
      shape = 'circle',
      decay = 0.96,
    } = options;

    const availableSlots = this.maxParticles - this.particles.length;
    const actualCount = Math.min(count, Math.max(0, availableSlots));

    for (let i = 0; i < actualCount; i++) {
      const angle = angleMin + Math.random() * (angleMax - angleMin);
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const life = lifeMin + Math.random() * (lifeMax - lifeMin);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color,
        maxLife: life,
        life,
        shape,
        decay,
      });
    }
  }

  // Quick helper emitters
  emitPlayerTrail(x, y, vx, vy, color = '#00f0ff') {
    if (this.particles.length >= this.maxParticles) return;
    const angle = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.5;
    const speed = 0.5 + Math.random() * 2;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2.5 + Math.random() * 2,
      color,
      maxLife: 0.2,
      life: 0.2,
      shape: 'circle',
      decay: 0.92,
    });
  }

  emitArrowContrail(x, y, angle, color = '#ff0055') {
    if (this.particles.length >= this.maxParticles) return;
    const spread = (Math.random() - 0.5) * 0.2;
    const trailAngle = angle + Math.PI + spread;
    this.particles.push({
      x: x - Math.cos(angle) * 10,
      y: y - Math.sin(angle) * 10,
      vx: Math.cos(trailAngle) * (0.6 + Math.random() * 1.2),
      vy: Math.sin(trailAngle) * (0.6 + Math.random() * 1.2),
      size: 1.5 + Math.random() * 1.5,
      color,
      maxLife: 0.15,
      life: 0.15,
      shape: 'circle',
      decay: 0.94,
    });
  }

  emitHitExplosion(x, y, color = '#ff0055') {
    this.emit(x, y, 20, {
      color,
      speedMin: 2,
      speedMax: 7,
      sizeMin: 2.5,
      sizeMax: 5.5,
      lifeMin: 0.3,
      lifeMax: 0.7,
      shape: 'spark',
    });
    // Add extra bright white core sparks
    this.emit(x, y, 8, {
      color: '#ffffff',
      speedMin: 1,
      speedMax: 3.5,
      sizeMin: 1.5,
      sizeMax: 3.5,
      lifeMin: 0.15,
      lifeMax: 0.4,
      shape: 'circle',
    });
  }

  emitNearMissSparks(x, y, color = '#00ff88') {
    this.emit(x, y, 5, {
      color,
      speedMin: 1.5,
      speedMax: 4,
      sizeMin: 1.5,
      sizeMax: 2.5,
      lifeMin: 0.12,
      lifeMax: 0.28,
      shape: 'spark',
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.decay;
      p.vy *= p.decay;
    }
  }

  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        const len = p.size * 1.8;
        const angle = Math.atan2(p.vy, p.vx);
        ctx.moveTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
        ctx.lineTo(p.x - Math.cos(angle) * len * 0.5, p.y - Math.sin(angle) * len * 0.5);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}
