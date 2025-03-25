
// import React from "react";
// import { TextureLoader } from "three";
// import { Box, Cylinder, Text } from "@react-three/drei";
// import { useLoader } from "@react-three/fiber";
// import entranceTexture from "../assets/textures/museum-entrance-2.jpg"; // Entrance Image
// import floor1 from "../assets/textures/floor-1.png"; // Floor Image

// import ArtworkFrame from "./ArtworkFrame";
// import Door from "./MuseumDoors";
// import floor2 from "../assets/textures/floor-2.png"; // Floor Image
// import walls1 from "../assets/textures/walls-1.jpg"; // Walls Image
// import walls2 from "../assets/textures/walls-2.jpg"; // Walls Image
// import walls3 from "../assets/textures/walls-3.jpg"; // Walls Image
// import walls4 from "../assets/textures/walls-4.jpg"; // Walls Image
// import walls5 from "../assets/textures/walls-5.jpg"; // Walls Image
// import ceiling1 from "../assets/textures/ceiling-1.jpg"; // Ceiling Image


// // Gallery Room 1 (based on image 1)
// function GalleryRoom1({ onDoorClick }) {
//   // Sample exhibit data for this gallery
//   const exhibits = [
//     {
//       id: 1,
//       title: "Renaissance Masterpiece",
//       description:
//         "A stunning example of Renaissance art showcasing perfect perspective and rich symbolism.",
//       position: [-6, 1.5, -8],
//     },
//     {
//       id: 2,
//       title: "Modern Abstract",
//       description:
//         "An exploration of form and color that challenges traditional perspectives.",
//       position: [-3, 1.5, -8],
//     },
//     {
//       id: 3,
//       title: "Ancient Sculpture",
//       description:
//         "Dating back to 500 BCE, this sculpture represents the cultural values of its time.",
//       position: [3, 1.5, -8],
//     },
//     ];
    
//         // load entrance ceiling texture
//         const ceilingTexture = useLoader(TextureLoader, ceiling1);

//   return (
//     <group>
//       {/* Simulated gallery room - replace with your actual environment model/texture */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
//         <planeGeometry args={[20, 20]} />
//         <meshStandardMaterial color="#f0f0f0" />
//           </mesh>
          
//           {/* Ceiling  */}
//               {/* ✅ Ceiling */}
//                 <Box position={[0, 5, 0]} args={[20, 0.2, 20]}>
//                   <meshStandardMaterial
//                     map={ceilingTexture}
//                     emissive={"black"}
//                     emissiveIntensity={1}
//                   />
//                   {/* <meshStandardMaterial color="#ffffff" /> */}
//                 </Box>

//       {/* Walls */}
//       <mesh position={[0, 5, -10]} receiveShadow>
//         <boxGeometry args={[20, 10, 0.2]} />
//         <meshStandardMaterial color="#f8f8f8" />
//       </mesh>

//       <mesh position={[-10, 5, 0]} receiveShadow>
//         <boxGeometry args={[0.2, 10, 20]} />
//         <meshStandardMaterial color="#f8f8f8" />
//       </mesh>

//       <mesh position={[10, 5, 0]} receiveShadow>
//         <boxGeometry args={[0.2, 10, 20]} />
//         <meshStandardMaterial color="#f8f8f8" />
//       </mesh>

//       {/* Display Art Exhibits */}
//       {exhibits.map((exhibit) => (
//         <ArtworkFrame
//           key={exhibit.id}
//           position={exhibit.position}
//           title={exhibit.title}
//           description={exhibit.description}
//         />
//       ))}

//       {/* Door to Entrance */}
//       <Door
//         position={[-9.9, 1.25, 0]}
//         rotation={[0, Math.PI / 2, 0]}
//         targetRoom="Entrance"
//         onDoorClick={onDoorClick}
//       />

//       {/* Door to Gallery 2 */}
//       <Door
//         position={[9.9, 1.25, 0]}
//         rotation={[0, -Math.PI / 2, 0]}
//         targetRoom="Gallery 2"
//         onDoorClick={onDoorClick}
//       />
//     </group>
//   );
// }

// export default GalleryRoom1;
import React, { useRef, useState } from "react";
import { TextureLoader, RepeatWrapping, DoubleSide } from "three";
import { Html, Box, Cylinder, Text, useTexture } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import Door from "../widgets/MuseumDoors"; // Using your enhanced door component
import floor2 from "../assets/textures/floor-2.png";
import walls5 from "../assets/textures/walls-5.jpg";
import ceiling1 from "../assets/textures/ceiling-1.jpg";
import marbleTexture from "../assets/textures/marble-1.png";
import useMetMuseumArtworks from "../hooks/useMuseumHook";
// import marbleTexture from "../assets/textures/marble.jpg";

// Art Frame Component for displaying artworks with interaction
const ArtFrame = ({
  position,
  rotation = [0, 0, 0],
  size = [2, 1.5],
  artwork

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

  
    const imageUrl = artwork?.primaryImage || null;

    // ✅ Use useTexture to load the actual painting image
    // If there's no image, fallback to a placeholder
    const texture = useTexture(imageUrl);
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
          color="#FFF8DC"
          anchorX="center"
          anchorY="middle"
        >
          {title || "Untitled"}
        </Text>

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

function GalleryRoom1({ onDoorClick }) {
  // References for animations or effects
  const skylightRef = useRef();
  const lightBeamRef = useRef();

  // Load textures
  const floorTexture = useLoader(TextureLoader, floor2);
  const wallTexture = useLoader(TextureLoader, walls5);
  const ceilingTexture = useLoader(TextureLoader, ceiling1);
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


  // Art exhibits data
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
      position: [0, 2, -9.8],
      size: [3, 2],
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
      position: [9.8, 4, 5],
      rotation: [0, -Math.PI / 2, 0],
      size: [2, 2.5],
    },
  ];

  // console.log(exhibits.length);

  // const { artworks, loading } = useMetMuseumArtworks(
  //   11,
  //   "painting",
  //   exhibits.length
  // );


    // Suppose we want European Paintings:
  const { artworks, loading, error } = useMetMuseumArtworks(11, "painting", exhibits.length);


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

        {/* Light beam effect */}
        {/* <mesh
          ref={lightBeamRef}
          position={[0, -5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[3.5, 3.5, 10, 16, 1, true]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.1}
            side={DoubleSide}
          />
        </mesh> */}
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
      {/* {
        artworks.map((ex, i) => {
          // Get the i-th artwork
          const art = artworks[i];
          return (
            <ArtFrame
              key={art.objectID}
              position={ex.position}
              rotation={ex.rotation}
              size={ex.size}
              // Pass the entire Met object so ArtFrame can read the title, image, etc.
              artwork={art}
            />
          );
        })
      } */}

      {exhibits.map((ex, i) => {
        const art = artworks[i]; // 0-based index

        // If we have fewer artworks than exhibits, or vice versa, do a quick check:
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

      {/* {exhibits.map((exhibit) => (
        <ArtFrame
          key={exhibit.id}
          position={exhibit.position}
          rotation={exhibit.rotation}
          size={exhibit.size}
          title={exhibit.title}
          description={exhibit.description}
        />
      ))} */}

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