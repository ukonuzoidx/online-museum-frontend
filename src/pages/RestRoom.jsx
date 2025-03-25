import React, { useRef } from "react";
import { TextureLoader, RepeatWrapping } from "three";
import { Box, Cylinder, Text, useTexture } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import Door from "../widgets/MuseumDoors";
import tiles from "../assets/textures/tiles-1.jpg";

function Restroom({ onDoorClick }) {
  // References for animations
  const lightRefs = useRef([]);

  // Animate indirect lighting for a subtle effect
  useFrame(({ clock }) => {
    if (lightRefs.current && lightRefs.current.length > 0) {
      lightRefs.current.forEach((ref, i) => {
        if (ref) {
          // Very subtle breathing effect for modern LED lighting
          ref.intensity =
            0.95 + Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.05;
        }
      });
    }
  });

  // Load tile texture
  const tileTexture = useTexture(tiles);


  // Main restroom layout
  return (
    <group>
      {/* Floor - smooth white */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#FFFFFF"
          roughness={0.3}
          metalness={0.2}
          envMapIntensity={1}
        />
      </mesh>

      {/* Ceiling with recessed lighting */}
      <Box position={[0, 3.5, 0]} args={[8, 0.2, 8]}>
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </Box>

      {/* Recessed ceiling accent lighting */}
      <Box position={[0, 3.4, 0]} args={[7, 0.1, 7]}>
        <meshStandardMaterial
          color="#EEEEEE"
          roughness={0.9}
          emissive="#FFFFFF"
          emissiveIntensity={0.2}
        />
      </Box>

      {/* Walls - light gray */}
      <Box position={[0, 1.75, 4]} args={[8, 3.5, 0.1]}>
        <meshStandardMaterial map={tileTexture} />
      </Box>

      <Box position={[0, 1.75, -4]} args={[8, 3.5, 0.1]}>
        <meshStandardMaterial map={tileTexture} />
      </Box>

      <Box position={[4, 1.75, 0]} args={[0.1, 3.5, 8]}>
        <meshStandardMaterial map={tileTexture} />
      </Box>

      <Box position={[-4, 1.75, 0]} args={[0.1, 3.5, 8]}>
        <meshStandardMaterial map={tileTexture} />
      </Box>

      {/* Modern white toilet */}
      <group position={[0, 0, -3.5]}>
        {/* Toilet base */}
        <Box args={[0.6, 0.4, 0.6]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        {/* Toilet bowl */}
        <Box args={[0.5, 0.15, 0.4]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        {/* Toilet seat */}
        <Box
          args={[0.45, 0.05, 0.35]}
          position={[0, 0.5, 0]}
          material-color="white"
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        {/* Toilet tank */}
        <Box args={[0.5, 0.6, 0.2]} position={[0, 0.8, -0.2]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        {/* Flush button */}
        <Box args={[0.1, 0.02, 0.1]} position={[0, 1.1, -0.2]}>
          <meshStandardMaterial color="#" roughness={0.3} />
        </Box>
      </group>

      {/* Small waste bin */}
      <Cylinder args={[0.15, 0.15, 0.4, 16]} position={[-3.5, 0.2, -1.5]}>
        <meshStandardMaterial color="#A0A0A0" roughness={0.3} metalness={0.5} />
      </Cylinder>

      {/* Toilet paper holder */}
      <group position={[0.5, 0.8, -3.8]}>
        <Cylinder args={[0.05, 0.05, 0.15, 8]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.8}
            roughness={0.2}
          />
        </Cylinder>

        <Cylinder args={[0.06, 0.06, 0.1, 16]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color="white" roughness={0.6} />
        </Cylinder>
      </group>

      {/* Towel ring */}
      <group position={[-0.5, 1.2, -3.9]}>
        <Box args={[0.1, 0.1, 0.02]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#E0E0E0"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>

        <Cylinder
          args={[0.12, 0.12, 0.02, 16, 1, true]}
          position={[0, -0.2, 0.04]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#E0E0E0"
            metalness={0.8}
            roughness={0.2}
          />
        </Cylinder>

        {/* Hanging towel */}
        <Box args={[0.24, 0.3, 0.02]} position={[0, -0.3, 0.05]}>
          <meshStandardMaterial color="white" roughness={0.6} />
        </Box>
      </group>

      {/* Modern vanity with wood base */}
      <group position={[-2.5, 0, -3.5]}>
        {/* Vanity cabinet - deep red/mahogany like the reference */}
        <Box args={[2, 0.9, 0.6]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#8B2323" roughness={0.7} />
        </Box>
     

        {/* Marble countertop */}
        <Box args={[2.2, 0.05, 0.8]} position={[0, 0.92, 0]}>
          <meshStandardMaterial color="white" roughness={0.2} />
        </Box>

        {/* Modern vessel sink */}
        <Cylinder args={[0.35, 0.35, 0.12, 32]} position={[0, 0.98, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Cylinder>

        <Cylinder args={[0.32, 0.25, 0.1, 32]} position={[0, 0.93, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Cylinder>

        {/* Modern faucet */}
        <group position={[0, 0.98, -0.4]}>
          <Cylinder
            args={[0.02, 0.02, 0.3, 8]}
            position={[0, 0.15, 0.1]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color="#C0C0C0"
              metalness={0.8}
              roughness={0.2}
            />
          </Cylinder>
        </group>

      </group>

      {/* Modern urinal */}
      <group position={[-1.5, 0, 3.9]}>
        <Box args={[0.5, 0.7, 0.1]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        <Box
          args={[0.4, 0.4, 0.2]}
          position={[0, 0.8, 0]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>
      </group>
      {/* Modern urinal */}
      <group position={[-0.6, 0, 3.9]}>
        <Box args={[0.5, 0.7, 0.1]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        <Box
          args={[0.4, 0.4, 0.2]}
          position={[0, 0.8, 0]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>
      </group>
      {/* Modern urinal */}
      <group position={[0.3, 0, 3.9]}>
        <Box args={[0.5, 0.7, 0.1]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        <Box
          args={[0.4, 0.4, 0.2]}
          position={[0, 0.8, 0]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>
      </group>
      {/* Modern urinal */}
      <group position={[1, 0, 3.9]}>
        <Box args={[0.5, 0.7, 0.1]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        <Box
          args={[0.4, 0.4, 0.2]}
          position={[0, 0.8, 0]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>
      </group>
      {/* Modern urinal */}
      <group position={[1.7, 0, 3.9]}>
        <Box args={[0.5, 0.7, 0.1]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>

        <Box
          args={[0.4, 0.4, 0.2]}
          position={[0, 0.8, 0]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="white" roughness={0.1} />
        </Box>
      </group>

      {/* Decorative wall art */}
      <Box args={[1.5, 1.2, 0.03]} position={[-2.5, 2, -3.9]}>
        <meshStandardMaterial color="#cbeaff" roughness={0.3} />
      </Box>

      {/* Ceiling lighting */}
      {[-2, 2].map((x, i) =>
        [-2, 2].map((z, j) => (
          <group key={`light-${i}-${j}`} position={[x, 3.39, z]}>
            <Box args={[0.4, 0.1, 0.4]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#F8F8F8"
                roughness={0.5}
                emissive="#FFFFFF"
                emissiveIntensity={1}
              />
            </Box>
            <pointLight
              position={[0, -0.2, 0]}
              intensity={0.9}
              distance={4}
              decay={2}
              color="#FFFFFF"
              ref={(el) => {
                if (!lightRefs.current) lightRefs.current = [];
                lightRefs.current[i * 2 + j] = el;
              }}
            />
          </group>
        ))
      )}

      {/* Indirect ceiling lighting */}
      <group position={[0, 3.3, 0]}>
        <pointLight
          intensity={0.4}
          distance={8}
          decay={2}
          color="#FFFFFF"
          ref={(el) => {
            if (!lightRefs.current) lightRefs.current = [];
            lightRefs.current[4] = el;
          }}
        />
      </group>

      {/* Door to Gallery */}
      <Door
        position={[-3.9, 1.25, 0]}
        rotation={[0, Math.PI / 2, 0]}
        targetRoom="Gallery 3"
        onDoorClick={onDoorClick}
      />
    </group>
  );
}

export default Restroom;
