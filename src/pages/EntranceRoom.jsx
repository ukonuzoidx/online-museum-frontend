import React, { useRef, useState, useEffect } from "react";
import { TextureLoader, DoubleSide, RepeatWrapping } from "three";
import Door from "../widgets/MuseumDoors";
import { Box, Cylinder, Text, useGLTF, Sphere } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import entranceTexture from "../assets/textures/museum-entrance-2.jpg";
import floor1 from "../assets/textures/floor-1.png";
import floor2 from "../assets/textures/floor-2.png";
import floor3 from "../assets/textures/floor-3.jpg";
import walls1 from "../assets/textures/walls-1.jpg";
import walls2 from "../assets/textures/walls-2.jpg";
import walls3 from "../assets/textures/walls-3.jpg";
import walls4 from "../assets/textures/walls-4.jpg";
import walls5 from "../assets/textures/walls-5.jpg";
import ceiling1 from "../assets/textures/ceiling-1.jpg";
import windowScreen from "../assets/textures/window_screen.jpg";
import appleScreen from "../assets/textures/apple_pc_screen.jpg";
import marbleTexture from "../assets/textures/marble.jpg";
import MusicPlayer from "../widgets/MusicPlayer";
import woodTexture from "../assets/textures/wood.jpg";
import leatherTexture from "../assets/textures/leather.jpg";
import useEmotionDetection from "../hooks/useEmotionDetection";
import EmotionMusicPanel from "../components/EmotionMusicPanel";

const EntranceRoom = ({ onDoorClick, onExitClick }) => {
  // References for animation
  const pendulumRef = useRef();
  const sculptureRef = useRef();


  // Load textures
  const floorTexture = useLoader(TextureLoader, floor1);
  const floorTexture2 = useLoader(TextureLoader, floor2);
  const floorTexture3 = useLoader(TextureLoader, floor3);
  const entranceWallTexture = useLoader(TextureLoader, entranceTexture);
  const wallsTexture = useLoader(TextureLoader, walls1);
  const wallsTexture2 = useLoader(TextureLoader, walls2);
  const wallsTexture3 = useLoader(TextureLoader, walls3);
  const wallsTexture4 = useLoader(TextureLoader, walls4);
  const wallsTexture5 = useLoader(TextureLoader, walls5);
  const ceilingTexture = useLoader(TextureLoader, ceiling1);
  const windowScreenTexture = useLoader(TextureLoader, windowScreen);
  const appleScreenTexture = useLoader(TextureLoader, appleScreen);

  // New textures - replace with your actual paths
  const marble = useLoader(TextureLoader, marbleTexture);
  const wood = useLoader(TextureLoader, woodTexture);
  const leather = useLoader(TextureLoader, leatherTexture);

  // Configure texture repeats for more realism
  floorTexture2.repeat.set(4, 4);
  floorTexture2.wrapS = floorTexture2.wrapT = RepeatWrapping;

  floorTexture3.repeat.set(4, 4);
  floorTexture3.wrapS = floorTexture3.wrapT = RepeatWrapping;

  wallsTexture5.repeat.set(2, 1);
  wallsTexture5.wrapS = wallsTexture5.wrapT = RepeatWrapping;

  ceilingTexture.repeat.set(2, 2);
  ceilingTexture.wrapS = ceilingTexture.wrapT = RepeatWrapping;

  // Animation for decorative elements
  useFrame(({ clock }) => {
    if (pendulumRef.current) {
      pendulumRef.current.rotation.z =
        Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
    if (sculptureRef.current) {
      sculptureRef.current.rotation.y += 0.002;
    }
  });

  // Define floor and ceiling heights for reference
  const floorHeight = 0.1; // Half of the floor thickness (0.2)
  const ceilingHeight = 4.9; // 5 - half of the ceiling thickness (0.2)

  return (
    <group>
      {/* ✅ Floor with more realistic marble texture */}
      <Box position={[0, 0, 0]} args={[20, 0.2, 20]}>
        <meshStandardMaterial
          map={floorTexture3}
          roughness={0.2}
          metalness={0.1}
        />
      </Box>

      {/* ✅ Ceiling with ambient lighting effect */}
      <Box position={[0, 5, 0]} args={[20, 0.2, 20]}>
        <meshStandardMaterial
          map={ceilingTexture}
          //   emissive={"#ffffff"}
          //   emissiveIntensity={0.2}
          //   roughness={0.7}
        />
      </Box>

      {/* ✅ Walls with enhanced textures */}
      <Box position={[0, 2.5, -10]} args={[20, 5, 0.2]}>
        <meshStandardMaterial color="#1c4c62" map={wallsTexture2} />
      </Box>
      <Box position={[-10, 2.5, 0]} args={[0.2, 5, 20]}>
        <meshStandardMaterial color="#dddcd8" map={wallsTexture2} />
      </Box>
      <Box position={[10, 2.5, 0]} args={[0.2, 5, 20]}>
        <meshStandardMaterial color="#dddcd8" map={wallsTexture2} />
      </Box>
      <Box position={[0, 2.5, 10]} args={[20, 5, 0.2]}>
        <meshStandardMaterial color="#dddcd8" map={wallsTexture2} />
      </Box>

      {/* ✅ Fixed Ornate Columns with spiral fluted shafts like the reference image */}
      {[
        [-7, 2.5, -9.9],
        [7, 2.5, -9.9],
        [-7, 2.5, -7],
        [7, 2.5, -7],
        [-7, 2.5, 9.9],
        [7, 2.5, 9.9],
      ].map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[2]]}>
          {/* Square plinth at bottom */}
          <Box position={[0, 0.1, 0]} args={[0.8, 0.2, 0.8]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Box>

          {/* Column base with decorative molding */}
          <Cylinder position={[0, 0.35, 0]} args={[0.45, 0.5, 0.3, 16]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Cylinder>

          <Cylinder position={[0, 0.55, 0]} args={[0.4, 0.45, 0.2, 16]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Cylinder>

          {/* Create the spiral fluted column shaft using multiple cylinders with rotation */}
          {Array.from({ length: 20 }).map((_, j) => (
            <group key={`flute-${j}`} position={[0, 0.7 + j * 0.2, 0]}>
              <Cylinder args={[0.35, 0.35, 0.2, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#ffffff" />
              </Cylinder>

              {/* Add the spiral fluting effect with smaller cylinders */}
              {Array.from({ length: 16 }).map((_, k) => (
                <Cylinder
                  key={`groove-${k}`}
                  args={[0.04, 0.04, 0.22, 8]}
                  position={[
                    0.33 * Math.cos((k * Math.PI) / 8 + j * 0.2),
                    0,
                    0.33 * Math.sin((k * Math.PI) / 8 + j * 0.2),
                  ]}
                  rotation={[0, 0, 0]}
                >
                  <meshStandardMaterial color="#f8f8f8" />
                </Cylinder>
              ))}
            </group>
          ))}

          {/* Column neck at top of shaft */}
          <Cylinder position={[0, 4.6, 0]} args={[0.38, 0.35, 0.1, 16]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Cylinder>

          {/* Column capital with square top */}
          <Cylinder position={[0, 4.75, 0]} args={[0.5, 0.38, 0.2, 16]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Cylinder>

          {/* Square abacus at top */}
          <Box position={[0, 4.9, 0]} args={[0.9, 0.1, 0.9]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Box>
        </group>
      ))}

      {/* ✅ Elegant Welcome Sign */}
      <group position={[0, 3.5, -9.9]}>
        <Box args={[11, 1, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#395a6b" />
        </Box>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.5}
          color="#e1dedc"
          anchorX="center"
          anchorY="middle"
        >
          🎭 WELCOME TO THE ONLINE MUSEUM
        </Text>
      </group>

      {/* ✅ Enhanced Reception Desk with Chairs and Computers */}
      <group position={[7, 0, -5]}>
        {/* Main desk */}
        <Box position={[0, 1, 0]} args={[4, 1.2, 1.5]}>
          <meshStandardMaterial map={wood} color="#8B4513" />
        </Box>

        {/* Desk top */}
        <Box position={[0, 1.61, 0]} args={[4.2, 0.05, 1.7]}>
          <meshStandardMaterial map={marble} color="#d0d0d0" />
        </Box>

        {/* Front panel */}
        <Box position={[0, 1, 0.8]} args={[4, 1.2, 0.05]}>
          <meshStandardMaterial map={wood} color="#6b3100" />
        </Box>

        {/* Enhanced Computer 1 */}
        <group position={[-1.2, 1.8, -0.2]} rotation={[0, -0.3, 0]}>
          {/* Monitor frame */}
          <Box args={[0.8, 0.6, 0.08]}>
            <meshStandardMaterial color="#111111" />
          </Box>

          {/* Monitor screen with Mac-style UI */}
          <Box position={[0, 0, 0.043]} args={[0.72, 0.52, 0.01]}>
            <meshStandardMaterial map={appleScreenTexture} />
          </Box>

          {/* Top bar of the screen */}
          <Box position={[0, 0.22, 0.044]} args={[0.72, 0.08, 0.005]}>
            <meshStandardMaterial color="#e0e0e0" />
          </Box>

          {/* Dock at bottom */}
          <Box position={[0, -0.22, 0.044]} args={[0.6, 0.05, 0.005]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>

          {/* Window on screen */}
          <Box position={[0, 0, 0.045]} args={[0.55, 0.35, 0.005]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>

          {/* Window title bar */}
          <Box position={[0, 0.175, 0.046]} args={[0.55, 0.04, 0.004]}>
            <meshStandardMaterial color="#3b82f6" />
          </Box>

          {/* Apple logo in corner */}
          <Sphere position={[-0.31, 0.22, 0.046]} args={[0.015, 8, 8]}>
            <meshStandardMaterial color="#333333" />
          </Sphere>

          {/* Monitor stand */}
          <Box position={[0, -0.35, -0.1]} args={[0.3, 0.1, 0.2]}>
            <meshStandardMaterial color="#222222" />
          </Box>
        </group>

        {/* Enhanced Keyboard 1 */}
        <group position={[-1.2, 1.64, 0.1]} rotation={[0, -0.3, 0]}>
          {/* Keyboard base */}
          <Box args={[0.6, 0.03, 0.2]}>
            <meshStandardMaterial
              color="#e0e0e0"
              metalness={0.3}
              roughness={0.7}
            />
          </Box>

          {/* Function keys row */}
          <Box position={[0, 0.02, -0.08]} args={[0.58, 0.01, 0.04]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>

          {/* Main keys section */}
          <Box position={[0, 0.02, 0]} args={[0.58, 0.01, 0.14]}>
            <meshStandardMaterial color="#c8c8c8" />
          </Box>

          {/* Arrow keys */}
          <Box position={[0.25, 0.02, 0.07]} args={[0.08, 0.01, 0.06]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>
        </group>

        {/* Enhanced Mouse 1 */}
        <group position={[-0.8, 1.64, 0.1]} rotation={[0, -0.3, 0]}>
          {/* Mouse body - curved shape */}
          <Box args={[0.1, 0.025, 0.18]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#e0e0e0"
              metalness={0.3}
              roughness={0.7}
            />
          </Box>

          {/* Mouse left button */}
          <Box args={[0.049, 0.027, 0.08]} position={[-0.025, 0, -0.04]}>
            <meshStandardMaterial color="#d8d8d8" />
          </Box>

          {/* Mouse right button */}
          <Box args={[0.049, 0.027, 0.08]} position={[0.025, 0, -0.04]}>
            <meshStandardMaterial color="#d8d8d8" />
          </Box>

          {/* Scroll wheel */}
          <Cylinder
            args={[0.01, 0.01, 0.02, 8]}
            position={[0, 0.02, -0.04]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#b0b0b0" />
          </Cylinder>
        </group>

        {/* Enhanced Computer 2 */}
        <group position={[1.2, 1.8, -0.2]} rotation={[0, 0.3, 0]}>
          {/* Monitor frame */}
          <Box args={[0.8, 0.6, 0.08]}>
            <meshStandardMaterial color="#111111" />
          </Box>

          {/* Monitor screen with Mac-style UI */}
          <Box position={[0, 0, 0.043]} args={[0.72, 0.52, 0.01]}>
            <meshStandardMaterial map={windowScreenTexture} />
          </Box>

          {/* Top bar of the screen */}
          <Box position={[0, 0.22, 0.044]} args={[0.72, 0.08, 0.005]}>
            <meshStandardMaterial color="#e0e0e0" />
          </Box>

          {/* Dock at bottom */}
          <Box position={[0, -0.22, 0.044]} args={[0.6, 0.05, 0.005]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>

          {/* Window on screen */}
          <Box position={[0, 0, 0.045]} args={[0.55, 0.35, 0.005]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>

          {/* Window title bar */}
          <Box position={[0, 0.175, 0.046]} args={[0.55, 0.04, 0.004]}>
            <meshStandardMaterial color="#3b82f6" />
          </Box>

          {/* Apple logo in corner */}
          <Sphere position={[-0.31, 0.22, 0.046]} args={[0.015, 8, 8]}>
            <meshStandardMaterial color="#333333" />
          </Sphere>

          {/* Monitor stand */}
          <Box position={[0, -0.35, -0.1]} args={[0.3, 0.1, 0.2]}>
            <meshStandardMaterial color="#222222" />
          </Box>
        </group>

        {/* Enhanced Keyboard 2 */}
        <group position={[1.2, 1.64, 0.1]} rotation={[0, 0.3, 0]}>
          {/* Keyboard base */}
          <Box args={[0.6, 0.03, 0.2]}>
            <meshStandardMaterial
              color="#e0e0e0"
              metalness={0.3}
              roughness={0.7}
            />
          </Box>

          {/* Function keys row */}
          <Box position={[0, 0.02, -0.08]} args={[0.58, 0.01, 0.04]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>

          {/* Main keys section */}
          <Box position={[0, 0.02, 0]} args={[0.58, 0.01, 0.14]}>
            <meshStandardMaterial color="#c8c8c8" />
          </Box>

          {/* Arrow keys */}
          <Box position={[0.25, 0.02, 0.07]} args={[0.08, 0.01, 0.06]}>
            <meshStandardMaterial color="#d0d0d0" />
          </Box>
        </group>

        {/* Enhanced Mouse 2 */}
        <group position={[0.8, 1.64, 0.1]} rotation={[0, 0.3, 0]}>
          {/* Mouse body - curved shape */}
          <Box args={[0.1, 0.025, 0.18]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#e0e0e0"
              metalness={0.3}
              roughness={0.7}
            />
          </Box>

          {/* Mouse left button */}
          <Box args={[0.049, 0.027, 0.08]} position={[-0.025, 0, -0.04]}>
            <meshStandardMaterial color="#d8d8d8" />
          </Box>

          {/* Mouse right button */}
          <Box args={[0.049, 0.027, 0.08]} position={[0.025, 0, -0.04]}>
            <meshStandardMaterial color="#d8d8d8" />
          </Box>

          {/* Scroll wheel */}
          <Cylinder
            args={[0.01, 0.01, 0.02, 8]}
            position={[0, 0.02, -0.04]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#b0b0b0" />
          </Cylinder>
        </group>

        {/* Office Chairs Behind Reception */}
        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, 0, -0.6]}>
            {/* Chair base with wheels */}
            <Cylinder position={[0, 0.15, 0]} args={[0.25, 0.25, 0.05, 16]}>
              <meshStandardMaterial color="#222222" />
            </Cylinder>

            {/* Chair post */}
            <Cylinder position={[0, 0.5, 0]} args={[0.05, 0.05, 0.7, 8]}>
              <meshStandardMaterial color="#444444" metalness={0.5} />
            </Cylinder>

            {/* Chair seat */}
            <Box position={[0, 0.9, 0]} args={[0.5, 0.08, 0.5]}>
              <meshStandardMaterial map={leather} color="#000000" />
            </Box>

            {/* Chair back */}
            <Box
              position={[0, 1.3, -0.25]}
              args={[0.5, 0.8, 0.08]}
              rotation={[0.1, 0, 0]}
            >
              <meshStandardMaterial map={leather} color="#000000" />
            </Box>

            {/* Chair armrests */}
            <Box position={[0.3, 1.1, 0]} args={[0.05, 0.2, 0.3]}>
              <meshStandardMaterial color="#222222" />
            </Box>
            <Box position={[-0.3, 1.1, 0]} args={[0.05, 0.2, 0.3]}>
              <meshStandardMaterial color="#222222" />
            </Box>
          </group>
        ))}

        {/* Small decorative lamp */}
        <group position={[0, 1.64, -0.6]}>
          <Cylinder args={[0.1, 0.15, 0.05, 16]}>
            <meshStandardMaterial color="#444444" />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.3, 8]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#888888" metalness={0.7} />
          </Cylinder>
          <Cylinder args={[0.15, 0.15, 0.02, 16]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color="#444444" />
          </Cylinder>
          <Cylinder args={[0.12, 0.15, 0.2, 16]} position={[0, 0.4, 0]}>
            <meshStandardMaterial
              color="#fffaf0"
              opacity={0.8}
              transparent={true}
            />
          </Cylinder>
        </group>
      </group>

      {/* ✅ Visitor Waiting Area */}

      {/* ✅ Information Panels */}
      {[
        [-9.9, 2.5, -5, 0, Math.PI / 2, 0, "EXHIBITIONS"],
        [9.9, 2.5, 5, 0, -Math.PI / 2, 0, "EVENTS"],
      ].map((item, i) => (
        <group
          key={i}
          position={[item[0], item[1], item[2]]}
          rotation={[item[3], item[4], item[5]]}
        >
          <Box args={[3, 2, 0.1]}>
            <meshStandardMaterial color="#3c5961" />
          </Box>
          <Text
            position={[0, 0.5, 0.06]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {item[6]}
          </Text>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
          >
            Explore our amazing collection of artworks from around the world.
          </Text>
        </group>
      ))}

      {/* ✅ Doorway to Gallery 1 */}
      <Door
        position={[0, 1.25, -9.9]}
        rotation={[0, 0, 0]}
        targetRoom="Gallery 1"
        onDoorClick={onDoorClick}
      />

      <Door
        position={[0, 1.25, 9.9]}
        rotation={[0, Math.PI, 0]}
        targetRoom="WelcomeScreen"
        onDoorClick={onDoorClick}
      />

      {/* text to exit */}
      {/* <Text
              position={[0, 0.5, 8]}
              rotation={[0, 0, 0]}
              fontSize={0.2}
              color="#555555"
              anchorX="center"
              anchorY="middle"
          >
          </Text> */}
      <group position={[0, 2.7, 9.7]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.11}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          ⬅️ EXIT
        </Text>
      </group>

      {/* ✅ Subtle directional signs for visitors */}
      <Text
        position={[0, 0.5, -8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#555555"
        anchorX="center"
        anchorY="middle"
      >
        ➡️ GALLERY 1
      </Text>

      {/* 🔴 Emotion Recording Feedback */}
      {/* {!permissionGranted && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#ff5555"
          anchorX="center"
          anchorY="middle"
        >
          ⚠️ Please allow webcam access for emotion-based experience.
        </Text>
      )}

      {loading && permissionGranted && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#3498db"
          anchorX="center"
          anchorY="middle"
        >
          🎥 Recording your facial expression...
        </Text>
      )}

      {emotion && !loading && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#2ecc71"
          anchorX="center"
          anchorY="middle"
        >
          🎭 Detected Emotion: {emotion}
        </Text>
      )} */}

    </group>
  );
};

export default EntranceRoom;
