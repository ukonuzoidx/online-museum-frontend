// Updated useEmotionDetection.js with mobile-safe webcam access
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const useEmotionDetection = (start = true, delay = 35000) => {
  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [hasDetected, setHasDetected] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const isCapturingRef = useRef(false);

  // Listen for user interaction to enable webcam
  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
      }
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [userInteracted]);

  const captureAndAnalyze = useCallback(async () => {
    if (!userInteracted || isCapturingRef.current) return;
    isCapturingRef.current = true;

    setLoading(true);
    setError(null);

    let videoStream = null;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const selectedDeviceId = videoDevices[0]?.deviceId;

      if (!selectedDeviceId) {
        throw new Error("No available webcam found");
      }

      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });

      setPermissionGranted(true);

      const video = document.createElement("video");
      video.setAttribute("playsinline", "");
      video.srcObject = videoStream;
      video.style.position = "absolute";
      video.style.left = "-9999px";
      document.body.appendChild(video);

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      //   await new Promise((r) => setTimeout(r, 300));
      await new Promise((r) => setTimeout(r, 10000));

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.95);
      });

      if (!blob) throw new Error("Failed to create image blob from webcam");

      const formData = new FormData();
      formData.append("file", blob, "webcam-capture.jpg");
      formData.append("model_name", "VGG19");

      const response = await axios.post(
        "https://ukonuzoidx-musemind.hf.space/api/predict-emotion/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 25000,
        }
      );

      if (response.data?.emotion && response.data?.confidence) {
        const parsedConfidence = parseFloat(
          response.data.confidence.replace("%", "")
        );

        if (parsedConfidence >= 29) {
          setEmotion(response.data.emotion);
          setConfidence(parsedConfidence);
          setHasDetected(true);
        }
      } else {
        throw new Error("Invalid emotion response from API");
      }
    } catch (err) {
      setError(err.message || "Failed to detect emotion");
    } finally {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }

      const videoEl = document.querySelector("video[playsinline]");
      if (videoEl && document.body.contains(videoEl)) {
        document.body.removeChild(videoEl);
      }

      setLoading(false);
      isCapturingRef.current = false;
    }
  }, [userInteracted]);

  useEffect(() => {
    let timerId;
    if (start) {
      captureAndAnalyze();
      if (delay) timerId = setInterval(captureAndAnalyze, delay);
    }
    return () => clearInterval(timerId);
  }, [start, delay, captureAndAnalyze]);

  return {
    emotion,
    loading,
    permissionGranted,
    error,
    confidence,
    hasDetected,
    triggerDetection: captureAndAnalyze,
  };
};

export default useEmotionDetection;
