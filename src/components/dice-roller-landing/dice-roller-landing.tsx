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
    if (typeof window === 'undefined') return undefined;

    let mounted = true;

    const loadDiceLibraries = async () => {
      try {
        // Check if libraries are already loaded
        if ((window as any).DICE) {
          if (mounted) initializeDice();
          return;
        }

        // Load Three.js, Cannon.js, and Teal.js first
        const script1 = document.createElement('script');
        script1.src = '/libs/three.min.js';
        script1.async = false;
        document.head.appendChild(script1);

        await new Promise((resolve, reject) => {
          script1.onload = resolve;
          script1.onerror = reject;
        });

        const script2 = document.createElement('script');
        script2.src = '/libs/cannon.min.js';
        script2.async = false;
        document.head.appendChild(script2);

        await new Promise((resolve, reject) => {
          script2.onload = resolve;
          script2.onerror = reject;
        });

        const script3 = document.createElement('script');
        script3.src = '/libs/teal.js';
        script3.async = false;
        document.head.appendChild(script3);

        await new Promise((resolve, reject) => {
          script3.onload = resolve;
          script3.onerror = reject;
        });

        // Finally load dice.js from public folder
        const script4 = document.createElement('script');
        script4.src = '/dice.js';
        script4.async = false;
        document.head.appendChild(script4);

        await new Promise((resolve, reject) => {
          script4.onload = () => {
            setTimeout(resolve, 200); // Give it more time to initialize
          };
          script4.onerror = reject;
        });

        if (mounted) initializeDice();
      } catch (error) {
        console.error('Error loading dice libraries:', error);
      }
    };

    const initializeDice = () => {
      if (!containerRef.current || !(window as any).DICE) {
        console.warn('Cannot initialize dice: container or DICE not available');
        return;
      }

      try {
        const DICE = (window as any).DICE;
        diceBoxRef.current = new DICE.dice_box(containerRef.current);
        diceBoxRef.current.setDice('2d6'); // Roll 2 six-sided dice

        if (autoRoll && mounted) {
          // Initial roll after a short delay
          setTimeout(() => {
            if (mounted) rollDice();
          }, 1500);

          // Set up auto-roll interval
          intervalRef.current = setInterval(() => {
            if (mounted) rollDice();
          }, rollInterval);
        }
      } catch (error) {
        console.error('Error initializing dice:', error);
      }
    };

    const rollDice = () => {
      if (diceBoxRef.current && !diceBoxRef.current.rolling) {
        try {
          diceBoxRef.current.start_throw();
        } catch (error) {
          console.error('Error rolling dice:', error);
        }
      }
    };

    loadDiceLibraries();

    // Cleanup
    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (diceBoxRef.current && diceBoxRef.current.clear) {
        try {
          diceBoxRef.current.clear();
        } catch (error) {
          console.error('Error clearing dice:', error);
        }
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
