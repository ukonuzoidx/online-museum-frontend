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

const useEmotionDetection = (start = true, delay = 60000) => {
  // 60 second delay between checks
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

  // Console logging for debugging - moved outside useCallback dependencies
  const logInfoRef = useRef((message) => {
    console.log(`[EmotionDetection] ${message}`);
  });

  // Helper to check if mediaDevices API is available
  const isCameraApiAvailable = useCallback(() => {
    return !!(
      navigator &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }, []);

  // Cleanup function for webcam resources
  const cleanupVideoResources = useCallback(() => {
    if (activeStreamRef.current) {
      logInfoRef.current("Cleaning up video resources");
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {

        logInfoRef.current(`Error cleaning up stream: ${e.message}`);
      }
      activeStreamRef.current = null;
    }

    // Improved selector to find all potential video elements we've created
    const videoElements = document.querySelectorAll("video[playsinline]");
    videoElements.forEach((videoEl) => {
      if (document.body.contains(videoEl)) {
        try {
          document.body.removeChild(videoEl);
        } catch (e) {
  
          logInfoRef.current(`Error cleaning up video: ${e.message}`);
        }
      }
    });
  }, []);

  // Listen for user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        logInfoRef.current("User interaction detected");
      }
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [userInteracted]);

  // Check camera permission when needed
  // FIX: Added ability to recheck permissions if needed
  const checkCameraPermission = useCallback(
    async (force = false) => {
      // Skip if already in progress
      if (permissionInProgress.current) return;

      // Skip if already checked and not forcing
      if (permissionChecked.current && !force) return;

      // Skip if the API isn't available
      if (!isCameraApiAvailable()) {
        logInfoRef.current("Camera API not available in this environment");
        setPermissionDenied(true);
        setError("Camera access not supported in this browser");
        permissionChecked.current = true;
        return;
      }

      try {
        permissionInProgress.current = true;
        logInfoRef.current("Checking camera permission...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        // Successfully got permission
        setPermissionGranted(true);
        setPermissionDenied(false);
        setError(null); // Clear any previous errors

        // Clean up the test stream
        stream.getTracks().forEach((track) => track.stop());
        logInfoRef.current("Camera permission granted");
      } catch (err) {
        logInfoRef.current(`Camera permission denied: ${err.message}`);
        setPermissionGranted(false);
        setPermissionDenied(true);
        setError("Camera access denied by browser or user");
      } finally {
        permissionChecked.current = true;
        permissionInProgress.current = false;
      }
    },
    [isCameraApiAvailable]
  );

  // Trigger permission check when conditions are right
  useEffect(() => {
    if (userInteracted && start) {
      checkCameraPermission();
    }
  }, [userInteracted, start, checkCameraPermission]);

  // Capture and analyze function with improved error handling
  const captureAndAnalyze = useCallback(
    async (forceCapture = false) => {
      // Skip if permissions denied or already capturing
      if (permissionDenied || isCapturingRef.current) {
        return;
      }

      // Skip if no user interaction yet
      if (!userInteracted) {
        logInfoRef.current("User hasn't interacted yet, can't access camera");
        return;
      }

      // Skip if camera API not available
      if (!isCameraApiAvailable()) {
        logInfoRef.current("Camera API not available");
        setPermissionDenied(true);
        return;
      }

      // Implement rate limiting to prevent spam
      // FIX: Use the configured delay parameter for rate limiting
      const now = Date.now();
      const timeSinceLastCapture = now - lastDetectionTime.current;
      const minCaptureInterval = Math.min(30000, delay / 2); // Use half the delay or 30 seconds, whichever is less

      // Only allow a capture if it's been long enough since the last one,
      // or if this is a forced capture
      if (!forceCapture && timeSinceLastCapture < minCaptureInterval) {
        logInfoRef.current(
          `Rate limiting: Not capturing (last capture was ${Math.round(
            timeSinceLastCapture / 1000
          )}s ago)`
        );
        return;
      }

      // Mark as capturing to prevent parallel attempts
      isCapturingRef.current = true;
      setLoading(true);
      lastDetectionTime.current = now;

      // Variables to hold resources that need cleanup
      let stream = null;
      let video = null;
      let canvas = null;

      try {
        logInfoRef.current("Starting emotion capture");

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        // Store the stream for later cleanup
        activeStreamRef.current = stream;
        setPermissionGranted(true);
        setError(null); // Clear any previous errors

        // Create and set up video element
        video = document.createElement("video");
        video.setAttribute("playsinline", ""); // Important for iOS
        video.srcObject = stream;
        video.style.position = "absolute";
        video.style.left = "-9999px";
        document.body.appendChild(video);

        // Wait for the video to be ready
        // FIX: Improved error handling for video loading
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Video load timeout"));
          }, 5000);

          video.onloadedmetadata = () => {
            clearTimeout(timeoutId);
            video
              .play()
              .then(resolve)
              .catch((error) => {
                reject(new Error(`Video play failed: ${error.message}`));
              });
          };

          video.onerror = (event) => {
            clearTimeout(timeoutId);
            reject(
              new Error(
                `Video error: ${video.error?.message || "Unknown error"}`
              )
            );
          };
        });

        // Give the camera some time to adjust
        await new Promise((r) => setTimeout(r, 300));

        // Create canvas and capture frame
        canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // FIX: Improved blob creation with proper error handling
        const blob = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Canvas blob conversion timeout"));
          }, 3000);

          canvas.toBlob(
            (result) => {
              clearTimeout(timeoutId);
              if (result) {
                resolve(result);
              } else {
                reject(new Error("Failed to create blob from canvas"));
              }
            },
            "image/jpeg",
            0.9
          );
        });

        // Create form data to send to API
        const formData = new FormData();
        formData.append("file", blob, "emotion-capture.jpg");
        formData.append("model_name", "VGG19");

        // Call emotion detection API
        // FIX: Added validation for API response
        try {
          const response = await axios.post(
            "https://ukonuzoidx-musemind.hf.space/api/predict-emotion/",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 30000,
            }
          );

          // Validate the response structure before processing
          if (!response.data) {
            throw new Error("API returned empty response");
          }

          // Process response - ACCEPT ALL DETECTIONS regardless of confidence
          if (response.data?.emotion && response.data?.confidence) {
            const detectedEmotion = response.data.emotion;

            // FIX: Better handling of confidence parsing
            let parsedConfidence = 0;
            try {
              if (typeof response.data.confidence === "number") {
                parsedConfidence = response.data.confidence;
              } else if (typeof response.data.confidence === "string") {
                parsedConfidence = parseFloat(
                  response.data.confidence.replace("%", "")
                );
              }

              // Ensure confidence is a valid number
              if (isNaN(parsedConfidence)) {
                parsedConfidence = 0;
                logInfoRef.current("Warning: Could not parse confidence value");
              }
            } catch (e) {
              logInfoRef.current(`Error parsing confidence: ${e.message}`);
            }

            // Format emotion with capitalized first letter
            const formattedEmotion =
              detectedEmotion.charAt(0).toUpperCase() +
              detectedEmotion.slice(1);

            // Always update emotion state, even with low confidence
            setEmotion(formattedEmotion);
            setConfidence(parsedConfidence);
            setHasDetected(true);

            if (parsedConfidence >= 25) {
              logInfoRef.current(
                `Detected emotion: ${formattedEmotion} (${parsedConfidence}%)`
              );
            } else {
              // Still accept the emotion, just log that it was low confidence
              logInfoRef.current(
                `Accepted low confidence detection: ${formattedEmotion} (${parsedConfidence}%)`
              );
            }
          } else {
            throw new Error("Invalid emotion response format from API");
          }
        } catch (apiError) {
          logInfoRef.current(`API error: ${apiError.message}`);
          throw apiError; // Re-throw to be caught by the outer catch
        }
      } catch (err) {
        logInfoRef.current(`Error during emotion detection: ${err.message}`);

        // Handle permission errors specifically
        if (
          err.name === "NotAllowedError" ||
          err.message.includes("denied") ||
          err.message.includes("permission")
        ) {
          setPermissionDenied(true);
          setPermissionGranted(false);
        }

        setError(err.message || "Failed to detect emotion");

        // NO RETRIES - We don't retry on errors anymore
      } finally {
        // FIX: Improved cleanup for all resources

        // Clean up canvas resources
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }

        // Clean up video element if it wasn't properly added to the DOM
        if (video && !document.body.contains(video)) {
          if (video.srcObject) {
            try {
              const tracks = video.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            } catch (e) {
              // Ignore cleanup errors
              logInfoRef.current(`Error cleaning up video: ${e.message}`);
            }
            video.srcObject = null;
          }
        }

        // Clean up stream if it wasn't assigned to activeStreamRef
        if (stream && stream !== activeStreamRef.current) {
          try {
            stream.getTracks().forEach((track) => track.stop());
          } catch (e) {
            // Ignore cleanup errors
            logInfoRef.current(`Error cleaning up stream: ${e.message}`);
          }
        }

        // Standard cleanup
        cleanupVideoResources();
        setLoading(false);
        isCapturingRef.current = false;
      }
    },
    [
      userInteracted,
      permissionDenied,
      isCameraApiAvailable,
      cleanupVideoResources,
      delay,
    ]
  );

  // Set up and clean up detection interval
  // FIX: Memoized the interval setup to prevent excessive re-creation
  const setupDetectionInterval = useCallback(() => {
    // Clear any existing interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }

    logInfoRef.current(`Setting up detection interval every ${delay}ms`);

    // Do an initial capture
    captureAndAnalyze(true);

    // Set up the interval for future captures
    detectionInterval.current = setInterval(() => {
      captureAndAnalyze();
    }, delay);

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [captureAndAnalyze, delay]);

  useEffect(() => {
    // Only set up the interval if all conditions are met
    if (start && userInteracted && permissionGranted && !permissionDenied) {
      const cleanup = setupDetectionInterval();
      return cleanup;
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
    setupDetectionInterval,
  ]);

  // Manual trigger function that respects rate limiting
  const triggerDetection = useCallback(() => {
    if (permissionDenied) {
      logInfoRef.current("Cannot trigger detection - permission denied");
      return false;
    }

    if (!userInteracted) {
      logInfoRef.current("Cannot trigger detection - user hasn't interacted");
      return false;
    }

    if (isCapturingRef.current) {
      logInfoRef.current("Already capturing, ignoring manual trigger");
      return false;
    }

    // Try to recheck permission if we haven't detected yet
    if (!permissionGranted && !hasDetected) {
      checkCameraPermission(true);
    }

    captureAndAnalyze(true);
    return true;
  }, [
    permissionDenied,
    userInteracted,
    permissionGranted,
    hasDetected,
    captureAndAnalyze,
    checkCameraPermission,
  ]);

  // On unmount cleanup
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
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
    triggerDetection,
    // Added additional functions for more control
    recheckPermission: () => checkCameraPermission(true),
    resetError: () => setError(null),
  };
};

export default useEmotionDetection;