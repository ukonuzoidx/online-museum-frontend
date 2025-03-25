import React, { useEffect, useRef, useState, useCallback } from "react";

// Import audio files directly to ensure proper bundling
import happyMusic from "../assets/music/happy.mp3";
import sadMusic from "../assets/music/sad.mp3";
import angryMusic from "../assets/music/angry.mp3";
import neutralMusic from "../assets/music/neutral.mp3";
import fearMusic from "../assets/music/fear.mp3";
import disgustMusic from "../assets/music/disgust.mp3";

// Ambient background tracks that can layer with emotion tracks
import ambientLoop from "../assets/music/ambient_base.mp3";

/**
 * Enhanced MuseumMusicPlayer with prominent autoplay notice
 * - Makes it clear to users that interaction is required
 * - Properly handles browser autoplay restrictions
 * - Provides clear visual feedback about audio state
 */
const MuseumMusicPlayer = ({
  detectedEmotion,
  mode = "immersive",
  onModeChange,
}) => {
  // Dual audio references for crossfading
  const audioRefA = useRef(null);
  const audioRefB = useRef(null);
  const ambientRef = useRef(null);

  // Track which audio element is currently active
  const [activeAudio, setActiveAudio] = useState("A");

  // Track states
  const [currentTrack, setCurrentTrack] = useState(neutralMusic);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused until user interaction
  const [volume, setVolume] = useState(0.6);
  const [localMode, setLocalMode] = useState(mode);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAutoplayNotice, setShowAutoplayNotice] = useState(true);

  // Loading states - using refs instead of state to avoid update loops
  const audioALoaded = useRef(false);
  const audioBLoaded = useRef(false);
  const ambientLoaded = useRef(false);

  // Emotion tracking
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Refs for tracking current state to avoid closure issues
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const modeRef = useRef(localMode);
  const userInteractedRef = useRef(userInteracted);
  const lastEmotionRef = useRef(detectedEmotion || "Neutral");
  const pendingTrackChangeRef = useRef(null);

  // Map emotions to imported audio files
  const emotionMusicMap = {
    Happy: happyMusic,
    Sad: sadMusic,
    Angry: angryMusic,
    Neutral: neutralMusic,
    Surprise: happyMusic, // Reusing happy for surprise
    Disgust: disgustMusic,
    Fear: fearMusic,
  };

  // Handle user interaction to enable audio
  const handleUserInteraction = useCallback(() => {
    if (!userInteractedRef.current) {
      console.log("User interaction detected, enabling audio");
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
          console.warn(`Play attempt ${attempts} failed:`, err);

          if (attempts >= maxAttempts) {
            console.error("Max play attempts reached, giving up");
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
        console.log("Already crossfading, ignoring request");
        return;
      }

      setIsCrossfading(true);
      console.log("Starting crossfade to", newTrack);

      try {
        // Determine which audio element to fade in/out
        const fadeIn = activeAudio === "A" ? audioRefB : audioRefA;
        const fadeOut = activeAudio === "A" ? audioRefA : audioRefB;

        // Prepare the new track
        fadeIn.current.src = newTrack;
        fadeIn.current.volume = 0;

        // Load the new track (this returns immediately)
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
          console.log(
            `Waiting for audio to load (attempt ${loadAttempts}/${maxLoadAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Try to play the new track
        const playSuccess = await safePlayAudio(fadeIn.current, 0);

        if (!playSuccess) {
          console.error("Failed to play new track during crossfade");
          setIsCrossfading(false);
          return;
        }

        console.log("Started playing new track, beginning crossfade");

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
            console.log(
              "Crossfade complete, new active audio:",
              activeAudio === "A" ? "B" : "A"
            );
          }
        }, interval);
      } catch (error) {
        console.error("Error during crossfade:", error);
        setIsCrossfading(false);
      }
    },
    [activeAudio, isCrossfading, safePlayAudio]
  );

  // Setup audio elements and attach event listeners
  useEffect(() => {
    console.log("Enhanced MuseumMusicPlayer mounted");

    // Setup audio element A
    if (audioRefA.current) {
      audioRefA.current.volume = 0;
      audioRefA.current.loop = true;

      // Handle loading state
      audioRefA.current.oncanplaythrough = () => {
        audioALoaded.current = true;
        console.log("Audio A loaded and ready");
      };

      audioRefA.current.onerror = (e) => {
        console.error("Error loading Audio A:", e);
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
        console.log("Audio B loaded and ready");
      };

      audioRefB.current.onerror = (e) => {
        console.error("Error loading Audio B:", e);
      };
    }

    // Setup ambient track
    if (ambientRef.current) {
      ambientRef.current.volume = 0;
      ambientRef.current.loop = true;

      // Handle loading state
      ambientRef.current.oncanplaythrough = () => {
        ambientLoaded.current = true;
        console.log("Ambient audio loaded and ready");
      };

      ambientRef.current.onerror = (e) => {
        console.error("Error loading Ambient audio:", e);
      };

      // Set ambient track
      ambientRef.current.src = ambientLoop;
      ambientRef.current.load();
    }

    // Add listeners for user interactions - but only for specific elements to avoid premature triggering
    // We'll manage interaction through our own buttons instead of document-wide events

    // Check for viewport size to set initial minimized state for mobile
    const checkViewportSize = () => {
      setIsMinimized(window.innerWidth < 768);
    };

    // Initialize based on current viewport
    checkViewportSize();

    // Listen for resize events
    window.addEventListener("resize", checkViewportSize);

    return () => {
      console.log("Enhanced MuseumMusicPlayer unmounted");

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

  // Initialize audio playback after loading - with more stable dependency array
  useEffect(() => {
    const canPlayAudio =
      audioALoaded.current &&
      ambientLoaded.current &&
      userInteracted &&
      isPlaying;

    if (canPlayAudio) {
      console.log("Audio loaded and user has interacted, safe to play audio");

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
        console.error("Error starting audio playback:", error);
      }
    }
  }, [userInteracted, isPlaying, volume, activeAudio, safePlayAudio]);

  // Track emotion changes and update history - simplified to prevent loops
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
        console.log(
          "🎧 Emotion changed, scheduling track change to",
          detectedEmotion
        );

        // If we can't play yet, store for later
        if (!userInteracted || !isPlaying) {
          console.log("Storing track change for when playback is enabled");
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
    emotionMusicMap,
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
      console.log(
        "Processing pending track change:",
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
      console.log("User hasn't interacted yet, can't control audio");
      return;
    }

    if (audioRefA.current && audioRefB.current) {
      try {
        if (isPlaying) {
          // Always try to play the active audio
          const activeRef =
            activeAudio === "A" ? audioRefA.current : audioRefB.current;

          if (activeRef.paused) {
            console.log("Resuming playback");
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
          console.log("Pausing all audio");
          audioRefA.current.pause();
          audioRefB.current.pause();
          if (ambientRef.current) ambientRef.current.pause();
        }
      } catch (error) {
        console.error("Error toggling playback:", error);
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
      console.log("User hasn't interacted yet, can't control audio modes");
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

  // Escape key to pause/play
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        console.log("Escape key pressed, toggling playback");
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Return the player UI - with autoplay notice overlay
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
          top: "110px",
          right: "10px",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: isMinimized ? "6px" : "12px",
          borderRadius: "6px",
          color: "white",
          zIndex: 1000,
          fontSize: isMinimized ? "12px" : "14px",
          width: isMinimized
            ? "auto"
            : window.innerWidth < 480
            ? "90%"
            : "240px",
          maxWidth: "90%",
          transition: "width 0.3s ease, height 0.3s ease",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
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
          <h3
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              fontSize: isMinimized ? "14px" : "16px",
            }}
          >
            🎭 Mood {!isMinimized && "Soundscape"}
            <div
              style={{
                marginLeft: "10px",
                width: isMinimized ? "16px" : "20px",
                height: isMinimized ? "16px" : "20px",
                borderRadius: "50%",
                backgroundColor: getEmotionColor(detectedEmotion || "Neutral"),
                transition: "background-color 1s ease",
              }}
            />
          </h3>
          <span style={{ marginLeft: "8px" }}>{isMinimized ? "+" : "−"}</span>
        </div>

        {/* Only show details if not minimized */}
        {!isMinimized && (
          <>
            <div style={{ marginBottom: "8px" }}>
              <div>Current Mood: {detectedEmotion || "Neutral"}</div>
              {!userInteracted ? (
                <div
                  style={{
                    color: "#ffcc00",
                    padding: "4px",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: "4px",
                    marginTop: "4px",
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
                <div style={{ color: "#ffcc00" }}>Crossfading...</div>
              ) : null}
            </div>

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

            {/* Mode selector */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ marginBottom: "4px", fontSize: "12px" }}>
                Experience Mode:
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["immersive", "relaxed", "silent"].map((modeOption) => (
                  <button
                    key={modeOption}
                    onClick={() => {
                      setLocalMode(modeOption);
                      if (onModeChange) onModeChange(modeOption);
                    }}
                    style={{
                      backgroundColor:
                        localMode === modeOption ? "#5555ff" : "#333",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "white",
                      flex: "1",
                    }}
                  >
                    {capitalize(modeOption)}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Play/pause button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    backgroundColor: isPlaying ? "#ff5555" : "#55ff55",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px",
                    cursor: "pointer",
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  {isPlaying ? "■ Pause" : "▶ Play"}
                </button>
              </div>
            </div>

            {/* Volume slider */}
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "12px" }}>
                  Volume:
                </span>
                <span style={{ fontSize: "12px" }}>
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                }}
                style={{ width: "100%" }}
              />
            </div>
          </>
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
                setIsPlaying(!isPlaying);
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
        {/* <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent expanding/collapsing when clicking play
            handleUserInteraction();
            setIsPlaying(!isPlaying);
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
          {isPlaying ? "■ Pause" : "▶ Play"}
        </button> */}
      </div>
    </div>
  );
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

export default MuseumMusicPlayer;
