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
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
};

export function useCountdownSeconds(initCountdown: number): UseCountdownSecondsReturn {
  const [countdown, setCountdown] = useState(initCountdown);

  const remainingSecondsRef = useRef(countdown);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    remainingSecondsRef.current = countdown;

    intervalIdRef.current = setInterval(() => {
      remainingSecondsRef.current -= 1;

      if (remainingSecondsRef.current <= 0) {
        remainingSecondsRef.current = 0;
        setCountdown(0);
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      } else {
        setCountdown(remainingSecondsRef.current);
      }
    }, 1000);
  }, [countdown]);

  const stopCountdown = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const counting = countdown > 0 && countdown < initCountdown;

  return {
    counting,
    countdown,
    startCountdown,
    stopCountdown,
    setCountdown,
  };
}

// Usage
// const { countdown, startCountdown, counting } = useCountdownSeconds(30);
