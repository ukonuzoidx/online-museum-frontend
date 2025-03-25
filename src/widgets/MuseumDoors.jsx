// import React, { useState } from "react";
// import { Html } from "@react-three/drei";

// // Door Component to transition between rooms
// function Door({ position, rotation, targetRoom, onDoorClick }) {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <group position={position} rotation={rotation}>
//       <mesh
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//         onClick={() => onDoorClick(targetRoom)}
//       >
//         <boxGeometry args={[1.5, 2.5, 0.1]} />
//         <meshStandardMaterial color={hovered ? "#8B4513" : "#654321"} />
//       </mesh>
//       {hovered && (
//         <Html position={[0, 0, 0.1]}>
//           <div className="door-label">Enter {targetRoom}</div>
//         </Html>
//       )}
//     </group>
//   );
// }

// export default Door;

import React, { useState, useRef } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import musDoor from "../assets/textures/doors-1.jpg";

// Door Component with realistic appearance
function Door({ position, rotation, targetRoom, onDoorClick }) {
  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const doorRef = useRef();

  // Use default texture if not provided
  const woodTexture = useTexture(musDoor);

  // Door opening animation
  useFrame(() => {
    if (isOpening && doorRef.current) {
      // Animate door opening then trigger room change
      if (doorRef.current.rotation.y < Math.PI / 4) {
        doorRef.current.rotation.y += 0.05;
      } else {
        setIsOpening(false);
        onDoorClick(targetRoom);
      }
    }
  });

  // Handle door click
  const handleDoorClick = () => {
    setIsOpening(true);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <group>
        {/* Left side of frame */}
        <mesh position={[-0.85, 0, -0.05]}>
          <boxGeometry args={[0.2, 2.6, 0.3]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>

        {/* Right side of frame */}
        <mesh position={[0.85, 0, -0.05]}>
          <boxGeometry args={[0.2, 2.6, 0.3]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>

        {/* Top of frame */}
        <mesh position={[0, 1.3, -0.05]}>
          <boxGeometry args={[1.9, 0.2, 0.3]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>

        {/* Threshold/bottom */}
        <mesh position={[0, -1.3, -0.05]}>
          <boxGeometry args={[1.9, 0.2, 0.3]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>
      </group>

      {/* Door itself - with animation pivot */}
      <group ref={doorRef} position={[-0.75, 0, 0]}>
        {/* Main door panel */}
        <mesh
          position={[0.75, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleDoorClick}
        >
          <boxGeometry args={[1.5, 2.4, 0.1]} />
          <meshStandardMaterial
            map={woodTexture}
            color={hovered ? "#A1887F" : "#8D6E63"}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Door panels/molding - top */}
        <mesh position={[0.75, 0.8, 0.06]}>
          <boxGeometry args={[1.2, 0.7, 0.02]} />
          <meshStandardMaterial
            map={woodTexture}
            color="#795548"
            roughness={0.6}
          />
        </mesh>

        {/* Door panels/molding - bottom */}
        <mesh position={[0.75, -0.8, 0.06]}>
          <boxGeometry args={[1.2, 0.7, 0.02]} />
          <meshStandardMaterial
            map={woodTexture}
            color="#795548"
            roughness={0.6}
          />
        </mesh>

        {/* Door handle - knob */}
        <mesh position={[1.35, 0, 0.07]}>
          <cylinderGeometry
            args={[0.06, 0.06, 0.15, 16]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <meshStandardMaterial
            color="#CFD8DC"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Door handle - plate */}
        <mesh position={[1.35, 0, 0.06]}>
          <boxGeometry args={[0.05, 0.3, 0.04]} />
          <meshStandardMaterial
            color="#B0BEC5"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Hinges */}
        <mesh position={[0.05, 0.7, 0.05]}>
          <boxGeometry args={[0.1, 0.2, 0.02]} />
          <meshStandardMaterial
            color="#B0BEC5"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.05, -0.7, 0.05]}>
          <boxGeometry args={[0.1, 0.2, 0.02]} />
          <meshStandardMaterial
            color="#B0BEC5"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Floating label when hovering */}
      {hovered && (
        <Html position={[0, 0, 0.5]} center>
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "6px 10px",
              borderRadius: "4px",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            {/* if traget is em,pty or null dont show enter */}
            {targetRoom === "WelcomeScreen" || targetRoom === null
              ? "Exit Museum"
              : "Enter " + targetRoom}
            {/* Enter {targetRoom} */}
          </div>
        </Html>
      )}

      {/* Optional room sign/plaque */}
      <mesh position={[0, 1.45, 0.1]}>
        <boxGeometry args={[1.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#3E2723" roughness={0.5} />
      </mesh>
      <Html position={[0, 1.45, 0.12]} center>
        <div
          style={{
            color: "#F5F5F5",
            fontFamily: "Times New Roman, serif",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            textTransform: "uppercase",
            width: "150px",
          }}
        >
          {targetRoom == 'WelcomeScreen' ? '' : targetRoom}
        </div>
      </Html>
    </group>
  );
}

export default Door;
