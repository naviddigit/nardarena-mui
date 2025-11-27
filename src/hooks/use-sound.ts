import { useRef, useState, useCallback, useEffect } from 'react';

// ----------------------------------------------------------------------

type SoundType = 'move' | 'turn';

const SOUND_PATHS = {
  move: '/dice-main/assets/stet.mp3',
  turn: '/dice-main/assets/select.mp3',
};

// ----------------------------------------------------------------------

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    move: null,
    turn: null,
  });

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRefs.current.move = new Audio(SOUND_PATHS.move);
      audioRefs.current.turn = new Audio(SOUND_PATHS.turn);

      // Set volume
      if (audioRefs.current.move) audioRefs.current.move.volume = 0.5;
      if (audioRefs.current.turn) audioRefs.current.turn.volume = 0.5;
    }

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.warn(`Failed to play ${type} sound:`, error);
        });
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isMuted,
    playSound,
    toggleMute,
  };
}
