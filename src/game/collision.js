/**
 * Collision and geometry calculations for Arrow Escape
 */

/**
 * Checks if a point is within a circle
 */
export function pointInCircle(px, py, cx, cy, radius) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Minimum distance from point (px, py) to line segment (x1, y1)-(x2, y2)
 */
export function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);

  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);

  return Math.hypot(px - projX, py - projY);
}

/**
 * Checks collision between circular player and directional arrow
 * @param {Object} player - { x, y, radius, invulnerable }
 * @param {Object} arrow - { x, y, angle, length, width }
 */
export function checkPlayerArrowCollision(player, arrow) {
  if (player.invulnerable) return { collided: false, nearMiss: false };

  const len = arrow.length || 32;
  const halfLen = len / 2;

  // Arrow tip position
  const tipX = arrow.x + Math.cos(arrow.angle) * halfLen;
  const tipY = arrow.y + Math.sin(arrow.angle) * halfLen;

  // Arrow tail position
  const tailX = arrow.x - Math.cos(arrow.angle) * halfLen;
  const tailY = arrow.y - Math.sin(arrow.angle) * halfLen;

  // Hitbox distance
  const dist = distToSegment(player.x, player.y, tailX, tailY, tipX, tipY);
  
  // Forgiving collision radius (70% of visual size)
  const hitRadius = (player.radius * 0.75) + ((arrow.width || 12) * 0.4);
  const nearMissRadius = player.radius + 24;

  const collided = dist <= hitRadius;
  const nearMiss = !collided && dist <= nearMissRadius;

  return { collided, nearMiss, hitPoint: { x: tipX, y: tipY } };
}
