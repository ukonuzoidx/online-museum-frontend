import React, { useEffect, useState } from "react";

const ExpressionRecorderOverlay = ({ onComplete, onCancel }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.recordingIndicator}></div>
          <h3 style={styles.title}>Recording Your Expression</h3>
        </div>

        <div style={styles.content}>
          <div style={styles.cameraIcon}>📸</div>
          <p style={styles.text}>
            We're capturing your facial expression to personalize the museum's
            music to your mood.
          </p>
          <p style={styles.privacyText}>
            Your image is processed instantly and is not stored.
          </p>
          <div style={styles.countdownText}>Ready in {countdown}...</div>
        </div>

        <div style={styles.progressBarBackground}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${progress}%`,
            }}
          />
        </div>

        <div style={styles.buttonRow}>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={onComplete} style={styles.skipBtn}>
            Skip Countdown
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(5px)",
    zIndex: 3000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  recordingIndicator: {
    width: "12px",
    height: "12px",
    backgroundColor: "#f44336",
    borderRadius: "50%",
    marginRight: "8px",
    animation: "pulse 1s infinite",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#333",
  },
  content: {
    marginBottom: "20px",
  },
  cameraIcon: {
    fontSize: "40px",
    marginBottom: "16px",
  },
  text: {
    fontSize: "16px",
    marginBottom: "8px",
    color: "#333",
  },
  privacyText: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "12px",
  },
  countdownText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#f44336",
  },
  progressBarBackground: {
    width: "100%",
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    transition: "width 1s linear",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  skipBtn: {
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ExpressionRecorderOverlay;
