'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type DiceRollerLandingProps = {
  autoRoll?: boolean;
  rollInterval?: number;
};

export function DiceRollerLanding({ autoRoll = true, rollInterval = 5000 }: DiceRollerLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceBoxRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const loadDiceLibraries = async () => {
      // Check if libraries are already loaded
      if ((window as any).DICE) {
        initializeDice();
        return;
      }

      // Load Three.js, Cannon.js, and Teal.js first
      const script1 = document.createElement('script');
      script1.src = '/libs/three.min.js';
      script1.async = false;
      document.body.appendChild(script1);

      await new Promise((resolve) => {
        script1.onload = resolve;
      });

      const script2 = document.createElement('script');
      script2.src = '/libs/cannon.min.js';
      script2.async = false;
      document.body.appendChild(script2);

      await new Promise((resolve) => {
        script2.onload = resolve;
      });

      const script3 = document.createElement('script');
      script3.src = '/libs/teal.js';
      script3.async = false;
      document.body.appendChild(script3);

      await new Promise((resolve) => {
        script3.onload = resolve;
      });

      // Finally load dice.js
      const script4 = document.createElement('script');
      script4.src = '/dice.js';
      script4.async = false;
      document.body.appendChild(script4);

      await new Promise((resolve) => {
        script4.onload = () => {
          setTimeout(resolve, 100); // Give it a moment to initialize
        };
      });

      initializeDice();
    };

    const initializeDice = () => {
      if (!containerRef.current || !(window as any).DICE) return;

      try {
        const DICE = (window as any).DICE;
        diceBoxRef.current = new DICE.dice_box(containerRef.current);
        diceBoxRef.current.setDice('2d6'); // Roll 2 six-sided dice

        if (autoRoll) {
          // Initial roll after a short delay
          setTimeout(() => {
            rollDice();
          }, 1000);

          // Set up auto-roll interval
          intervalRef.current = setInterval(() => {
            rollDice();
          }, rollInterval);
        }
      } catch (error) {
        console.error('Error initializing dice:', error);
      }
    };

    const rollDice = () => {
      if (diceBoxRef.current && !diceBoxRef.current.rolling) {
        diceBoxRef.current.start_throw();
      }
    };

    loadDiceLibraries();

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
      }
    };
  }, [autoRoll, rollInterval]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        pointerEvents: 'none',
        '& canvas': {
          width: '100% !important',
          height: '100% !important',
        },
      }}
    />
  );
}
