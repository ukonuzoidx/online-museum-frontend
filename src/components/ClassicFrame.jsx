import React from "react";
import marbleTexture from "../assets/textures/marble.jpg";
import loadingGif from "../assets/loading.gif";
import { Box, Text, Html, useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

// Classical Framed Artwork Component
const ClassicalArtwork = ({
  position,
  rotation = [0, 0, 0],
  size = [2, 1.5],
  title,
  department,
  artist,
  dimensions,
  medium,
  objectURL,
  imageURL,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [viewed, setViewed] = React.useState(false);

  // Load textures
  const marble = useTexture(marbleTexture);
  let finalUrl = loadingGif;
  if (imageURL && imageURL.startsWith("http")) {
    finalUrl = `https://corsproxy.io/?url=${encodeURIComponent(
      imageURL
    )}`;
  }

  // If the finalUrl is still invalid, fallback.png will be used
  const texture = useTexture(finalUrl);

  // Configure texture repeats
  marble.wrapS = marble.wrapT = RepeatWrapping;
  marble.repeat.set(2, 2);

  

  return (
    <group position={position} rotation={rotation}>
      {/* Artwork with ornate gold frame */}
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setViewed(!viewed)}
      >
        {/* Ornate gold frame - outer edge */}
        <Box
          args={[size[0] + 0.3, size[1] + 0.3, 0.1]}
          position={[0, 0, -0.05]}
        >
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.6}
            metalness={0.2}
          />
        </Box>

        {/* Artwork canvas */}
        <Box args={[size[0], size[1], 0.05]} position={[0, 0, 0.132]}>
          <meshStandardMaterial
            map={texture}
            color="#fff"
            roughness={0.7}
            // roughness={0.7}
          />
        </Box>

        {/* Ornate gold frame - inner ornamental border */}
        <Box
          args={[size[0] + 0.2, size[1] + 0.2, 0.12]}
          position={[0, 0, -0.03]}
        >
          <meshStandardMaterial
            color="#DAA520"
            roughness={0.3}
            metalness={0.8}
          />
        </Box>

        {/* Small discrete info tag */}
        <Box
          args={[2.5, 0.15, 0.01]}
          position={[size[0] / 2 - 1, -size[1] / 2 - 0.2, 0]}
        >
          <meshStandardMaterial color="#333333" />
        </Box>
        <Text
          position={[size[0] / 2 - 1, -size[1] / 2 - 0.2, 0.02]}
          fontSize={0.04}
          color="#F5F5F5"
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


export  default ClassicalArtwork;
