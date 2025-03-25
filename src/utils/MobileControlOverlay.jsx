// Debug version - MobileJoystickOverlay.jsx
import React, { useRef, useEffect, useState } from "react";

const MobileJoystickOverlay = ({
  onMoveStart,
  onMove,
  onMoveEnd,
  onLookStart,
  onLook,
  onLookEnd,
}) => {
  const moveBaseRef = useRef(null);
  const moveThumbRef = useRef(null);
  const lookBaseRef = useRef(null);
  const lookThumbRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState({
    move: { x: 0, y: 0 },
    look: { dx: 0, dy: 0 },
  });

  // Direct manipulation of joystick visuals
  const updateJoystickPosition = (
    e,
    baseRef,
    thumbRef,
    isMove = true,
    maxRadius = 40
  ) => {
    if (!baseRef.current || !thumbRef.current) return { x: 0, y: 0 };

    const touch = e.touches[0];
    const baseRect = baseRef.current.getBoundingClientRect();

    // Calculate center of joystick base
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;

    // Calculate distance from center
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit joystick movement within base radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      deltaX *= ratio;
      deltaY *= ratio;
    }

    // Directly update position
    thumbRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Update debug info
    if (isMove) {
      setDebugInfo((prev) => ({
        ...prev,
        move: { x: deltaX / maxRadius, y: deltaY / maxRadius },
      }));
    } else {
      setDebugInfo((prev) => ({
        ...prev,
        look: { dx: deltaX, dy: deltaY },
      }));
    }

    // Return normalized values (-1 to 1)
    return {
      x: deltaX / maxRadius,
      y: deltaY / maxRadius,
    };
  };

  const resetJoystick = (thumbRef, isMove = true) => {
    if (thumbRef.current) {
      thumbRef.current.style.transform = "translate(0px, 0px)";
    }

    // Reset debug info
    if (isMove) {
      setDebugInfo((prev) => ({ ...prev, move: { x: 0, y: 0 } }));
    } else {
      setDebugInfo((prev) => ({ ...prev, look: { dx: 0, dy: 0 } }));
    }
  };

  return (
    <>
      <div className="joystick-overlay">
        {/* Move Joystick */}
        <div
          className="joystick-zone move-joystick"
          onTouchStart={(e) => {
            e.preventDefault();
            updateJoystickPosition(e, moveBaseRef, moveThumbRef, true);
            onMoveStart(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            updateJoystickPosition(e, moveBaseRef, moveThumbRef, true);
            onMove(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            resetJoystick(moveThumbRef, true);
            onMoveEnd();
          }}
        >
          <div className="joystick-base" ref={moveBaseRef}>
            <div className="joystick-thumb" ref={moveThumbRef} />
          </div>
          <div className="joystick-label">MOVE</div>
        </div>

        {/* Look Joystick */}
        <div
          className="joystick-zone look-joystick"
          onTouchStart={(e) => {
            e.preventDefault();
            updateJoystickPosition(e, lookBaseRef, lookThumbRef, false);
            onLookStart(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            updateJoystickPosition(e, lookBaseRef, lookThumbRef, false);
            onLook(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            resetJoystick(lookThumbRef, false);
            onLookEnd();
          }}
        >
          <div className="joystick-base" ref={lookBaseRef}>
            <div className="joystick-thumb" ref={lookThumbRef} />
          </div>
          <div className="joystick-label">LOOK</div>
        </div>
      </div>

      {/* Debug overlay */}
      <div className="debug-overlay">
        <div>
          Move: x={debugInfo.move.x.toFixed(2)} y={debugInfo.move.y.toFixed(2)}
        </div>
        <div>
          Look: dx={debugInfo.look.dx.toFixed(2)} dy=
          {debugInfo.look.dy.toFixed(2)}
        </div>
      </div>

      <style jsx="true">{`
        .debug-overlay {
          position: fixed;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          z-index: 2000;
        }
      `}</style>
    </>
  );
};

export default MobileJoystickOverlay;
