/**
 * ⛔ CRITICAL - DO NOT MODIFY AFTER TESTING! ⛔
 * 
 * این فایل مدیریت گرفتن تاس از backend و اعمال آن را انجام میدهد.
 * بعد از تست کامل، هیچ تغییری در این فایل ندهید!
 * 
 * قوانین Backend Dice:
 * 1. همیشه تاس از backend گرفته میشه (نه از frontend animation)
 * 2. تاس اول به game state apply میشه، بعد animation نمایش داده میشه
 * 3. تاس های قبلی باید پاک بشن قبل از نمایش تاس جدید
 * 4. Animation فقط visual هست، روی game logic تاثیر نداره
 * 
 * این فایل با چوب حفاظت شده! 🔒
 */

import { gamePersistenceAPI } from 'src/services/game-persistence-api';

interface UseBackendDiceReturn {
  rollBackendDice: () => Promise<number[]>;
}

/**
 * Hook برای گرفتن تاس از backend
 * این تضمین میکنه که همیشه مقدار تاس از backend میاد و در game logic استفاده میشه
 */
export function useBackendDice(): UseBackendDiceReturn {
  
  const rollBackendDice = async (): Promise<number[]> => {
    try {
      const diceResponse = await gamePersistenceAPI.rollDice();
      return diceResponse.dice;
    } catch (error) {
      console.error('❌ Failed to get dice from backend:', error);
      throw error;
    }
  };

  return {
    rollBackendDice,
  };
}
