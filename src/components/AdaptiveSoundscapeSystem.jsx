import React, { useState, useEffect } from "react";
import MuseumMusicPlayer from "../widgets/MusicPlayer";
import MoodMonitorPanel from "./MoodMonitorPanel";
const AdaptiveSoundscapeSystem = ({
  detectedEmotion,
  detectionConfidence,
  currentRoom,
  isEnabled = true,
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

  // Room-specific settings
  const [roomSettings, setRoomSettings] = useState({});

  // Process incoming emotion detections with stability filter
  useEffect(() => {
    if (!isEnabled || !detectedEmotion || !detectionConfidence) return;

    const parsedConfidence = parseFloat(detectionConfidence);
    const now = Date.now();
    const timeSinceLastUpdate = now - lastEmotionUpdate;

    // Ignore low confidence detections
    if (parsedConfidence < 30) {
      console.log(
        `⚠️ Low confidence (${parsedConfidence}%) - ignoring emotion`
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

          console.log(
            `🎯 Emotion stabilized: ${formattedEmotion} (Confidence: ${parsedConfidence}%)`
          );

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

    // Define room-specific soundscape settings
    const roomSoundscapeSettings = {
      Entrance: {
        defaultMode: "immersive",
        volumeAdjustment: 0, // normal volume
      },
      Gallery1: {
        defaultMode: "immersive",
        volumeAdjustment: 0,
      },
      Gallery2: {
        defaultMode: "relaxed",
        volumeAdjustment: -0.1, // slightly quieter
      },
      Meditation: {
        defaultMode: "relaxed",
        volumeAdjustment: -0.2, // quieter
      },
      Restroom: {
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
    }
  }, [currentRoom, musicMode]);

  // Handle music mode changes
  const handleMusicModeChange = (newMode) => {
    setMusicMode(newMode);
    console.log(`Music mode changed to: ${newMode}`);
  };

  // Only render components if the system is enabled
  if (!isEnabled) return null;

  return (
    <>
      <MuseumMusicPlayer
        detectedEmotion={stableEmotion}
        mode={musicMode}
        onModeChange={handleMusicModeChange}
      />

      <MoodMonitorPanel
        emotionHistory={emotionHistory}
        stableEmotion={stableEmotion}
        currentRoom={currentRoom}
      />
    </>
  );
};

export default AdaptiveSoundscapeSystem;
