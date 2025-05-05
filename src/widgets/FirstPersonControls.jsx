
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
/**
 * FirstPersonControls Component
 * 
 * A React component that implements first-person camera controls in a Three.js scene
 * using the PointerLockControls for rotation and custom keyboard input for movement.
 * Includes collision detection to prevent moving through objects in the scene.
 * 
 * @returns {null} - This component doesn't render any visible elements as it only manages camera controls.
 */

function FirstPersonControls({ moveSpeed = 0.1, currentRoom }) {
  // Access Three.js objects and the rendering context from React Three Fiber
  const { camera, gl, scene } = useThree();

  // State variables to manage movement direction
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  // Refs for persistent values that don't trigger re-renders
  const controlsRef = useRef(); // Reference to the PointerLockControls
  const isLocked = useRef(false); // Tracks if pointer is currently locked
  const raycaster = useRef(new THREE.Raycaster()); // For collision detection
  
  // Constants for player configuration
  const playerHeight = 1.6; // Eye level height
  const collisionDistance = 0.5; // How close we can get to objects

  useEffect(() => {
    // Set initial position
    camera.position.set(0, playerHeight, 5);

    // Initialize PointerLockControls
    const controls = new PointerLockControls(camera, gl.domElement);
    controlsRef.current = controls;

    // Handle keyboard controls
    const handleKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
          setMoveForward(true);
          break;
        case "KeyS":
          setMoveBackward(true);
          break;
        case "KeyA":
          setMoveLeft(true);
          break;
        case "KeyD":
          setMoveRight(true);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
          setMoveForward(false);
          break;
        case "KeyS":
          setMoveBackward(false);
          break;
        case "KeyA":
          setMoveLeft(false);
          break;
        case "KeyD":
          setMoveRight(false);
          break;
        default:
          break;
      }
    };

    /**
     * Activates pointer lock when the canvas is clicked
     */
    const lockPointer = () => {
      controls.lock();
    };

    // Update isLocked state based on lock changes
    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    // Register all event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("pointerlockchange", onLockChange, false);
    gl.domElement.addEventListener("click", lockPointer);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", onLockChange, false);
      gl.domElement.removeEventListener("click", lockPointer);
      controls.dispose();
    };
  }, [camera, gl.domElement]);

  // Check for collisions in a particular direction
  const checkCollision = (direction) => {
    // Get meshes from the scene for collision detection
    const meshes = [];
    scene.traverse((object) => {
      // Check if the object is a mesh with geometry (excludes lights, cameras, etc.)
      if (object.isMesh && object.geometry && !object.userData.noCollision) {
        meshes.push(object);
      }
    });

    if (meshes.length === 0) return false;

    // Set raycaster position and direction
    raycaster.current.set(camera.position, direction.clone().normalize());

    // Check for intersections
    const intersects = raycaster.current.intersectObjects(meshes, true);

    // If we're too close to an object, prevent movement in that direction
    return intersects.length > 0 && intersects[0].distance < collisionDistance;
  };

  useFrame(() => {
    if (!isLocked.current) return;

    // Handle movement with collision detection
    const direction = new THREE.Vector3();

    // Get camera direction vectors
    const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(
      camera.quaternion
    );

    // Zero out the y component to keep movement horizontal
    frontVector.y = 0;
    rightVector.y = 0;
    frontVector.normalize();
    rightVector.normalize();

    // Calculate movement vector based on key presses
    let moveVector = new THREE.Vector3();

    // Forward movement
    if (moveForward) {
      const forwardDir = frontVector.clone();
      if (!checkCollision(forwardDir)) {
        moveVector.add(forwardDir.multiplyScalar(moveSpeed));
      }
    }

    // Backward movement
    if (moveBackward) {
      const backwardDir = frontVector.clone().negate();
      if (!checkCollision(backwardDir)) {
        moveVector.add(backwardDir.multiplyScalar(moveSpeed));
      }
    }

    // Left movement
    if (moveLeft) {
      const leftDir = rightVector.clone().negate();
      if (!checkCollision(leftDir)) {
        moveVector.add(leftDir.multiplyScalar(moveSpeed));
      }
    }

    // Right movement
    if (moveRight) {
      const rightDir = rightVector.clone();
      if (!checkCollision(rightDir)) {
        moveVector.add(rightDir.multiplyScalar(moveSpeed));
      }
    }

    // Apply movement if not colliding
    camera.position.add(moveVector);

    // Room bounds - optional, can be adjusted based on your room size
    const roomBounds = currentRoom === "Restrooms" ? 3 : 9;
    camera.position.x = Math.max(
      -roomBounds,
      Math.min(roomBounds, camera.position.x)
    );
    camera.position.z = Math.max(
      -roomBounds,
      Math.min(roomBounds, camera.position.z)
    );

    // Keep camera at eye level
    camera.position.y = playerHeight;
  });

  return null;
}

export default FirstPersonControls;