import React, { useRef, useState, useEffect } from 'react';

/**
 * Mobile Virtual Joystick / Directional Touch Controller
 */
export default function VirtualJoystick({ onMove }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const maxRadius = 45;

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (active) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = containerRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setActive(true);
    updateVector(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateVector(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        setActive(false);
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0, magnitude: 0 });
        break;
      }
    }
  };

  const updateVector = (clientX, clientY) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0, magnitude: 0 });
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Normalized move vector (-1 to 1)
    const normX = (kx / maxRadius);
    const normY = (ky / maxRadius);
    const magnitude = clampedDist / maxRadius;

    onMove({ x: normX, y: normY, magnitude });
  };

  return (
    <div className="virtual-joystick-container">
      <div
        ref={containerRef}
        className={`joystick-base ${active ? 'active' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <div className="joystick-crosshair">
          <span>▲</span>
          <span>▼</span>
          <span>◀</span>
          <span>▶</span>
        </div>
      </div>
      <div className="joystick-hint">Touch & Drag to Dodge</div>
    </div>
  );
}
