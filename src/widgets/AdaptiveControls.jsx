import React, { useEffect, useState } from "react";
import TouchControls from "./TouchControl";
import FirstPersonControls from "./FirstPersonControls";
import { Html } from "@react-three/drei";

/**
 * AdaptiveControls - Manages controls based on device type and user preference
 *
 * This component handles:
 * 1. Device detection (mobile vs desktop)
 * 2. Control scheme selection
 * 3. Appropriate controls rendering
 */
const AdaptiveControls = ({ currentRoom }) => {
  // Available control schemes
  const CONTROL_SCHEMES = {
    KEYBOARD_MOUSE: "keyboard_mouse",
    TOUCH_DUAL: "touch_dual",
  };

  // State to track device type and selected control scheme
  const [isMobile, setIsMobile] = useState(false);
  const [controlScheme, setControlScheme] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  // Detect device type on mount
  useEffect(() => {
    const detectMobile = () => {
      // Check for touch capability and small screen
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;

      return isTouchDevice && isSmallScreen;
    };

    const mobile = detectMobile();
    setIsMobile(mobile);

    // Set initial control scheme based on device
    const savedScheme = localStorage.getItem("preferredControlScheme");

    if (savedScheme) {
      setControlScheme(savedScheme);
    } else {
      // Default based on device type
      setControlScheme(
        mobile ? CONTROL_SCHEMES.TOUCH_DUAL : CONTROL_SCHEMES.KEYBOARD_MOUSE
      );
      setShowSelector(true); // Show selector on first visit
    }

    // Handle resize events to update device detection
    const handleResize = () => {
      const newIsMobile = detectMobile();
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        // Only change scheme automatically if user hasn't explicitly selected one
        if (!localStorage.getItem("preferredControlScheme")) {
          setControlScheme(
            newIsMobile
              ? CONTROL_SCHEMES.TOUCH_DUAL
              : CONTROL_SCHEMES.KEYBOARD_MOUSE
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, CONTROL_SCHEMES]);

  // Handle control scheme selection
  const selectControlScheme = (scheme) => {
    setControlScheme(scheme);
    localStorage.setItem("preferredControlScheme", scheme);
    setShowSelector(false);
  };

  // Toggle control selector
  const toggleSelector = () => {
    setShowSelector((prev) => !prev);
  };

  // Render the appropriate controls based on selected scheme
  const renderControls = () => {
    switch (controlScheme) {
      case CONTROL_SCHEMES.KEYBOARD_MOUSE:
        return <FirstPersonControls currentRoom={currentRoom} />;
      case CONTROL_SCHEMES.TOUCH_DUAL:
        return <TouchControls currentRoom={currentRoom} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Render the active control system */}
      {renderControls()}

      {/* Control scheme selector */}
      {showSelector && (
        <Html>
          <div
            className="control-scheme-selector"
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: "10px",
              padding: "15px",
              zIndex: 1000,
              maxWidth: "90%",
              width: "350px",
              color: "white",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
              Choose Your Controls
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "15px",
              }}
            >
              <button
                onClick={() =>
                  selectControlScheme(CONTROL_SCHEMES.KEYBOARD_MOUSE)
                }
                style={{
                  backgroundColor:
                    controlScheme === CONTROL_SCHEMES.KEYBOARD_MOUSE
                      ? "#4a90e2"
                      : "#333",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px 15px",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  flex: 1,
                  margin: "0 5px",
                }}
              >
                <span
                  role="img"
                  aria-label="keyboard"
                  style={{ fontSize: "24px", marginBottom: "5px" }}
                >
                  ⌨️
                </span>
                <div>Keyboard & Mouse</div>
                <div
                  style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}
                >
                  WASD + Mouse Look
                </div>
              </button>

              <button
                onClick={() => selectControlScheme(CONTROL_SCHEMES.TOUCH_DUAL)}
                style={{
                  backgroundColor:
                    controlScheme === CONTROL_SCHEMES.TOUCH_DUAL
                      ? "#4a90e2"
                      : "#333",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px 15px",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  flex: 1,
                  margin: "0 5px",
                }}
              >
                <span
                  role="img"
                  aria-label="touch"
                  style={{ fontSize: "24px", marginBottom: "5px" }}
                >
                  👆
                </span>
                <div>Touch Controls</div>
                <div
                  style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}
                >
                  Dual Touch Joysticks
                </div>
              </button>
            </div>

            <button
              onClick={() => selectControlScheme(controlScheme)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "5px",
                padding: "5px 10px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Continue with selected
            </button>
          </div>
        </Html>
      )}

      {/* Toggle button to show selector again */}
      {!showSelector && (
        <Html>
          <button
            onClick={toggleSelector}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              cursor: "pointer",
              zIndex: 900,
            }}
            aria-label="Change controls"
          >
            🎮
          </button>
        </Html>
      )}

      {/* Controls help */}
      <Html>
        <div
          className="controls-help"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "5px",
            fontSize: "14px",
            zIndex: 900,
          }}
        >
          {controlScheme === CONTROL_SCHEMES.KEYBOARD_MOUSE ? (
            <p style={{ margin: 0 }}>
              Move: WASD | Look: Mouse | Click canvas to enable controls
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Left side: Move | Right side: Look around
            </p>
          )}
        </div>
      </Html>
    </>
  );
};

export default AdaptiveControls;
