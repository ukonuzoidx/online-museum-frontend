// WebcamCapture.jsx
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

function WebcamCapture({ onFramesCaptured }) {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Capture frames for N seconds
  const captureFrames = async () => {
    setIsCapturing(true);
    const frames = [];
    const startTime = Date.now();
    const captureDuration = 5000; // 5 seconds

    while (Date.now() - startTime < captureDuration) {
      if (!webcamRef.current) break;
      const screenshot = webcamRef.current.getScreenshot();
      frames.push(screenshot);
      await new Promise((res) => setTimeout(res, 500)); // capture every 0.5s
    }

    setIsCapturing(false);
    onFramesCaptured(frames);
  };

  // Cleanup function to stop capturing if the component unmounts
  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      />
      <button disabled={isCapturing} onClick={captureFrames}>
        {isCapturing ? "Capturing..." : "Capture Emotion"}
      </button>
    </div>
  );
}

export default WebcamCapture;
