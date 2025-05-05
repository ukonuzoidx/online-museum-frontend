import React, { useState, useEffect, useRef } from "react";
import MuseumMusicPlayer from "../widgets/MusicPlayer";
import MoodMonitorPanel from "./MoodMonitorPanel";

// Enhanced Adaptive Soundscape System that properly responds to emotion changes
const AdaptiveSoundscapeSystem = ({
  detectedEmotion,
  detectionConfidence,
  currentRoom,
  isEnabled = true,
  permissionGranted,
}) => {
  // Soundscape state
  const [stableEmotion, setStableEmotion] = useState("Neutral");
  const [previousEmotion, setPreviousEmotion] = useState("Neutral");
  const [emotionHistory, setEmotionHistory] = useState(["Neutral"]);
  const [consistencyCounter, setConsistencyCounter] = useState(0);
  const [lastEmotionUpdate, setLastEmotionUpdate] = useState(Date.now());

  // Soundscape settings
  const [musicMode, setMusicMode] = useState("immersive");
  const [volume, setVolume] = useState(0.6);
  const [audioReady, setAudioReady] = useState(false);

  // Refs for tracking and debugging
  const audioContextRef = useRef(null);
  const debugInfoRef = useRef({
    lastDetection: "None",
    emotionChanges: 0,
    musicChanges: 0,
    currentTrack: "None",
  });

  // Log important events to help debugging
  const logEvent = (event, details) => {
    console.log(`[AdaptiveSoundscape] ${event}:`, details);
  };

  // Initialize the audio context on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        try {
          // Create AudioContext on first user interaction
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
          setAudioReady(true);
          logEvent("Audio context initialized", audioContextRef.current.state);
        } catch (err) {
          console.error("Failed to initialize audio context:", err);
        }
      }
    };

    // Initialize on first interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Room-specific settings
  const [roomSettings, setRoomSettings] = useState({});

  // Process incoming emotion detections with stability filter
  useEffect(() => {
    if (!isEnabled || !detectedEmotion || !detectionConfidence) return;

    const parsedConfidence =
      typeof detectionConfidence === "string"
        ? parseFloat(detectionConfidence.replace("%", ""))
        : detectionConfidence;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastEmotionUpdate;

    // Track the detection for debugging
    debugInfoRef.current.lastDetection = `${detectedEmotion} (${parsedConfidence.toFixed(
      1
    )}%)`;

    // Ignore low confidence detections
    if (parsedConfidence < 25) {
      logEvent(
        "Low confidence detection ignored",
        `${parsedConfidence}% for ${detectedEmotion}`
      );
      return;
    }

    // Apply consistency filter
    if (detectedEmotion === previousEmotion) {
      setConsistencyCounter((prevCount) => {
        const newCount = prevCount + 1;

        // If we have consistent detections of a new emotion, update stable emotion
        if (newCount >= 2 && detectedEmotion !== stableEmotion) {
          // Capitalize first letter
          const formattedEmotion =
            detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1);

          logEvent(
            "Emotion stabilized",
            `${formattedEmotion} (${parsedConfidence.toFixed(1)}%)`
          );
          debugInfoRef.current.emotionChanges += 1;

          // Update stable emotion
          setStableEmotion(formattedEmotion);

          // Update emotion history (keep last 5)
          setEmotionHistory((prev) => [...prev.slice(-4), formattedEmotion]);

          // Record timestamp
          setLastEmotionUpdate(now);
        }

        return newCount;
      });
    } else {
      // New emotion detected, start consistency counter
      logEvent(
        "New emotion detected",
        `${detectedEmotion} (changed from ${previousEmotion})`
      );
      setPreviousEmotion(detectedEmotion);
      setConsistencyCounter(1);
    }
  }, [
    detectedEmotion,
    detectionConfidence,
    isEnabled,
    previousEmotion,
    stableEmotion,
    lastEmotionUpdate,
  ]);

  // Apply room-specific soundscape adjustments
  useEffect(() => {
    if (!currentRoom) return;

    logEvent("Room changed", currentRoom);

    // Define room-specific soundscape settings
    const roomSoundscapeSettings = {
      Entrance: {
        defaultMode: "immersive",
        volumeAdjustment: 0, // normal volume
      },
      "Gallery 1": {
        defaultMode: "immersive",
        volumeAdjustment: 0.1,
      },
      "Gallery 2": {
        defaultMode: "relaxed",
        volumeAdjustment: -0.1, // slightly quieter
      },
      "Gallery 3": {
        defaultMode: "relaxed",
        volumeAdjustment: -0.2, // quieter
      },
      Restrooms: {
        defaultMode: "silent",
        volumeAdjustment: 0,
      },
    };

    // Apply default settings for the room if we have them
    const settings =
      roomSoundscapeSettings[currentRoom] || roomSoundscapeSettings["Entrance"];
    setRoomSettings(settings);

    // If this is first entrance to the room, apply its default mode
    if (!musicMode || musicMode === "auto") {
      setMusicMode(settings.defaultMode);
      logEvent("Setting default music mode for room", settings.defaultMode);
    }
  }, [currentRoom, musicMode]);

  // Handle music mode changes
  const handleMusicModeChange = (newMode) => {
    setMusicMode(newMode);
    debugInfoRef.current.musicChanges += 1;
    logEvent("Music mode changed", newMode);
  };

  // Only render components if the system is enabled
  if (!isEnabled) return null;

  return (
    <>
      <MuseumMusicPlayer
        detectedEmotion={stableEmotion}
        mode={musicMode}
        onModeChange={handleMusicModeChange}
        audioReady={audioReady}
      />

      <MoodMonitorPanel
        emotionHistory={emotionHistory}
        stableEmotion={stableEmotion}
        confidence={detectionConfidence}
        currentRoom={currentRoom}
      />

      {/* Debug info overlay when pressing D key */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "12px",
            zIndex: 9999,
            display: "none", // Unhide with D key via CSS
            maxWidth: "300px",
          }}
          className="debug-soundscape"
        >
          <h4 style={{ margin: "0 0 5px 0" }}>Soundscape Debug</h4>
          <div>Permission: {permissionGranted ? "✅" : "❌"}</div>
          <div>Current Emotion: {stableEmotion}</div>
          <div>Last Detection: {debugInfoRef.current.lastDetection}</div>
          <div>Music Mode: {musicMode}</div>
          <div>Audio Ready: {audioReady ? "✅" : "❌"}</div>
          <div>Emotion Changes: {debugInfoRef.current.emotionChanges}</div>
          <div>Music Changes: {debugInfoRef.current.musicChanges}</div>
          <div>Current Room: {currentRoom}</div>
          <div>History: {emotionHistory.join(" → ")}</div>
        </div>
      )}

      {/* CSS for debug overlay - Press D to show/hide */}
      <style>{`
        body:not(.debug-mode) .debug-soundscape {
          display: none !important;
        }
        
        /* Debug mode toggle */
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        .debug-mode .debug-soundscape {
          display: block !important;
          animation: pulse 2s infinite;
        }
      `}</style>

      {/* Script for debug mode toggle */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('keydown', function(e) {
            if (e.key === 'd' || e.key === 'D') {
              document.body.classList.toggle('debug-mode');
              console.log('Debug mode: ' + (document.body.classList.contains('debug-mode') ? 'ON' : 'OFF'));
            }
          });
        `,
        }}
      ></script>
    </>
  );
};

export default AdaptiveSoundscapeSystem;