'use client';

import { useEffect, useRef, useState } from 'react';

interface GameTimerProps {
  /** Server-calculated time in seconds - THIS IS THE SOURCE OF TRUTH */
  serverSeconds: number;
  /** Whether this timer is currently ticking */
  isActive: boolean;
  /** Callback when timer reaches zero */
  onTimeUp?: () => void;
}

/**
 * ⏱️ Server-Authoritative Timer (Lichess Architecture)
 * 
 * Simple and reliable:
 * - Server calculates time based on lastDoneAt
 * - Frontend displays server value with local countdown
 * - Local countdown runs every second for smooth display
 * - Server sync happens ONLY on important events (Done, Move, Load)
 * 
 * NO complex drift detection, NO periodic polling, NO state conflicts!
 */
export function GameTimer({ serverSeconds, isActive, onTimeUp }: GameTimerProps) {
  const [displaySeconds, setDisplaySeconds] = useState(serverSeconds);
  const lastServerUpdateRef = useRef<number>(Date.now());
  const timeUpCalledRef = useRef<boolean>(false);

  // ✅ SERVER SYNC - Update display when server sends new value
  useEffect(() => {
    console.log(`⏱️ [GameTimer] Server update: ${serverSeconds}s`);
    setDisplaySeconds(serverSeconds);
    lastServerUpdateRef.current = Date.now();
  }, [serverSeconds]);
  
  // 🔍 LOG isActive changes separately
  useEffect(() => {
    console.log(`⏱️ [GameTimer] isActive changed to: ${isActive}`);
  }, [isActive]);

  // ✅ LOCAL COUNTDOWN - Smooth display between server syncs
  useEffect(() => {
    console.log(`⏱️ [GameTimer] LOCAL COUNTDOWN useEffect - isActive: ${isActive}, serverSeconds: ${serverSeconds}`);
    
    if (!isActive) {
      console.log(`⏱️ [GameTimer] Timer PAUSED (isActive=false)`);
      return;
    }

    console.log(`⏱️ [GameTimer] Timer ACTIVE - starting countdown from ${displaySeconds}s`);

    const interval = setInterval(() => {
      setDisplaySeconds(prev => {
        const newValue = Math.max(0, prev - 1);
        console.log(`⏱️ [GameTimer ${serverSeconds}s base] Countdown: ${prev}s → ${newValue}s`);
        
        if (newValue === 0 && onTimeUp && !timeUpCalledRef.current) {
          timeUpCalledRef.current = true;
          onTimeUp();
        }
        
        return newValue;
      });
    }, 1000);

    return () => {
      console.log(`⏱️ [GameTimer ${serverSeconds}s base] Cleaning up interval`);
      clearInterval(interval);
    };
  }, [isActive, onTimeUp, serverSeconds]);

  // Reset timeout flag when time goes back up
  useEffect(() => {
    if (serverSeconds > 0) {
      timeUpCalledRef.current = false;
    }
  }, [serverSeconds]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      fontSize: '1.2rem',
      color: displaySeconds < 30 ? '#ff4444' : 'inherit' 
    }}>
      {formatTime(displaySeconds)}
    </div>
  );
}
