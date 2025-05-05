import React, { Suspense, useRef } from "react";
import { TextureLoader, RepeatWrapping, DoubleSide } from "three";
import { Html, Box, Cylinder, Text, useTexture } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import Door from "../widgets/MuseumDoors"; // Using your enhanced door component
import floor2 from "../assets/textures/floor-2.png";
import marbleTexture from "../assets/textures/marble.jpg";
import woodTexture from "../assets/textures/wood.jpg";
import Stairs from "../widgets/Stairs";
import useMetMuseumArtworks from "../hooks/useMuseumHook";
import loadingGif from "../assets/loading.gif";
import ClassicalArtwork from "../components/ClassicFrame";

function GalleryRoom3({ onDoorClick, artworks, loading }) {
  // References for lighting and animations
  const ambientLightRef = useRef();
  const skylightRef = useRef();

  // Load textures
  const floorTexture = useLoader(TextureLoader, woodTexture);

  // Configure texture repeats
  floorTexture.repeat.set(5, 5);
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;

  // Configure texture repeats
  floorTexture.repeat.set(5, 5);
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;

  // Dynamic skylight effect
  useFrame(({ clock }) => {
    if (skylightRef.current) {
      skylightRef.current.intensity =
        1.5 + Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  // References for animations
  const spotlightRefs = useRef([]);

  // Animate spotlights for dramatic effect - more subtle
  useFrame(({ clock }) => {
    if (spotlightRefs.current && spotlightRefs.current.length > 0) {
      spotlightRefs.current.forEach((ref, i) => {
        if (ref) {
          ref.intensity =
            15 + Math.sin(clock.getElapsedTime() * 0.2 + i * 0.5) * 2;
        }
      });
    }
  });

  // Classical paintings collection
  const paintings = [
    {
      id: 1,
      position: [-7.5, 2, -9.8],
      size: [2, 2.5],
    },
    {
      id: 2,
      position: [-3.5, 2, -9.8],
      size: [2.5, 2.5],
    },
    {
      id: 3,
      position: [0, 2, -9.8],
      size: [2, 2.5],
    },
    {
      id: 4,
      position: [3.5, 2, -9.8],
      size: [2, 2.5],
    },
    {
      id: 5,
      position: [7.5, 2, -9.8],
      size: [2, 2.5],
    },
    {
      id: 6,
      position: [-9.8, 2, -6.8],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 7,
      position: [-9.8, 2, -2.5],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 8,
      position: [-9.8, 2, 1.5],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 9,
      position: [-9.8, 2, 6.5],
      rotation: [0, Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 10,
      position: [9.8, 2, -5],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 11,
      position: [9.8, 2, 0],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
    {
      id: 12,
      position: [9.8, 2, 5],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
  ];

  // Frame collection data - smaller frames for a more intimate gallery
  const frames = [
    // Front wall (North wall)
    {
      id: 1,
      position: [-5, 2, -7.9],
      size: [1.4, 1.8],
      frameStyle: "baroque",
      frameWidth: 0.2,
    },
    {
      id: 2,
      position: [-1.7, 2, -7.9],
      size: [1.2, 1.6],
      frameStyle: "neoclassical",
      frameWidth: 0.15,
    },
    {
      id: 3,
      position: [1.7, 2, -7.9],
      size: [1.3, 1.7],
      frameStyle: "rococo",
      frameWidth: 0.2,
    },
    {
      id: 4,
      position: [5, 2, -7.9],
      size: [1.5, 1.9],
      frameStyle: "victorian",
      frameWidth: 0.2,
    },

    // Left wall (West wall)
    {
      id: 5,
      position: [-7.9, 2, -4],
      rotation: [0, Math.PI / 2, 0],
      size: [1.4, 1.8],
      frameStyle: "baroque",
      frameWidth: 0.2,
    },
    {
      id: 6,
      position: [-7.9, 2, 0],
      rotation: [0, Math.PI / 2, 0],
      size: [1.3, 1.7],
      frameStyle: "victorian",
      frameWidth: 0.18,
    },
    {
      id: 7,
      position: [-7.9, 2, 4],
      rotation: [0, Math.PI / 2, 0],
      size: [1.5, 1.9],
      frameStyle: "rococo",
      frameWidth: 0.2,
    },

    // Right wall (East wall)
    {
      id: 8,
      position: [7.9, 2, -4],
      rotation: [0, -Math.PI / 2, 0],
      size: [1.3, 1.7],
      frameStyle: "neoclassical",
      frameWidth: 0.15,
    },
    {
      id: 9,
      position: [7.9, 2, 0],
      rotation: [0, -Math.PI / 2, 0],
      size: [1.4, 1.8],
      frameStyle: "baroque",
      frameWidth: 0.2,
    },
    {
      id: 10,
      position: [7.9, 2, 4],
      rotation: [0, -Math.PI / 2, 0],
      size: [1.3, 1.7],
      frameStyle: "rococo",
      frameWidth: 0.2,
    },

    // Back wall (South wall)
    {
      id: 11,
      position: [-5, 2, 7.9],
      rotation: [0, Math.PI, 0],
      size: [1.4, 1.8],
      frameStyle: "victorian",
      frameWidth: 0.18,
    },
    {
      id: 12,
      position: [-1.7, 2, 7.9],
      rotation: [0, Math.PI, 0],
      size: [1.3, 1.7],
      frameStyle: "baroque",
      frameWidth: 0.2,
    },
    {
      id: 13,
      position: [1.7, 2, 7.9],
      rotation: [0, Math.PI, 0],
      size: [1.2, 1.6],
      frameStyle: "neoclassical",
      frameWidth: 0.15,
    },
    {
      id: 14,
      position: [5, 2, 7.9],
      rotation: [0, Math.PI, 0],
      size: [1.5, 1.9],
      frameStyle: "rococo",
      frameWidth: 0.2,
    },
  ];

  // const { artworks, loading } = useMetMuseumArtworks(
  //   9,
  //   "Portrait",
  //   paintings.length + 5,
  //   true
  // );

  const validArtworks = artworks.slice(0, paintings.length);

  return (
    <group>
      {/* Highly polished floor with reflections */}
      {/* Polished wood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          map={floorTexture}
          color="#5D4037"
          roughness={0.3}
          metalness={0.2}
          envMapIntensity={1}
        />
      </mesh>

      {/* Clean white walls with subtle lighting effect */}
      <Box position={[0, 5, -10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>
      <Box position={[-10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>
      <Box position={[10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>
      <Box position={[0, 5, 10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>

      {/* Bright white ceiling with enhanced lighting */}
      <Box position={[0, 8, 0]} args={[16, 0.3, 16]}>
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.9}
          emissive="#FFFFFF"
          emissiveIntensity={0.2}
        />
      </Box>

      {/* Crown molding */}
      {[
        [0, 7.85, -7.9, 16, 0.3], // Front
        [0, 7.85, 7.9, 16, 0.3], // Back
        [-7.9, 7.85, 0, 16, 0.3], // Left
        [7.9, 7.85, 0, 16, 0.3], // Right
      ].map((props, i) => (
        <Box
          key={`molding-${i}`}
          position={[props[0], props[1], props[2]]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          args={[props[3], props[4], 0.3]}
        >
          <meshStandardMaterial color="#FFFFFF" />
        </Box>
      ))}

      {/* Secondary molding detail */}
      {[
        [0, 7.6, -7.8, 15.6, 0.15], // Front
        [0, 7.6, 7.8, 15.6, 0.15], // Back
        [-7.8, 7.6, 0, 15.6, 0.15], // Left
        [7.8, 7.6, 0, 15.6, 0.15], // Right
      ].map((props, i) => (
        <Box
          key={`molding2-${i}`}
          position={[props[0], props[1], props[2]]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          args={[props[3], props[4], 0.2]}
        >
          <meshStandardMaterial color="#FFFFFF" />
        </Box>
      ))}

      {/* Baseboards */}
      {[
        [0, 0.15, -7.8, 16, 0.3], // Front
        [0, 0.15, 7.8, 16, 0.3], // Back
        [-7.8, 0.15, 0, 16, 0.3], // Left
        [7.8, 0.15, 0, 16, 0.3], // Right
      ].map((props, i) => (
        <Box
          key={`baseboard-${i}`}
          position={[props[0], props[1], props[2]]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          args={[props[3], props[4], 0.3]}
        >
          <meshStandardMaterial color="#FFFFFF" />
        </Box>
      ))}

      {/* Ceiling recessed lighting - brighter */}
      {[-4, 0, 4].map((x, i) =>
        [-4, 0, 4].map((z, j) => (
          <group key={`ceiling-light-${i}-${j}`} position={[x, 7.9, z]}>
            <Box args={[1, 0.1, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.5}
              />
            </Box>
            <pointLight
              position={[0, -0.2, 0]}
              intensity={15}
              distance={12}
              decay={2}
              color="#FFF9E5" // Warm gallery lighting
            />
          </group>
        ))
      )}

      {/* Track lighting - more focused on frames */}
      {[-5, 0, 5].map((x, i) => (
        <group key={`track-${i}`} position={[x, 7.7, 0]}>
          <Box args={[0.15, 0.05, 14]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#E0E0E0"
              metalness={0.5}
              roughness={0.5}
            />
          </Box>
          {/* Spotlights */}
          {frames
            .filter((_, index) => index % 3 === i % 3)
            .map((frame, j) => {
              const spotPosition = [0, 0, -6 + j * 3]; // Distribute along track

              return (
                <group key={`spot-${i}-${j}`} position={spotPosition}>
                  <Cylinder
                    args={[0.08, 0.08, 0.2, 8]}
                    rotation={[Math.PI / 2, 0, 0]}
                  >
                    <meshStandardMaterial
                      color="#D0D0D0"
                      metalness={0.6}
                      roughness={0.4}
                    />
                  </Cylinder>
                  <spotLight
                    position={[0, -0.2, 0]}
                    angle={0.4}
                    penumbra={0.5}
                    intensity={12}
                    distance={10}
                    decay={2}
                    color="#FFF9E5" // Warm gallery lighting
                    castShadow
                    ref={(el) => {
                      if (!spotlightRefs.current) spotlightRefs.current = [];
                      spotlightRefs.current[i * 5 + j] = el;
                    }}
                  />
                </group>
              );
            })}
        </group>
      ))}

      {/* Enhanced ambient lighting for brighter room */}
      <ambientLight intensity={0.7} color="#FFF5E1" />

      {/* Display all paintings */}
      <Suspense fallback={null}>
        {paintings.map((painting, i) => {
          const art = validArtworks[i];

          return (
            <ClassicalArtwork
              key={painting.id}
              position={painting.position}
              rotation={painting.rotation}
              size={painting.size}
              title={art?.title || "No title"}
              department={art?.department || "Unknown Department"}
              artist={art?.artistDisplayName || "Unknown Artist"}
              dimensions={art?.dimensions || "Unknown Dimensions"}
              medium={art?.medium || "Unknown Medium"}
              objectURL={art?.objectURL}
              imageURL={art?.primaryImage}
            />
          );
        })}
      </Suspense>

      {/* Doors */}
      {/* Door to Gallery 2 */}
      <Door
        position={[-5, 1.533, 9.9]}
        rotation={[0, Math.PI, 0]}
        targetRoom="Gallery 2"
        onDoorClick={onDoorClick}
      />
      <Stairs
        position={[-5, -1.7, 9.9]}
        rotation={[0, Math.PI, 0]}
        width={2}
        steps={1}
        height={2}
      />

      {/* Door to Restrooms */}
      <Door
        position={[9.9, 1.503, 8.9]}
        rotation={[0, -Math.PI / 2, 0]}
        targetRoom="Restrooms"
        onDoorClick={onDoorClick}
      />

      <Stairs
        position={[9.9, -1.7, 8.9]}
        rotation={[0, -Math.PI / 2, 0]}
        width={2}
        steps={1}
        height={2}
      />

      {/* Gallery information sign */}
      <group position={[0, 4.5, -9.6]}>
        <Box args={[3, 0.6, 0.05]}>
          <meshStandardMaterial color="#F0F0F0" />
        </Box>
        <Text
          position={[0, 0.15, 0.03]}
          fontSize={0.12}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          DRAWINGS & PAINTINGS
        </Text>
        <Text
          position={[0, -0.1, 0.03]}
          fontSize={0.08}
          color="#555555"
          anchorX="center"
          anchorY="middle"
        >
          Portriat Masterpieces
        </Text>
      </group>

      {/* Benches for visitors */}
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 0.4, 0]}>
          <Box args={[2, 0.1, 0.8]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#F0F0F0" />
          </Box>
          <Box args={[2, 0.3, 0.1]} position={[0, -0.2, 0.35]}>
            <meshStandardMaterial color="#F0F0F0" />
          </Box>
          <Box args={[0.1, 0.3, 0.8]} position={[-0.95, -0.2, 0]}>
            <meshStandardMaterial color="#F0F0F0" />
          </Box>
          <Box args={[0.1, 0.3, 0.8]} position={[0.95, -0.2, 0]}>
            <meshStandardMaterial color="#F0F0F0" />
          </Box>
        </group>
      ))}
    </group>
  );
}

export default GalleryRoom3;
