import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import { Box } from "@react-three/drei";
import { useBox } from "@react-three/cannon"; 
import woodTexture from "../assets/textures/wood.jpg"; 

const Stairs = ({
  position,
  rotation = [0, 0, 0],
  width = 2,
  steps = 6,
  height = 2,
}) => {
  const woodTex = useLoader(TextureLoader, woodTexture);
  woodTex.repeat.set(2, 2);
  woodTex.wrapS = woodTex.wrapT = RepeatWrapping;

  const stepHeight = height / steps;
    const stepDepth = stepHeight * 1.94;
  const totalDepth = stepDepth * steps;

  return (
    <group position={position} rotation={rotation}>
      {/* ✅ Walkable Steps with Physics */}
      {Array.from({ length: steps }).map((_, i) => {
        const stepY = i * stepHeight + stepHeight / 2;
        const stepZ = totalDepth / 2 - stepDepth / 2 - i * stepDepth;

        return (
          <PhysicsStep
            key={`step-${i}`}
            position={[0, stepY, stepZ]}
            width={width}
            stepHeight={stepHeight}
            stepDepth={stepDepth}
            woodTex={woodTex}
          />
        );
      })}
    </group>
  );
};

/**
 * ✅ Walkable Step Component with Physics Collision
 */
const PhysicsStep = ({ position, width, stepHeight, stepDepth, woodTex }) => {
  const [ref] = useBox(() => ({
    type: "Static", // ✅ Prevents movement
    args: [width, stepHeight, stepDepth], // ✅ Correctly sized collider
    position: position,
  }));

  return (
    <Box
      ref={ref}
      args={[width, stepHeight, stepDepth]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        map={woodTex}
        color="#8B4513"
        roughness={0.7}
        metalness={0.1}
      />
    </Box>
  );
};

export default Stairs;
