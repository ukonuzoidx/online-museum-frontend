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

/**
 * Fetch artworks from The Met's API by department and query.
 * Then fetch details for each objectID, skipping entries with missing or invalid images.
 *
 * @param {number} departmentId - e.g. 11 for European Paintings
 * @param {string} query - e.g. "painting"
 * @param {number} limit - how many results to fetch
 * @param {boolean} hasImages - only fetch artworks with images
 */
const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

async function isImageOk(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

const fetchArtworksForDepartment = async (
  departmentId,
  query,
  limit,
  hasImages = false
) => {
  // 1. Search for objectIDs
  let searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${encodeURIComponent(
    query
  )}`;
  if (hasImages) searchUrl += "&hasImages=true";

  let searchRes;
  try {
    searchRes = await fetch(searchUrl);
  } catch (err) {
    console.error("Search request failed:", err);
    return [];
  }

  if (!searchRes.ok) {
    console.error(`Search failed: ${searchRes.status}`);
    return [];
  }

  const searchData = await searchRes.json();
  if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
    return [];
  }

  // 2. Limit how many objectIDs we want
  const objectIDs = searchData.objectIDs.slice(0, limit);

  // 3. Fetch in small chunks to avoid CORS/rate-limit issues
  const chunkSize = 5;
  const results = [];

  for (let i = 0; i < objectIDs.length; i += chunkSize) {
    const chunk = objectIDs.slice(i, i + chunkSize);

    const chunkResults = await Promise.all(
      chunk.map(async (id) => {
        try {
    const data = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
    )
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
        return data;
      });

    if (!data.primaryImage) {
      console.warn(`Skipping object ${id}: no primary image`);
      return null; // skip this object
    }

    // const isValidImage = await isImageOk(data.primaryImage);
    // if (!isValidImage) continue;

    results.push(data);
  } catch (err) {
    console.warn(`Failed to fetch or parse object ${id}:`, err);
    return null; // skip this object
  }
  })
    );

    results.push(...chunkResults.filter(Boolean));
  }

  return results;
};

export default fetchArtworksForDepartment;

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

// import { useState, useEffect } from "react";

// async function isImageOk(url) {
//     try {
//         const res = await fetch(url, { method: "HEAD" });
//         return res.ok;
//     } catch (err) {
//         return false;
//     }
// }

// // Helper function to add delay between requests
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const fetchArtworksForDepartment = async (
//     departmentId,
//     query,
//     limit,
//     hasImages = false
// ) => {
//     // Try direct API first, fallback to proxy if needed
//     const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";
//     // const BASE_URL = "/api/public/collection/v1";

//     try {
//         // 1. Search for objectIDs
//         let searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
//         if (hasImages) {
//             searchUrl += "&hasImages=true";
//         }

//         console.log('Searching with URL:', searchUrl);

//         const searchRes = await fetch(searchUrl);
//         if (!searchRes.ok) {
//             throw new Error(`Search failed: ${searchRes.status} ${searchRes.statusText}`);
//         }
//         const searchData = await searchRes.json();

//         if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
//             console.log('No objects found for search');
//             return [];
//         }

//         console.log(`Found ${searchData.objectIDs.length} objects, fetching ${Math.min(limit, searchData.objectIDs.length)}`);

//         // 2. Limit how many objectIDs we want
//         const objectIDs = searchData.objectIDs.slice(0, limit);

//         // 3. Fetch details with rate limiting and better error handling
//         const details = [];
//         let successCount = 0;
//         let errorCount = 0;

//         for (let i = 0; i < objectIDs.length; i++) {
//             try {
//                 const id = objectIDs[i];
//                 const detailUrl = `${BASE_URL}/objects/${id}`;

//                 console.log(`Fetching artwork ${i + 1}/${objectIDs.length}: ${id}`);

//                 const detailRes = await fetch(detailUrl);

//                 if (!detailRes.ok) {
//                     console.warn(`Failed to fetch object ${id}: ${detailRes.status} ${detailRes.statusText}`);
//                     errorCount++;

//                     // If we're getting too many 403s, break early
//                     if (detailRes.status === 403 && errorCount > 5) {
//                         console.error('Too many 403 errors, stopping requests');
//                         break;
//                     }
//                     continue;
//                 }

//                 const detailData = await detailRes.json();

//                 // Skip if no primaryImage
//                 if (!detailData.primaryImage) {
//                     console.warn(`Skipping object ${id}: no primary image`);
//                     continue;
//                 }

//                 // Check if image is accessible
//                 const imageValid = await isImageOk(detailData.primaryImage);
//                 if (!imageValid) {
//                     console.warn(`Skipping object ${id}: image not accessible`);
//                     continue;
//                 }

//                 details.push(detailData);
//                 successCount++;
//                 console.log(`Successfully fetched object ${id} (${successCount} successful so far)`);

//                 // Add delay between requests to avoid rate limiting
//                 if (i < objectIDs.length - 1) {
//                     await delay(200); // Increased delay to 200ms
//                 }

//             } catch (err) {
//                 console.error(`Error fetching object ${objectIDs[i]}:`, err);
//                 errorCount++;
//                 continue;
//             }
//         }

//         console.log(`Fetch complete: ${successCount} successful, ${errorCount} errors`);
//         return details;

//     } catch (error) {
//         console.error('Error in fetchArtworksForDepartment:', error);
//         throw error;
//     }
// };

// export default fetchArtworksForDepartment;

// import { useState, useEffect } from "react";

// async function isImageOk(url) {
//     try {
//         const res = await fetch(url, { method: "HEAD" });
//         return res.ok;
//     } catch (err) {
//         return false;
//     }
// }

// // Helper function to add delay between requests
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Helper function to shuffle array (Fisher-Yates algorithm)
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// const fetchArtworksForDepartment = async (
//     departmentId,
//     query,
//     targetCount, // Renamed from 'limit' to be clearer about intent
//     hasImages = false
// ) => {
//     const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

//     try {
//         // 1. Search for objectIDs
//         let searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
//         if (hasImages) {
//             searchUrl += "&hasImages=true";
//         }

//         console.log('Searching with URL:', searchUrl);

//         const searchRes = await fetch(searchUrl);
//         if (!searchRes.ok) {
//             throw new Error(`Search failed: ${searchRes.status} ${searchRes.statusText}`);
//         }
//         const searchData = await searchRes.json();

//         if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
//             console.log('No objects found for search');
//             return [];
//         }

//         console.log(`Found ${searchData.objectIDs.length} total objects, targeting ${targetCount} valid artworks`);

//         // 2. Randomize the objectIDs to get different results each time
//         const shuffledObjectIDs = shuffleArray(searchData.objectIDs);

//         // 3. Fetch details with rate limiting and continue until we have enough valid artworks
//         const validArtworks = [];
//         let attemptCount = 0;
//         let errorCount = 0;
//         const maxAttempts = Math.min(shuffledObjectIDs.length, targetCount * 10); // Try up to 3x the target count

//         console.log(`Starting to fetch artworks. Target: ${targetCount}, Max attempts: ${maxAttempts}`);

//         while (validArtworks.length < targetCount && attemptCount < maxAttempts) {
//             try {
//                 const id = shuffledObjectIDs[attemptCount];
//                 const detailUrl = `${BASE_URL}/objects/${id}`;

//                 console.log(`Attempt ${attemptCount + 1}/${maxAttempts}: Fetching object ${id} (${validArtworks.length}/${targetCount} valid so far)`);

//                 const detailRes = await fetch(detailUrl);

//                 if (!detailRes.ok) {
//                     console.warn(`Failed to fetch object ${id}: ${detailRes.status} ${detailRes.statusText}`);
//                     errorCount++;

//                     // If we're getting too many 403s in a row, add longer delay
//                     if (detailRes.status === 403) {
//                         await delay(500);
//                     }

//                     attemptCount++;
//                     continue;
//                 }

//                 const detailData = await detailRes.json();

//                 // Skip if no primaryImage
//                 if (!detailData.primaryImage) {
//                     console.warn(`Skipping object ${id}: no primary image`);
//                     attemptCount++;
//                     continue;
//                 }

//                 // Check if image is accessible
//                 const imageValid = await isImageOk(detailData.primaryImage);
//                 if (!imageValid) {
//                     console.warn(`Skipping object ${id}: image not accessible`);
//                     attemptCount++;
//                     continue;
//                 }

//                 // This is a valid artwork!
//                 validArtworks.push(detailData);
//                 console.log(`✓ Successfully added object ${id} (${validArtworks.length}/${targetCount} complete)`);

//                 // Add delay between requests to avoid rate limiting
//                 await delay(150);

//             } catch (err) {
//                 console.error(`Error fetching object ${shuffledObjectIDs[attemptCount]}:`, err);
//                 errorCount++;
//             }

//             attemptCount++;
//         }

//         console.log(`Fetch complete: ${validArtworks.length}/${targetCount} valid artworks obtained after ${attemptCount} attempts (${errorCount} errors)`);

//         if (validArtworks.length < targetCount) {
//             console.warn(`Could only fetch ${validArtworks.length} valid artworks out of ${targetCount} requested`);
//         }

//         return validArtworks;

//     } catch (error) {
//         console.error('Error in fetchArtworksForDepartment:', error);
//         throw error;
//     }
// };

// export default fetchArtworksForDepartment;

// import { useState, useEffect } from "react";

// async function isImageOk(url) {
//     try {
//         const res = await fetch(url, { method: "HEAD" });
//         return res.ok;
//     } catch (err) {
//         return false;
//     }
// }

// // Helper function to add delay between requests
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Helper function to shuffle array (Fisher-Yates algorithm)
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// const fetchArtworksForDepartment = async (
//     departmentId,
//     query,
//     targetCount,
//     hasImages = false
// ) => {
//     const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

//     try {
//         // 1. Search for objectIDs
//         let searchUrl = `${BASE_URL}/search?departmentId=${departmentId}&q=${query}`;
//         if (hasImages) {
//             searchUrl += "&hasImages=true";
//         }

//         console.log('Searching with URL:', searchUrl);

//         const searchRes = await fetch(searchUrl);
//         if (!searchRes.ok) {
//             throw new Error(`Search failed: ${searchRes.status} ${searchRes.statusText}`);
//         }
//         const searchData = await searchRes.json();

//         if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
//             console.log('No objects found for search');
//             return [];
//         }
//  console.log(`Found ${searchData.objectIDs.length} total objects, targeting ${targetCount} valid artworks`);

//         // 2. Randomize the objectIDs to get different results each time
//         const shuffledObjectIDs = shuffleArray(searchData.objectIDs);

//         // 3. Fetch details using the same approach as the working old code
//         const validArtworks = [];
//         let attemptCount = 0;
//         const maxAttempts = Math.min(shuffledObjectIDs.length, targetCount * 3);

//         console.log(`Starting to fetch artworks. Target: ${targetCount}, Max attempts: ${maxAttempts}`);

//         while (validArtworks.length < targetCount && attemptCount < maxAttempts) {
//             try {
//                 const id = shuffledObjectIDs[attemptCount];
//                 const detailUrl = `${BASE_URL}/objects/${id}`;

//                 console.log(`Attempt ${attemptCount + 1}/${maxAttempts}: Fetching object ${id} (${validArtworks.length}/${targetCount} valid so far)`);

//                 const detailRes = await fetch(detailUrl);

//                 if (!detailRes.ok) {
//                     console.warn(`Failed to fetch object ${id}: ${detailRes.status} ${detailRes.statusText}`);
//                     attemptCount++;
//                     continue;
//                 }

//                 const detailData = await detailRes.json();

//                 // Use the same simple check as the old working code
//                 if (detailData.primaryImage) {
//                     validArtworks.push(detailData);
//                     console.log(`✓ Successfully added object ${id} (${validArtworks.length}/${targetCount} complete)`);
//                 } else {
//                     console.warn(`Skipping object ${id}: no primary image`);
//                 }

//                 // Add small delay between requests
//                 await delay(100);

//             } catch (err) {
//                 console.error(`Error fetching object ${shuffledObjectIDs[attemptCount]}:`, err);
//             }

//             attemptCount++;
//         }

//         console.log(`Fetch complete: ${validArtworks.length}/${targetCount} valid artworks obtained after ${attemptCount} attempts`);

//         if (validArtworks.length < targetCount) {
//             console.warn(`Could only fetch ${validArtworks.length} valid artworks out of ${targetCount} requested`);
//         }

//         return validArtworks;

//     } catch (error) {
//         console.error('Error in fetchArtworksForDepartment:', error);
//         throw error;
//     }
// };

// export default fetchArtworksForDepartment;
