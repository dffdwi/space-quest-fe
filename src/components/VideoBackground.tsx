"use client";

import { useMemo } from "react";

interface VideoBackgroundProps {
  activeTheme: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ activeTheme }) => {
  const videoSrc = useMemo(() => {
    console.log("active theme : " + activeTheme);
    switch (activeTheme) {
      case "theme-nebula-dark":
        return "/videos/theme-nebula-dark.mp4";
      case "theme-starfield-light":
        return "/videos/theme-starfield-light.mp4";
      case "theme-dark":
        return "/videos/theme-dark.mp4";
      default:
        return;
    }
  }, [activeTheme]);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Browser Anda tidak mendukung tag video.
      </video>
    </div>
  );
};

export default VideoBackground;
