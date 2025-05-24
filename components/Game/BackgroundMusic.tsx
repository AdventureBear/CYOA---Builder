import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic({ src = "/music/v-viking-venture-chant-remix-333478.mp3" }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const resumeAudio = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", resumeAudio);
    };
    window.addEventListener("click", resumeAudio);
    return () => window.removeEventListener("click", resumeAudio);
  }, [isPlaying]);

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      <button
        onClick={() => setIsPlaying((p) => !p)}
        className="fixed bottom-4 right-4 z-50 bg-white/80 px-3 py-1 rounded shadow text-sm"
      >
        {isPlaying ? "🔊 Music On" : "🔇 Music Off"}
      </button>
    </>
  );
} 