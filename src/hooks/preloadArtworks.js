import { useEffect, useState } from "react";

// Preload image utility
const preloadImage = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url, loaded: true });
        img.onerror = () => resolve({ url, loaded: false });
        img.src = url;
    });
};

// Hook to preload an array of artworks
const usePreloadedArtworks = (artworks = []) => {
    const [preloadedArtworks, setPreloadedArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!artworks || artworks.length === 0) {
            setPreloadedArtworks([]);
            setIsLoading(false);
            return;
        }

        const loadAllImages = async () => {
            setIsLoading(true);
            const results = await Promise.all(
                artworks.map(async (art) => {
                    const result = await preloadImage(art.primaryImage);
                    return {
                        ...art,
                        preloaded: result.loaded,
                        imageUrl: result.loaded ? art.primaryImage : null,
                    };
                })
            );

            setPreloadedArtworks(results);
            setIsLoading(false);
        };

        loadAllImages();
    }, [artworks]);

    return { artworks: preloadedArtworks, isLoading };
};

export default usePreloadedArtworks;