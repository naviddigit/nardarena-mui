'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';

export type DiceResult = {
  value: number;
  type: string;
};

type DiceRollerProps = {
  diceNotation?: string;
  onRollComplete?: (results: DiceResult[]) => void;
};

declare global {
  interface Window {
    DICE: any;
    THREE: any;
    CANNON: any;
    $t: any;
  }
}

export function DiceRoller({ diceNotation = '2d6', onRollComplete }: DiceRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    console.log('🎲 Starting to load scripts...');
    
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          console.log('🎲 Script already loaded:', src);
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => {
          console.log('✅ Loaded:', src);
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Failed to load:', src);
          reject(new Error(`Failed to load ${src}`));
        };
        document.body.appendChild(script);
      });
    };

    const initializeDice = async () => {
      try {
        await loadScript('/libs/three.min.js');
        await loadScript('/libs/cannon.min.js');
        await loadScript('/libs/teal.js');
        await loadScript('/dice.js');
        
        console.log('🎲 All scripts loaded, checking window objects...');
        console.log('🎲 Window:', { DICE: !!window.DICE, THREE: !!window.THREE, CANNON: !!window.CANNON, $t: !!window.$t });

        if (!window.DICE || !containerRef.current) {
          console.error('🎲 DICE or container not available');
          return;
        }

        console.log('🎲 Creating dice_box...');
        const box = new window.DICE.dice_box(containerRef.current);
        box.diceToRoll = diceNotation;
        boxRef.current = box;
        
        console.log('🎲 Dice box ready!');
        setIsReady(true);
      } catch (error) {
        console.error('🎲 Error loading scripts:', error);
      }
    };

    initializeDice();
  }, [diceNotation]);

  const rollDice = () => {
    if (!boxRef.current || isRolling || !isReady) {
      console.log('🎲 Cannot roll:', { hasBox: !!boxRef.current, isRolling, isReady });
      return;
    }

    console.log('🎲 Rolling dice:', diceNotation);
    setIsRolling(true);

    // Play dice roll sound
    try {
      const audio = new Audio('/dice-main/assets/nc93322.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Audio not supported:', error);
    }

    const box = boxRef.current;

    try {
      const notation = window.DICE.parse_notation(diceNotation);
      console.log('🎲 Parsed notation:', notation);
      
      if (notation.set.length === 0) {
        console.log('🎲 No dice to roll');
        setIsRolling(false);
        return;
      }

      // Generate vectors for dice throw
      const vector = { x: 0, y: 1 };
      const boost = 500;
      const vectors = box.generate_vectors(notation, vector, boost);
      
      console.log('🎲 Generated vectors:', vectors);

      // Roll!
      box.roll(vectors, null, (result: number[]) => {
        console.log('🎲 Roll complete! Results:', result);
        const results: DiceResult[] = result.map((value) => ({
          value,
          type: 'd6',
        }));
        setIsRolling(false);
        onRollComplete?.(results);
      });
    } catch (error) {
      console.error('🎲 Error rolling dice:', error);
      setIsRolling(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'background.neutral',
          borderRadius: 2,
          overflow: 'hidden',
          '& canvas': {
            display: 'block',
          },
        }}
      />
      <Button
        variant="contained"
        onClick={rollDice}
        disabled={!isReady || isRolling}
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          boxShadow: 4,
          '&:hover': {
            boxShadow: 8,
            transform: 'translateX(-50%) translateY(-2px)',
          },
          '&:active': {
            transform: 'translateX(-50%) translateY(0)',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {!isReady ? 'Loading Dice...' : isRolling ? 'Rolling...' : 'Roll Dice'}
      </Button>
    </Box>
  );
}
