'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

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

export const DiceRoller = forwardRef<any, DiceRollerProps>(function DiceRollerComponent(
  { diceNotation = '2d6', onRollComplete },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Responsive sizes
  const containerSize = isMobile ? 200 : 280;
  const canvasWidth = isMobile ? 180 : 250;

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    console.log('🎲 Starting to load scripts...');
    
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
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

    const waitForContainer = (): Promise<void> => {
      return new Promise((resolve) => {
        if (containerRef.current) {
          resolve();
          return;
        }
        const checkInterval = setInterval(() => {
          if (containerRef.current) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 3000);
      });
    };

    const initializeDice = async () => {
      try {
        // Load all required scripts with retry
        const maxRetries = 3;
        let attempt = 0;
        
        while (attempt < maxRetries && mounted) {
          try {
            await loadScript('/libs/three.min.js');
            await loadScript('/libs/cannon.min.js');
            await loadScript('/libs/teal.js');
            await loadScript('/dice.js');
            break;
          } catch (error) {
            attempt++;
            console.log(`🎲 Script loading attempt ${attempt} failed, retrying...`);
            if (attempt >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!mounted) return;
        
        console.log('🎲 All scripts loaded, waiting for container...');
        
        // Wait for container to be ready
        await waitForContainer();
        
        if (!mounted) return;

        // Double check everything is available
        if (!window.DICE) {
          throw new Error('DICE library not loaded');
        }
        
        if (!containerRef.current) {
          throw new Error('Container not available');
        }

        console.log('🎲 Creating dice_box...');
        
        // Add small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted || !containerRef.current) return;
        
        const box = new window.DICE.dice_box(containerRef.current);
        
        if (!box) {
          throw new Error('Failed to create dice box');
        }
        
        boxRef.current = box;
        
        console.log('🎲 Dice box ready!');
        if (mounted) {
          setIsReady(true);
          setHasFailed(false);
        }
      } catch (error) {
        console.error('🎲 Error initializing dice:', error);
        
        if (mounted) {
          setInitAttempts(prev => prev + 1);
          
          // Retry up to 3 times with exponential backoff
          if (initAttempts < 3) {
            const delay = Math.pow(2, initAttempts) * 1000;
            console.log(`🎲 Retrying initialization in ${delay}ms...`);
            initTimeout = setTimeout(() => {
              if (mounted) initializeDice();
            }, delay);
          } else {
            console.error('🎲 Failed to initialize dice after multiple attempts');
            setHasFailed(true);
          }
        }
      }
    };

    initializeDice();
    
    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, [initAttempts]);

  const rollDice = () => {
    // Comprehensive checks before rolling
    if (!isReady) {
      console.error('🎲 Dice system not ready yet');
      return;
    }
    
    if (isRolling) {
      console.log('🎲 Already rolling, please wait');
      return;
    }
    
    if (!boxRef.current) {
      console.error('🎲 Dice box not initialized');
      // Try to reinitialize
      setIsReady(false);
      setInitAttempts(0);
      return;
    }
    
    if (!window.DICE) {
      console.error('🎲 DICE library not available');
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
      
      if (!notation || notation.set.length === 0) {
        console.error('🎲 Invalid dice notation');
        setIsRolling(false);
        return;
      }

      // Generate vectors for dice throw
      const vector = { x: -1, y: 0 };
      const boost = 500;
      const vectors = box.generate_vectors(notation, vector, boost);
      
      if (!vectors || vectors.length === 0) {
        console.error('🎲 Failed to generate vectors');
        setIsRolling(false);
        return;
      }
      
      console.log('🎲 Generated vectors:', vectors);

      // Roll with timeout fallback
      const rollTimeout = setTimeout(() => {
        console.error('🎲 Roll timeout - forcing completion');
        setIsRolling(false);
        // Generate random fallback results
        const fallbackResults = notation.set.map(() => Math.floor(Math.random() * 6) + 1);
        const results: DiceResult[] = fallbackResults.map((value) => ({
          value,
          type: 'd6',
        }));
        onRollComplete?.(results);
      }, 5000);

      box.roll(vectors, null, (result: number[]) => {
        clearTimeout(rollTimeout);
        console.log('🎲 Roll complete! Results:', result);
        
        if (!result || result.length === 0) {
          console.error('🎲 Invalid roll result');
          setIsRolling(false);
          return;
        }
        
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
      
      // Fallback: generate random results
      try {
        const diceCount = diceNotation.match(/(\d+)d/)?.[1] || '2';
        const count = parseInt(diceCount, 10);
        const fallbackResults = Array.from({ length: count }, () => 
          Math.floor(Math.random() * 6) + 1
        );
        const results: DiceResult[] = fallbackResults.map((value) => ({
          value,
          type: 'd6',
        }));
        console.log('🎲 Using fallback results:', fallbackResults);
        onRollComplete?.(results);
      } catch (fallbackError) {
        console.error('🎲 Fallback also failed:', fallbackError);
      }
    }
  };

  // Expose rollDice and clearDice methods via ref
  useImperativeHandle(ref, () => ({
    rollDice,
    clearDice: () => {
      if (boxRef.current && boxRef.current.clear) {
        console.log('🎲 Clearing dice...');
        boxRef.current.clear();
      }
    },
  }));

  return (
    <Box sx={{ position: 'relative', width: containerSize, height: containerSize }}>
      <Box
        ref={containerRef}
        sx={{
          width: canvasWidth,
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          '& canvas': {
            display: 'block',
          },
        }}
      />
    </Box>
  );
});
