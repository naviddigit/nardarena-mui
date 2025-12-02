'use client';

import { useEffect } from 'react';

// ⚠️ DEVELOPMENT ONLY - Remove this component before production deployment
// This component provides keyboard shortcuts for testing game features

type DevHotkeysProps = {
  onWinTest?: () => void;
  onBothDemoAdd?: () => void;
  onSetStartTest?: () => void;
  onDiceRoll?: () => void;
  onDiceRefresh?: () => void;
  onDoubleSix?: () => void; // Ctrl+6: Force dice to show 6,6
};

export function DevHotkeys({ onWinTest, onBothDemoAdd, onSetStartTest, onDiceRoll, onDiceRefresh, onDoubleSix }: DevHotkeysProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+1: Trigger win effect for testing
      if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        onWinTest?.();
      }
      
      // Ctrl+2: Add 1 checker to both white and black bear-off zones
      if (event.ctrlKey && event.key === '2') {
        event.preventDefault();
        onBothDemoAdd?.();
      }
      
      // Ctrl+3: Test set start animation
      if (event.ctrlKey && event.key === '3') {
        event.preventDefault();
        onSetStartTest?.();
      }
      
      // Ctrl+4: Roll dice
      if (event.ctrlKey && event.key === '4') {
        event.preventDefault();
        onDiceRoll?.();
      }
      
      // Ctrl+5: Refresh/clear dice
      if (event.ctrlKey && event.key === '5') {
        event.preventDefault();
        onDiceRefresh?.();
      }
      
      // Ctrl+6: Force dice to show 6,6 (for testing)
      if (event.ctrlKey && event.key === '6') {
        event.preventDefault();
        onDoubleSix?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onWinTest, onBothDemoAdd, onSetStartTest, onDiceRoll, onDiceRefresh, onDoubleSix]);

  return null; // This component doesn't render anything
}
