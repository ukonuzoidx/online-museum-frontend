import React, { useRef } from "react";
import noImageS from "../assets/textures/fallback.png";
import { Html, useTexture, Box, Cylinder, Text } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { DoubleSide, TextureLoader } from "three";
import woodTextureWall from "../assets/textures/wood.jpg";



// Display Case Component for 3D artifacts
const DisplayCase = ({
  position,
  rotation = [0, 0, 0],
  size = [1, 1, 1.8],
  title,
  department,
  artist,
  dimensions,
  medium,
  objectURL,
  // artifactType,
  // imageUrl,
  artwork
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [viewed, setViewed] = React.useState(false);
  const artifactRef = useRef();

  const fallback = noImageS;

  // const finalUrl = 
  //   `https://corsproxy.io/?url=${artwork?.primaryImage}`;

  // // Always call useTexture (avoid conditional hook calls)
  // const texture = useTexture(finalUrl || fallback);
  
  let finalUrl = fallback;
  if (artwork?.primaryImage && artwork.primaryImage.startsWith("http")) {
    finalUrl = `https://corsproxy.io/?url=${encodeURIComponent(
      artwork.primaryImage
    )}`;
  }

  // If the finalUrl is still invalid, fallback.png will be used
  const texture = useTexture(finalUrl);


  // Rotate the artifact slowly
  useFrame(({ clock }) => {
    if (artifactRef.current && !viewed) {
      artifactRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  // Load textures
  const woodTexture = useLoader(TextureLoader, woodTextureWall);

  // console.log("texture", texture);
  // console.log("finalUrl", finalUrl);

  return (
    <group position={position} rotation={rotation}>
      {/* Glass display case */}
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setViewed(!viewed)}
      >
        {/* Wooden base */}
        <Box args={[size[0] + 0.1, 0.1, size[1] + 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial
            map={woodTexture}
            color="#8B4513"
            roughness={0.7}
          />
        </Box>

        {/* Wooden stand */}
        <Box args={[size[0], size[2], size[1]]} position={[0, size[2] / 2, 0]}>
          <meshStandardMaterial
            map={woodTexture}
            color="#A0522D"
            roughness={0.6}
          />
        </Box>

        {/* Artifact display area (cutout) */}
        <Box
          args={[size[0] - 0.2, size[2] - 0.2, size[1] - 0.2]}
          position={[0, size[2] / 2, 0]}
        >
          <meshStandardMaterial color="#FFFFFF" />
        </Box>

        {/* Glass cover */}
        <Box
          args={[size[0], size[2], size[1]]}
          position={[0, size[2] + size[2] / 2, 0]}
        >
          <meshStandardMaterial
            color="#FFFFFF"
            transparent={true}
            opacity={0.3}
            roughness={0.1}
            metalness={0.1}
            emissive={hovered ? "#FFFFFF" : "#F8F8FF"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </Box>

        {/* The artifact inside */}
        {/* <mesh position={[0, size[2], 0]}>
          <boxGeometry args={[0.5, 1, 1]} />
          <meshStandardMaterial map={texture} />
        </mesh> */}
        {/* <mesh position={[0, size[1], 0]}>
          <planeGeometry args={[0.7, 0.5]} />
          <meshStandardMaterial map={texture} side={2} />
        </mesh> */}

        <group
          ref={artifactRef}
          // scale the entire group so it fits nicely in the case
          scale={[0.8, 0.8, 0.8]}
          // place it roughly halfway up the case, with a small offset
          position={[0, size[1], 0]}
        >
          {/* Front plane for the bust image */}
          <mesh position={[0, 0.05, 0]}>
            <planeGeometry args={[0.7, 0.9]} />
            <meshStandardMaterial map={texture} side={DoubleSide} />
          </mesh>

          {/* Smaller, more stylish base */}
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.2, 16]} />
            <meshStandardMaterial
              color="#8B4513"
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
        </group>
        {/*
     
        {/* Title plaque */}

        <Box
          args={[size[0] - 0.2, 0.3, 0.05]} // narrower than before
          position={[0, 0.2, size[1] / 2 + 0.03]}

          // position={[0, size[1] / 2 - 0.2, 0.05]}
        >
          <meshStandardMaterial
            color="#B8860B"
            metalness={0.7}
            roughness={0.3}
          />
        </Box>

        {/* Wrapping 3D Text (narrow) */}
        <Text
          position={[0, 0.2, size[1] / 2 + 0.06]} // slight offset forward
          fontSize={0.067} // smaller font
          maxWidth={1.2} // narrower line-wrapping
          lineHeight={1.2}
          textAlign="center"
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          {title || "Untitled"}
        </Text>

        {/* Info popup when viewed is true */}
        {viewed && (
          <Html position={[0, 0, 0.5]} center>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: "#000",
                padding: "10px",
                borderRadius: "5px",
                width: "220px",
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                fontFamily: "sans-serif",
              }}
            >
              <strong>{title}</strong>
              <p style={{ margin: "6px 0" }}>
                <em>{artist}</em>
              </p>
              <p style={{ margin: 0 }}>
                <strong>Department:</strong> {department}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Dimensions:</strong> {dimensions}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Medium:</strong> {medium}
              </p>
              <a
                href={objectURL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                More Info
              </a>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};


export default DisplayCase;
