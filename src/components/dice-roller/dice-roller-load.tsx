'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Hidden canvas - just for dice physics
  const containerSize = 1;
  const canvasWidth = 1;

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

        if (!window.DICE || !containerRef.current) {
          console.error('🎲 DICE or container not available');
          return;
        }

        console.log('🎲 Creating dice_box...');
        const box = new window.DICE.dice_box(containerRef.current);
        boxRef.current = box;
        
        console.log('🎲 Dice box ready!');
        setIsReady(true);
      } catch (error) {
        console.error('🎲 Error loading scripts:', error);
      }
    };

    initializeDice();
  }, []);

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
      const vector = { x: -1, y: 0 };
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
    <>
      {/* Hidden canvas for dice physics */}
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }} 
      />
      
      {/* Roll Button */}
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={rollDice}
        disabled={!isReady || isRolling}
        sx={{ 
          minWidth: 80,
        }}
      >
        {!isReady ? 'Loading...' : isRolling ? 'Rolling...' : 'Roll'}
      </Button>
    </>
  );
}
