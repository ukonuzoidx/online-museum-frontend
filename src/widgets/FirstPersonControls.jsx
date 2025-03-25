// import { useRef, useEffect, useState } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";
// function FirstPersonControls({ moveSpeed = 0.1 }) {
//   const { camera } = useThree();
//   const [moveForward, setMoveForward] = useState(false);
//   const [moveBackward, setMoveBackward] = useState(false);
//   const [moveLeft, setMoveLeft] = useState(false);
//   const [moveRight, setMoveRight] = useState(false);
//   const mouseRef = useRef({ x: 0, y: 0 });
//   const isLocked = useRef(false);

//   useEffect(() => {
//     // Set initial position
//     camera.position.set(0, 1.6, 5);

//     // Handle keyboard controls
//     const handleKeyDown = (e) => {
//       switch (e.code) {
//         case "KeyW":
//           setMoveForward(true);
//           break;
//         case "KeyS":
//           setMoveBackward(true);
//           break;
//         case "KeyA":
//           setMoveLeft(true);
//           break;
//         case "KeyD":
//           setMoveRight(true);
//           break;
//         default:
//           break;
//       }
//     };

//     const handleKeyUp = (e) => {
//       switch (e.code) {
//         case "KeyW":
//           setMoveForward(false);
//           break;
//         case "KeyS":
//           setMoveBackward(false);
//           break;
//         case "KeyA":
//           setMoveLeft(false);
//           break;
//         case "KeyD":
//           setMoveRight(false);
//           break;
//         default:
//           break;
//       }
//     };

//     // Set up pointerlock for mouse look
//     const canvas = document.querySelector("canvas");

//     const lockPointer = () => {
//       canvas.requestPointerLock();
//     };

//     const handleMouseMove = (e) => {
//       if (document.pointerLockElement === canvas) {
//         isLocked.current = true;
//         mouseRef.current.x += e.movementX * 0.002;
//         mouseRef.current.y += e.movementY * 0.002;

//         // Limit vertical look
//         mouseRef.current.y = Math.max(
//           -Math.PI / 3,
//           Math.min(Math.PI / 3, mouseRef.current.y)
//         );
//       } else {
//         isLocked.current = false;
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     document.addEventListener("keyup", handleKeyUp);
//     document.addEventListener("mousemove", handleMouseMove);
//     canvas.addEventListener("click", lockPointer);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.removeEventListener("keyup", handleKeyUp);
//       document.removeEventListener("mousemove", handleMouseMove);
//       canvas.removeEventListener("click", lockPointer);
//     };
//   }, [camera]);

//   useFrame(() => {
//     // Apply camera rotation from mouse
//     if (isLocked.current) {
//       camera.rotation.y = -mouseRef.current.x;
//       camera.rotation.x = -mouseRef.current.y;
//     }

//     // Handle movement
//     const direction = new THREE.Vector3();
//     const rotation = camera.rotation.y;

//     if (moveForward) {
//       direction.z = -moveSpeed * Math.cos(rotation);
//       direction.x = -moveSpeed * Math.sin(rotation);
//     }
//     if (moveBackward) {
//       direction.z = moveSpeed * Math.cos(rotation);
//       direction.x = moveSpeed * Math.sin(rotation);
//     }
//     if (moveLeft) {
//       direction.x = -moveSpeed * Math.cos(rotation);
//       direction.z = moveSpeed * Math.sin(rotation);
//     }
//     if (moveRight) {
//       direction.x = moveSpeed * Math.cos(rotation);
//       direction.z = -moveSpeed * Math.sin(rotation);
//     }

//     // Apply movement
//     camera.position.add(direction);

//     // Keep camera within bounds (adjust these based on your room size)
//     camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
//     camera.position.z = Math.max(-9, Math.min(9, camera.position.z));
//     camera.position.y = 1.6; // Keep at eye level
//   });

//   return null;
// }
// export default FirstPersonControls;
// import { useEffect, useRef } from "react";
// import { useThree } from "@react-three/fiber";
// import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
// import * as THREE from "three";

// const FirstPersonControls = ({ moveSpeed = 0.1 }) => {
//   const { camera, gl } = useThree();
//   const controls = useRef(null);
//   const velocity = useRef(new THREE.Vector3());
//   const direction = useRef(new THREE.Vector3());
//   const keysPressed = useRef({});

//   useEffect(() => {
//     // ✅ Properly instantiate PointerLockControls
//     controls.current = new PointerLockControls(camera, gl.domElement);
//     gl.domElement.addEventListener("click", () => controls.current.lock());

//     const handleKeyDown = (e) => (keysPressed.current[e.code] = true);
//     const handleKeyUp = (e) => (keysPressed.current[e.code] = false);

//     document.addEventListener("keydown", handleKeyDown);
//     document.addEventListener("keyup", handleKeyUp);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [camera, gl]);

//   useThree(({ clock }) => {
//     if (!controls.current || !controls.current.isLocked) return;

//     const delta = clock.getDelta();
//     direction.current.set(0, 0, 0);

//     if (keysPressed.current["KeyW"]) direction.current.z -= moveSpeed;
//     if (keysPressed.current["KeyS"]) direction.current.z += moveSpeed;
//     if (keysPressed.current["KeyA"]) direction.current.x -= moveSpeed;
//     if (keysPressed.current["KeyD"]) direction.current.x += moveSpeed;

//     direction.current.normalize().multiplyScalar(delta * 5);
//     velocity.current.lerp(direction.current, 0.2);

//     camera.position.add(velocity.current);
//     camera.position.y = 1.6; // Keep player at a fixed height
//   });

//   return null;
// };

// export default FirstPersonControls;

// import { useRef, useEffect, useState } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";
// import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// function FirstPersonControls({ moveSpeed = 0.1 }) {
//   const { camera, gl } = useThree();
//   const [moveForward, setMoveForward] = useState(false);
//   const [moveBackward, setMoveBackward] = useState(false);
//   const [moveLeft, setMoveLeft] = useState(false);
//   const [moveRight, setMoveRight] = useState(false);

//   const controlsRef = useRef();
//   const isLocked = useRef(false);

//   useEffect(() => {
//     // Set initial position
//     camera.position.set(0, 1.6, 5);

//     // Initialize PointerLockControls
//     const controls = new PointerLockControls(camera, gl.domElement);
//     controlsRef.current = controls;

//     // Handle keyboard controls
//     const handleKeyDown = (e) => {
//       switch (e.code) {
//         case "KeyW":
//           setMoveForward(true);
//           break;
//         case "KeyS":
//           setMoveBackward(true);
//           break;
//         case "KeyA":
//           setMoveLeft(true);
//           break;
//         case "KeyD":
//           setMoveRight(true);
//           break;
//         default:
//           break;
//       }
//     };

//     const handleKeyUp = (e) => {
//       switch (e.code) {
//         case "KeyW":
//           setMoveForward(false);
//           break;
//         case "KeyS":
//           setMoveBackward(false);
//           break;
//         case "KeyA":
//           setMoveLeft(false);
//           break;
//         case "KeyD":
//           setMoveRight(false);
//           break;
//         default:
//           break;
//       }
//     };

//     // Lock pointer on click
//     const lockPointer = () => {
//       controls.lock();
//     };

//     // Update isLocked state based on lock changes
//     const onLockChange = () => {
//       isLocked.current = document.pointerLockElement === gl.domElement;
//     };

//     // Event listeners
//     document.addEventListener("keydown", handleKeyDown);
//     document.addEventListener("keyup", handleKeyUp);
//     document.addEventListener("pointerlockchange", onLockChange, false);
//     gl.domElement.addEventListener("click", lockPointer);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.removeEventListener("keyup", handleKeyUp);
//       document.removeEventListener("pointerlockchange", onLockChange, false);
//       gl.domElement.removeEventListener("click", lockPointer);
//       controls.dispose();
//     };
//   }, [camera, gl.domElement]);

//   useFrame(() => {
//     if (!isLocked.current) return;

//     // Handle movement
//     const direction = new THREE.Vector3();

//     // Get camera direction vectors
//     const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
//       camera.quaternion
//     );
//     const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(
//       camera.quaternion
//     );

//     // Calculate movement direction
//     if (moveForward)
//       direction.add(frontVector.clone().multiplyScalar(moveSpeed));
//     if (moveBackward)
//       direction.add(frontVector.clone().multiplyScalar(-moveSpeed));
//     if (moveLeft) direction.add(rightVector.clone().multiplyScalar(-moveSpeed));
//     if (moveRight) direction.add(rightVector.clone().multiplyScalar(moveSpeed));

//     // Apply movement
//     camera.position.add(direction);

//     // Keep camera within bounds (adjust these based on your room size)
//     camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
//     camera.position.z = Math.max(-9, Math.min(9, camera.position.z));
//     camera.position.y = 1.6; // Keep at eye level
//   });

//   return null;
// }

// export default FirstPersonControls;

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

function FirstPersonControls({ moveSpeed = 0.1, currentRoom }) {
  const { camera, gl, scene } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  const controlsRef = useRef();
  const isLocked = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
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

    // Lock pointer on click
    const lockPointer = () => {
      controls.lock();
    };

    // Update isLocked state based on lock changes
    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    // Event listeners
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

    if (moveForward) {
      const forwardDir = frontVector.clone();
      if (!checkCollision(forwardDir)) {
        moveVector.add(forwardDir.multiplyScalar(moveSpeed));
      }
    }

    if (moveBackward) {
      const backwardDir = frontVector.clone().negate();
      if (!checkCollision(backwardDir)) {
        moveVector.add(backwardDir.multiplyScalar(moveSpeed));
      }
    }

    if (moveLeft) {
      const leftDir = rightVector.clone().negate();
      if (!checkCollision(leftDir)) {
        moveVector.add(leftDir.multiplyScalar(moveSpeed));
      }
    }

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