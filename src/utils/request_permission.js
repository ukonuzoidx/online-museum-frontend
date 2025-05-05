// This file contains functions to request permissions for various features
export const requestWebcamPermission = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop()); // stop after check
        return true;
    } catch (err) {
        console.warn("Webcam access denied or unavailable", err);
        return false;
    }
};
