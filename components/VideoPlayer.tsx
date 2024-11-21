"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const videoSrc = `/api/video/${videoId}/metadata`;

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
        video.addEventListener("loadedmetadata", () => {
          // video.play();
        });
      } else {
        console.error("Your browser does not support HLS playback.");
      }
    }

    return () => {
      if (video && video.src) video.src = "";
    };
  }, [videoId]);

  return <video ref={videoRef} controls style={{ maxHeight: "100%" }} />;
};

export default VideoPlayer;
