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
  initialDiceValues?: number[];
  currentPlayer?: 'white' | 'black'; // جهت پرتاب تاس بر اساس بازیکن
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
  { diceNotation = '2d6', onRollComplete, initialDiceValues, currentPlayer = 'white' },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  const [lastDiceValues, setLastDiceValues] = useState<number[] | null>(initialDiceValues || null);
  const hasRestoredDiceRef = useRef(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Responsive sizes - container and canvas should match to prevent overflow
  const containerSize = isMobile ? 150 : 170;
  const canvasWidth = isMobile ? 180 : 260;
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => {
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
            if (attempt >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!mounted) return;
        
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
        
        // Add small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted || !containerRef.current) return;
        
        const box = new window.DICE.dice_box(containerRef.current);
        
        if (!box) {
          throw new Error('Failed to create dice box');
        }
        
        boxRef.current = box;
        
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

  // ✅ Restore dice after page refresh (show last rolled dice without animation)
  useEffect(() => {
    if (!isReady || hasRestoredDiceRef.current) {
      return;
    }

    // Check if we have dice values to restore (from props or state)
    const diceToRestore = initialDiceValues || lastDiceValues;
    
    if (!diceToRestore || diceToRestore.length === 0) {
      return;
    }

    console.log('🎲 Restoring dice after refresh:', diceToRestore);
    hasRestoredDiceRef.current = true;
    
    // Show dice without animation after a short delay
    setTimeout(() => {
      showStaticDice(diceToRestore);
    }, 500);
  }, [isReady, initialDiceValues, lastDiceValues]);

  const rollDice = () => {
    // Comprehensive checks before rolling
    console.log('🎲 [rollDice] Called - isReady:', isReady, 'isRolling:', isRolling);
    
    if (!isReady) {
      console.error('🎲 [rollDice] Dice system not ready yet');
      return;
    }
    
    if (isRolling) {
      console.warn('🎲 [rollDice] Already rolling, ignoring');
      return;
    }
    
    if (!boxRef.current) {
      console.error('🎲 [rollDice] Dice box not initialized');
      // Try to reinitialize
      setIsReady(false);
      setInitAttempts(0);
      return;
    }
    
    if (!window.DICE) {
      console.error('🎲 [rollDice] DICE library not available');
      return;
    }
    
    console.log('🎲 [rollDice] Starting roll...');
    setIsRolling(true);
    
    // ✅ For opening rolls (1d6), override prepare function AND clear function to keep existing dice
    if (diceNotation === '1d6' && boxRef.current) {
      const originalPrepare = boxRef.current.prepare_dices_for_roll;
      const originalClear = boxRef.current.clear;
      
      // Override prepare to not clear existing dice
      boxRef.current.prepare_dices_for_roll = function(vectors: any) {
        this.iteration = 0;
        for (const i in vectors) {
          this.create_dice(vectors[i].set, vectors[i].pos, vectors[i].velocity,
                  vectors[i].angle, vectors[i].axis);
        }
      };
      
      // Override clear to do nothing (keep existing dice)
      boxRef.current.clear = function() {
        // Keep existing dice during opening roll
      };
      
      // Restore original functions after roll
      setTimeout(() => {
        if (boxRef.current) {
          boxRef.current.prepare_dices_for_roll = originalPrepare;
          boxRef.current.clear = originalClear;
        }
      }, 200);
    }
    
    setIsRolling(true);

    // Play dice roll sound
    try {
      const audio = new Audio('/dice-main/assets/dice-rolls.m4a');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      // Audio not supported
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
      // ✅ ارسال currentPlayer برای تعیین جهت پرتاب (اولین generate_vectors)
      const vectors = box.generate_vectors(notation, vector, boost, currentPlayer);
      
      if (!vectors || vectors.length === 0) {
        console.error('🎲 Failed to generate vectors');
        setIsRolling(false);
        return;
      }
      
      // Roll with timeout fallback
      const rollTimeout = setTimeout(() => {
        console.error('🎲 Roll timeout - forcing completion');
        setIsRolling(false);
        // Generate random fallback results
        const fallbackResults = notation.set.map(() => Math.floor(Math.random() * 6) + 1);
        const results: DiceResult[] = fallbackResults.map((value: number) => ({
          value,
          type: 'd6',
        }));
        onRollComplete?.(results);
      }, 5000);

      box.roll(vectors, null, (result: number[]) => {
        clearTimeout(rollTimeout);
        
        // ✅ For opening rolls (1d6), box.roll returns ALL dice on scene
        // We only want the LAST die that was just rolled
        let actualResult = result;
        const expectedCount = parseInt(diceNotation.match(/(\d+)d/)?.[1] || '1', 10);
        if (diceNotation === '1d6' && result.length > expectedCount) {
          actualResult = result.slice(-expectedCount); // Take only the last N dice
        }
        
        if (!actualResult || actualResult.length === 0) {
          console.error('🎲 Invalid roll result');
          setIsRolling(false);
          return;
        }
        
        const results: DiceResult[] = actualResult.map((value) => ({
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
        onRollComplete?.(results);
      } catch (fallbackError) {
        console.error('🎲 Fallback also failed:', fallbackError);
      }
    }
  };

  // Force dice to show specific values (for testing/debugging)
  const setDiceValues = (values: number[], skipAnimation = false) => {
    console.log('🎲 setDiceValues called:', { values, diceNotation, valuesLength: values.length, skipAnimation });
    
    // ✅ Save dice values for restoration after refresh
    setLastDiceValues(values);
    
    if (!isReady) {
      console.error('🎲 Dice system not ready yet');
      return;
    }
    
    if (isRolling) {
      // Already rolling
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

    // ✅ For opening rolls (1d6), check if we need to keep existing dice
    // Only keep dice if there's already 1 die on board (second opening roll)
    const shouldKeepExistingDice = diceNotation === '1d6' && boxRef.current && boxRef.current.dices && boxRef.current.dices.length === 1;
    
    if (shouldKeepExistingDice) {
      console.log('🎲 Second opening roll - keeping first die');
      const originalPrepare = boxRef.current.prepare_dices_for_roll;
      const originalClear = boxRef.current.clear;
      
      // Override prepare to not clear existing dice
      boxRef.current.prepare_dices_for_roll = function(vectors: any) {
        this.iteration = 0;
        for (const i in vectors) {
          this.create_dice(vectors[i].set, vectors[i].pos, vectors[i].velocity,
                  vectors[i].angle, vectors[i].axis);
        }
      };
      
      // Override clear to do nothing (keep existing dice)
      boxRef.current.clear = function() {
        console.log('🎲 Clear blocked - keeping first die');
      };
      
      // Restore original functions after roll
      setTimeout(() => {
        if (boxRef.current) {
          boxRef.current.prepare_dices_for_roll = originalPrepare;
          boxRef.current.clear = originalClear;
        }
      }, 200);
    } else if (diceNotation === '1d6') {
      console.log('🎲 First opening roll - should have NO dice on board. Current dice:', boxRef.current?.dices?.length || 0);
    }
    
    setIsRolling(true);

    // Play dice roll sound
    try {
      const audio = new Audio('/dice-main/assets/dice-rolls.m4a');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      // Audio not supported
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
      // ✅ ارسال currentPlayer برای تعیین جهت پرتاب (دومین generate_vectors)
      const vectors = box.generate_vectors(notation, vector, boost, currentPlayer);
      
      if (!vectors || vectors.length === 0) {
        console.error('🎲 Failed to generate vectors');
        setIsRolling(false);
        return;
      }

      console.log('🎲 [setDiceValues] Vectors generated:', { 
        count: vectors.length, 
        diceNotation, 
        valuesLength: values.length 
      });

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

      // ✅ Save current dice count BEFORE roll (for fixing faces later)
      // ⚠️ SPECIAL CASE: If rolling 2d6 but box has 0 dice (after opening clear), 
      //    we should expect 2 NEW dice, not slice from old ones
      let diceCountBeforeRoll = box.dices ? box.dices.length : 0;
      
      console.log(`🔍 Before roll: diceNotation=${diceNotation}, box.dices.length=${diceCountBeforeRoll}`);
      
      // ✅ FIX: If we're rolling 2d6 and box is empty (after opening clear), set count to 0
      if (diceNotation === '2d6' && diceCountBeforeRoll < 2) {
        console.log(`🔧 Rolling 2d6 after clear: diceCountBeforeRoll reset from ${diceCountBeforeRoll} → 0`);
        diceCountBeforeRoll = 0;
      }

      // Pass forced values as the second parameter
      // IMPORTANT: Use 'values' parameter directly, NOT the 'result' from callback
      // because shift_dice_faces in dice.js doesn't always work correctly
      
      // ✅ If skipAnimation, don't call box.roll at all - just create dice and show result
      if (skipAnimation) {
        // Create dice without rolling
        box.prepare_dices_for_roll(vectors);
        
        // Emulate throw to get settled positions and rotations
        const currentValues = box.emulate_throw();
        console.log('🎲 Emulated throw result:', currentValues);
        
        // Now shift faces to show correct values
        box.dices.forEach((die: any, i: number) => {
          const currentValue = currentValues[i];
          const targetValue = values[i];
          
          if (currentValue === targetValue) return;
          
          // Shift faces using same logic as dice.js
          const num = targetValue - currentValue;
          const geom = die.geometry.clone();
          
          for (let j = 0; j < geom.faces.length; j++) {
            let matindex = geom.faces[j].materialIndex;
            if (matindex === 0) continue;
            
            matindex += num - 1;
            while (matindex > 6) matindex -= 6;
            while (matindex < 1) matindex += 6;
            
            geom.faces[j].materialIndex = matindex + 1;
          }
          
          die.geometry = geom;
        });
        
        // Update visual positions to match physics
        box.dices.forEach((die: any) => {
          die.position.copy(die.body.position);
          die.quaternion.copy(die.body.quaternion);
        });
        
        // Force render
        box.renderer.render(box.scene, box.camera);
        
        // Call completion immediately
        clearTimeout(rollTimeout);
        setIsRolling(false);
        
        const results: DiceResult[] = values.map((value) => ({
          value,
          type: 'd6',
        }));
        
        onRollComplete?.(results);
        return;
      }
      
      box.roll(vectors, values, (result: number[]) => {
        clearTimeout(rollTimeout);
        
        // ✅ Skip animation - stop physics immediately
        if (skipAnimation && box.running) {
          box.running = false; // Stop animation loop
          
          // Position dice at final settled positions
          box.dices.forEach((die: any, i: number) => {
            die.body.position.set(
              (i - (box.dices.length - 1) / 2) * 1.5,
              0.5,
              0
            );
            die.body.velocity.set(0, 0, 0);
            die.body.angularVelocity.set(0, 0, 0);
            die.position.copy(die.body.position);
            die.dice_stopped = true;
          });
          
          // Force render
          box.renderer.render(box.scene, box.camera);
        }
        
        // ✅ For opening rolls (1d6), box.roll returns ALL dice on scene
        // We only want the LAST die that was just rolled
        let actualResult = result;
        if (diceNotation === '1d6' && result.length > values.length) {
          actualResult = result.slice(-values.length); // Take only the last N dice
        }
        
        // ✅ IMMEDIATE FIX: Correct dice faces RIGHT NOW in callback, before rendering
        const requestedSorted = [...values].sort().join(',');
        const receivedSorted = [...actualResult].sort().join(',');
        
        if (requestedSorted !== receivedSorted) {
          console.log(`🎲 Old: [${actualResult}] → New: [${values}]`);
          
          // Get the dice that were just rolled
          const allDice = box.dices;
          const lastNDice = allDice.slice(-actualResult.length);
          
          for (let i = 0; i < lastNDice.length; i++) {
            const die = lastNDice[i];
            const physicsValue = actualResult[i];
            const backendValue = values[i];
            
            if (physicsValue !== backendValue) {
              const geom = die.geometry;
              const shift = backendValue - physicsValue;
              
              // Correct each face's materialIndex
              for (let j = 0; j < geom.faces.length; j++) {
                const face = geom.faces[j];
                if (face.materialIndex === 0) continue; // Skip non-face materials
                
                // Apply shift with wrapping (1-6 for d6)
                let newMatIndex = face.materialIndex - 1 + shift;
                while (newMatIndex > 6) newMatIndex -= 6;
                while (newMatIndex < 1) newMatIndex += 6;
                
                face.materialIndex = newMatIndex + 1;
              }
              
              geom.elementsNeedUpdate = true;
            }
          }
          
          // Force immediate re-render
          box.renderer.render(box.scene, box.camera);
        } else {
          console.log(`🎲 Dice: [${values}]`);
        }
        
        setIsRolling(false);
        
        // ✅ ALWAYS use the values we requested from backend, NOT what dice.js physics returned
        // This ensures anti-cheat: dice values come from backend, not client physics
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
      // Remove old dice.js script
      const oldScript = document.querySelector('script[src="/dice.js"]');
      if (oldScript) {
        oldScript.remove();
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

  // ✅ Show dice without animation (skip animation, show result immediately)
  const showStaticDice = (values: number[]) => {
    if (!isReady || !boxRef.current || !window.DICE) return;

    // Roll with skipAnimation = true
    setDiceValues(values, true);
  };

  // Expose rollDice, clearDice, setDiceValues, showStaticDice, reloadDiceScript and isReady via ref
  useImperativeHandle(ref, () => ({
    rollDice,
    setDiceValues,
    showStaticDice,
    clearDice: () => {
      console.log('🎲 [clearDice] Clearing dice and resetting state');
      if (boxRef.current && boxRef.current.clear) {
        boxRef.current.clear();
      }
      // ✅ Reset isRolling state to allow new rolls
      setIsRolling(false);
      setLastDiceValues(null);
    },
    reloadDice: reloadDiceScript,
    isReady,
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
            width: '100% !important',
            height: '100% !important',
            maxWidth: '100%',
            maxHeight: '100%',
          },
        }}
      />
    </Box>
  );
});
