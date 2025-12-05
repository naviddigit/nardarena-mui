'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Script from 'next/script';
import { Box } from '@mui/material';

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

export const DiceRoller = forwardRef<any, DiceRollerProps>(
  function DiceRollerComponent({ diceNotation = '2d6', onRollComplete }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<any>(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(0);
    const [isRolling, setIsRolling] = useState(false);

    const handleScriptLoad = () => {
      setScriptsLoaded((prev) => {
        const newCount = prev + 1;
        console.log('🎲 Script loaded, count:', newCount);
        return newCount;
      });
    };

    // Initialize dice box when all scripts are loaded
    useEffect(() => {
      if (scriptsLoaded < 4 || !containerRef.current || boxRef.current) return;
      
      // Wait a bit for scripts to be ready
      const timer = setTimeout(() => {
        console.log('🎲 Checking globals:', {
          DICE: !!window.DICE,
          THREE: !!window.THREE,
          CANNON: !!window.CANNON,
        });
        
        if (!window.DICE || !window.THREE || !window.CANNON) {
          console.error('❌ Scripts not loaded yet, waiting...');
          return;
        }

        try {
          console.log('🎲 Initializing dice box...');
          const box = new window.DICE.dice_box(containerRef.current, { w: 500, h: 300 });
          boxRef.current = box;
          console.log('✅ Dice box initialized!');
        } catch (error) {
          console.error('❌ Failed to initialize dice box:', error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }, [scriptsLoaded]);

    const rollDice = () => {
      if (!boxRef.current || isRolling) return;

      setIsRolling(true);
      const box = boxRef.current;

      try {
        const notation = window.DICE.parse_notation(diceNotation);
        if (notation.set.length === 0) {
          setIsRolling(false);
          return;
        }

        const vector = { x: 0, y: 1 };
        const boost = 500;
        const vectors = box.generate_vectors(notation, vector, boost);

        box.roll(vectors, null, (result: number[]) => {
          const results: DiceResult[] = result.map((value) => ({
            value,
            type: 'd6',
          }));
          setIsRolling(false);
          onRollComplete?.(results);
        });
      } catch (error) {
        console.error('Roll failed:', error);
        setIsRolling(false);
      }
    };

    const setDiceValues = (values: number[]) => {
      if (!boxRef.current) return;

      // Clear first
      boxRef.current.clear();
      
      setTimeout(() => {
        setIsRolling(true);
        const box = boxRef.current;

        try {
          const notation = window.DICE.parse_notation(`${values.length}d6`);
          const vector = { x: 0, y: 1 };
          const boost = 500;
          const vectors = box.generate_vectors(notation, vector, boost);

          // Set target values
          vectors.forEach((v: any, i: number) => {
            if (values[i]) v.value = values[i];
          });

          box.roll(vectors, values, (result: number[]) => {
            const results: DiceResult[] = result.map((value) => ({
              value,
              type: 'd6',
            }));
            setIsRolling(false);
            onRollComplete?.(results);
          });
        } catch (error) {
          console.error('SetDiceValues failed:', error);
          setIsRolling(false);
        }
      }, 100);
    };

    const clearDice = () => {
      if (!boxRef.current) return;
      try {
        boxRef.current.clear();
        setIsRolling(false);
      } catch (error) {
        console.error('Clear failed:', error);
      }
    };

    const reloadDice = () => {
      clearDice();
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      rollDice,
      setDiceValues,
      clearDice,
      reloadDice,
    }));

    return (
      <>
        <Script src="/libs/three.min.js" onLoad={handleScriptLoad} strategy="afterInteractive" />
        <Script src="/libs/cannon.min.js" onLoad={handleScriptLoad} strategy="afterInteractive" />
        <Script src="/libs/teal.js" onLoad={handleScriptLoad} strategy="afterInteractive" />
        <Script src="/dice.js" onLoad={handleScriptLoad} strategy="afterInteractive" />

        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: 300,
            position: 'relative',
            '& canvas': {
              display: 'block',
              width: '100% !important',
              height: '100% !important',
            },
          }}
        />
      </>
    );
  }
);
