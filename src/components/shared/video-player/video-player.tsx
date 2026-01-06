"use client";

import { useRef, useState } from "react";
import { useHLS } from "@/hooks/useHLS";

export function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorData: any) => {
    setError(errorData.message || "Lỗi phát video");
  }

  useHLS({ videoRef, src, onError: handleError });

  if (error) {
    return (
      <div className="w-full aspect-video rounded-lg border bg-black flex items-center justify-center text-white">
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      className="w-full aspect-video rounded-lg border bg-black"
    />
  );
}
