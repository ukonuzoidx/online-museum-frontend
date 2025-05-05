// ExitDoor component for the museum scene in a React Three Fiber application.
import React, { useState, useRef } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import musDoor from "../assets/textures/doors-1.jpg";

function ExitDoor({
  position = [0, 1.25, -4.9],
  rotation = [0, 0, 0],
  onExit,
}) {
  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const doorRef = useRef();
  const woodTexture = useTexture(musDoor);

  useFrame(() => {
    if (isOpening && doorRef.current) {
      if (doorRef.current.rotation.y < Math.PI / 4) {
        doorRef.current.rotation.y += 0.05;
      } else {
        setIsOpening(false);
        onExit();
      }
    }
  });

  const handleExit = () => {
    setIsOpening(true);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.8, 2.6, 0.2]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Door */}
      <group ref={doorRef} position={[-0.75, 0, 0]}>
        <mesh
          position={[0.75, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleExit}
        >
          <boxGeometry args={[1.5, 2.4, 0.1]} />
          <meshStandardMaterial
            map={woodTexture}
            color={hovered ? "#A1887F" : "#8D6E63"}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Label */}
      {hovered && (
        <Html position={[0, 0, 0.5]} center>
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "6px 10px",
              borderRadius: "4px",
              fontFamily: "Arial",
              fontSize: "14px",
            }}
          >
            Exit Museum
          </div>
        </Html>
      )}
    </group>
  );
}

export default ExitDoor;
