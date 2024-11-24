// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { Video } from '../types';

// export default function VideoList() {
//   const [videos, setVideos] = useState<Video[]>([]);

//   useEffect(() => {
//     async function fetchVideos() {
//       try {
//         const response = await fetch('/api/metadata');
//         if (!response.ok) {
//           throw new Error(`Failed to fetch videos: ${response.statusText}`);
//         }
//         const data = await response.json();

//         // Process the data to ensure duration is a number
//         const processedData: Video[] = data.map((video: any) => ({
//           ...video,
//           duration: Number(video.duration),
//         }));

//         setVideos(processedData);
//       } catch (error) {
//         console.error('Error fetching videos:', error);
//       }
//     }

//     fetchVideos();
//   }, []);

//   // Helper function to format duration
//   function formatDuration(totalSeconds): string {
//     // Round down to the nearest whole number
//     const totalSecondsInt = Math.floor(totalSeconds);
//     const minutes = Math.floor(totalSecondsInt / 60);
//     const remainingSeconds = totalSecondsInt % 60;
//     const secondsString = remainingSeconds.toString().padStart(2, '0');
//     return `${minutes}:${secondsString}`;
//   }

//   return (
//     <>
//       {videos.map((video) => (
//         <div key={video.id} style={{ marginLeft: '7ch', marginBottom: '0.5em' }}>
//           <Link href={`/video/${video.id}`} style={{ textDecoration: 'underline' }}>
//             {video.title}
//           </Link>
//           {` (${formatDuration(video.duration)})`}
//         </div>
//       ))}
//     </>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video } from '../types';

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/metadata');
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }
        const data = await response.json();

        // Process the data to ensure duration is a number
        const processedData: Video[] = data.map((video: any) => ({
          ...video,
          duration: Number(video.duration),
        }));

        setVideos(processedData);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Please try again later.');
      }
    }

    fetchVideos();
  }, []);

  // Helper function to format duration
  function formatDuration(totalSeconds: number): string {
    // Round down to the nearest whole number
    const totalSecondsInt = Math.floor(totalSeconds);
    const minutes = Math.floor(totalSecondsInt / 60);
    const remainingSeconds = totalSecondsInt % 60;
    const secondsString = remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${secondsString}`;
  }

  // Handler to delete a video
  async function handleDelete(id: string) {
    // Optional: Confirm deletion with the user
    const confirmDelete = confirm('Are you sure you want to delete this video?');
    if (!confirmDelete) return;

    // Add the id to the loading set to indicate deletion in progress
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      const formData = new FormData();
      formData.append('id', id);

      const response = await fetch('/api/delete', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete video.');
      }

      // Remove the deleted video from the state
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
    } catch (err: any) {
      console.error('Error deleting video:', err);
      alert(`Error deleting video: ${err.message}`);
    } finally {
      // Remove the id from the loading set
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {videos.length === 0 && !error && <p>No videos available.</p>}
      {videos.map((video) => (
        <div
          key={video.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: '7ch',
            marginBottom: '0.5em',
          }}
        >
          <Link
            href={`/video/${video.id}`}
            style={{ textDecoration: 'underline', marginRight: '1em' }}
          >
            {video.title}
          </Link>
          <span>({formatDuration(video.duration)})</span>
          <button
            onClick={() => handleDelete(video.id)}
            disabled={loadingIds.has(video.id)}
            style={{
              marginLeft: 'auto',
              padding: '0.3em 0.6em',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loadingIds.has(video.id) ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </>
  );
}
