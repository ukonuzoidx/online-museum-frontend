function MuseumEnvironment({ currentRoom, onDoorClick, galleryArtworks }) {
  // No need to fetch artworks here anymore, as they are passed as props
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

  // Render the current room based on the currentRoom prop
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      {renderRoom()}
    </>
  );
}

export default MuseumEnvironment;