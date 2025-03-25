// import { useState, useEffect } from 'react';

// const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// const useMetMuseumArtworks = (departmentId, limit = 10) => {
//     const [artworks, setArtworks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchArtworks = async () => {
//             setLoading(true);
//             try {
//                 // Fetch object IDs for the specified department
//                 const searchResponse = await fetch(
//                     `${BASE_URL}/search?departmentId=${departmentId}&q=`
//                 );
//                 const searchData = await searchResponse.json();

//                 if (searchData.total === 0) {
//                     setArtworks([]);
//                     setLoading(false);
//                     return;
//                 }

//                 // Limit the number of artworks to fetch
//                 const objectIds = searchData.objectIDs.slice(0, limit);

//                 // Fetch details for each artwork
//                 const artworkPromises = objectIds.map(async (id) => {
//                     const objectResponse = await fetch(`${BASE_URL}/objects/${id}`);
//                     return objectResponse.json();
//                 });

//                 const artworkData = await Promise.all(artworkPromises);
//                 setArtworks(artworkData);
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchArtworks();
//     }, [departmentId, limit]);

//     return { artworks, loading, error };
// };

// export default useMetMuseumArtworks;

// /**
//  * Fetch artworks from The Met's API by department and query
//  * Then fetch details for each objectID, skipping 404 or missing images
//  * @param {number} departmentId - e.g. 11 for European Paintings
//  * @param {string} query - e.g. "painting"
//  * @param {number} limit - how many results to fetch
//  * @param {boolean} hasImages - only fetch artworks with images
//  * @param {boolean} isHighlight - only fetch artworks with images
//  */

import { useState, useEffect } from "react";

async function isImageOk(url) {
    try {
        // HEAD request to check if the URL is valid (some servers block HEAD, in which case use GET)
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
    } catch (err) {
        return false;
    }
}


const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

export default function useMetMuseumArtworks(departmentId, query, limit = 10, hasImages = false, isHighlight = false) {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError("");
        setArtworks([]);

        (async () => {
            try {
                // 1) Search for objectIDs
                // const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&q=${query}&hasImages=true`;
                // const searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
                
                let searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
                if (hasImages) {
                    searchUrl += "&hasImages=true";
                }
                if (isHighlight) {
                    searchUrl += "&isHighlight=true";
                }
                console.log(searchUrl);
                const searchRes = await fetch(searchUrl);
                if (!searchRes.ok) {
                    throw new Error(`Search failed: ${searchRes.status}`);
                }
                const searchData = await searchRes.json();

                if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
                    if (isMounted) {
                        setError("No results found");
                        setLoading(false);
                    }
                    return;
                }

                // 2) Limit how many objectIDs we want
                const objectIDs = searchData.objectIDs.slice(0, limit);

                // 3) Fetch details concurrently
                const detailPromises = objectIDs.map(async (id) => {
                    try {
                        const detailUrl = `${BASE_URL}/objects/${id}`;
                        const detailRes = await fetch(detailUrl);
                        if (!detailRes.ok) {
                            // e.g. 404
                            return null; // skip
                        }
                        const detailData = await detailRes.json();
                        // skip if no primaryImage
                        if (!detailData.primaryImage || !await isImageOk(detailData.primaryImage)) return null;

                        return detailData;
                    } catch (err) {
                        return null; // skip on error
                    }
                });

                const details = await Promise.all(detailPromises);
                // 4) filter out null or incomplete
                const validArtworks = details.filter(Boolean);

                if (isMounted) {
                    setArtworks(validArtworks);
                    setLoading(false);
                }
            } catch (err) {
                console.error("useMetMuseumArtworks error:", err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [departmentId, query, limit]);

    return { artworks, loading, error };
}


// import { is } from "@react-three/fiber/dist/declarations/src/core/utils";
// import { useState, useEffect } from "react";



// async function isImageOk(url) {
//     try {
//         // HEAD request to check if the URL is valid (some servers block HEAD, in which case use GET)
//         const res = await fetch(url, { method: "HEAD" });
//         return res.ok;
//     } catch (err) {
//         return false;
//     }
// }

// export default function useMetMuseumArtworks(departmentId, query, limit) {
//     const [artworks, setArtworks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         let isMounted = true;
//         setLoading(true);
//         setError("");
//         setArtworks([]); // reset

//         (async () => {
//             try {
//                 // 1. Search for objectIDs
//                 // const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&q=${query}&hasImages=true`;
//                 const searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
//                 const searchRes = await fetch(searchUrl);
//                 if (!searchRes.ok) {
//                     throw new Error(`Search failed with status ${searchRes.status}`);
//                 }
//                 const searchData = await searchRes.json();

//                 if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
//                     // No results found
//                     if (isMounted) {
//                         setError("No results found");
//                         setArtworks([]);
//                         setLoading(false);
//                     }
//                     return;
//                 }

//                 // 2. Limit how many objectIDs we want
//                 const objectIDs = searchData.objectIDs.slice(0, limit);

//                 // 3. Fetch details concurrently
//                 const detailPromises = objectIDs.map(async (id) => {
//                     try {
//                         // const detailUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
//                         const detailUrl = `${BASE_URL}/objects/${id}`;
//                         const detailRes = await fetch(detailUrl);
//                         if (!detailRes.ok) {
//                             // e.g. 404
//                             return null; // skip
//                         }
//                         const detailData = await detailRes.json();
//                         // skip if no primaryImage
//                         if (!detailData.primaryImage) return null;

                        // // check if image URL is valid
                        // if (!await isImageOk(detailData.primaryImage)) return null;
                        // // console.log(isImageOk(detailData.primaryImage));




//                         return detailData;
//                     } catch (err) {
//                         console.error("Detail fetch error:", err);
//                         return null; // skip
//                     }
//                 });

//                 const details = await Promise.all(detailPromises);
//                 // filter out null or incomplete
//                 const validArtworks = details.filter(Boolean);

//                 if (isMounted) {
//                     setArtworks(validArtworks);
//                     setLoading(false);
//                 }
//             } catch (err) {
//                 console.error("Error in useMetMuseumArtworks:", err);
//                 if (isMounted) {
//                     setError(err.message || "Unknown error");
//                     setArtworks([]);
//                     setLoading(false);
//                 }
//             }
//         })();

//         return () => {
//             isMounted = false;
//         };
//     }, [departmentId, query, limit]);

//     return { artworks, loading, error };
// }
