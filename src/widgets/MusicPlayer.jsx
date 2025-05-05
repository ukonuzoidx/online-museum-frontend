import React, { useState, useEffect, useRef, useCallback } from "react";

// Import audio files directly to ensure proper bundling - you'll need to update these paths
import happyMusic from "../assets/music/happy.mp3";
import sadMusic from "../assets/music/sad.mp3";
import angryMusic from "../assets/music/angry.mp3";
import neutralMusic from "../assets/music/neutral.mp3";
import fearMusic from "../assets/music/fear.mp3";
import disgustMusic from "../assets/music/disgust.mp3";
import ambientLoop from "../assets/music/ambient_base.mp3"; // Ambient background track

// Enhanced MusicPlayer component with reliable playback and autoplay notice
const MuseumMusicPlayer = ({
  detectedEmotion,
  mode = "immersive",
  onModeChange,
  audioReady,
}) => {
  // Dual audio references for crossfading
  const audioRefA = useRef(null);
  const audioRefB = useRef(null);
  const ambientRef = useRef(null);

  // Track which audio element is currently active
  const [activeAudio, setActiveAudio] = useState("A");

  // State management
  const [isPlaying, setIsPlaying] = useState(false); // Start paused until user interaction
  const [volume, setVolume] = useState(0.4);
  const [currentTrack, setCurrentTrack] = useState(neutralMusic);
  const [playbackError, setPlaybackError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showAutoplayNotice, setShowAutoplayNotice] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Track playback state
  const [playbackState, setPlaybackState] = useState({
    hasStarted: false,
    hasLoaded: false,
    isBuffering: false,
    progress: 0,
    duration: 0,
  });

  // Emotion tracking
  const [emotionHistory, setEmotionHistory] = useState([]);

  // Loading states - using refs to avoid update loops
  const audioALoaded = useRef(false);
  const audioBLoaded = useRef(false);
  const ambientLoaded = useRef(false);

  // Refs for tracking current state to avoid closure issues
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const modeRef = useRef(localMode);
  const userInteractedRef = useRef(userInteracted);
  const lastEmotionRef = useRef(detectedEmotion || "Neutral");
  const pendingTrackChangeRef = useRef(null);

  // Track load/play attempts
  const attemptCountRef = useRef(0);
  const lastAttemptTimeRef = useRef(0);

  // Map emotions to music files
  const emotionMusicMap = {
    Happy: happyMusic,
    Sad: sadMusic,
    Angry: angryMusic,
    Neutral: neutralMusic,
    Surprise: happyMusic, // Reusing happy for surprise
    Disgust: disgustMusic,
    Fear: fearMusic,
  };

  // Debug logging
  const logEvent = (event, details) => {
    console.log(`[MusicPlayer] ${event}:`, details);
  };

  // Handle user interaction to enable audio
  const handleUserInteraction = useCallback(() => {
    if (!userInteractedRef.current) {
      logEvent("User interaction detected", "Enabling audio");
      setUserInteracted(true);
      userInteractedRef.current = true;
      setShowAutoplayNotice(false);

      // Start playing
      setIsPlaying(true);
    }
  }, []);

  // Safe audio play function with retry logic
  const safePlayAudio = useCallback(
    async (audioElement, targetVolume = null) => {
      if (!audioElement) return false;

      // If volume is specified, set it before playing
      if (targetVolume !== null) {
        audioElement.volume = targetVolume;
      }

      // Try to play with retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          await audioElement.play();
          return true;
        } catch (err) {
          attempts++;
          logEvent(`Play attempt ${attempts} failed`, err.message);

          if (attempts >= maxAttempts) {
            logEvent("Max play attempts reached", "Giving up");
            return false;
          }

          // Wait a moment before retrying
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      return false;
    },
    []
  );

  // Crossfade function with improved error handling
  const performCrossfade = useCallback(
    async (newTrack) => {
      if (isCrossfading) {
        logEvent("Already crossfading", "Ignoring request");
        return;
      }

      setIsCrossfading(true);
      logEvent("Starting crossfade", newTrack);

      try {
        // Determine which audio element to fade in/out
        const fadeIn = activeAudio === "A" ? audioRefB : audioRefA;
        const fadeOut = activeAudio === "A" ? audioRefA : audioRefB;

        // Prepare the new track
        fadeIn.current.src = newTrack;
        fadeIn.current.volume = 0;

        // Load the new track
        fadeIn.current.load();

        // Wait for the audio to be loadable
        let loadAttempts = 0;
        const maxLoadAttempts = 10;

        while (loadAttempts < maxLoadAttempts) {
          if (fadeIn.current.readyState >= 2) {
            // HAVE_CURRENT_DATA or better
            break;
          }

          loadAttempts++;
          logEvent(
            `Waiting for audio to load`,
            `attempt ${loadAttempts}/${maxLoadAttempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Try to play the new track
        const playSuccess = await safePlayAudio(fadeIn.current, 0);

        if (!playSuccess) {
          logEvent("Failed to play new track", "Aborting crossfade");
          setIsCrossfading(false);
          return;
        }

        logEvent("Started playing new track", "Beginning crossfade");

        // Perform the crossfade
        const crossfadeDuration = 1500;
        const steps = 15;
        const volumeStep = volumeRef.current / steps;
        const interval = crossfadeDuration / steps;

        let step = 0;
        const crossfadeInterval = setInterval(() => {
          step++;

          if (step <= steps) {
            // Calculate new volumes
            const fadeOutVolume = volumeRef.current - volumeStep * step;
            const fadeInVolume = volumeStep * step;

            // Apply volumes
            if (fadeOut.current)
              fadeOut.current.volume = Math.max(0, fadeOutVolume);
            if (fadeIn.current)
              fadeIn.current.volume = Math.min(volumeRef.current, fadeInVolume);
          } else {
            // Crossfade complete
            clearInterval(crossfadeInterval);

            // Stop the old track
            if (fadeOut.current) {
              fadeOut.current.pause();
              fadeOut.current.currentTime = 0;
            }

            // Toggle active audio
            setActiveAudio((prevActive) => (prevActive === "A" ? "B" : "A"));

            // Update loading state for the new active audio
            if (activeAudio === "A") {
              audioBLoaded.current = true;
            } else {
              audioALoaded.current = true;
            }

            // End crossfade state
            setIsCrossfading(false);
            logEvent("Crossfade complete", activeAudio === "A" ? "B" : "A");
          }
        }, interval);
      } catch (error) {
        logEvent("Error during crossfade", error.message);
        setIsCrossfading(false);
      }
    },
    [activeAudio, isCrossfading, safePlayAudio]
  );

  // Setup audio elements and attach event listeners
  useEffect(() => {
    logEvent("MuseumMusicPlayer mounted", currentTrack);

    // Setup audio element A
    if (audioRefA.current) {
      audioRefA.current.volume = 0;
      audioRefA.current.loop = true;

      // Handle loading state
      audioRefA.current.oncanplaythrough = () => {
        audioALoaded.current = true;
        logEvent("Audio A loaded", "Ready to play");
      };

      audioRefA.current.onerror = (e) => {
        logEvent("Error loading Audio A", e);
      };

      // Set initial track
      audioRefA.current.src = currentTrack;
      audioRefA.current.load();
    }

    // Setup audio element B
    if (audioRefB.current) {
      audioRefB.current.volume = 0;
      audioRefB.current.loop = true;

      // Handle loading state
      audioRefB.current.oncanplaythrough = () => {
        audioBLoaded.current = true;
        logEvent("Audio B loaded", "Ready to play");
      };

      audioRefB.current.onerror = (e) => {
        logEvent("Error loading Audio B", e);
      };
    }

    // Setup ambient track
    if (ambientRef.current) {
      ambientRef.current.volume = 0;
      ambientRef.current.loop = true;

      // Handle loading state
      ambientRef.current.oncanplaythrough = () => {
        ambientLoaded.current = true;
        logEvent("Ambient audio loaded", "Ready to play");
      };

      ambientRef.current.onerror = (e) => {
        logEvent("Error loading Ambient audio", e);
      };

      // Set ambient track
      ambientRef.current.src = ambientLoop;
      ambientRef.current.load();
    }

    // Check for viewport size to set initial minimized state for mobile
    const checkViewportSize = () => {
      setIsMinimized(window.innerWidth < 768);
    };

    // Initialize based on current viewport
    checkViewportSize();

    // Listen for resize events
    window.addEventListener("resize", checkViewportSize);

    return () => {
      logEvent("MuseumMusicPlayer unmounted", "Cleaning up resources");

      // Clean up audio on unmount
      if (audioRefA.current) {
        audioRefA.current.oncanplaythrough = null;
        audioRefA.current.onerror = null;
        audioRefA.current.pause();
      }

      if (audioRefB.current) {
        audioRefB.current.oncanplaythrough = null;
        audioRefB.current.onerror = null;
        audioRefB.current.pause();
      }

      if (ambientRef.current) {
        ambientRef.current.oncanplaythrough = null;
        ambientRef.current.onerror = null;
        ambientRef.current.pause();
      }

      window.removeEventListener("resize", checkViewportSize);
    };
  }, [currentTrack]);

  // Initialize audio playback after loading
  useEffect(() => {
    const canPlayAudio =
      audioALoaded.current &&
      ambientLoaded.current &&
      userInteracted &&
      isPlaying;

    if (canPlayAudio) {
      logEvent("Audio loaded and user has interacted", "Safe to play audio");

      // Safe to play audio
      try {
        if (activeAudio === "A" && audioRefA.current) {
          audioRefA.current.volume = volume;
          safePlayAudio(audioRefA.current, volume);
        } else if (activeAudio === "B" && audioRefB.current) {
          audioRefB.current.volume = volume;
          safePlayAudio(audioRefB.current, volume);
        }

        // Play ambient if in immersive mode
        if (modeRef.current === "immersive" && ambientRef.current) {
          safePlayAudio(ambientRef.current, volume * 0.3);
        }
      } catch (error) {
        logEvent("Error starting audio playback", error.message);
      }
    }
  }, [userInteracted, isPlaying, volume, activeAudio, safePlayAudio]);

  // Track emotion changes and update history
  useEffect(() => {
    if (!detectedEmotion) return;

    // Only update emotion history if the emotion actually changed
    if (detectedEmotion !== lastEmotionRef.current) {
      // Update emotion history - use functional update to avoid dependency on previous state
      setEmotionHistory((prev) => {
        const updated = [...prev];
        if (updated.length >= 5) {
          updated.shift(); // Remove oldest
        }
        updated.push(detectedEmotion);
        return updated;
      });

      lastEmotionRef.current = detectedEmotion;

      // Get appropriate track for this emotion
      const newTrack =
        emotionMusicMap[detectedEmotion] || emotionMusicMap["Neutral"];

      // Only change if different from current track
      if (newTrack !== currentTrackRef.current) {
        logEvent("Emotion changed, scheduling track change", detectedEmotion);

        // If we can't play yet, store for later
        if (!userInteracted || !isPlaying) {
          logEvent("Storing track change for later", newTrack);
          pendingTrackChangeRef.current = newTrack;
        }

        // Update current track reference and state
        currentTrackRef.current = newTrack;
        setCurrentTrack(newTrack);

        // Initiate crossfade if playing and not already crossfading
        if (userInteracted && isPlaying && !isCrossfading) {
          performCrossfade(newTrack);
        }
      }
    }
  }, [
    detectedEmotion,
    userInteracted,
    isPlaying,
    isCrossfading,
    performCrossfade,
  ]);

  // Handle pending track changes when playback becomes available
  useEffect(() => {
    if (
      userInteracted &&
      isPlaying &&
      pendingTrackChangeRef.current &&
      !isCrossfading
    ) {
      logEvent(
        "Processing pending track change",
        pendingTrackChangeRef.current
      );
      const newTrack = pendingTrackChangeRef.current;
      pendingTrackChangeRef.current = null;

      performCrossfade(newTrack);
    }
  }, [userInteracted, isPlaying, isCrossfading, performCrossfade]);

  // Handle play/pause toggle
  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (!userInteracted) {
      logEvent("User hasn't interacted yet", "Can't control audio");
      return;
    }

    if (audioRefA.current && audioRefB.current) {
      try {
        if (isPlaying) {
          // Always try to play the active audio
          const activeRef =
            activeAudio === "A" ? audioRefA.current : audioRefB.current;

          if (activeRef.paused) {
            logEvent("Resuming playback", activeAudio);
            safePlayAudio(activeRef, volume);
          }

          // Play ambient if in immersive mode
          if (
            modeRef.current === "immersive" &&
            ambientRef.current &&
            ambientRef.current.paused
          ) {
            safePlayAudio(ambientRef.current, volume * 0.3);
          }
        } else {
          // Pause both audio elements
          logEvent("Pausing all audio", "");
          audioRefA.current.pause();
          audioRefB.current.pause();
          if (ambientRef.current) ambientRef.current.pause();
        }
      } catch (error) {
        logEvent("Error toggling playback", error.message);
      }
    }
  }, [isPlaying, activeAudio, userInteracted, volume, safePlayAudio]);

  // Handle volume changes
  useEffect(() => {
    volumeRef.current = volume;

    // Apply volume to active audio
    if (activeAudio === "A" && audioRefA.current) {
      audioRefA.current.volume = volume;
    } else if (activeAudio === "B" && audioRefB.current) {
      audioRefB.current.volume = volume;
    }

    // Ambient track at reduced volume
    if (ambientRef.current && modeRef.current === "immersive") {
      ambientRef.current.volume = volume * 0.3;
    }
  }, [volume, activeAudio]);

  // Sync with incoming mode prop
  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  // Handle mode changes
  useEffect(() => {
    modeRef.current = localMode;

    if (!userInteracted) {
      logEvent("User hasn't interacted yet", "Can't control audio modes");
      return;
    }

    // Update mode settings
    switch (localMode) {
      case "immersive":
        // Enable both emotion and ambient tracks
        if (ambientRef.current) {
          ambientRef.current.volume = volume * 0.3;
          if (isPlaying && ambientRef.current.paused) {
            safePlayAudio(ambientRef.current, volume * 0.3);
          }
        }
        break;

      case "relaxed":
        // Only emotion tracks, no ambient
        if (ambientRef.current) {
          ambientRef.current.pause();
        }
        break;

      case "silent":
        // Pause all audio
        if (audioRefA.current) audioRefA.current.pause();
        if (audioRefB.current) audioRefB.current.pause();
        if (ambientRef.current) ambientRef.current.pause();
        break;

      default:
        break;
    }
  }, [localMode, volume, isPlaying, userInteracted, safePlayAudio]);

  // Toggle debug mode
  const toggleDebug = () => {
    setDebugMode((prev) => !prev);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Helper function to get color based on emotion
  const getEmotionColor = (emotion) => {
    const colorMap = {
      Happy: "#ffcc00",
      Sad: "#6495ED",
      Angry: "#ff4d4d",
      Neutral: "#aaaaaa",
      Surprise: "#66ff66",
      Disgust: "#9370DB",
      Fear: "#800080",
    };

    return colorMap[emotion] || colorMap["Neutral"];
  };

  // Helper to capitalize first letter
  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="enhanced-music-player">
      {/* Hidden audio elements for crossfading */}
      <audio ref={audioRefA} preload="auto" />
      <audio ref={audioRefB} preload="auto" />
      <audio ref={ambientRef} preload="auto" />

      {/* Autoplay notice overlay */}
      {showAutoplayNotice && (
        <div
          className="autoplay-notice"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            maxWidth: "90%",
            width: "350px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            zIndex: 2000,
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "pulse 2s infinite",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>🎵</div>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
            Enable Emotional Music
          </h3>
          <p style={{ margin: "0 0 15px 0", fontSize: "14px", opacity: 0.9 }}>
            Your browser requires user interaction before playing audio.
            {detectedEmotion &&
              ` We've detected a ${detectedEmotion.toLowerCase()} mood.`}
          </p>
          <button
            onClick={handleUserInteraction}
            style={{
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 16px",
              fontSize: "16px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
              transition: "background-color 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            Start Music Experience
          </button>
          <style>{`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(74, 144, 226, 0); }
              100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
            }
          `}</style>
        </div>
      )}

      {/* Responsive player UI */}
      <div
        className="soundscape-controls"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          backgroundColor: "rgba(20, 20, 20, 0.8)",
          padding: isMinimized ? "6px" : "12px",
          borderRadius: "10px",
          color: "white",
          zIndex: 1000,
          fontSize: isMinimized ? "12px" : "14px",
          width: isMinimized ? "auto" : "300px",
          maxWidth: "90%",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header with toggle for minimized view */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMinimized ? 0 : "8px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
              fontSize: isMinimized ? "14px" : "16px",
            }}
          >
            <span
              className="mood-indicator"
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: getEmotionColor(detectedEmotion || "Neutral"),
                marginRight: "8px",
              }}
            ></span>
            <span className="track-name">
              Current Emotion
              {/* {currentTrack
                ? currentTrack.split("/").pop().replace(".mp3", "")
                : "No track"} */}
            </span>
            <span
              className="emotion-tag"
              style={{
                fontSize: "11px",
                background: "rgba(255,255,255,0.2)",
                padding: "2px 6px",
                borderRadius: "10px",
                marginLeft: "8px",
              }}
            >
              {detectedEmotion || "Neutral"}
            </span>
          </div>
          <span style={{ marginLeft: "8px" }}>{isMinimized ? "+" : "−"}</span>
        </div>

        {/* Only show details if not minimized */}
        {!isMinimized && (
          <div
            className="player-controls"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {!userInteracted ? (
              <div
                style={{
                  color: "#ffcc00",
                  padding: "4px",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "4px",
                  marginTop: "4px",
                  textAlign: "center",
                }}
              >
                <span
                  onClick={handleUserInteraction}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Click here to enable audio
                </span>
              </div>
            ) : isCrossfading ? (
              <div style={{ color: "#ffcc00", textAlign: "center" }}>
                Crossfading...
              </div>
            ) : null}

            {/* Emotion history visualization */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}
              >
                Recent Moods:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {emotionHistory
                  .slice()
                  .reverse()
                  .map((emotion, index) => (
                    <div
                      key={index}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: getEmotionColor(emotion),
                        opacity:
                          0.4 + (emotionHistory.length - 1 - index) * 0.15,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#fff",
                        textShadow: "0 0 2px #000",
                      }}
                      title={emotion}
                    >
                      {emotion.charAt(0)}
                    </div>
                  ))}
                {emotionHistory.length === 0 && (
                  <div style={{ padding: "8px", opacity: 0.7 }}>
                    No history yet
                  </div>
                )}
              </div>
            </div>

            {/* Player buttons */}
            <div
              className="player-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                className={`play-button ${isPlaying ? "playing" : ""}`}
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!userInteracted}
                style={{
                  backgroundColor: isPlaying ? "#f44336" : "#4CAF50",
                  border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <div
                className="volume-control"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexGrow: 1,
                }}
              >
                <span className="volume-icon">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  style={{
                    flexGrow: 1,
                    height: "5px",
                    appearance: "none",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>

            {/* Mode selector */}
            <div className="mode-selector" style={{ marginTop: "8px" }}>
              <select
                value={localMode}
                onChange={(e) => {
                  setLocalMode(e.target.value);
                  if (onModeChange) onModeChange(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "black",
                  borderRadius: "4px",
                }}
              >
                <option value="immersive">Immersive</option>
                <option value="relaxed">Relaxed</option>
                <option value="silent">Silent</option>
              </select>
            </div>

            <button
              className="debug-toggle"
              onClick={toggleDebug}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.7)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                marginTop: "8px",
                cursor: "pointer",
                alignSelf: "flex-end",
              }}
            >
              {debugMode ? "Hide Details" : "Show Details"}
            </button>
          </div>
        )}

        {/* Play/pause button - always visible even in minimized mode */}
        {isMinimized && (
          <div
            style={{
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!userInteracted) {
                  handleUserInteraction();
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: isPlaying ? "#ff5555" : "#55ff55",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              {isPlaying ? "■" : "▶"}
            </button>
          </div>
        )}

        {/* Debug panel */}
        {debugMode && !isMinimized && (
          <div
            className="player-debug"
            style={{
              marginTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              padding: "12px 0 0 0",
              fontSize: "12px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
              Music Player Debug
            </h4>
            <div>
              Current Track:{" "}
              {currentTrack ? currentTrack.split("/").pop() : "None"}
            </div>
            <div>Emotion: {detectedEmotion || "None"}</div>
            <div>Mode: {localMode}</div>
            <div>State: {isPlaying ? "Playing" : "Paused"}</div>
            <div>User Interacted: {userInteracted ? "Yes" : "No"}</div>
            <div>Active Audio: {activeAudio}</div>
            <div>Audio A Loaded: {audioALoaded.current ? "Yes" : "No"}</div>
            <div>Audio B Loaded: {audioBLoaded.current ? "Yes" : "No"}</div>
            <div>Ambient Loaded: {ambientLoaded.current ? "Yes" : "No"}</div>
            <div>Crossfading: {isCrossfading ? "Yes" : "No"}</div>
            <div>Volume: {(volume * 100).toFixed(0)}%</div>
            <div>Emotion History: {emotionHistory.join(" → ")}</div>
            {playbackError && (
              <div className="error" style={{ color: "#ff6b6b" }}>
                Error: {playbackError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MuseumMusicPlayer;
