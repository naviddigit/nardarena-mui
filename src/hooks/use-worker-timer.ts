import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseWorkerTimerReturn = {
  counting: boolean;
  countdown: number;
  startCountdown: () => void;
  stopCountdown: () => void;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Countdown timer using Web Worker for background execution
 * - Continues running when tab is minimized/inactive
 * - Harder to manipulate (runs in separate thread)
 * - More accurate timing
 */
export function useWorkerTimer(initCountdown: number): UseWorkerTimerReturn {
  const [countdown, setCountdown] = useState(initCountdown);
  const [counting, setCounting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker('/timer-worker.js');

        workerRef.current.onmessage = (e) => {
          const { type, remaining } = e.data;

          if (type === 'TICK') {
            setCountdown(remaining);
            setCounting(remaining > 0 && remaining < initCountdown);
          } else if (type === 'COMPLETE') {
            setCountdown(0);
            setCounting(false);
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Timer Worker Error:', error);
          // Fallback to main thread if worker fails
        };
      } catch (error) {
        console.error('Failed to create Worker:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [initCountdown]);

  const startCountdown = useCallback(() => {
    if (workerRef.current) {
      // Use Web Worker
      workerRef.current.postMessage({
        type: 'START',
        duration: countdown,
      });
      setCounting(true);
    } else {
      // Fallback: Use Date.now() based timer (still better than setInterval)
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + countdown * 1000;
      setCounting(true);

      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }

      fallbackIntervalRef.current = setInterval(() => {
        if (!targetTimeRef.current) return;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));

        setCountdown(remaining);

        if (remaining <= 0) {
          setCounting(false);
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
        }
      }, 100);
    }
  }, [countdown]);

  const stopCountdown = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    setCounting(false);
    startTimeRef.current = null;
    targetTimeRef.current = null;
  }, []);

  return {
    counting,
    countdown,
    startCountdown,
    stopCountdown,
    setCountdown,
  };
}
