import { useRef, useState, useCallback, useEffect } from 'react';

// ----------------------------------------------------------------------

type SoundType = 'move' | 'turn';

const SOUND_PATHS = {
  move: '/dice-main/assets/stet.mp3',
  turn: '/dice-main/assets/select.mp3',
};

// Audio Pool برای پخش همزمان صداها
const AUDIO_POOL_SIZE = 3; // حداکثر 3 صدا همزمان

// ----------------------------------------------------------------------

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  
  // Audio Pool برای هر نوع صدا
  const audioPoolsRef = useRef<Record<SoundType, HTMLAudioElement[]>>({
    move: [],
    turn: [],
  });
  
  const poolIndexRef = useRef<Record<SoundType, number>>({
    move: 0,
    turn: 0,
  });

  // Initialize audio pools
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // ساخت pool برای هر نوع صدا
      (['move', 'turn'] as SoundType[]).forEach(type => {
        audioPoolsRef.current[type] = [];
        for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
          const audio = new Audio(SOUND_PATHS[type]);
          audio.volume = 0.5;
          audio.preload = 'auto'; // Pre-load برای سرعت بیشتر
          audioPoolsRef.current[type].push(audio);
        }
      });
      
      // Unlock audio on first user interaction (for mobile)
      const unlockAudio = () => {
        if (!isAudioUnlocked) {
          // Unlock همه audio ها
          Object.values(audioPoolsRef.current).forEach((pool) => {
            pool.forEach((audio) => {
              audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
              }).catch(() => {
                // Ignore error, will try again on next interaction
              });
            });
          });
          setIsAudioUnlocked(true);
        }
      };

      // Add listeners for first user interaction
      const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
      events.forEach(event => {
        document.addEventListener(event, unlockAudio, { once: true });
      });

      return () => {
        // Cleanup
        events.forEach(event => {
          document.removeEventListener(event, unlockAudio);
        });
        Object.values(audioPoolsRef.current).forEach((pool) => {
          pool.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
          });
        });
      };
    }
  }, [isAudioUnlocked]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      const pool = audioPoolsRef.current[type];
      if (!pool || pool.length === 0) return;
      
      // انتخاب audio بعدی از pool (round-robin)
      const currentIndex = poolIndexRef.current[type];
      const audio = pool[currentIndex];
      
      // Update index برای دفعه بعد
      poolIndexRef.current[type] = (currentIndex + 1) % pool.length;
      
      // پخش صدا
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Only log on mobile if autoplay was blocked
          if (error.name === 'NotAllowedError') {
            console.log(`Audio blocked on mobile - user interaction needed first`);
          } else {
            console.warn(`Failed to play ${type} sound:`, error);
          }
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
