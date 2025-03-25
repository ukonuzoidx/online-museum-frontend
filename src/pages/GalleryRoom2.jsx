import React, { Suspense, useRef } from "react";
import { TextureLoader, RepeatWrapping, DoubleSide } from "three";
import { Html, Box, Cylinder, Text } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import Door from "../widgets/MuseumDoors"; // Using your enhanced door component
import floor2 from "../assets/textures/floor-2.png";
import useMetMuseumArtworks from "../hooks/useMuseumHook";
import DisplayCase from "../components/DisplayCase";

function GalleryRoom2({ onDoorClick }) {
  // References for animations or effects
  const chandelierRef = useRef();

  // Load textures
  const floorTexture = useLoader(TextureLoader, floor2);

  // Configure texture repeats
  floorTexture.repeat.set(5, 5);
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;

  // Animate the chandeliers
  useFrame(({ clock }) => {
    if (chandelierRef.current) {
      chandelierRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    }
  });

  // Art collection data
  const collections = [
    {
      id: 1,
      position: [-7, 0.05, -7],
      size: [1.2, 1.2, 0.8],
      artifactType: "bust",
    },
    {
      id: 2,
      position: [-4, 0.05, -7],
      size: [1.2, 1.2, 0.8],
      artifactType: "vase",
    },
    {
      id: 3,
      position: [-1, 0.05, -7],
      size: [1.2, 1.2, 0.8],
      artifactType: "sculpture",
    },
    {
      id: 4,
      position: [2, 0.05, -7],
      size: [1.2, 1.2, 0.8],
      artifactType: "artifact",
    },
    {
      id: 5,
      position: [5, 0.05, -7],
      size: [1.2, 1.2, 0.8],
      artifactType: "jewelry",
    },
    {
      id: 6,
      position: [-7, 0.05, 0],
      size: [1.2, 1.2, 0.8],
      artifactType: "bust",
    },
    {
      id: 7,
      position: [-4, 0.05, 0],
      size: [1.2, 1.2, 0.8],
      artifactType: "vase",
    },
    {
      id: 8,
      position: [0, 0.05, 0],
      size: [4, 1.5, 1],
    },
    // {
    //   id: 9,
    //   position: [2, 0.05, 0],
    //   size: [1.2, 1.2, 0.8],
    //   artifactType: "artifact",
    // },
    {
      id: 10,
      position: [5, 0.05, 0],
      size: [1.2, 1.2, 0.8],
      artifactType: "jewelry",
    },
    {
      id: 11,
      position: [-7, 0.05, 7],
      size: [1.2, 1.2, 0.8],
      artifactType: "bust",
    },
    {
      id: 12,
      position: [-4, 0.05, 7],
      size: [1.2, 1.2, 0.8],
      artifactType: "vase",
    },
    {
      id: 13,
      position: [-1, 0.05, 7],
      size: [1.2, 1.2, 0.8],
      artifactType: "sculpture",
    },
    {
      id: 14,
      position: [2, 0.05, 7],
      size: [1.2, 1.2, 0.8],
      artifactType: "artifact",
    },
    {
      id: 15,
      position: [5, 0.05, 7],
      size: [1.2, 1.2, 0.8],
      artifactType: "jewelry",
    },
  ];

  // fetch up to 15 items from dept=5 (Arts of Africa, Oceania, and the Americas)
  const { artworks, loading } = useMetMuseumArtworks(
    5,
    "sculpture",
    collections.length + 5,
    true
  );

  const validArtworks = artworks.slice(0, collections.length);

  return (
    <group>
      {/* Herringbone wooden floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          map={floorTexture}
          color="#D2B48C"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Arched ceiling */}
      <group>
        {/* Main ceiling */}
        <Box position={[0, 10, 0]} args={[20, 0.3, 20]}>
          <meshStandardMaterial color="#FFFAF0" />
        </Box>

        {/* Skylight */}
        <Box position={[0, 10.1, 0]} args={[10, 0.1, 10]}>
          <meshStandardMaterial
            color="#87CEEB"
            transparent
            opacity={0.7}
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </Box>
      </group>

      {/* Crystal Chandelier based on reference image */}
      <group ref={chandelierRef} position={[0, 6, 0]}>
        {/* Main chandelier crown */}
        <Cylinder args={[0.6, 0.8, 0.2, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        {/* Chandelier chain */}
        <Cylinder args={[0.05, 0.05, 4, 8]} position={[0, 2, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        {/* Light candle holders */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;

          return (
            <group key={i} position={[x, -0.4, z]}>
              {/* Candle holder */}
              <Cylinder args={[0.08, 0.1, 0.1, 8]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              {/* Candle stem */}
              <Cylinder args={[0.04, 0.04, 0.4, 8]} position={[0, 0.25, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              {/* Light source */}
              <pointLight
                position={[0, 0.5, 0]}
                intensity={8}
                distance={15}
                decay={2}
                color="#FFF9C4"
              />

              {/* Crystal drops - several per arm */}
              {Array.from({ length: 3 }).map((_, j) => {
                const dropAngle = (j / 3) * Math.PI * 0.5 - Math.PI * 0.25;
                const dropX = Math.cos(dropAngle) * 0.15;
                const dropZ = Math.sin(dropAngle) * 0.15;

                return (
                  <group
                    key={`drop-${j}`}
                    position={[dropX, -0.2 - j * 0.15, dropZ]}
                  >
                    {/* Crystal teardrop */}
                    <mesh>
                      <octahedronGeometry args={[0.07, 2]} />
                      <meshStandardMaterial
                        color="#F5F5F5"
                        metalness={0.2}
                        roughness={0.1}
                        transparent={true}
                        opacity={0.8}
                        envMapIntensity={2}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {/* Center crystal clusters */}
        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <group key={`center-${i}`} position={[0, -0.5 - i * 0.3, 0]}>
              {/* Central crystals */}
              <mesh>
                <octahedronGeometry args={[0.2 - i * 0.03, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        {/* Crystal strands connecting arms */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const x1 = Math.cos(angle) * 0.8;
          const z1 = Math.sin(angle) * 0.8;
          const x2 = Math.cos(angle) * 1.2;
          const z2 = Math.sin(angle) * 1.2;

          return (
            <group key={`strand-${i}`}>
              {Array.from({ length: 5 }).map((_, j) => {
                const ratio = j / 4;
                const x = x1 + (x2 - x1) * ratio;
                const z = z1 + (z2 - z1) * ratio;
                const y = -0.2 - Math.sin(ratio * Math.PI) * 0.3;

                return (
                  <mesh key={`bead-${j}`} position={[x, y, z]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial
                      color="#F5F5F5"
                      metalness={0.3}
                      roughness={0.1}
                      transparent={true}
                      opacity={0.9}
                      envMapIntensity={2}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        })}

        {/* Bottom hanging crystal teardrops */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * 0.9;
          const z = Math.sin(angle) * 0.9;

          return (
            <group key={`bottom-${i}`} position={[x, -1.2, z]}>
              <mesh>
                <octahedronGeometry args={[0.1, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        {/* Additional light sources for more reflection */}
        <pointLight
          position={[0, -0.5, 0]}
          intensity={15}
          distance={20}
          decay={2}
          color="#FFF9C4"
        />
      </group>

      {/* Crystal Chandelier (smaller version) at front of gallery */}
      <group position={[0, 6, -7]} scale={0.7}>
        {/* Same structure as the main chandelier but smaller */}
        <Cylinder args={[0.6, 0.8, 0.2, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        <Cylinder args={[0.05, 0.05, 4, 8]} position={[0, 2, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;

          return (
            <group key={i} position={[x, -0.4, z]}>
              <Cylinder args={[0.08, 0.1, 0.1, 8]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              <Cylinder args={[0.04, 0.04, 0.4, 8]} position={[0, 0.25, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              <pointLight
                position={[0, 0.5, 0]}
                intensity={8}
                distance={15}
                decay={2}
                color="#FFF9C4"
              />

              {Array.from({ length: 3 }).map((_, j) => {
                const dropAngle = (j / 3) * Math.PI * 0.5 - Math.PI * 0.25;
                const dropX = Math.cos(dropAngle) * 0.15;
                const dropZ = Math.sin(dropAngle) * 0.15;

                return (
                  <group
                    key={`drop-${j}`}
                    position={[dropX, -0.2 - j * 0.15, dropZ]}
                  >
                    <mesh>
                      <octahedronGeometry args={[0.07, 2]} />
                      <meshStandardMaterial
                        color="#F5F5F5"
                        metalness={0.2}
                        roughness={0.1}
                        transparent={true}
                        opacity={0.8}
                        envMapIntensity={2}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <group key={`center-${i}`} position={[0, -0.5 - i * 0.3, 0]}>
              <mesh>
                <octahedronGeometry args={[0.2 - i * 0.03, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * 0.9;
          const z = Math.sin(angle) * 0.9;

          return (
            <group key={`bottom-${i}`} position={[x, -1.2, z]}>
              <mesh>
                <octahedronGeometry args={[0.1, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        <pointLight
          position={[0, -0.5, 0]}
          intensity={15}
          distance={20}
          decay={2}
          color="#FFF9C4"
        />
      </group>

      {/* Crystal Chandelier (smaller version) at back of gallery */}
      <group position={[0, 6, 7]} scale={0.7}>
        {/* Same structure as the main chandelier */}
        <Cylinder args={[0.6, 0.8, 0.2, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        <Cylinder args={[0.05, 0.05, 4, 8]} position={[0, 2, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>

        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;

          return (
            <group key={i} position={[x, -0.4, z]}>
              <Cylinder args={[0.08, 0.1, 0.1, 8]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              <Cylinder args={[0.04, 0.04, 0.4, 8]} position={[0, 0.25, 0]}>
                <meshStandardMaterial
                  color="#FFD700"
                  metalness={0.9}
                  roughness={0.1}
                />
              </Cylinder>

              <pointLight
                position={[0, 0.5, 0]}
                intensity={8}
                distance={15}
                decay={2}
                color="#FFF9C4"
              />

              {Array.from({ length: 3 }).map((_, j) => {
                const dropAngle = (j / 3) * Math.PI * 0.5 - Math.PI * 0.25;
                const dropX = Math.cos(dropAngle) * 0.15;
                const dropZ = Math.sin(dropAngle) * 0.15;

                return (
                  <group
                    key={`drop-${j}`}
                    position={[dropX, -0.2 - j * 0.15, dropZ]}
                  >
                    <mesh>
                      <octahedronGeometry args={[0.07, 2]} />
                      <meshStandardMaterial
                        color="#F5F5F5"
                        metalness={0.2}
                        roughness={0.1}
                        transparent={true}
                        opacity={0.8}
                        envMapIntensity={2}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <group key={`center-${i}`} position={[0, -0.5 - i * 0.3, 0]}>
              <mesh>
                <octahedronGeometry args={[0.2 - i * 0.03, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * 0.9;
          const z = Math.sin(angle) * 0.9;

          return (
            <group key={`bottom-${i}`} position={[x, -1.2, z]}>
              <mesh>
                <octahedronGeometry args={[0.1, 2]} />
                <meshStandardMaterial
                  color="#F5F5F5"
                  metalness={0.2}
                  roughness={0.1}
                  transparent={true}
                  opacity={0.8}
                  envMapIntensity={2}
                />
              </mesh>
            </group>
          );
        })}

        <pointLight
          position={[0, -0.5, 0]}
          intensity={15}
          distance={20}
          decay={2}
          color="#FFF9C4"
        />
      </group>

      {/* Dark blue walls with gold trim */}
      <Box position={[0, 5, -10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#1C2841" />
      </Box>
      <Box position={[-10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#1C2841" />
      </Box>
      <Box position={[10, 5, 0]} args={[0.2, 10, 20]}>
        <meshStandardMaterial color="#1C2841" />
      </Box>
      <Box position={[0, 5, 10]} args={[20, 10, 0.2]}>
        <meshStandardMaterial color="#1C2841" />
      </Box>

      {/* Gold trim along the top of walls */}
      {[
        [0, 9, -9.9, 20, 0.5], // Front
        [0, 9, 9.9, 20, 0.5], // Back
        [-9.9, 9, 0, 20, 0.5], // Left
        [9.9, 9, 0, 20, 0.5], // Right
      ].map((props, i) => (
        <Box
          key={`trim-${i}`}
          position={[props[0], props[1], props[2]]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          args={[props[3], props[4], 0.25]}
        >
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.6}
            roughness={0.3}
          />
        </Box>
      ))}

      {/* Elegant archway at the entrance end */}
      <group position={[0, 5, -9.9]}>
        <Box args={[6, 6, 0.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1C2841" />
        </Box>
        {/* <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry
            args={[3, 3, 0.7, 32, 1, true, 0, Math.PI]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <meshStandardMaterial color="#1C2841" side={DoubleSide} />
        </mesh> */}
        <Box args={[6.5, 0.5, 0.6]} position={[0, 3, 0]}>
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.6}
            roughness={0.3}
          />
        </Box>
      </group>
      <Suspense fallback={null}>
        {collections.map((item, i) => {
          const art = validArtworks[i];
  
          return (
            <DisplayCase
              key={item.id}
              position={item.position}
              size={item.size}
              title={art?.title || "No Title"}
              department={art?.department || "Unknown Department"}
              artist={art?.artistDisplayName || "Unknown Artist"}
              dimensions={art?.dimensions || "Unknown Dimensions"}
              medium={art?.medium || "Unknown Medium"}
              objectURL={art?.objectURL}
              // artifactType={item.artifactType}
              imageUrl={art?.primaryImage} // pass real Met image
            />
          );
        })}
      </Suspense>


      {/* Display Cases for Collections */}
      {/* {collections.map((collection) => (
        <DisplayCase
          key={collection.id}
          position={collection.position}
          size={collection.size}
          title={collection.title}
          description={collection.description}
          artifactType={collection.artifactType}
        />
      ))} */}

      {/* Door to Gallery 1 */}
      <Door
        position={[-5, 1.25, -9.9]}
        rotation={[0, 0, 0]}
        targetRoom="Gallery 1"
        onDoorClick={onDoorClick}
      />

      {/* Door to Gallery 3 */}
      <Door
        position={[5, 1.25, -9.9]}
        rotation={[0, 0, 0]}
        targetRoom="Gallery 3"
        onDoorClick={onDoorClick}
      />

      {/* Door to Restrooms */}
      <Door
        position={[9.9, 1.25, 8]}
        rotation={[0, -Math.PI / 2, 0]}
        targetRoom="Restrooms"
        onDoorClick={onDoorClick}
      />

      {/* Gallery information plaque */}
      <group position={[0, 0.8, -9.7]}>
        <Box args={[4, 0.8, 0.02]}>
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.6}
            roughness={0.4}
          />
        </Box>
        <Text
          position={[0, 0.2, 0.03]}
          fontSize={0.15}
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          ARTS OF AFRICA, OCEANIA, AND THE AMERICANS
        </Text>
        <Text
          position={[0, -0.1, 0.03]}
          fontSize={0.1}
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          Sculptures and artifacts from ancient civilizations
        </Text>
      </group>
    </group>
  );
}

export default GalleryRoom2;
