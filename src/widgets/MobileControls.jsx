import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * MobileControls Component
 * 
 * A React component that implements the camera controls for mobile devices in a Three.js scene
 * using the PointerLockControls for rotation and touch pad input for movement.
 * Includes collision detection to prevent moving through objects in the scene.
 * 
 * @returns {null} - This component doesn't render any visible elements as it only manages camera controls.
 */
function MobileControls({ currentRoom, moveRef, lookRef }) {
  const { camera, gl, scene } = useThree();
  const playerHeight = 1.6;
  const collisionDistance = 0.5;
  const raycaster = useRef(new THREE.Raycaster());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const direction = useRef(new THREE.Vector3());
  const moveSpeed = 0.08;
  const lookSensitivity = 0.003;

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, playerHeight, 5);

    // Make sure camera quaternion is initialized properly
    camera.lookAt(0, playerHeight, 0);

    // Extract existing camera rotation to euler
    euler.current.setFromQuaternion(camera.quaternion);

    return () => {
      // Reset camera position on unmount if needed
    };
  }, [camera]);

  const checkCollision = (direction) => {
    const meshes = [];

    // Find collision meshes in the scene
    if (scene) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.geometry && !obj.userData.noCollision) {
          meshes.push(obj);
        }
      });
    }

    if (meshes.length === 0) return false;

    raycaster.current.set(camera.position, direction.clone().normalize());
    const intersects = raycaster.current.intersectObjects(meshes, true);

    return intersects.length > 0 && intersects[0].distance < collisionDistance;
  };

  useFrame(() => {
    // Get joystick values from refs
    const move = moveRef.current;
    const look = lookRef.current;

    // Debug joystick status - only log when values actually change to reduce spam
    const moveActive =
      move.active && (Math.abs(move.x) > 0.01 || Math.abs(move.y) > 0.01);
    const lookActive =
      look.active && (Math.abs(look.dx) > 0.01 || Math.abs(look.dy) > 0.01);

    if (moveActive || lookActive) {
      console.log(
        "Move:",
        moveActive
          ? `x:${move.x.toFixed(2)} y:${move.y.toFixed(2)}`
          : "inactive",
        "Look:",
        lookActive
          ? `dx:${look.dx.toFixed(2)} dy:${look.dy.toFixed(2)}`
          : "inactive"
      );
    }

    // Handle camera rotation from look joystick
    if (look.active && (look.dx !== 0 || look.dy !== 0)) {
      // Get current camera rotation
      euler.current.setFromQuaternion(camera.quaternion);

      // Apply joystick movement to rotation with sensitivity adjustment
      euler.current.y -= look.dx * lookSensitivity;
      euler.current.x -= look.dy * lookSensitivity;

      // Clamp vertical rotation to prevent flipping
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, euler.current.x)
      );

      // Apply updated rotation
      camera.quaternion.setFromEuler(euler.current);

      // Reset deltas after applying them
      look.dx = 0;
      look.dy = 0;
    }

    // Handle movement from move joystick
    if (move.active && (move.x !== 0 || move.y !== 0)) {
      // Calculate front direction based on camera orientation
      const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
        camera.quaternion
      );
      frontVector.y = 0; // Keep movement horizontal
      frontVector.normalize();

      // Calculate right direction
      const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(
        camera.quaternion
      );
      rightVector.y = 0; // Keep movement horizontal
      rightVector.normalize();

      // Calculate movement vector
      const moveVector = new THREE.Vector3();

      // Forward/backward movement
      if (move.y !== 0) {
        const forwardDir = frontVector.clone().multiplyScalar(-move.y);
        if (!checkCollision(forwardDir)) {
          moveVector.add(forwardDir);
        }
      }

      // Left/right movement
      if (move.x !== 0) {
        const rightDir = rightVector.clone().multiplyScalar(move.x);
        if (!checkCollision(rightDir)) {
          moveVector.add(rightDir);
        }
      }

      // Apply movement with speed adjustment
      moveVector.multiplyScalar(moveSpeed);
      camera.position.add(moveVector);

      // Keep within room bounds
      const bounds = currentRoom === "Restrooms" ? 3 : 9;
      camera.position.x = Math.max(
        -bounds,
        Math.min(bounds, camera.position.x)
      );
      camera.position.z = Math.max(
        -bounds,
        Math.min(bounds, camera.position.z)
      );
    }

    // Maintain constant height
    camera.position.y = playerHeight;
  });

  return null;
}

export default MobileControls;
