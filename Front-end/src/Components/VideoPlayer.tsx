import { useEffect, useRef } from "react";

export const VideoPlayer: React.FC<{
  stream?: MediaStream;
  isMuted: boolean;
}> = ({ stream, isMuted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      className="rounded-sm w-full h-full object-cover"
      ref={videoRef}
      autoPlay
      muted={isMuted}
    />
  );
};
