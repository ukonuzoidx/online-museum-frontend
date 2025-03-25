import React, { useEffect, useRef, useState } from "react";

// Import audio files directly to ensure proper bundling
import happyMusic from "../assets/music/happy.mp3";
import sadMusic from "../assets/music/sad.mp3";
import angryMusic from "../assets/music/angry.mp3";
import neutralMusic from "../assets/music/neutral.mp3";
import fearMusic from "../assets/music/fear.mp3";
import disgustMusic from "../assets/music/disgust.mp3";

// Ambient background tracks that can layer with emotion tracks
import ambientLoop from "../assets/music/ambient_base.mp3";

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const [localMode, setLocalMode] = useState(mode); // Use the incoming mode prop
  const [isExpanded, setIsExpanded] = useState(false);

  // Emotion tracking
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Refs for tracking current state to avoid closure issues
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const modeRef = useRef(localMode);
  const lastEmotionRef = useRef(detectedEmotion || "Neutral");

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

  // Debug logging on component mount and setup
  useEffect(() => {
    console.log("Enhanced MuseumMusicPlayer mounted");

    // Initial setup of both audio elements
    if (audioRefA.current && audioRefB.current) {
      audioRefA.current.src = currentTrack;
      audioRefA.current.volume = volume;
      audioRefA.current.loop = true;

      audioRefB.current.volume = 0;
      audioRefB.current.loop = true;

      // Start playing if isPlaying is true
      if (isPlaying) {
        const playPromiseA = audioRefA.current.play();
        if (playPromiseA !== undefined) {
          playPromiseA.catch((error) => {
            console.error("Initial play failed:", error);
            setIsPlaying(false);
          });
        }
      }
    }

    // Set up ambient track if in immersive mode
    if (ambientRef.current && mode === "immersive") {
      ambientRef.current.src = ambientLoop;
      ambientRef.current.volume = volume * 0.3; // Lower volume for ambient
      ambientRef.current.loop = true;

      if (isPlaying) {
        const playPromiseAmbient = ambientRef.current.play();
        if (playPromiseAmbient !== undefined) {
          playPromiseAmbient.catch((error) => {
            console.error("Ambient play failed:", error);
          });
        }
      }
    }

    return () => {
      console.log("Enhanced MuseumMusicPlayer unmounted");
      // Clean up audio on unmount
      if (audioRefA.current) audioRefA.current.pause();
      if (audioRefB.current) audioRefB.current.pause();
      if (ambientRef.current) ambientRef.current.pause();
    };
  }, []);

  // Track emotion changes and update history
  useEffect(() => {
    if (!detectedEmotion) return;

    // Update emotion history
    setEmotionHistory((prev) => [...prev, detectedEmotion].slice(-5));

    // Check if emotion has changed and we're not already crossfading
    if (detectedEmotion !== lastEmotionRef.current && !isCrossfading) {
      lastEmotionRef.current = detectedEmotion;

      // Check if we need to change tracks
      const newTrack =
        emotionMusicMap[detectedEmotion] || emotionMusicMap["Neutral"];
      if (newTrack !== currentTrackRef.current) {
        console.log(
          "🎧 Emotion changed, switching track immediately to",
          detectedEmotion
        );

        // Update current track reference
        currentTrackRef.current = newTrack;
        setCurrentTrack(newTrack);

        // Initiate crossfade if playing
        if (isPlayingRef.current && modeRef.current !== "silent") {
          performCrossfade(newTrack);
        }
      }
    }
  }, [detectedEmotion, isCrossfading]);

  // Crossfade function
  const performCrossfade = (newTrack) => {
    if (isCrossfading) return; // Prevent multiple crossfades

    setIsCrossfading(true);
    console.log("Starting crossfade to", newTrack);

    // Determine which audio element to fade in
    const fadeIn = activeAudio === "A" ? audioRefB : audioRefA;
    const fadeOut = activeAudio === "A" ? audioRefA : audioRefB;

    // Set up the new track on the fade-in element
    fadeIn.current.src = newTrack;
    fadeIn.current.volume = 0;
    fadeIn.current.load();

    const playPromise = fadeIn.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Started playing new track");

          // Duration of crossfade in milliseconds (faster for more immediate transition)
          const crossfadeDuration = 1500;
          const steps = 15;
          const volumeStep = volumeRef.current / steps;
          const interval = crossfadeDuration / steps;

          let step = 0;

          // Perform the crossfade
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
                fadeIn.current.volume = Math.min(
                  volumeRef.current,
                  fadeInVolume
                );
            } else {
              // Crossfade complete
              clearInterval(crossfadeInterval);

              // Stop the old track
              if (fadeOut.current) fadeOut.current.pause();

              // Toggle active audio
              setActiveAudio((prevActive) => (prevActive === "A" ? "B" : "A"));

              // End crossfade state
              setIsCrossfading(false);
              console.log(
                "Crossfade complete, new active audio:",
                activeAudio === "A" ? "B" : "A"
              );
            }
          }, interval);
        })
        .catch((error) => {
          console.error("Audio play failed during crossfade:", error);
          setIsCrossfading(false);
        });
    }
  };

  // Handle play/pause toggle
  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (audioRefA.current && audioRefB.current) {
      try {
        if (isPlaying) {
          // Always try to play the active audio
          const activeRef =
            activeAudio === "A" ? audioRefA.current : audioRefB.current;

          if (activeRef.paused) {
            const playPromise = activeRef.play();

            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error("Play failed:", error);
                setIsPlaying(false);
              });
            }
          }

          // Play ambient if in immersive mode
          if (modeRef.current === "immersive" && ambientRef.current) {
            const ambientPromise = ambientRef.current.play();
            if (ambientPromise !== undefined) {
              ambientPromise.catch((error) => {
                console.error("Ambient play failed:", error);
              });
            }
          }
        } else {
          // Pause both audio elements
          audioRefA.current.pause();
          audioRefB.current.pause();
          if (ambientRef.current) ambientRef.current.pause();
        }
      } catch (error) {
        console.error("Error toggling playback:", error);
      }
    }
  }, [isPlaying, activeAudio]);

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

    // Update mode settings
    switch (localMode) {
      case "immersive":
        // Enable both emotion and ambient tracks
        if (ambientRef.current) {
          ambientRef.current.volume = volume * 0.3;
          if (isPlaying)
            ambientRef.current.play().catch((e) => console.error(e));
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
  }, [localMode, volume, isPlaying]);

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

  // Return the player UI
  return (
    <div className="enhanced-music-player">
      {/* Hidden audio elements for crossfading */}
      <audio ref={audioRefA} preload="auto" />
      <audio ref={audioRefB} preload="auto" />
      <audio ref={ambientRef} preload="auto" />

      {/* Control panel */}
      <div
        className="soundscape-controls"
        style={{
          position: "fixed",
          top: "120px",
          right: "20px",
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: "8px",
          color: "white",
          zIndex: 1000,
          transition: "all 0.3s ease",
          maxWidth: isExpanded ? "320px" : "80px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header and toggle */}
        <div
          style={{
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 style={{ margin: 0, display: "flex", alignItems: "center" }}>
            {isExpanded ? "🎭 Mood Soundscape" : "🎭"}
            <div
              style={{
                marginLeft: "10px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: getEmotionColor(detectedEmotion || "Neutral"),
                transition: "background-color 1s ease",
                display: isExpanded ? "block" : "none",
              }}
            />
          </h3>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>

        {/* Panel content - only visible when expanded */}
        {isExpanded && (
          <div style={{ padding: "12px" }}>
            {/* Current mood */}
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  Current Mood:
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {detectedEmotion || "Neutral"}
                  {isCrossfading && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#ffcc00",
                        marginLeft: "8px",
                      }}
                    >
                      Crossfading...
                    </span>
                  )}
                </div>
              </div>

              {/* Mood bubble */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: getEmotionColor(
                    detectedEmotion || "Neutral"
                  ),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: `0 0 15px ${getEmotionColor(
                    detectedEmotion || "Neutral"
                  )}`,
                }}
              >
                {(detectedEmotion || "Neutral").charAt(0)}
              </div>
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
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}
              >
                Experience Mode:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
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
                      padding: "6px 8px",
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
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", opacity: 0.7 }}>Volume:</span>
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
                style={{
                  width: "100%",
                  accentColor: "#5555ff",
                }}
              />
            </div>
          </div>
        )}

        {/* Quick controls for collapsed state */}
        {!isExpanded && (
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
      </div>
    </div>
  );
};

export default MuseumMusicPlayer;
