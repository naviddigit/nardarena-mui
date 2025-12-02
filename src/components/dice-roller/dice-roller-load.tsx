/**
 * ⛔ CRITICAL - DO NOT MODIFY AFTER TESTING! ⛔
 * 
 * Dice roller component with 3D physics rendering.
 * LOCKED after fixing dice desync and clear issues.
 * 
 * Key fixes implemented:
 * 1. setDiceValues() always clears old dice first
 * 2. Increased clear delay to 500ms for AI rolls
 * 3. Always use requested values, NOT callback results from dice.js
 * 
 * DO NOT modify unless there's a clear, reproducible bug!
 */

'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
  const containerSize = isMobile ? 150 : 170;
  const canvasWidth = isMobile ? 180 : 260;

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

  // Force dice to show specific values (for testing/debugging)
  const setDiceValues = (values: number[]) => {
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
      return;
    }
    
    if (!window.DICE) {
      console.error('🎲 DICE library not available');
      return;
    }

    console.log('🎲 Forcing dice values:', values);
    
    // ✅ CRITICAL: Clear any existing dice first!
    if (boxRef.current.clear) {
      console.log('🎲 Clearing old dice before setting new values');
      boxRef.current.clear();
    }
    
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

      // Roll with forced values (pass as second parameter to box.roll)
      const rollTimeout = setTimeout(() => {
        console.error('🎲 Roll timeout - forcing completion');
        setIsRolling(false);
        const results: DiceResult[] = values.map((value) => ({
          value,
          type: 'd6',
        }));
        onRollComplete?.(results);
      }, 5000);

      // Pass forced values as the second parameter
      // IMPORTANT: Use 'values' parameter directly, NOT the 'result' from callback
      // because shift_dice_faces in dice.js doesn't always work correctly
      box.roll(vectors, values, (result: number[]) => {
        clearTimeout(rollTimeout);
        
        // ⚠️ Check if dice.js returned wrong values (it often does!)
        const requestedSorted = [...values].sort().join(',');
        const receivedSorted = [...result].sort().join(',');
        
        if (requestedSorted !== receivedSorted) {
          console.warn('⚠️ dice.js returned wrong values!');
          console.warn('   Requested:', values, 'Got:', result);
          console.warn('   ✅ Using requested values (correct)');
        } else {
          console.log('🎲 Roll complete! Requested:', values, 'Got:', result);
        }
        
        setIsRolling(false);
        
        // ✅ ALWAYS use the values we requested, NOT what dice.js returned
        // dice.js shift_dice_faces doesn't work reliably!
        const results: DiceResult[] = values.map((value) => ({
          value,
          type: 'd6',
        }));
        
        onRollComplete?.(results);
      });
    } catch (error) {
      console.error('🎲 Error forcing dice values:', error);
      setIsRolling(false);
    }
  };

  // Reload dice.js file (for hot-reload during development)
  const reloadDiceScript = async () => {
    try {
      console.log('🔄 Reloading dice.js...');
      
      // Remove old dice.js script
      const oldScript = document.querySelector('script[src="/dice.js"]');
      if (oldScript) {
        oldScript.remove();
        console.log('🗑️ Removed old dice.js');
      }
      
      // Clear current box
      if (boxRef.current && boxRef.current.clear) {
        boxRef.current.clear();
      }
      boxRef.current = null;
      setIsReady(false);
      
      // Clear window.DICE to force reload (set to undefined instead of delete)
      if (window.DICE) {
        window.DICE = undefined;
      }
      
      // Remove old canvas from container
      if (containerRef.current) {
        const oldCanvas = containerRef.current.querySelector('canvas');
        if (oldCanvas) {
          oldCanvas.remove();
          console.log('🗑️ Removed old canvas');
        }
      }
      
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load new dice.js with cache busting
      const timestamp = new Date().getTime();
      const script = document.createElement('script');
      script.src = `/dice.js?v=${timestamp}`;
      script.async = false;
      
      script.onload = async () => {
        console.log('✅ dice.js reloaded');
        
        // Wait for DICE to be available
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!window.DICE) {
          console.error('❌ DICE not available after reload');
          return;
        }
        
        // Reinitialize dice box
        if (containerRef.current) {
          try {
            const box = new window.DICE.dice_box(containerRef.current);
            box.setDice(diceNotation);
            boxRef.current = box;
            setIsReady(true);
            setHasFailed(false);
            console.log('✅ Dice box reinitialized and ready!');
          } catch (error) {
            console.error('❌ Failed to reinitialize dice box:', error);
          }
        }
      };
      
      script.onerror = () => {
        console.error('❌ Failed to reload dice.js');
      };
      
      document.body.appendChild(script);
    } catch (error) {
      console.error('❌ Error reloading dice.js:', error);
    }
  };

  // Expose rollDice, clearDice, setDiceValues, and reloadDiceScript methods via ref
  useImperativeHandle(ref, () => ({
    rollDice,
    setDiceValues,
    clearDice: () => {
      if (boxRef.current && boxRef.current.clear) {
        console.log('🎲 Clearing dice...');
        boxRef.current.clear();
      }
    },
    reloadDice: reloadDiceScript,
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
