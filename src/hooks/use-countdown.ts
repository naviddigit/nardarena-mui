import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseCountdownDateReturn = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export function useCountdownDate(date: Date): UseCountdownDateReturn {
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    setNewTime();
    const interval = setInterval(setNewTime, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setNewTime = () => {
    const startTime = date;

    const endTime = new Date();

    const distanceToNow = startTime.valueOf() - endTime.valueOf();

    const getDays = Math.floor(distanceToNow / (1000 * 60 * 60 * 24));

    const getHours =
      `0${Math.floor((distanceToNow % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}`.slice(-2);

    const getMinutes = `0${Math.floor((distanceToNow % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2);

    const getSeconds = `0${Math.floor((distanceToNow % (1000 * 60)) / 1000)}`.slice(-2);

    setCountdown({
      days: getDays < 10 ? `0${getDays}` : `${getDays}`,
      hours: getHours,
      minutes: getMinutes,
      seconds: getSeconds,
    });
  };

  return countdown;
}

// Usage
// const countdown = useCountdown(new Date('07/07/2022 21:30'));

// ----------------------------------------------------------------------

export type UseCountdownSecondsReturn = {
  counting: boolean;
  countdown: number;
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Improved countdown timer that works even when tab is minimized
 * - Uses Date.now() for accurate time calculation
 * - Combines RAF + setInterval for reliability
 * - Resistant to browser throttling
 */

export function useCountdownSeconds(initCountdown: number): UseCountdownSecondsReturn {
  const [countdown, setCountdown] = useState(initCountdown);
  const initCountdownRef = useRef(initCountdown);

  // Store start time to calculate actual elapsed time (防止 minimize 时停止)
  const startTimeRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Update countdown when initCountdown changes (but only if timer is not running)
  useEffect(() => {
    if (initCountdown !== initCountdownRef.current && !startTimeRef.current) {
      setCountdown(initCountdown);
      initCountdownRef.current = initCountdown;
    }
  }, [initCountdown]);

  // Use requestAnimationFrame + Date.now() for accurate timing even when tab is inactive
  const updateCountdown = useCallback(() => {
    if (!startTimeRef.current || !targetTimeRef.current) return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const remaining = targetTimeRef.current - now;
    const remainingSeconds = Math.ceil(remaining / 1000);

    if (remainingSeconds <= 0) {
      setCountdown(0);
      startTimeRef.current = null;
      targetTimeRef.current = null;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    } else {
      setCountdown(remainingSeconds);
      rafIdRef.current = requestAnimationFrame(updateCountdown);
    }
  }, []);

  const startCountdown = useCallback(() => {
    // Clear any existing timers
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Record start time and calculate target end time
    const now = Date.now();
    startTimeRef.current = now;
    targetTimeRef.current = now + countdown * 1000;

    // Use both RAF (for active tab) and setInterval (fallback for inactive tab)
    rafIdRef.current = requestAnimationFrame(updateCountdown);
    
    // Backup interval for when RAF is throttled (minimized/inactive tab)
    intervalIdRef.current = setInterval(() => {
      if (!rafIdRef.current) {
        // RAF was canceled, use interval instead
        updateCountdown();
      }
    }, 100); // Check every 100ms for more accuracy

  }, [countdown, updateCountdown]);

  const stopCountdown = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    startTimeRef.current = null;
    targetTimeRef.current = null;
  }, []);

  const resetCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(initCountdown);
  }, [stopCountdown, initCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const counting = countdown > 0 && countdown < initCountdown;

  return {
    counting,
    countdown,
    startCountdown,
    stopCountdown,
    resetCountdown,
    setCountdown,
  };
}

// Usage
// const { countdown, startCountdown, counting } = useCountdownSeconds(30);
