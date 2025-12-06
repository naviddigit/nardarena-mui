'use client';

import { useEffect, useRef, useState } from 'react';

interface GameTimerProps {
  /** Initial time in seconds from database */
  initialSeconds: number;
  /** Whether this timer is currently active */
  isActive: boolean;
  /** Callback when timer reaches zero */
  onTimeUp?: () => void;
  /** Callback to get current time (called every second) */
  onTick?: (seconds: number) => void;
}

/**
 * ⏱️ Clean Chess-Clock Style Timer Component
 * 
 * - Counts down from initialSeconds
 * - Only runs when isActive = true
 * - Persists through page refresh via initialSeconds prop
 * - No external state management needed
 */
export function GameTimer({ initialSeconds, isActive, onTimeUp, onTick }: GameTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpCalledRef = useRef<boolean>(false);

  // Reset timer when initialSeconds changes (on page load/refresh)
  useEffect(() => {
    // ✅ Validate initialSeconds
    if (typeof initialSeconds !== 'number' || isNaN(initialSeconds) || initialSeconds < 0) {
      return;
    }
    
    setSeconds(initialSeconds);
    
    // If timer is already at 0 or negative, trigger onTimeUp immediately (only once)
    if (initialSeconds <= 0 && onTimeUp && !timeUpCalledRef.current) {
      timeUpCalledRef.current = true;
      onTimeUp();
    }
    
    // Reset flag if timer goes above 0 (for new game/set)
    if (initialSeconds > 0) {
      timeUpCalledRef.current = false;
    }
  }, [initialSeconds, onTimeUp]);

  // Start/stop countdown based on isActive
  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newValue = Math.max(0, prev - 1);
          
          // Notify parent of new value
          if (onTick) {
            onTick(newValue);
          }
          
          // Check if time is up (only call once)
          if (newValue === 0 && onTimeUp && !timeUpCalledRef.current) {
            timeUpCalledRef.current = true;
            onTimeUp();
          }
          
          return newValue;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, seconds, onTimeUp, onTick]);

  // Format seconds as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      fontSize: '1.2rem',
      color: seconds < 30 ? '#ff4444' : 'inherit' 
    }}>
      {formatTime(seconds)}
    </div>
  );
}

/**
 * Hook to manage both player timers
 */
export function useGameTimers(
  whiteInitial: number,
  blackInitial: number,
  currentPlayer: 'white' | 'black',
  gamePhase: string
) {
  const whiteTimeRef = useRef(whiteInitial);
  const blackTimeRef = useRef(blackInitial);

  // ✅ Update refs when initial values change (from database load)
  useEffect(() => {
    if (typeof whiteInitial === 'number' && !isNaN(whiteInitial) && whiteInitial >= 0) {
      whiteTimeRef.current = whiteInitial;
    }
  }, [whiteInitial]);

  useEffect(() => {
    if (typeof blackInitial === 'number' && !isNaN(blackInitial) && blackInitial >= 0) {
      blackTimeRef.current = blackInitial;
    }
  }, [blackInitial]);

  // Only active if game is in play (not opening, not finished)
  const isWhiteActive = currentPlayer === 'white' && gamePhase !== 'opening' && gamePhase !== 'game-over';
  const isBlackActive = currentPlayer === 'black' && gamePhase !== 'opening' && gamePhase !== 'game-over';

  const handleWhiteTick = (seconds: number) => {
    whiteTimeRef.current = seconds;
  };

  const handleBlackTick = (seconds: number) => {
    blackTimeRef.current = seconds;
  };

  return {
    whiteTimeRef,
    blackTimeRef,
    isWhiteActive,
    isBlackActive,
    handleWhiteTick,
    handleBlackTick,
  };
}
