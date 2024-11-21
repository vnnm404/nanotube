'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video } from '../types';

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);

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
      }
    }

    fetchVideos();
  }, []);

  // Helper function to format duration
  function formatDuration(totalSeconds): string {
    // Round down to the nearest whole number
    const totalSecondsInt = Math.floor(totalSeconds);
    const minutes = Math.floor(totalSecondsInt / 60);
    const remainingSeconds = totalSecondsInt % 60;
    const secondsString = remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${secondsString}`;
  }

  return (
    <>
      {videos.map((video) => (
        <div key={video.id} style={{ marginLeft: '7ch', marginBottom: '0.5em' }}>
          <Link href={`/video/${video.id}`} style={{ textDecoration: 'underline' }}>
            {video.title}
          </Link>
          {` (${formatDuration(video.duration)})`}
        </div>
      ))}
    </>
  );
}
