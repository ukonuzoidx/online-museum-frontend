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
        <p style={styles.text}>📸 Recording your expression... {countdown}</p>
        <div style={styles.progressBarBackground}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${progress}%`,
            }}
          />
        </div>
        <button onClick={onCancel} style={styles.cancelBtn}>
          Cancel
        </button>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 3000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    width: "90%",
    maxWidth: "350px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  text: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  progressBarBackground: {
    width: "100%",
    height: "14px",
    backgroundColor: "#eee",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "14px",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    transition: "width 1s ease",
  },
  cancelBtn: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ExpressionRecorderOverlay;
