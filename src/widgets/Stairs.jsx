// import React from "react";
// import { useLoader } from "@react-three/fiber";
// import { TextureLoader, RepeatWrapping } from "three";
// import { Box, Cylinder } from "@react-three/drei";
// import { useBox } from "@react-three/cannon"; // ✅ Physics for collision
// import woodTexture from "../assets/textures/wood.jpg"; // Your wood texture

// const Stairs = ({
//   position,
//   rotation = [0, 0, 0],
//   width = 2,
//   steps = 5,
//   height = 2,
// }) => {
//   const woodTex = useLoader(TextureLoader, woodTexture);
//   woodTex.repeat.set(2, 2);
//   woodTex.wrapS = woodTex.wrapT = RepeatWrapping;

//   const stepHeight = height / steps;
//   const stepDepth = stepHeight * 2;
//   const totalDepth = stepDepth * steps;

//   return (
//     <group position={position} rotation={rotation}>
//       {/* ✅ Walkable Steps with Physics */}
//       {Array.from({ length: steps }).map((_, i) => {
//         const stepY = i * stepHeight + stepHeight / 2;
//         const stepZ = totalDepth / 2 - stepDepth / 2 - i * stepDepth;

//         return (
//           <PhysicsStep
//             key={`step-${i}`}
//             position={[0, stepY, stepZ]}
//             width={width}
//             stepHeight={stepHeight}
//             stepDepth={stepDepth}
//             woodTex={woodTex}
//           />
//         );
//       })}

//       {/* ✅ Railings */}
//       {[-width / 2 + 0.1, width / 2 - 0.1].map((xPos, idx) => (
//         <group key={`railing-${idx}`}>
//           {/* Main railing poles */}
//           <Cylinder
//             args={[0.05, 0.05, height * 1.2, 8]}
//             position={[xPos, height * 0.6, totalDepth / 2 - stepDepth / 2]}
//           >
//             <meshStandardMaterial color="#5D4037" roughness={0.5} />
//           </Cylinder>

//           <Cylinder
//             args={[0.05, 0.05, height * 1.2, 8]}
//             position={[xPos, height * 0.6, -totalDepth / 2 + stepDepth / 2]}
//           >
//             <meshStandardMaterial color="#5D4037" roughness={0.5} />
//           </Cylinder>

//           {/* Handrails */}
//           <Cylinder
//             args={[0.03, 0.03, totalDepth, 8]}
//             position={[xPos, height * 1.1, 0]}
//             rotation={[Math.PI / 2, 0, 0]}
//           >
//             <meshStandardMaterial color="#5D4037" roughness={0.4} />
//           </Cylinder>

//           <Cylinder
//             args={[
//               0.03,
//               0.03,
//               Math.sqrt(totalDepth * totalDepth + height * height),
//               8,
//             ]}
//             position={[xPos, height / 2, 0]}
//             rotation={[Math.atan2(height, totalDepth), 0, 0]}
//           >
//             <meshStandardMaterial color="#5D4037" roughness={0.4} />
//           </Cylinder>
//         </group>
//       ))}
//     </group>
//   );
// };

// /**
//  * ✅ Walkable Step Component with Physics Collision
//  */
// const PhysicsStep = ({ position, width, stepHeight, stepDepth, woodTex }) => {
//   const [ref] = useBox(() => ({
//     type: "Static", // ✅ Static object (won't move)
//     args: [width, stepHeight, stepDepth],
//     position: position,
//   }));

//   return (
//     <Box
//       ref={ref}
//       args={[width, stepHeight, stepDepth]}
//       castShadow
//       receiveShadow
//     >
//       <meshStandardMaterial
//         map={woodTex}
//         color="#8B4513"
//         roughness={0.7}
//         metalness={0.1}
//       />
//     </Box>
//   );
// };

// export default Stairs;


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
