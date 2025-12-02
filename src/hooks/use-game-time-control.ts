import { useState, useEffect } from 'react';
import { gamePersistenceAPI } from 'src/services/game-persistence-api';

/**
 * Hook to load game time control from database
 * Returns the time control value (defaults to 1800 if not loaded yet)
 */
export function useGameTimeControl(): number {
  const [timeControl, setTimeControl] = useState(1800); // Default 30 minutes
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      gamePersistenceAPI
        .getGameTimeControl()
        .then((time) => {
          console.log('⏱️ Time control loaded from database:', time, 'seconds');
          setTimeControl(time);
          setLoaded(true);
        })
        .catch((err) => {
          console.error('Failed to load time control, using default 1800:', err);
          setLoaded(true);
        });
    }
  }, [loaded]);

  return timeControl;
}
