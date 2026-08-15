import React, { useRef, useState, useEffect, useCallback } from 'react';

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

  const updateVector = useCallback((clientX, clientY) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= 3) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0, magnitude: 0 });
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Smooth responsive sensitivity curve for micro-dodging precision
    const normMag = clampedDist / maxRadius;
    const responsiveMag = Math.pow(normMag, 1.12);
    const normX = Math.cos(angle) * responsiveMag;
    const normY = Math.sin(angle) * responsiveMag;

    onMove({ x: normX, y: normY, magnitude: responsiveMag });
  }, [onMove]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (active) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }

    setActive(true);
    updateVector(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!active) return;

    const handleWindowTouchMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          updateVector(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleWindowTouchEnd = (e) => {
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

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleWindowTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchEnd);
    };
  }, [active, updateVector, onMove]);

  // Support Mouse Drag for testing on desktop devtools
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    setActive(true);
    updateVector(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      updateVector(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      setActive(false);
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0, magnitude: 0 });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="virtual-joystick-container">
      <div
        ref={containerRef}
        className={`joystick-base ${active ? 'active' : ''}`}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
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
