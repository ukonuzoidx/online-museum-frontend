import React, { useEffect, useState } from "react";

const WebcamPermissionNotice = ({ onPermissionGranted }) => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if permission is already granted
    navigator.permissions?.query({ name: "camera" }).then((result) => {
      if (result.state === "denied" || result.state === "prompt") {
        setShowNotice(true);
      }
    });
  }, []);

  // Auto-dismiss after 60 seconds if permission is not granted
  // useEffect(() => {
  //   if (showNotice) {
  //     const timer = setTimeout(() => setShowNotice(false), 60000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showNotice]);

  const requestWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // You can stop it immediately after permission granted
      stream.getTracks().forEach((track) => track.stop());
      setShowNotice(false);
      // 👉 Trigger emotion detection after permission granted
      if (onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (err) {
      console.warn("User denied webcam access:", err);
    }
  };

  if (!showNotice) return null;

  // Show notice if permission is not granted
  // and user has not interacted with the page yet
  return (
    <div style={styles.container}>
      <p style={styles.message}>
        🎥 Please enable your webcam so we can track facial expressions and
        tailor your soundscape.
      </p>
      <button style={styles.button} onClick={requestWebcam}>
        Turn On Webcam
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: "14px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    zIndex: 2000,
    animation: "fadeInOut 8s ease-in-out",
    textAlign: "center",
  },
  message: {
    fontSize: "14px",
    marginBottom: "8px",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default WebcamPermissionNotice;
