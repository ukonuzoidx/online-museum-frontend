import React, { useState, useEffect, useRef } from "react";

function EmotionMusicPanel({ emotion }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);

  // Map emotions to music files
  const emotionMusicMap = {
    Happy: "../assets/music/happy.mp3",
    Sad: "../assets/music/sad.mp3",
    Angry: "../assets/music/angry.mp3",
    Neutral: "../assets/music/neutral.mp3",
    Surprise: "../assets/music/happy.mp3",
    Disgust: "../assets/music/disgust.mp3",
    Fear: "../assets/music/fear.mp3",
  };

 useEffect(() => {
   if (emotion) {
     const track = emotionMusicMap[emotion] || emotionMusicMap["Neutral"];
     setCurrentTrack(track);
     setIsPlaying(true); // trigger playback
   }
 }, [emotion]);

 useEffect(() => {
   if (audioRef.current) {
     if (isPlaying) {
       audioRef.current.play().catch((err) => {
         console.warn("Playback failed (maybe autoplay blocked):", err);
       });
     } else {
       audioRef.current.pause();
     }
   }
 }, [isPlaying]);

 const handleTogglePlay = () => {
   setIsPlaying((prev) => !prev);
 };

  return (
    <div className="emotion-panel visible">
      <h3>🎭 Mood: {emotion || "Detecting..."}</h3>
      <p>🎵 Track: {currentTrack ? currentTrack.split("/").pop() : "None"}</p>

      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack}
          loop
          preload="auto"
          controls={false}
        />
      )}

      <button onClick={handleTogglePlay}>
        {isPlaying ? "⏸ Pause" : "▶️ Play"}
      </button>
    </div>
  );
}

export default EmotionMusicPanel;
