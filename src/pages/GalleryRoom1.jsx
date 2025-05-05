import React, { Suspense, useRef, useState } from "react";
import { TextureLoader, RepeatWrapping, DoubleSide } from "three";

import { useLoader, useFrame } from "@react-three/fiber";
import Door from "../widgets/MuseumDoors"; 
import floor2 from "../assets/textures/floor-2.png";
import walls5 from "../assets/textures/walls-5.jpg";
import ceiling1 from "../assets/textures/ceiling-1.jpg";
import marbleTexture from "../assets/textures/marble-1.png";
import useMetMuseumArtworks from "../hooks/useMuseumHook";
import ArtFrame from "../components/ArtworkFrame";
import { Box, Cylinder, Text } from "@react-three/drei";


function GalleryRoom1({ onDoorClick, artworks, loading }) {
  // References for animations or effects
  const skylightRef = useRef();
  const lightBeamRef = useRef();

  // Load textures
  const floorTexture = useLoader(TextureLoader, floor2);
  const wallTexture = useLoader(TextureLoader, walls5);
  const marbleFloor = useLoader(TextureLoader, marbleTexture);

  // Configure texture repeats
  floorTexture.repeat.set(5, 5);
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;

  //   marbleFloor.repeat.set(8, 8);
  //   marbleFloor.wrapS = marbleFloor.wrapT = RepeatWrapping;

  wallTexture.repeat.set(2, 1);
  wallTexture.wrapS = wallTexture.wrapT = RepeatWrapping;

  // Animate light rays coming from skylight
  useFrame(({ clock }) => {
    if (lightBeamRef.current) {
      lightBeamRef.current.material.opacity =
        0.1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  // Fetch artworks from the European Paintings department (Department ID: 11)
  // ✅ Use your custom hook to fetch up to 6 European Paintings
  // Art exhibits data postion  and sizes
  const exhibits = [
    {
      id: 1,
      // title: "Portrait of Nobility",
      // description:
      //   "17th century portrait showing the detailed craftsmanship of the period with rich colors and symbolic elements.",
      position: [-8, 2.2, -9.8],
      size: [2.5, 3],
    },
    {
      id: 2,
      position: [0, 3.5, -9.8],
      size: [4, 4],
    },
    {
      id: 3,

      position: [8, 2.2, -9.8],
      size: [2.5, 3],
    },
    {
      id: 4,
      position: [-9.8, 2, -5],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 5,
      position: [-9.8, 2, 5],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 6,
      position: [9.8, 2, -5],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 7,
      position: [9.8, 2, 5],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 8,
      position: [2.8, 2.1, 9.7],
      rotation: [0, Math.PI, 0],
      size: [2, 2.5],
    },
    {
      id: 9,
      position: [-4.8, 2.1, 9.7],
      rotation: [0, Math.PI, 0],
      size: [2, 2.5],
    },
  ];

  // console.log(exhibits.length);
// would load Artwork from the APp.jsx file instead of here because of the long loading time
  // const { artworks, loading } = useMetMuseumArtworks(
  //   11,
  //   "painting",
  //   exhibits.length
  // );

  // Suppose we want European Paintings:
  // const { artworks, loading, error } = useMetMuseumArtworks(
  //   11,
  //   "paintings",
  //   20,
  //   // exhibits.length
  // );

  const validArtworks = artworks.slice(0, exhibits.length);

  return (
    <group>
      {/* Polished marble floor - brightened */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          map={marbleFloor}
          roughness={0.05}
          metalness={0.1}
          envMapIntensity={1}
          color="#E0E0E0" // Adding a light color overlay to brighten the floor
        />
      </mesh>

      {/* Ceiling with skylight */}
      <Box position={[0, 10, 0]} args={[20, 0.3, 20]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>

      {/* Ceiling light well/skylight */}
      <group ref={skylightRef} position={[0, 10, 0]}>
        <Box args={[8, 0.4, 8]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#d0d0d0" />
        </Box>
        <Box args={[7, 0.1, 7]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#87CEEB"
            transparent
            opacity={0.7}
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </Box>

         </group>

      {/* Elegant crown molding where walls meet ceiling */}
      {[
        [0, 9.7, -9.9, 0, 0, 0, 20, 0.3], // Front
        [0, 9.7, 9.9, 0, 0, 0, 20, 0.3], // Back
        [-9.9, 9.7, 0, 0, 0, Math.PI / 2, 20, 0.3], // Left
        [9.9, 9.7, 0, 0, 0, Math.PI / 2, 20, 0.3], // Right
      ].map((props, i) => (
        <Box
          key={i}
          position={[props[0], props[1], props[2]]}
          rotation={[props[3], props[4], props[5]]}
          args={[props[6], 0.6, 0.3]}
        >
          <meshStandardMaterial color="#E8E8E8" />
        </Box>
      ))}

      {/* Base trim where walls meet floor */}
      {[
        [0, 0.15, -9.85, 20, 0.3], // Front
        [0, 0.15, 9.85, 20, 0.3], // Back
        [-9.85, 0.15, 0, 20, 0.3], // Left
        [9.85, 0.15, 0, 20, 0.3], // Right
      ].map((props, i) => (
        <Box
          key={`base-${i}`}
          position={[props[0], props[1], props[2]]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          args={[props[3], 0.3, 0.3]}
        >
          <meshStandardMaterial color="#D0D0D0" />
        </Box>
      ))}

      {/* White gallery walls */}
      <Box position={[0, 5, -10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
      <Box position={[-10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
      <Box position={[10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
      <Box position={[0, 5, 10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>

      {/* Display Art Exhibits */}
      {/* Use custom ArtFrame component to display the artworks */}
      <Suspense fallback={null}>
        {exhibits.map((ex, i) => {
          const art = validArtworks[i];
          if (!art) return null;

          return (
            <ArtFrame
              key={ex.id}
              position={ex.position}
              rotation={ex.rotation}
              size={ex.size}
              artwork={art}
            />
          );
        })}
      </Suspense>

      {/* Door to Entrance - using your enhanced Door component */}
      <Door
        position={[-5, 1.5, -9.9]}
        rotation={[0, 0, 0]}
        targetRoom="Entrance"
        onDoorClick={onDoorClick}
      />

      {/* Door to Gallery 2 */}
      <Door
        position={[5, 1.5, -9.9]}
        rotation={[0, 0, 0]}
        targetRoom="Gallery 2"
        onDoorClick={onDoorClick}
      />

      {/* Door to Restrooms */}
      <Door
        position={[9.9, 1.5, 8]}
        rotation={[0, -Math.PI / 2, 0]}
        targetRoom="Restrooms"
        onDoorClick={onDoorClick}
      />

      {/* Information Plaque */}
      <group position={[0, 0.8, -9.7]}>
        <Box args={[2, 0.6, 0.05]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        <Text
          position={[0, 0.1, 0.03]}
          fontSize={0.12}
          color="#F5F5DC"
          anchorX="center"
          anchorY="middle"
        >
          EUROPEAN PAINTINGS
        </Text>
        <Text
          position={[0, -0.1, 0.03]}
          fontSize={0.08}
          color="#F5F5DC"
          anchorX="center"
          anchorY="middle"
        >
          17th-19th Century
        </Text>
      </group>

      {/* Gallery benches for visitors */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, 0.4, 0]}>
          <Box args={[3, 0.1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#5D4037" />
          </Box>
          <Box args={[3, 0.4, 0.1]} position={[0, -0.25, 0.45]}>
            <meshStandardMaterial color="#5D4037" />
          </Box>
          <Box args={[0.1, 0.4, 1]} position={[-1.45, -0.25, 0]}>
            <meshStandardMaterial color="#5D4037" />
          </Box>
          <Box args={[0.1, 0.4, 1]} position={[1.45, -0.25, 0]}>
            <meshStandardMaterial color="#5D4037" />
          </Box>
        </group>
      ))}

      {/* Small spotlights for artwork */}
      {exhibits.map((exhibit, i) => {
        const spotPosition = [...exhibit.position];
        spotPosition[1] += 3; // Position above artwork

        return (
          <group key={`spot-${i}`} position={spotPosition}>
            <Cylinder args={[0.1, 0.1, 0.2, 8]}>
              <meshStandardMaterial color="#333333" />
            </Cylinder>
            <Cylinder
              args={[0.05, 0.1, 0.15, 8]}
              position={[0, -0.15, 0]}
              rotation={exhibit.rotation || [0, 0, 0]}
            >
              <meshStandardMaterial color="#222222" />
            </Cylinder>
            <pointLight
              intensity={15}
              distance={10}
              decay={2}
              color="#FFF9C4"
            />
          </group>
        );
      })}
    </group>
  );
}

export default GalleryRoom1;
