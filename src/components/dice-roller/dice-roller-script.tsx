'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
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
  const [scriptsLoaded, setScriptsLoaded] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const handleScriptLoad = () => {
    const newCount = scriptsLoaded + 1;
    console.log('🎲 Script loaded, count:', newCount);
    setScriptsLoaded(newCount);
  };

  // Initialize dice box when all scripts are loaded
  useEffect(() => {
    console.log('🎲 useEffect triggered:', { scriptsLoaded, hasContainer: !!containerRef.current, hasBox: !!boxRef.current });
    
    if (scriptsLoaded < 4 || !containerRef.current || boxRef.current) return;
    if (!window.DICE || !window.THREE || !window.CANNON) {
      console.log('🎲 Missing globals:', { DICE: !!window.DICE, THREE: !!window.THREE, CANNON: !!window.CANNON });
      return;
    }

    console.log('🎲 Initializing DICE box...');
    const container = containerRef.current;
    
    try {
      const box = new window.DICE.dice_box(container);
      box.diceToRoll = diceNotation;
      boxRef.current = box;
      console.log('🎲 DICE box initialized successfully');
    } catch (error) {
      console.error('🎲 Error initializing DICE:', error);
    }
  }, [scriptsLoaded, diceNotation]);

  const rollDice = () => {
    if (!boxRef.current || isRolling) return;

    console.log('🎲 Rolling dice:', diceNotation);
    setIsRolling(true);

    const box = boxRef.current;
    const container = containerRef.current!;

    // Simple swipe simulation (like original)
    const vector = { x: 0, y: 1 };
    const dist = 100;
    const boost = 500;

    try {
      // Call the throw function from original dice.js
      const notation = window.DICE.parse_notation(diceNotation);
      if (notation.set.length === 0) {
        setIsRolling(false);
        return;
      }

      const vectors = box.generate_vectors(notation, vector, boost);
      
      box.roll(vectors, null, (result: number[]) => {
        console.log('🎲 Roll complete:', result);
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
      {/* Load scripts in order */}
      <Script src="/libs/three.min.js" onLoad={handleScriptLoad} onError={(e) => console.error('❌ three.min.js failed', e)} />
      <Script src="/libs/cannon.min.js" onLoad={handleScriptLoad} onError={(e) => console.error('❌ cannon.min.js failed', e)} />
      <Script src="/libs/teal.js" onLoad={handleScriptLoad} onError={(e) => console.error('❌ teal.js failed', e)} />
      <Script src="/dice.js" onLoad={handleScriptLoad} onError={(e) => console.error('❌ dice.js failed', e)} />

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
          disabled={isRolling || scriptsLoaded < 4}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {scriptsLoaded < 4 ? 'Loading...' : isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </Box>
    </>
  );
}
