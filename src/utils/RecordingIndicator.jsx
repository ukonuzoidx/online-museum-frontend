import React, { useState, useEffect } from "react";

// Component to show when facial recording is active
const RecordingIndicator = ({ isRecording, onRequestRecording }) => {
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-collapse after showing info
  useEffect(() => {
    let timer;
    if (showInfo) {
      timer = setTimeout(() => {
        setShowInfo(false);
        setExpanded(false);
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [showInfo]);

  // When recording starts, briefly show expanded state
  useEffect(() => {
    if (isRecording) {
      setExpanded(true);
      setShowInfo(true);

      const timer = setTimeout(() => {
        setExpanded(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isRecording]);

  return (
    // Recording indicator with a dot and text
    <div
    className={`recording-indicator ${expanded ? "expanded" : ""} ${
      isRecording ? "active" : "inactive"
    }`}
    >
      {/* Clicking the indicator toggles expanded state */}
      <div className="indicator-dot"></div>

      {expanded && (
        <div className="indicator-content">
          {isRecording ? (
            <>
              <span className="indicator-text">
                Facial expression recording
              </span>
              <button
                className="indicator-button"
                onClick={() => setShowInfo(true)}
              >
                ℹ️
              </button>
            </>
          ) : (
            <>
              <span className="indicator-text">Expression detection off</span>
              <button className="indicator-button" onClick={onRequestRecording}>
                Enable
              </button>
            </>
          )}
        </div>
      )}

      {/* UI to let you know when the facial capturing starts */}
      {showInfo && (
        <div className="recording-info-popup">
          <h4>About Facial Recording</h4>
          <p>
            We briefly analyze your facial expression to personalize the
            museum's music to match your mood.
          </p>
          <p>
            <strong>Privacy:</strong> Your image is processed instantly and not
            stored. Recognition happens only on your device.
          </p>
        </div>
      )}

      <style jsx="true">{`
        .recording-indicator {
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 20px;
          padding: 6px;
          z-index: 1000;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .recording-indicator:hover {
          transform: scale(1.05);
        }

        .recording-indicator.expanded {
          padding: 6px 12px;
        }

        .indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #888;
          transition: all 0.3s ease;
        }

        .recording-indicator.active .indicator-dot {
          background-color: #f44336;
          box-shadow: 0 0 8px #f44336;
          animation: pulse 1.5s infinite;
        }

        .indicator-content {
          display: flex;
          align-items: center;
          margin-left: 8px;
        }

        .indicator-text {
          color: white;
          font-size: 12px;
          white-space: nowrap;
        }

        .indicator-button {
          background: none;
          border: none;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          margin-left: 8px;
          border-radius: 3px;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .recording-info-popup {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 10px;
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          width: 280px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          color: #333;
          text-align: left;
          z-index: 1001;
          animation: fadeIn 0.3s ease;
        }

        .recording-info-popup h4 {
          margin-top: 0;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .recording-info-popup p {
          margin: 8px 0;
          font-size: 13px;
          line-height: 1.4;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
          @media (max-width: 600px) {
          .recording-info-popup {
          display: none; /* Hide on small screens */
          }
          .recording-indicator {
          top: 50px;
          }
      `}</style>
    </div>
  );
};

export default RecordingIndicator;
