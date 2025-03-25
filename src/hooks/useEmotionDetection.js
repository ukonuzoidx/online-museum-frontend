// import { useEffect, useState } from "react";
// import axios from "axios";
// import { requestWebcamPermission } from "../utils/request_permission";

// const useEmotionDetection = (start = true, delay) => {
//     const [emotion, setEmotion] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [permissionGranted, setPermissionGranted] = useState(false);

//     useEffect(() => {
//         let timer;

//         const init = async () => {
//             const granted = await requestWebcamPermission();
//             setPermissionGranted(granted);

//             if (granted && start) {
//                 timer = setTimeout(async () => {
//                     setLoading(true);
//                     try {
//                         const response = await axios.get("http://127.0.0.1:8000/api/record-expression/?duration=5");
//                        console.log(response.data.detected_emotion);
//                         setEmotion(response.data.detected_emotion);
//                     } catch (err) {
//                         console.error("Emotion detection failed:", err);
//                     } finally {
//                         setLoading(false);
//                     }
//                 }, delay);
//             }
//         };

//         init();

//         return () => clearTimeout(timer);
//     }, [start, delay]);

//     return { emotion, loading, permissionGranted };
// };

// export default useEmotionDetection;

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const useEmotionDetection = (start = true, delay = 5000) => {
    const [emotion, setEmotion] = useState("Neutral");
    const [loading, setLoading] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState(null);

    const isCapturingRef = useRef(false);

    // Function to capture image from webcam and send to API
    const captureAndAnalyze = useCallback(async () => {
        if (isCapturingRef.current) return; // prevent overlap
        isCapturingRef.current = true;

        setLoading(true);
        setError(null);

        let videoStream = null;

        try {
            // Step 1: Detect cameras and pick one
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((d) => d.kind === "videoinput");
            const selectedDeviceId = videoDevices[0]?.deviceId;

            console.log("📷 Detected cameras:", videoDevices);

            if (!selectedDeviceId) {
                throw new Error("No available webcam found");
            }

            // Step 2: Get webcam stream
            console.log("🔍 Requesting webcam access...");
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: selectedDeviceId } }
            });

            console.log("✅ Webcam stream obtained.");
            setPermissionGranted(true);

            // Step 3: Create and prepare hidden video element
            const video = document.createElement("video");
            video.setAttribute("playsinline", "");
            video.srcObject = videoStream;
            video.style.position = "absolute";
            video.style.left = "-9999px";
            document.body.appendChild(video);

            // Step 4: Wait for metadata & play video
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve).catch(reject);
                };
            });

            console.log("🎥 Video is playing.");

            // Step 5: Create canvas, capture image
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            await new Promise((r) => setTimeout(r, 300)); // let camera adjust
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Step 6: Convert frame to JPEG blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.95);
            });

            if (!blob) throw new Error("Failed to create image blob from webcam");

            // Step 7: Upload to backend
            const formData = new FormData();
            formData.append("file", blob, "webcam-capture.jpg");
            formData.append("model_name", "VGG19");

            console.log("📤 Sending to backend...");

            const response = await axios.post(
                "http://127.0.0.1:8000/api/predict-emotion/",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 10000
                }
            );

            console.log("✅ API emotion response:", response.data);

            if (response.data?.emotion && response.data?.confidence) {
                const parsedConfidence = parseFloat(response.data.confidence.replace("%", ""));

                if (parsedConfidence >= 29) {
                    setEmotion(response.data.emotion);
                    setConfidence(parsedConfidence);
                    console.log(`🎯 Emotion updated to: ${response.data.emotion} (Confidence: ${parsedConfidence.toFixed(2)}%)`);
                } else {
                    console.log(`⚠️ Ignored emotion: ${response.data.emotion} (Low confidence: ${parsedConfidence.toFixed(2)}%)`);
                }
            } else {
                throw new Error("Invalid emotion response from API");
            }

        } catch (err) {
            console.error("❌ Emotion detection failed:", err);
            setError(err.message || "Failed to detect emotion");
        } finally {
            // Clean up
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
    }, []);


    // Set up continuous or one-time detection
    useEffect(() => {
        let timerId;

        if (start) {
            captureAndAnalyze();

            if (delay) {
                timerId = setInterval(captureAndAnalyze, delay);
            }
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [start, delay, captureAndAnalyze]);

    return {
        emotion,
        loading,
        permissionGranted,
        error,
        confidence,
        triggerDetection: captureAndAnalyze
    };
};

export default useEmotionDetection;