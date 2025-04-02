// // App.js
// import React, { useState, Suspense, useEffect, useMemo } from "react";
// import { Canvas } from "@react-three/fiber";
// import { Physics } from "@react-three/cannon";
// import "./App.css";
// import WelcomeScreen from "./pages/WelcomeScreen";
// import FirstPersonControls from "./widgets/FirstPersonControls";
// import MuseumEnvironment from "./pages/MuseumEnvironment";
// import useEmotionDetection from "./hooks/useEmotionDetection";
// import {
//   createJoystickRefs,
//   createMovementHandlers,
//   createLookHandlers,
// } from "./utils/joystickUtils";
// import AdaptiveSoundscapeSystem from "./components/AdaptiveSoundscapeSystem";
// import MobileControls from "./widgets/MobileControls";
// import MobileJoystickOverlay from "./utils/MobileControlOverlay";
// import WebcamPermissionNotice from "./widgets/WebPermissionNotice";
// import ExpressionRecorderOverlay from "./utils/EmotionOverlay";

// // Loading Screen
// function LoadingScreen() {
//   return (
//     <div className="loading-screen">
//       <div className="loading-spinner"></div>
//       <p>Loading Museum Environment...</p>
//     </div>
//   );
// }

// // Transition Effect
// function RoomTransition({ isTransitioning }) {
//   return (
//     <div className={`room-transition ${isTransitioning ? "active" : ""}`}></div>
//   );
// }

// // Main App
// function App() {
//   // App state
//   const [isEntered, setIsEntered] = useState(false);
//   const [currentRoom, setCurrentRoom] = useState("Entrance");
//   const [isInsideMuseum, setIsInsideMuseum] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [movementMode, setMovementMode] = useState(null); // "desktop" | "mobile"
//   const [showMovementSelection, setShowMovementSelection] = useState(false);
//   const [showRecorder, setShowRecorder] = useState(false);

//   // Create joystick refs and handlers
//   const { moveRef, lookRef } = useMemo(() => createJoystickRefs(), []);
//   const movementHandlers = useMemo(
//     () => createMovementHandlers(moveRef),
//     [moveRef]
//   );
//   const lookHandlers = useMemo(() => createLookHandlers(lookRef), [lookRef]);

//   // Detect if the device is likely mobile
//   useEffect(() => {
//     const detectMobile = () => {
//       return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//         navigator.userAgent
//       );
//     };

//     // Auto-select mobile controls on mobile devices
//     if (isEntered && showMovementSelection) {
//       if (detectMobile()) {
//         setMovementMode("mobile");
//         setShowMovementSelection(false);
//       }
//     }
//   }, [isEntered, showMovementSelection]);

//   // Emotion detection hook (polling every 15 seconds)
//   const { emotion, loading, permissionGranted, confidence, hasDetected, triggerDetection } = useEmotionDetection(true, 15000);

//   // Handle room transitions
//   const handleRoomChange = (newRoom) => {
//     if (newRoom === "WelcomeScreen") {
//       setIsEntered(false);
//       setIsInsideMuseum(false);
//       setTimeout(() => {
//         setIsEntered(false);
//         setCurrentRoom("Entrance"); // Reset to entrance for next time
//       }, 2000); // 2 seconds exit transition
//     } else {
//       setIsTransitioning(true);
//       setIsInsideMuseum(true);
//       setTimeout(() => {
//         setCurrentRoom(newRoom);
//         setTimeout(() => {
//           setIsTransitioning(false);
//         }, 500);
//       }, 800);
//     }
//   };

//   // Start experience when entering museum
//   const handleEnterMuseum = () => {
//     setIsEntered(true);
//     setIsInsideMuseum(true);
//     setShowMovementSelection(true);
//     // setShowRecorder(true);
//   };

//   // emotion overlay
//   const handleStartRecording = () => {
//     setShowRecorder(true);
//     triggerDetection();
//   };

//   const handleCancelRecording = () => {
//     setShowRecorder(false);
//   };

//   const handleCompleteRecording = () => {
//     setShowRecorder(false);
//     triggerDetection(); // only start capture after countdown
//   };

//   // Simulate initial loading
//   useEffect(() => {
//     if (isEntered) {
//       setTimeout(() => {
//         setIsLoading(false);
//       }, 2000);
//     }
//   }, [isEntered]);

//   return (
//     <div className="App">
//       {!isEntered ? (
//         <WelcomeScreen onEnter={handleEnterMuseum} />
//       ) : (
//         <>
//           {isLoading ? (
//             <LoadingScreen />
//           ) : (
//             <>
//               {showMovementSelection && (
//                 <div className="movement-selection-modal">
//                   <h2>Select Movement Mode</h2>
//                   <button
//                     onClick={() => {
//                       setMovementMode("desktop");
//                       setShowMovementSelection(false);
//                     }}
//                   >
//                     🖥️ Desktop (WASD + Mouse)
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMovementMode("mobile");
//                       setShowMovementSelection(false);
//                     }}
//                   >
//                     📱 Mobile (Touch Controls)
//                   </button>
//                 </div>
//               )}

//               <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 70 }}>
//                 <Physics gravity={[0, -9.8, 0]}>
//                   <Suspense fallback={null}>
//                     <MuseumEnvironment
//                       currentRoom={currentRoom}
//                       onDoorClick={handleRoomChange}
//                     />
//                     {movementMode === "desktop" && (
//                       <FirstPersonControls currentRoom={currentRoom} />
//                     )}

//                     {movementMode === "mobile" && (
//                       <MobileControls
//                         currentRoom={currentRoom}
//                         moveRef={moveRef}
//                         lookRef={lookRef}
//                       />
//                     )}
//                   </Suspense>
//                 </Physics>
//               </Canvas>

//               {/* Integrated Adaptive Soundscape System */}
//               {isInsideMuseum && (
//                 <>
//                   <WebcamPermissionNotice
//                     permissionGranted={handleStartRecording}
//                   />
//                   <AdaptiveSoundscapeSystem
//                     detectedEmotion={hasDetected ? emotion : "Neutral"}
//                     detectionConfidence={confidence}
//                     currentRoom={currentRoom}
//                     isEnabled={true}
//                     permissionGranted={permissionGranted}
//                   />
//                 </>
//               )}
//               {showRecorder && (
//                 <ExpressionRecorderOverlay
//                   onComplete={handleCompleteRecording}
//                   onCancel={handleCancelRecording}
//                 />
//               )}

//               {movementMode === "mobile" && (
//                 <MobileJoystickOverlay
//                   onMoveStart={movementHandlers.onMoveStart}
//                   onMove={movementHandlers.onMove}
//                   onMoveEnd={movementHandlers.onMoveEnd}
//                   onLookStart={lookHandlers.onLookStart}
//                   onLook={lookHandlers.onLook}
//                   onLookEnd={lookHandlers.onLookEnd}
//                 />
//               )}

//               <div className="controls-help">
//                 {movementMode === "desktop" ? (
//                   <p>
//                     Move: WASD | Look: Mouse | Click canvas to enable controls
//                   </p>
//                 ) : (
//                   <p>Left joystick: Move | Right joystick: Look</p>
//                 )}
//               </div>
//               <RoomTransition isTransitioning={isTransitioning} />
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

// App.js (Updated with enhanced emotion detection)
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
import RecordingIndicator from "./utils/RecordingIndicator";
import fetchArtworksForDepartment from "./hooks/useMuseumHook";

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
  // Artwork state for all galleries
  const [galleryArtworks, setGalleryArtworks] = useState({
    gallery1: [],
    gallery2: [],
    gallery3: [],
    loading: true,
  });

  // Preload all artworks during initial app loading
  useEffect(() => {
    if (isEntered && isLoading) {
      // Start loading all artwork collections in parallel
      const loadAllArtworks = async () => {
        try {
          console.log("Preloading all gallery artworks...");

          // Create promises for each gallery's artwork collection
          const gallery1Promise = fetchArtworksForDepartment(
            11,
            "Paintings",
            25
          );
          const gallery2Promise = fetchArtworksForDepartment(
            5,
            "Sculpture",
            65,
            true
          );
          const gallery3Promise = fetchArtworksForDepartment(
            6,
            "Portrait",
            20,
            true
          );

          // Wait for all promises to resolve
          const [gallery1Data, gallery2Data, gallery3Data] = await Promise.all([
            gallery1Promise,
            gallery2Promise,
            gallery3Promise,
          ]);

          // Update state with all loaded artworks
          setGalleryArtworks({
            gallery1: gallery1Data,
            gallery2: gallery2Data,
            gallery3: gallery3Data,
            loading: false,
          });

          console.log("All gallery artworks preloaded successfully");

          // Now finish the loading screen
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } catch (error) {
          console.error("Error preloading artworks:", error);
          // Still hide loading screen even if there's an error
          setIsLoading(false);
        }
      };

      loadAllArtworks();
    }
  }, [isEntered, isLoading]);


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

  // IMPROVED: Emotion detection hook with more frequent polling (every 10 seconds)
  const {
    emotion,
    loading: emotionLoading,
    permissionGranted,
    confidence,
    hasDetected,
    triggerDetection,
  } = useEmotionDetection(true, 10000); // Poll every 10 seconds instead of 15

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

    // IMPROVED: Immediately request webcam permission on enter
    setTimeout(() => {
      handleStartRecording();
    }, 1000);
  };

  const handleCancelRecording = () => {
    console.log("Emotion recording cancelled");
    setShowRecorder(false);
  };

  const handleCompleteRecording = () => {
    console.log("Emotion recording completed, triggering detection...");
    setShowRecorder(false);
    triggerDetection(); // Start capture after countdown

    // IMPROVED: Set up periodic emotion detection reminders
    setupEmotionReminders();
  };

  // IMPROVED: Setup periodic emotion detection reminders
  const setupEmotionReminders = () => {
    // Remind user to refresh emotion detection every 2 minutes
    const reminderInterval = setInterval(() => {
      if (isInsideMuseum && permissionGranted) {
        setShowRecorder(true);
        setTimeout(() => {
          if (showRecorder) {
            handleCompleteRecording();
          }
        }, 5000);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(reminderInterval);
  };

  // Simulate initial loading
  useEffect(() => {
    if (isEntered) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [isEntered]);

  // IMPROVED: Trigger emotion detection when room changes
  useEffect(() => {
    if (isInsideMuseum && permissionGranted && !emotionLoading) {
      console.log(
        `Room changed to ${currentRoom}, triggering emotion detection...`
      );
      triggerDetection();
    }
  }, [currentRoom, isInsideMuseum, permissionGranted, emotionLoading]);

  const handleStartRecording = () => {
    console.log("Starting emotion recording...");
    setShowRecorder(true);

    // Add this notification
    if (
      window.Notification &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification("Museum Experience", {
            body: "We're analyzing your facial expression to personalize the music to your mood.",
            icon: "/favicon.ico",
          });
        }
      });
    }
  };

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
                      galleryArtworks={galleryArtworks}
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

              {/* IMPROVED: Enhanced Webcam Permission Notice - more visible */}
              {/* {isInsideMuseum && !permissionGranted && (
                <div className="webcam-permission-notice-enhanced">
                  <h3>📸 Enable Camera for Full Experience</h3>
                  <p>
                    Our museum adapts music based on your emotions. To
                    experience this feature, please allow camera access.
                  </p>
                  <button
                    className="permission-button"
                    onClick={handleStartRecording}
                  >
                    Enable Emotion Detection
                  </button>
                </div>
              )} */}

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

                  {/* IMPROVED: Emotion Detection Status */}
                  {permissionGranted && (
                    <div className="emotion-status">
                      <div
                        className="status-indicator"
                        style={{
                          background: hasDetected ? "#4CAF50" : "#FFC107",
                        }}
                      ></div>
                      {hasDetected
                        ? `Emotion: ${emotion} (${Math.round(confidence)}%)`
                        : "Detecting emotion..."}
                      <button
                        onClick={handleStartRecording}
                        className="refresh-button"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                  <RecordingIndicator
                    isRecording={emotionLoading}
                    onRequestRecording={handleStartRecording}
                  />

                  <PrivacyInfoButton />
                </>
              )}

              {/* {showRecorder && (
                <ExpressionRecorderOverlay
                  onComplete={handleCompleteRecording}
                  onCancel={handleCancelRecording}
                />
              )} */}

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

function PrivacyInfoButton() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button className="privacy-info-button" onClick={() => setShowInfo(true)}>
        Privacy Info
      </button>

      {showInfo && (
        <div className="privacy-info-overlay">
          <div className="privacy-info-content">
            <h2>Privacy Information</h2>
            <h3>About Facial Expression Detection</h3>
            <p>
              This museum experience uses your device's camera to detect your
              facial expression and adapt the music to match your mood.
            </p>

            <h3>How It Works</h3>
            <ul>
              <li>Your facial expression is analyzed in real-time</li>
              <li>Analysis happens only on your device</li>
              <li>No facial images are stored or transmitted</li>
              <li>
                Only the detected emotion (e.g., "happy", "neutral") is used
              </li>
            </ul>

            <h3>Your Control</h3>
            <p>
              You can disable facial recording at any time by clicking the
              recording indicator in the top-left corner. You'll still enjoy the
              museum with default music.
            </p>

            <button className="close-button" onClick={() => setShowInfo(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .privacy-info-button {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 5px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          z-index: 1000;
        }

        .privacy-info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .privacy-info-content {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .privacy-info-content h2 {
          margin-top: 0;
          color: #333;
        }

        .privacy-info-content h3 {
          color: #555;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .privacy-info-content p,
        .privacy-info-content li {
          color: #666;
          line-height: 1.5;
        }

        .close-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 20px;
          cursor: pointer;
          font-size: 16px;
        }
      `}</style>
    </>
  );
}

// Component to get user consent for facial analysis
const PrivacyConsentModal = ({ onAccept, onDecline }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="privacy-consent-overlay">
      <div className="privacy-consent-modal">
        <h2>Welcome to the Museum Experience</h2>

        <div className="consent-icon">🎭 + 🎵</div>

        <p className="consent-description">
          This experience can detect your emotions using your camera to
          personalize the music as you explore different galleries.
        </p>

        <div className="consent-features">
          <div className="feature">
            <div className="feature-icon">😊</div>
            <div className="feature-text">
              <h4>Adaptive Music</h4>
              <p>Music that matches your mood</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">
              <h4>Privacy-Focused</h4>
              <p>No images stored or shared</p>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="privacy-details">
            <h3>How It Works</h3>
            <ul>
              <li>
                Your camera will be used to analyze your facial expressions
              </li>
              <li>Analysis is done on your device, not on remote servers</li>
              <li>We detect emotions like "happy," "sad," or "surprised"</li>
              <li>The music in each gallery will adapt to your emotions</li>
              <li>No facial images or videos are stored or transmitted</li>
              <li>You can disable this at any time</li>
            </ul>
          </div>
        )}

        <div className="consent-buttons">
          <button
            className="show-details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Privacy Details"}
          </button>

          <div className="action-buttons">
            <button className="decline-button" onClick={onDecline}>
              No Thanks
            </button>
            <button className="accept-button" onClick={onAccept}>
              Allow Emotion Detection
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .privacy-consent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .privacy-consent-modal {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .consent-icon {
          font-size: 40px;
          margin: 20px 0;
        }

        .consent-description {
          color: #555;
          line-height: 1.5;
          margin-bottom: 25px;
        }

        .consent-features {
          display: flex;
          justify-content: space-around;
          margin-bottom: 25px;
        }

        .feature {
          display: flex;
          align-items: center;
          text-align: left;
        }

        .feature-icon {
          font-size: 30px;
          margin-right: 12px;
        }

        .feature-text h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .feature-text p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .privacy-details {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
          text-align: left;
        }

        .privacy-details h3 {
          margin-top: 0;
          color: #444;
        }

        .privacy-details ul {
          margin: 0;
          padding-left: 20px;
        }

        .privacy-details li {
          margin-bottom: 8px;
          color: #555;
        }

        .consent-buttons {
          display: flex;
          flex-direction: column;
        }

        .show-details-button {
          background: none;
          border: none;
          color: #2196f3;
          margin-bottom: 15px;
          cursor: pointer;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          justify-content: space-between;
        }

        .decline-button {
          background-color: #f5f5f5;
          color: #333;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          width: 45%;
        }

        .accept-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          width: 45%;
        }

        @media (max-width: 600px) {
          .consent-features {
            flex-direction: column;
            gap: 15px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 10px;
          }

          .decline-button,
          .accept-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
