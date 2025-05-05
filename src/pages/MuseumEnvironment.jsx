// Import necessary libraries and components
import React from "react";
import { Text } from "@react-three/drei";
import EntranceRoom from "./EntranceRoom";
import GalleryRoom1 from "../pages/GalleryRoom1";
import GalleryRoom2 from "../pages/GalleryRoom2";
import GalleryRoom3 from "./GalleryRoom3";
import Restroom from "./RestRoom";
import WelcomeScreen from "./WelcomeScreen";
import useMetMuseumArtworks from "../hooks/useMuseumHook";

function MuseumEnvironment({ currentRoom, onDoorClick, galleryArtworks }) {
  // No need to fetch artworks here anymore as it's done in the App.jsx file for faster loading
  
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

  // Render the room based on the current room state
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      {renderRoom()}
    </>
  );
}

export default MuseumEnvironment;