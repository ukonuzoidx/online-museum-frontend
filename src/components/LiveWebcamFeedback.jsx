// LiveWebcamFeedback.jsx
import React, { useEffect, useRef, useState } from "react";

const LiveWebcamFeedback = ({ active, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" for front camera, "environment" for back

  // Start webcam stream when component mounts and active is true
  useEffect(() => {
    if (active && !stream) {
      startWebcam();
    }

    // Cleanup function to stop webcam when component unmounts
    return () => {
      stopWebcam();
    };
  }, [active]);

  // Start webcam stream
  const startWebcam = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported in this browser");
        return;
      }

      // Request camera access with specific constraints
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
      });

      // Store the stream
      setStream(videoStream);

      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }

      setError(null);
    } catch (err) {
      setError(`Camera access error: ${err.message}`);
      console.error("Error accessing camera:", err);
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Toggle between front and back cameras (for mobile)
  const switchCamera = async () => {
    stopWebcam();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(startWebcam, 300); // Small delay to ensure previous stream is fully stopped
  };

  return (
    <div className="webcam-feedback">
      <div className="webcam-container">
        <div className="webcam-header">
          <div className="recording-indicator"></div>
          <h3>Live Camera Feed</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="video-container">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted />
          )}
        </div>

        <div className="webcam-controls">
          <div className="privacy-notice">
            Your expression is being analyzed to personalize music. No images
            are stored or transmitted.
          </div>
          <div className="button-row">
            <button className="switch-camera" onClick={switchCamera}>
              Switch Camera
            </button>
            <button className="hide-button" onClick={onClose}>
              Hide Camera
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .webcam-feedback {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 2000;
          transition: all 0.3s ease;
        }

        .webcam-container {
          background-color: rgba(0, 0, 0, 0.8);
          border-radius: 12px;
          overflow: hidden;
          width: 320px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .webcam-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: rgba(0, 0, 0, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .recording-indicator {
          width: 12px;
          height: 12px;
          background-color: #f44336;
          border-radius: 50%;
          margin-right: 10px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .webcam-header h3 {
          color: white;
          margin: 0;
          flex-grow: 1;
          font-size: 16px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0 5px;
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background-color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror the video */
        }

        .error-message {
          color: #ff6b6b;
          text-align: center;
          padding: 20px;
          font-size: 14px;
        }

        .webcam-controls {
          padding: 10px;
        }

        .privacy-notice {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
          text-align: center;
        }

        .button-row {
          display: flex;
          justify-content: space-between;
        }

        .button-row button {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .button-row button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .webcam-feedback {
            bottom: 10px;
            right: 10px;
            left: 10px;
            width: calc(100% - 20px);
          }

          .webcam-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveWebcamFeedback;
