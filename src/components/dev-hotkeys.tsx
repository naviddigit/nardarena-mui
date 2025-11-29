'use client';

import { useEffect } from 'react';

// ⚠️ DEVELOPMENT ONLY - Remove this component before production deployment
// This component provides keyboard shortcuts for testing game features

type DevHotkeysProps = {
  onWinTest?: () => void;
  onBothDemoAdd?: () => void;
  onSetStartTest?: () => void;
};

export function DevHotkeys({ onWinTest, onBothDemoAdd, onSetStartTest }: DevHotkeysProps) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onWinTest, onBothDemoAdd, onSetStartTest]);

  return null; // This component doesn't render anything
}
