// import React, { useEffect, useState } from "react";
// import EntranceRoom from "./EntranceRoom";
// import GalleryRoom1 from "../pages/GalleryRoom1";
// import GalleryRoom2 from "../pages/GalleryRoom2";
// import GalleryRoom3 from "./GalleryRoom3";
// import Restroom from "./RestRoom";
// import useMetMuseumArtworks from "../hooks/useMuseumHook";

// function MuseumEnvironment({ currentRoom, onDoorClick }) {
//   // Fetch all artworks ONCE
//   const { artworks, loading } = useMetMuseumArtworks(11, "Paintings", 20, true); // Example for dept 11
//   const { artworks: africanArtworks } = useMetMuseumArtworks(5, "Sculpture", 20, true); // Example for dept 5

//   const renderRoom = () => {
//     switch (currentRoom) {
//       case "Entrance":
//         return <EntranceRoom onDoorClick={onDoorClick} />;
//       case "Gallery 1":
//         return <GalleryRoom1 onDoorClick={onDoorClick} artworks={artworks} />;
//       case "Gallery 2":
//         return <GalleryRoom2 onDoorClick={onDoorClick} artworks={africanArtworks} />;
//       case "Gallery 3":
//         return <GalleryRoom3 onDoorClick={onDoorClick} />;
//       case "Restrooms":
//         return <Restroom onDoorClick={onDoorClick} />;
//       default:
//         return <EntranceRoom onDoorClick={onDoorClick} />;
//     }
//   };

//   return (
//     <>
//       <ambientLight intensity={0.5} />
//       <directionalLight
//         position={[10, 10, 5]}
//         intensity={1}
//         castShadow
//         shadow-mapSize-width={2048}
//         shadow-mapSize-height={2048}
//       />
//       {renderRoom()}
//     </>
//   );
// }

// export default MuseumEnvironment;

import React from "react";
import { Text } from "@react-three/drei";
import EntranceRoom from "./EntranceRoom";
import GalleryRoom1 from "../pages/GalleryRoom1";
import GalleryRoom2 from "../pages/GalleryRoom2";
import GalleryRoom3 from "./GalleryRoom3";
import Restroom from "./RestRoom";
import WelcomeScreen from "./WelcomeScreen";
import useMetMuseumArtworks from "../hooks/useMuseumHook";

// function MuseumEnvironment({ currentRoom, onDoorClick }) {
//   // Fetch all artworks for different galleries
//   const { artworks, loading } = useMetMuseumArtworks(11, "Paintings", 20, ); // European Paintings for Gallery 1
//   const { artworks: africanArtworks, loading: africanLoading } =
//     useMetMuseumArtworks(5, "Sculpture", 65, true); // African sculptures for Gallery 2
//   const { artworks: asianArtworks, loading: asianLoading } =
//     useMetMuseumArtworks(6, "Portrait", 20, true); // Portraits for Gallery 3

//   // Function to map room name to its component
//   const renderRoom = () => {
//     switch (currentRoom) {
//       case "Entrance":
//         return <EntranceRoom onDoorClick={onDoorClick} />;
//       case "Gallery 1":
//         return (
//           <GalleryRoom1
//             onDoorClick={onDoorClick}
//             artworks={artworks}
//             loading={loading}
//           />
//         );
//       case "Gallery 2":
//         return (
//           <GalleryRoom2
//             onDoorClick={onDoorClick}
//             artworks={africanArtworks}
//             loading={africanLoading}
//           />
//         );
//       case "Gallery 3":
//         return (
//           <GalleryRoom3
//             onDoorClick={onDoorClick}
//             artworks={asianArtworks}
//             loading={asianLoading}
//           />
//         );
//       case "Restrooms":
//         return <Restroom onDoorClick={onDoorClick} />;
//       default:
//         // If no room is selected or for welcome screen
//         return <EntranceRoom onDoorClick={onDoorClick} />;
//     }
//   };

//   return (
//     <>
//       <ambientLight intensity={0.5} />
//       <directionalLight
//         position={[10, 10, 5]}
//         intensity={1}
//         castShadow
//         shadow-mapSize-width={2048}
//         shadow-mapSize-height={2048}
//       />
//       {renderRoom()}
//     </>
//   );
// }

// export default MuseumEnvironment;
// In MuseumEnvironment.jsx
function MuseumEnvironment({ currentRoom, onDoorClick, galleryArtworks }) {
  // No need to fetch artworks here anymore
  
  // Function to map room name to its component
  const renderRoom = () => {
    switch (currentRoom) {
      case "Entrance":
        return <EntranceRoom onDoorClick={onDoorClick} />;
      case "Gallery 1":
        return <GalleryRoom1 onDoorClick={onDoorClick} artworks={galleryArtworks.gallery1} loading={galleryArtworks.loading} />;
      case "Gallery 2":
        return <GalleryRoom2 onDoorClick={onDoorClick} artworks={galleryArtworks.gallery2} loading={galleryArtworks.loading} />;
      case "Gallery 3":
        return <GalleryRoom3 onDoorClick={onDoorClick} artworks={galleryArtworks.gallery3} loading={galleryArtworks.loading} />;
      case "Restrooms":
        return <Restroom onDoorClick={onDoorClick} />;
      default:
        return <EntranceRoom onDoorClick={onDoorClick} />;
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      {renderRoom()}
    </>
  );
}

export default MuseumEnvironment;