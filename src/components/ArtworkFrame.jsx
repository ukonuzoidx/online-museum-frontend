import React, { useState } from "react";
import { Html, Box, Cylinder, Text, useTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import loadingGif from "../assets/loading.gif";


// Art Frame Component for displaying artworks with interaction
const ArtFrame = ({
  position,
  rotation = [0, 0, 0],
  size = [2, 1.5],
  artwork,
}) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  //  extract details from the artwork object
  const title = artwork?.title ?? "Unknown Title";
  const artist = artwork?.artistDisplayName ?? "Unknown Artist";
  const department = artwork?.department ?? "";
  const dimensions = artwork?.dimensions ?? "";
  const medium = artwork?.medium ?? "";
  const objectURL = artwork?.objectURL ?? "";



  const imageUrl = `https://corsproxy.io/?url=${artwork?.primaryImage}`;

  // ✅ Use useTexture to load the actual painting image
  // If there's no image, fallback to a placeholder
  const texture = useTexture(imageUrl || loadingGif);
  // const texture = useLoader(TextureLoader, imageUrl);

  // Handle frame highlighting and information display
  return (
    <group position={position} rotation={rotation}>
      {/* Artwork Frame */}
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => {
          setHovered(false);
          setClicked(false);
        }}
        onClick={() => setClicked(!clicked)}
      >
        {/* Ornate frame */}
        <Box
          args={[size[0] + 0.2, size[1] + 0.2, 0.1]}
          position={[0, 0, -0.05]}
        >
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.7}
            metalness={0.2}
          />
        </Box>

        {/* Inner frame border */}
        <Box
          args={[size[0] + 0.1, size[1] + 0.1, 0.12]}
          position={[0, 0, -0.04]}
        >
          <meshStandardMaterial
            color="#A0522D"
            roughness={0.6}
            metalness={0.3}
          />
        </Box>

        {/* Canvas/artwork area */}

        {/* 2D Plane for the actual painting image */}
        <mesh position={[0, 0, 0.03]}>
          {/* If you prefer a slightly bigger or smaller area for the image,
            adjust these plane args. */}
          <planeGeometry args={[size[0], size[1]]} />
          <meshBasicMaterial
            map={texture}
            color={!texture ? "#ccc" : "#ffffff"} // fallback color if no image
            side={DoubleSide}
          />
        </mesh>

        {/* Hover Tooltip */}
        {hovered && !clicked && (
          <Html position={[0, size[1] / 2 + 0.2, 0.05]} center>
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "4px",
                fontSize: "14px",
                maxWidth: "220px",
              }}
            >
              <strong>{title}</strong>
              <p style={{ margin: 0 }}>{artist}</p>
            </div>
          </Html>
        )}

        {/* Frame highlights */}
        <Box
          args={[size[0] + 0.22, 0.05, 0.13]}
          position={[0, size[1] / 2 + 0.1, -0.04]}
        >
          <meshStandardMaterial
            color="#D2B48C"
            metalness={0.4}
            roughness={0.6}
          />
        </Box>
        <Box
          args={[size[0] + 0.22, 0.05, 0.13]}
          position={[0, -size[1] / 2 - 0.1, -0.04]}
        >
          <meshStandardMaterial
            color="#D2B48C"
            metalness={0.4}
            roughness={0.6}
          />
        </Box>

        {/* Title plaque */}

        
        <Box
          args={[1.4, 0.3, 0.02]} 
          position={[0, -size[1] / 2 - 0.2, 0.05]}
        >
          <meshStandardMaterial
            color="#B8860B"
            metalness={0.7}
            roughness={0.3}
          />
        </Box>

        {/* Wrapping 3D Text (narrow) */}
        <Text
          position={[0, -size[1] / 2 - 0.2, 0.07]}
          fontSize={0.06} // smaller font
          maxWidth={1.2} // narrower line-wrapping
          lineHeight={1.2}
          textAlign="center"
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          {title || "Untitled"}
        </Text>

        {/* <Box
          args={[size[0] / 2, 0.15, 0.02]}
          position={[0, -size[1] / 2 - 0.2, 0.05]}
        >
          <meshStandardMaterial
            color="#B8860B"
            metalness={0.7}
            roughness={0.3}
          />
        </Box>
        <Text
          position={[0, -size[1] / 2 - 0.2, 0.07]}
          fontSize={0.08}
          maxWidth={1.8}
          lineHeight={1.2}
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          {title || "Untitled"}
        </Text> */}

        {/* if Artframe is clicked show information */}
        {clicked && (
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


export default ArtFrame;