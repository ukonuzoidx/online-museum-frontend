// MobileJoystickOverlay.jsx - Complete rewrite
import React, { useRef, useEffect, useState } from "react";

const MobileJoystickOverlay = ({
  onMoveStart,
  onMove,
  onMoveEnd,
  onLookStart,
  onLook,
  onLookEnd,
}) => {
  // State to track thumb positions
  const [moveThumbPos, setMoveThumbPos] = useState({ x: 0, y: 0 });
  const [lookThumbPos, setLookThumbPos] = useState({ x: 0, y: 0 });

  // Refs for the joystick elements
  const moveBaseRef = useRef(null);
  const lookBaseRef = useRef(null);

  // Track if joysticks are active
  const [moveActive, setMoveActive] = useState(false);
  const [lookActive, setLookActive] = useState(false);

  // Maximum radius the thumb can move
  const maxRadius = 40;

  // Handle move joystick touch start
  const handleMoveStart = (e) => {
    e.preventDefault();
    setMoveActive(true);

    const touch = e.touches[0];
    const rect = moveBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate initial position
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit to maxRadius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      deltaX *= scale;
      deltaY *= scale;
    }

    // Update thumb position
    setMoveThumbPos({ x: deltaX, y: deltaY });

    // Calculate normalized values (-1 to 1)
    const normX = deltaX / maxRadius;
    const normY = deltaY / maxRadius;

    // Call handler with normalized values
    const touchData = { ...e };
    touchData.joystickX = normX;
    touchData.joystickY = normY;
    onMoveStart(touchData);
  };

  // Handle move joystick touch move
  const handleMove = (e) => {
    e.preventDefault();
    if (!moveActive) return;

    const touch = e.touches[0];
    const rect = moveBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate position
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit to maxRadius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      deltaX *= scale;
      deltaY *= scale;
    }

    // Update thumb position
    setMoveThumbPos({ x: deltaX, y: deltaY });

    // Calculate normalized values (-1 to 1)
    const normX = deltaX / maxRadius;
    const normY = deltaY / maxRadius;

    // Call handler with normalized values
    const touchData = { ...e };
    touchData.joystickX = normX;
    touchData.joystickY = normY;
    onMove(touchData);
  };

  // Handle move joystick touch end
  const handleMoveEnd = (e) => {
    e.preventDefault();
    setMoveActive(false);
    setMoveThumbPos({ x: 0, y: 0 });
    onMoveEnd();
  };

  // Handle look joystick touch start
  const handleLookStart = (e) => {
    e.preventDefault();
    setLookActive(true);

    const touch = e.touches[0];
    const rect = lookBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate initial position
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit to maxRadius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      deltaX *= scale;
      deltaY *= scale;
    }

    // Update thumb position
    setLookThumbPos({ x: deltaX, y: deltaY });

    // Call handler
    onLookStart(e);
  };

  // Handle look joystick touch move
  const handleLook = (e) => {
    e.preventDefault();
    if (!lookActive) return;

    const touch = e.touches[0];
    const rect = lookBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate position
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit to maxRadius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      deltaX *= scale;
      deltaY *= scale;
    }

    // Update thumb position
    setLookThumbPos({ x: deltaX, y: deltaY });

    // Call handler
    onLook(e);
  };

  // Handle look joystick touch end
  const handleLookEnd = (e) => {
    e.preventDefault();
    setLookActive(false);
    setLookThumbPos({ x: 0, y: 0 });
    onLookEnd();
  };

  return (
    <>
      <div className="joystick-overlay">
        {/* Move Joystick */}
        <div
          className="joystick-zone move-joystick"
          onTouchStart={handleMoveStart}
          onTouchMove={handleMove}
          onTouchEnd={handleMoveEnd}
          onTouchCancel={handleMoveEnd}
        >
          <div className="joystick-base" ref={moveBaseRef}>
            <div
              className="joystick-thumb"
              style={{
                left: `calc(50% + ${moveThumbPos.x}px)`,
                top: `calc(50% + ${moveThumbPos.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="joystick-label">MOVE</div>
        </div>

        {/* Look Joystick */}
        <div
          className="joystick-zone look-joystick"
          onTouchStart={handleLookStart}
          onTouchMove={handleLook}
          onTouchEnd={handleLookEnd}
          onTouchCancel={handleLookEnd}
        >
          <div className="joystick-base" ref={lookBaseRef}>
            <div
              className="joystick-thumb"
              style={{
                left: `calc(50% + ${lookThumbPos.x}px)`,
                top: `calc(50% + ${lookThumbPos.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="joystick-label">LOOK</div>
        </div>
      </div>

      <style jsx="true">{`
        .joystick-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30%;
          z-index: 1000;
          display: flex;
          pointer-events: none;
        }

        .joystick-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        .joystick-base {
          width: 100px;
          height: 100px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          position: relative;
        }

        .joystick-thumb {
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          position: absolute;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .joystick-label {
          margin-top: 10px;
          color: white;
          font-size: 14px;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
        }

        .move-joystick {
          margin-left: 20px;
        }

        .look-joystick {
          margin-right: 20px;
        }
      `}</style>
    </>
  );
};

export default MobileJoystickOverlay;
