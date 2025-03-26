// App.js
import React, { useState, Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import "./App.css";
import WelcomeScreen from "./pages/WelcomeScreen";
import FirstPersonControls from "./widgets/FirstPersonControls";
import MuseumEnvironment from "./pages/MuseumEnvironment";
import useEmotionDetection from "./hooks/useEmotionDetection";
import {
  createJoystickRefs,
  createMovementHandlers,
  createLookHandlers,
} from "./utils/joystickUtils";
import AdaptiveSoundscapeSystem from "./components/AdaptiveSoundscapeSystem";
import MobileControls from "./widgets/MobileControls";
import MobileJoystickOverlay from "./utils/MobileControlOverlay";
import WebcamPermissionNotice from "./widgets/WebPermissionNotice";
import ExpressionRecorderOverlay from "./utils/EmotionOverlay";

// Loading Screen
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading Museum Environment...</p>
    </div>
  );
}

// Transition Effect
function RoomTransition({ isTransitioning }) {
  return (
    <div className={`room-transition ${isTransitioning ? "active" : ""}`}></div>
  );
}

// Main App
function App() {
  // App state
  const [isEntered, setIsEntered] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("Entrance");
  const [isInsideMuseum, setIsInsideMuseum] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movementMode, setMovementMode] = useState(null); // "desktop" | "mobile"
  const [showMovementSelection, setShowMovementSelection] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  
  // Create joystick refs and handlers
  const { moveRef, lookRef } = useMemo(() => createJoystickRefs(), []);
  const movementHandlers = useMemo(
    () => createMovementHandlers(moveRef),
    [moveRef]
  );
  const lookHandlers = useMemo(() => createLookHandlers(lookRef), [lookRef]);

  // Detect if the device is likely mobile
  useEffect(() => {
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // Auto-select mobile controls on mobile devices
    if (isEntered && showMovementSelection) {
      if (detectMobile()) {
        setMovementMode("mobile");
        setShowMovementSelection(false);
      }
    }
  }, [isEntered, showMovementSelection]);

  // Emotion detection hook (polling every 15 seconds)
  const { emotion, loading, permissionGranted, confidence, hasDetected, triggerDetection } = useEmotionDetection(true, 15000);

  // Handle room transitions
  const handleRoomChange = (newRoom) => {
    if (newRoom === "WelcomeScreen") {
      setIsEntered(false);
      setIsInsideMuseum(false);
      setTimeout(() => {
        setIsEntered(false);
        setCurrentRoom("Entrance"); // Reset to entrance for next time
      }, 2000); // 2 seconds exit transition
    } else {
      setIsTransitioning(true);
      setIsInsideMuseum(true);
      setTimeout(() => {
        setCurrentRoom(newRoom);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 800);
    }
  };

  // Start experience when entering museum
  const handleEnterMuseum = () => {
    setIsEntered(true);
    setIsInsideMuseum(true);
    setShowMovementSelection(true);
    // setShowRecorder(true);
  };
  
  // emotion overlay
  const handleStartRecording = () => {
    setShowRecorder(true);
    triggerDetection();
  };

  const handleCancelRecording = () => {
    setShowRecorder(false);
  };

  const handleCompleteRecording = () => {
    setShowRecorder(false);
    triggerDetection(); // only start capture after countdown
  };

  // Simulate initial loading
  useEffect(() => {
    if (isEntered) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [isEntered]);

  return (
    <div className="App">
      {!isEntered ? (
        <WelcomeScreen onEnter={handleEnterMuseum} />
      ) : (
        <>
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <>
              {showMovementSelection && (
                <div className="movement-selection-modal">
                  <h2>Select Movement Mode</h2>
                  <button
                    onClick={() => {
                      setMovementMode("desktop");
                      setShowMovementSelection(false);
                    }}
                  >
                    🖥️ Desktop (WASD + Mouse)
                  </button>
                  <button
                    onClick={() => {
                      setMovementMode("mobile");
                      setShowMovementSelection(false);
                    }}
                  >
                    📱 Mobile (Touch Controls)
                  </button>
                </div>
              )}

              <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 70 }}>
                <Physics gravity={[0, -9.8, 0]}>
                  <Suspense fallback={null}>
                    <MuseumEnvironment
                      currentRoom={currentRoom}
                      onDoorClick={handleRoomChange}
                    />
                    {movementMode === "desktop" && (
                      <FirstPersonControls currentRoom={currentRoom} />
                    )}

                    {movementMode === "mobile" && (
                      <MobileControls
                        currentRoom={currentRoom}
                        moveRef={moveRef}
                        lookRef={lookRef}
                      />
                    )}
                  </Suspense>
                </Physics>
              </Canvas>

              {/* Integrated Adaptive Soundscape System */}
              {isInsideMuseum && (
                <>
                  <WebcamPermissionNotice
                    permissionGranted={handleStartRecording}
                  />
                  <AdaptiveSoundscapeSystem
                    detectedEmotion={hasDetected ? emotion : "Neutral"}
                    detectionConfidence={confidence}
                    currentRoom={currentRoom}
                    isEnabled={true}
                    permissionGranted={permissionGranted}
                  />
                </>
              )}
              {showRecorder && (
                <ExpressionRecorderOverlay
                  onComplete={handleCompleteRecording}
                  onCancel={handleCancelRecording}
                />
              )}

              {movementMode === "mobile" && (
                <MobileJoystickOverlay
                  onMoveStart={movementHandlers.onMoveStart}
                  onMove={movementHandlers.onMove}
                  onMoveEnd={movementHandlers.onMoveEnd}
                  onLookStart={lookHandlers.onLookStart}
                  onLook={lookHandlers.onLook}
                  onLookEnd={lookHandlers.onLookEnd}
                />
              )}

              <div className="controls-help">
                {movementMode === "desktop" ? (
                  <p>
                    Move: WASD | Look: Mouse | Click canvas to enable controls
                  </p>
                ) : (
                  <p>Left joystick: Move | Right joystick: Look</p>
                )}
              </div>
              <RoomTransition isTransitioning={isTransitioning} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
