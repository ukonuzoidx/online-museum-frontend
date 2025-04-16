// // Updated useEmotionDetection.js with mobile-safe webcam access
// import { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";

// const useEmotionDetection = (start = true, delay = 35000) => {
//   const [emotion, setEmotion] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [confidence, setConfidence] = useState(0);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasDetected, setHasDetected] = useState(false);
//   const [userInteracted, setUserInteracted] = useState(false);

//   const isCapturingRef = useRef(false);

//   // Listen for user interaction to enable webcam
//   useEffect(() => {
//     const handleInteraction = () => {
//       if (!userInteracted) {
//         setUserInteracted(true);
//       }
//     };

//     document.addEventListener("click", handleInteraction);
//     document.addEventListener("touchstart", handleInteraction);

//     return () => {
//       document.removeEventListener("click", handleInteraction);
//       document.removeEventListener("touchstart", handleInteraction);
//     };
//   }, [userInteracted]);

//   const captureAndAnalyze = useCallback(async () => {
//     if (!userInteracted || isCapturingRef.current) return;
//     isCapturingRef.current = true;

//     setLoading(true);
//     setError(null);

//     let videoStream = null;

//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter((d) => d.kind === "videoinput");
//       const selectedDeviceId = videoDevices[0]?.deviceId;

//       if (!selectedDeviceId) {
//         throw new Error("No available webcam found");
//       }

//       videoStream = await navigator.mediaDevices.getUserMedia({
//         video: { deviceId: { exact: selectedDeviceId } },
//       });

//       setPermissionGranted(true);

//       const video = document.createElement("video");
//       video.setAttribute("playsinline", "");
//       video.srcObject = videoStream;
//       video.style.position = "absolute";
//       video.style.left = "-9999px";
//       document.body.appendChild(video);

//       await new Promise((resolve, reject) => {
//         video.onloadedmetadata = () => {
//           video.play().then(resolve).catch(reject);
//         };
//       });

//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       //   await new Promise((r) => setTimeout(r, 300));
//       await new Promise((r) => setTimeout(r, 10000));

//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       const blob = await new Promise((resolve) => {
//         canvas.toBlob(resolve, "image/jpeg", 0.95);
//       });

//       if (!blob) throw new Error("Failed to create image blob from webcam");

//       const formData = new FormData();
//       formData.append("file", blob, "webcam-capture.jpg");
//       formData.append("model_name", "VGG19");

//       const response = await axios.post(
//         "https://ukonuzoidx-musemind.hf.space/api/predict-emotion/",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           timeout: 25000,
//         }
//       );

//       if (response.data?.emotion && response.data?.confidence) {
//         const parsedConfidence = parseFloat(
//           response.data.confidence.replace("%", "")
//         );

//         if (parsedConfidence >= 29) {
//           setEmotion(response.data.emotion);
//           setConfidence(parsedConfidence);
//           setHasDetected(true);
//         }
//       } else {
//         throw new Error("Invalid emotion response from API");
//       }
//     } catch (err) {
//       setError(err.message || "Failed to detect emotion");
//     } finally {
//       if (videoStream) {
//         videoStream.getTracks().forEach((track) => track.stop());
//       }

//       const videoEl = document.querySelector("video[playsinline]");
//       if (videoEl && document.body.contains(videoEl)) {
//         document.body.removeChild(videoEl);
//       }

//       setLoading(false);
//       isCapturingRef.current = false;
//     }
//   }, [userInteracted]);

//   useEffect(() => {
//     let timerId;
//     if (start) {
//       captureAndAnalyze();
//       if (delay) timerId = setInterval(captureAndAnalyze, delay);
//     }
//     return () => clearInterval(timerId);
//   }, [start, delay, captureAndAnalyze]);

//   return {
//     emotion,
//     loading,
//     permissionGranted,
//     error,
//     confidence,
//     hasDetected,
//     triggerDetection: captureAndAnalyze,
//   };
// };

// export default useEmotionDetection;

// import { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";

// const useEmotionDetection = (start = true, delay = 15000) => {
//   const [emotion, setEmotion] = useState("Neutral");
//   const [loading, setLoading] = useState(false);
//   const [confidence, setConfidence] = useState(0);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasDetected, setHasDetected] = useState(false);
//   const [userInteracted, setUserInteracted] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);

//   const isCapturingRef = useRef(false);
//   const lastDetectionAttempt = useRef(0);

//   // Track video stream for cleanup
//   const activeStreamRef = useRef(null);

//   // Console logging for debugging
//   const logInfo = (message) => {
//     console.log(`[EmotionDetection] ${message}`);
//   };

//   // Listen for user interaction to enable webcam
//   useEffect(() => {
//     const handleInteraction = () => {
//       if (!userInteracted) {
//         setUserInteracted(true);
//         logInfo("User interaction detected - ready for capture");
//       }
//     };

//     document.addEventListener("click", handleInteraction);
//     document.addEventListener("touchstart", handleInteraction);

//     return () => {
//       document.removeEventListener("click", handleInteraction);
//       document.removeEventListener("touchstart", handleInteraction);
//     };
//   }, [userInteracted]);

//   // Cleanup function for webcam resources
//   const cleanupVideoResources = useCallback(() => {
//     if (activeStreamRef.current) {
//       logInfo("Cleaning up video resources");
//       activeStreamRef.current.getTracks().forEach(track => track.stop());
//       activeStreamRef.current = null;
//     }

//     const videoEl = document.querySelector("video[playsinline]");
//     if (videoEl && document.body.contains(videoEl)) {
//       document.body.removeChild(videoEl);
//     }
//   }, []);

//   // Enhanced capture and analyze function
//   const captureAndAnalyze = useCallback(async (forceCapture = false) => {
//     // Prevent multiple simultaneous captures
//     if (!userInteracted || isCapturingRef.current) {
//       logInfo("Skipping capture - either user hasn't interacted or already capturing");
//       return;
//     }

//     // Throttle captures to prevent overwhelming the API
//     const now = Date.now();
//     if (!forceCapture && now - lastDetectionAttempt.current < 5000) {
//       logInfo("Throttling detection attempts - too frequent");
//       return;
//     }
    
//     lastDetectionAttempt.current = now;
//     isCapturingRef.current = true;
//     setLoading(true);
//     setError(null);
    
//     logInfo("Starting emotion capture process");
    
//     try {
//       // First, check if we have webcam permissions
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(d => d.kind === "videoinput");
      
//       if (videoDevices.length === 0) {
//         throw new Error("No webcam detected on device");
//       }
      
//       // Use the first available camera (typically the user-facing one on mobile)
//       const selectedDeviceId = videoDevices[0]?.deviceId;

//       logInfo(`Found ${videoDevices.length} video devices, using device ID: ${selectedDeviceId.substring(0, 8)}...`);

//       if (!selectedDeviceId) {
//         throw new Error("No available webcam found");
//       }

//       // Request specific camera with video constraints
//       const videoStream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           deviceId: { exact: selectedDeviceId },
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: "user" // Prefer front camera for mobile
//         }
//       });
      
//       activeStreamRef.current = videoStream;
//       setPermissionGranted(true);
//       logInfo("Webcam permission granted, stream active");

//       // Create and set up video element
//       const video = document.createElement("video");
//       video.setAttribute("playsinline", "");
//       video.srcObject = videoStream;
//       video.style.position = "absolute";
//       video.style.left = "-9999px";
//       document.body.appendChild(video);

//       // Wait for video to be ready to play
//       await new Promise((resolve, reject) => {
//         video.onloadedmetadata = () => {
//           video.play().then(resolve).catch(reject);
//         };
//       });

//       logInfo("Video element ready, preparing for capture");

//       // Set up canvas for capture
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
      
//       // Wait to let camera adjust exposure/focus
//       await new Promise(r => setTimeout(r, 1500));

//       // Capture frame
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       logInfo(`Captured frame: ${canvas.width}x${canvas.height}`);

//       // Convert to blob
//       const blob = await new Promise(resolve => {
//         canvas.toBlob(resolve, "image/jpeg", 0.95);
//       });

//       if (!blob) throw new Error("Failed to create image blob from webcam");
//       logInfo(`Created image blob: ${Math.round(blob.size / 1024)} KB`);

//       // Prepare form data
//       const formData = new FormData();
//       formData.append("file", blob, "webcam-capture.jpg");
//       formData.append("model_name", "CNN");

//       // Send to API
//       logInfo("Sending image to emotion detection API...");
//       const response = await axios.post(
//         "https://ukonuzoidx-musemind.hf.space/api/predict-emotion/",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           timeout: 25000,
//         }
//       );

//       // Process response
//       if (response.data?.emotion && response.data?.confidence) {
//         const detectedEmotion = response.data.emotion;
//         const parsedConfidence = parseFloat(
//           response.data.confidence.replace("%", "")
//         );
        
//         logInfo(`API returned emotion: ${detectedEmotion} with confidence: ${parsedConfidence}%`);

//         // Ensure reasonable confidence level
//         if (parsedConfidence >= 29) {
//           // Capitalize first letter for consistency
//           const formattedEmotion =
//             detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1);
          
//           setEmotion(formattedEmotion);
//           setConfidence(parsedConfidence);
//           setHasDetected(true);
//           setRetryCount(0); // Reset retry counter on success
//           logInfo(`✅ Successfully detected emotion: ${formattedEmotion}`);
//         } else {
//           logInfo(`⚠️ Detected emotion had low confidence: ${parsedConfidence}%`);
//           if (retryCount < 2) {
//             setRetryCount(prev => prev + 1);
//             // Try again immediately with a short delay
//             setTimeout(() => {
//               isCapturingRef.current = false;
//               captureAndAnalyze(true);
//             }, 1000);
//           }
//         }
//       } else {
//         throw new Error("Invalid emotion response from API");
//       }
//     } catch (err) {
//       logInfo(`❌ Error during emotion detection: ${err.message}`);
//       setError(err.message || "Failed to detect emotion");
      
//       // Retry once on failure if we haven't tried too many times
//       if (retryCount < 2) {
//         setRetryCount(prev => prev + 1);
//         logInfo(`Retrying emotion detection (attempt ${retryCount + 1})...`);
        
//         // Back-off slightly before retry
//         setTimeout(() => {
//           isCapturingRef.current = false;
//           captureAndAnalyze(true);
//         }, 2000);
//       }
//     } finally {
//       cleanupVideoResources();
//       setLoading(false);
//       isCapturingRef.current = false;
//     }
//   }, [userInteracted, cleanupVideoResources, retryCount]);

//   // Set up interval for emotion detection
//   useEffect(() => {
//     let timerId;
    
//     if (start && permissionGranted) {
//       logInfo(`Setting up emotion detection interval every ${delay}ms`);
      
//       // Initial capture
//       captureAndAnalyze();
      
//       // Periodic captures
//       if (delay) {
//         timerId = setInterval(captureAndAnalyze, delay);
//       }
//     }
    
//     return () => {
//       if (timerId) {
//         clearInterval(timerId);
//         logInfo("Cleared emotion detection interval");
//       }
//       cleanupVideoResources();
//     };
//   }, [start, delay, captureAndAnalyze, permissionGranted, cleanupVideoResources]);

//   return {
//     emotion,
//     loading,
//     permissionGranted,
//     error,
//     confidence,
//     hasDetected,
//     triggerDetection: () => captureAndAnalyze(true),
//   };
// };

// export default useEmotionDetection;


import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const useEmotionDetection = (start = true, delay = 60000) => { // 60 second delay between checks
  // State management
  const [emotion, setEmotion] = useState("Neutral");
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);
  const [hasDetected, setHasDetected] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Track permission and detection state
  const permissionChecked = useRef(false);
  const permissionInProgress = useRef(false);
  const detectionInterval = useRef(null);
  const isCapturingRef = useRef(false);
  const lastDetectionTime = useRef(0);
  
  // Track video stream for cleanup
  const activeStreamRef = useRef(null);

  // Console logging for debugging
  const logInfo = (message) => {
    console.log(`[EmotionDetection] ${message}`);

  };

  // Helper to check if mediaDevices API is available
  const isCameraApiAvailable = useCallback(() => {
    return !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);
  
  // Cleanup function for webcam resources
  const cleanupVideoResources = useCallback(() => {
    if (activeStreamRef.current) {
      logInfo("Cleaning up video resources");
      try {
        activeStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        // Ignore errors during cleanup
      }
      activeStreamRef.current = null;
    }

    const videoEl = document.querySelector("video[playsinline]");
    if (videoEl && document.body.contains(videoEl)) {
      try {
        document.body.removeChild(videoEl);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  }, []);

  // Listen for user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        logInfo("User interaction detected");
      }
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [userInteracted]);

  // Check camera permission only once
  useEffect(() => {
    // Only run this check once
    if (permissionChecked.current || permissionInProgress.current) return;
    
    const checkCameraPermission = async () => {
      // Skip if the API isn't available
      if (!isCameraApiAvailable()) {
        logInfo("Camera API not available in this environment");
        setPermissionDenied(true);
        setError("Camera access not supported in this browser");
        permissionChecked.current = true;
        return;
      }
      
      try {
        permissionInProgress.current = true;
        logInfo("Checking camera permission...");
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        
        // Successfully got permission
        setPermissionGranted(true);
        setPermissionDenied(false);
        
        // Clean up the test stream
        stream.getTracks().forEach(track => track.stop());
        logInfo("Camera permission granted");
      } catch (err) {
        logInfo(`Camera permission denied: ${err.message}`);
        setPermissionGranted(false);
        setPermissionDenied(true);
        setError("Camera access denied by browser or user");
      } finally {
        permissionChecked.current = true;
        permissionInProgress.current = false;
      }
    };
    
    // Only run the check if user has interacted and we're supposed to start
    if (userInteracted && start) {
      checkCameraPermission();
    }
  }, [userInteracted, start, isCameraApiAvailable]);

  // Capture and analyze function with no retries for low confidence
  const captureAndAnalyze = useCallback(async (forceCapture = false) => {
    // Skip if permissions denied or already capturing
    if (permissionDenied || isCapturingRef.current) {
      return;
    }
    
    // Skip if no user interaction yet
    if (!userInteracted) {
      logInfo("User hasn't interacted yet, can't access camera");
      return;
    }
    
    // Skip if camera API not available
    if (!isCameraApiAvailable()) {
      logInfo("Camera API not available");
      setPermissionDenied(true);
      return;
    }
    
    // Implement rate limiting to prevent spam
    const now = Date.now();
    const timeSinceLastCapture = now - lastDetectionTime.current;
    
    // Only allow a capture if it's been long enough since the last one,
    // or if this is a forced capture
    if (!forceCapture && timeSinceLastCapture < 30000) {
      logInfo(`Rate limiting: Not capturing (last capture was ${Math.round(timeSinceLastCapture/1000)}s ago)`);
      return;
    }
    
    // Mark as capturing to prevent parallel attempts
    isCapturingRef.current = true;
    setLoading(true);
    lastDetectionTime.current = now;
    
    try {
      logInfo("Starting emotion capture");
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      // Store the stream for later cleanup
      activeStreamRef.current = stream;
      setPermissionGranted(true);
      
      // Create and set up video element
      const video = document.createElement("video");
      video.setAttribute("playsinline", ""); // Important for iOS
      video.srcObject = stream;
      video.style.position = "absolute";
      video.style.left = "-9999px";
      document.body.appendChild(video);
      
      // Wait for the video to be ready
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        
        // Add a timeout in case the video never loads
        setTimeout(() => reject(new Error("Video load timeout")), 5000);
      });
      
      // Give the camera some time to adjust
      await new Promise(r => setTimeout(r, 300));
      
      // Capture frame from video
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to JPEG blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });
      
      if (!blob) {
        throw new Error("Failed to create image from camera");
      }
      
      // Create form data to send to API
      const formData = new FormData();
      formData.append("file", blob, "emotion-capture.jpg");
      formData.append("model_name", "VGG19");
      
  
      // Call emotion detection API
      const response = await axios.post(
        "https://ukonuzoidx-musemind.hf.space/api/predict-emotion/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000
        }
      );
      
      // Process response - ACCEPT ALL DETECTIONS regardless of confidence
      if (response.data?.emotion && response.data?.confidence) {
        const detectedEmotion = response.data.emotion;
        const parsedConfidence = parseFloat(
          response.data.confidence.replace("%", "")
        );
        
        // Format emotion with capitalized first letter
        const formattedEmotion = 
          detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1);
        
        // Always update emotion state, even with low confidence
        setEmotion(formattedEmotion);
        setConfidence(parsedConfidence);
        setHasDetected(true);
        
        if (parsedConfidence >= 25) {
          logInfo(`Detected emotion: ${formattedEmotion} (${parsedConfidence}%)`);
        } else {
          // Still accept the emotion, just log that it was low confidence
          logInfo(`Accepted low confidence detection: ${formattedEmotion} (${parsedConfidence}%)`);
        }
      } else {
        logInfo("API returned invalid response format");
        throw new Error("Invalid emotion response from API");
      }
    } catch (err) {
      logInfo(`Error during emotion detection: ${err.message}`);
      
      // Handle permission errors specifically
      if (err.name === 'NotAllowedError' || err.message.includes('denied') || 
          err.message.includes('permission')) {
        setPermissionDenied(true);
        setPermissionGranted(false);
      }
      
      setError(err.message || "Failed to detect emotion");
      
      // NO RETRIES - We don't retry on errors anymore
    } finally {
      // Always clean up video resources
      cleanupVideoResources();
      setLoading(false);
      isCapturingRef.current = false;
    }
  }, [userInteracted, permissionDenied, isCameraApiAvailable, cleanupVideoResources]);

  // Set up and clean up detection interval
  useEffect(() => {
    // Only set up the interval if all conditions are met
    if (start && userInteracted && permissionGranted && !permissionDenied) {
      // Clear any existing interval
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      
      logInfo(`Setting up detection interval every ${delay}ms`);
      
      // Do an initial capture
      captureAndAnalyze(true);
      
      // Set up the interval for future captures
      detectionInterval.current = setInterval(() => {
        captureAndAnalyze();
      }, delay);
      
      // Clean up when component unmounts
      return () => {
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
          detectionInterval.current = null;
        }
        cleanupVideoResources();
      };
    }
    
    // If we get here and there's an interval running, clean it up
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  }, [
    start, 
    userInteracted, 
    permissionGranted, 
    permissionDenied, 
    captureAndAnalyze, 
    delay, 
    cleanupVideoResources
  ]);

  // Manual trigger function that respects rate limiting
  const triggerDetection = useCallback(() => {
    if (permissionDenied) {
      logInfo("Cannot trigger detection - permission denied");
      return;
    }
    
    if (!userInteracted) {
      logInfo("Cannot trigger detection - user hasn't interacted");
      return;
    }
    
    if (isCapturingRef.current) {
      logInfo("Already capturing, ignoring manual trigger");
      return;
    }
    
    captureAndAnalyze(true);
  }, [permissionDenied, userInteracted, captureAndAnalyze]);

  // On unmount cleanup
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      cleanupVideoResources();
    };
  }, [cleanupVideoResources]);

  // Return the hook's public API
  return {
    emotion,
    loading,
    permissionGranted,
    permissionDenied,
    error,
    confidence,
    hasDetected,
    triggerDetection
  };
};

export default useEmotionDetection;