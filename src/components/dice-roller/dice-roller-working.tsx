'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
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
  }
}

export const DiceRoller = forwardRef<any, DiceRollerProps>(
  function DiceRollerComponent({ diceNotation = '2d6', onRollComplete }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<any>(null);
    const scriptsLoadedRef = useRef(false);
    const initializingRef = useRef(false);
    const [isRolling, setIsRolling] = useState(false);

    // Load scripts and initialize dice box
    useEffect(() => {
    //   if (scriptsLoadedRef.current || initializingRef.current || !containerRef.current) return;
      if (scriptsLoadedRef.current || !containerRef.current) return;

      initializingRef.current = true;
      let mounted = true;

      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Check if already loaded
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      };

      const init = async () => {
        try {
          // Load scripts in order
          await loadScript('/libs/three.min.js');
          await loadScript('/libs/cannon.min.js');
          await loadScript('/libs/teal.js');
          await loadScript('/dice.js');

          // Wait for globals to be available
          await new Promise((resolve) => {
            const check = () => {
              if (window.DICE && window.THREE && window.CANNON) {
                resolve(true);
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });

          if (!mounted || !containerRef.current) return;

          console.log('🎲 Initializing dice box...');
          const box = new window.DICE.dice_box(containerRef.current, { w: 500, h: 300 });
          boxRef.current = box;
          scriptsLoadedRef.current = true;
          console.log('✅ Dice box ready!');
        } catch (error) {
          console.error('❌ Init failed:', error);
        }
      };

      init();

      return () => {
        mounted = false;
      };
    }, []);

    const rollDice = () => {
      if (!boxRef.current || isRolling) {
        console.log('⚠️ Cannot roll - box not ready or already rolling');
        return;
      }

      console.log('🎲 Rolling dice...');
      setIsRolling(true);

      try {
        const notation = window.DICE.parse_notation(diceNotation);
        const vector = { x: 0, y: 1 };
        const boost = 500;
        const vectors = boxRef.current.generate_vectors(notation, vector, boost);

        boxRef.current.roll(vectors, null, (result: number[]) => {
          console.log('🎲 Roll result:', result);
          const results: DiceResult[] = result.map((value) => ({
            value,
            type: 'd6',
          }));
          setIsRolling(false);
          onRollComplete?.(results);
        });
      } catch (error) {
        console.error('❌ Roll failed:', error);
        setIsRolling(false);
      }
    };

    const setDiceValues = (values: number[]) => {
      if (!boxRef.current) {
        console.log('⚠️ Cannot set values - box not ready');
        return;
      }

      console.log('🎲 Setting dice values:', values);
      boxRef.current.clear();
      
      setTimeout(() => {
        setIsRolling(true);

        try {
          const notation = window.DICE.parse_notation(`${values.length}d6`);
          const vector = { x: 0, y: 1 };
          const boost = 500;
          const vectors = boxRef.current.generate_vectors(notation, vector, boost);

          // Set target values
          vectors.forEach((v: any, i: number) => {
            if (values[i]) v.value = values[i];
          });

          boxRef.current.roll(vectors, values, (result: number[]) => {
            console.log('🎲 Set values result:', result);
            const results: DiceResult[] = result.map((value) => ({
              value,
              type: 'd6',
            }));
            setIsRolling(false);
            onRollComplete?.(results);
          });
        } catch (error) {
          console.error('❌ Set values failed:', error);
          setIsRolling(false);
        }
      }, 150);
    };

    const clearDice = () => {
      if (!boxRef.current) return;
      console.log('🧹 Clearing dice');
      try {
        boxRef.current.clear();
        setIsRolling(false);
      } catch (error) {
        console.error('❌ Clear failed:', error);
      }
    };

    const reloadDice = () => {
      clearDice();
    };

    // Expose methods
    useImperativeHandle(ref, () => ({
      rollDice,
      setDiceValues,
      clearDice,
      reloadDice,
    }));

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          '& canvas': {
            display: 'block',
          },
        }}
      />
    );
  }
);
