/**
 * 🐛 Debug Configuration
 * 
 * تنظیمات debug برای کنترل console.log ها در پروژه
 * فقط در development mode فعال می‌شود
 */

// بررسی محیط اجرا
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * فعال/غیرفعال کردن کلی debug logs
 * برای production همیشه false است
 * 🚀 PERFORMANCE: در production باید false باشه تا logs خاموش بشن
 */
export const DEBUG_ENABLED = isDevelopment && false; // 🚀 خاموش برای performance (تغییر به true فقط برای debugging)

/**
 * تنظیمات جزئی برای هر بخش
 */
export const DEBUG_CONFIG = {
  // بخش بازی
  GAME: {
    ENABLED: DEBUG_ENABLED && true,
    DICE_ROLLS: DEBUG_ENABLED && true,        // 🎲 Dice roll logs
    MOVE_VALIDATION: DEBUG_ENABLED && false,  // ✓ Move validation (خیلی زیاد!)
    STATE_CHANGES: DEBUG_ENABLED && true,     // 🎮 State changes
    BACKEND_SYNC: DEBUG_ENABLED && true,      // 📥 Backend sync
  },

  // بخش AI
  AI: {
    ENABLED: DEBUG_ENABLED && true,
    DECISIONS: DEBUG_ENABLED && true,         // 🤖 AI decisions
    EXECUTION: DEBUG_ENABLED && true,         // 🏃 AI execution
    AUTO_ROLL: DEBUG_ENABLED && true,         // 🎲 AI auto-roll
  },

  // بخش تایمر
  TIMER: {
    ENABLED: DEBUG_ENABLED && false,          // ⏱️ Timer (هر 1 ثانیه!) - 🚀 خاموش برای performance
    COUNTDOWN: DEBUG_ENABLED && false,        // ⏱️ Countdown updates - 🚀 خاموش
    SYNC: DEBUG_ENABLED && false,             // ⏱️ Timer sync با backend - 🚀 خاموش
    RESTORATION: DEBUG_ENABLED && false,      // ⏱️ Timer restoration on load - 🚀 خاموش
    TIMEOUT: DEBUG_ENABLED && true,           // ⏱️ Timeout events - فقط مهم
  },

  // بخش opening roll
  OPENING_ROLL: {
    ENABLED: DEBUG_ENABLED && true,
    EXECUTION: DEBUG_ENABLED && true,         // 🎯 Opening roll
    WINNER: DEBUG_ENABLED && true,            // 🎯 Opening winner
  },

  // بخش نتایج و امتیازات
  RESULTS: {
    ENABLED: DEBUG_ENABLED && true,
    SET_WINNER: DEBUG_ENABLED && true,        // 🏆 Set winner
    MATCH_WINNER: DEBUG_ENABLED && true,      // 🏆 Match winner
    SCORING: DEBUG_ENABLED && true,           // 📊 Scoring
  },

  // بخش UI
  UI: {
    ENABLED: DEBUG_ENABLED && false,
    VISIBILITY: DEBUG_ENABLED && true,        // 👁️ Page visibility
    DIALOGS: DEBUG_ENABLED && false,          // 💬 Dialogs
    SHARE: DEBUG_ENABLED && true,             // 🔗 Share actions
  },

  // بخش مشکلات و خطاها
  ERRORS: {
    ENABLED: true, // همیشه فعال (حتی در production)
    NETWORK: true,                            // ❌ Network errors
    VALIDATION: true,                         // ⚠️ Validation errors
    GAME_LOGIC: true,                         // 🚫 Game logic errors
  },
};

/**
 * Helper function برای log کردن با چک کردن config
 */
export const debugLog = {
  // بخش بازی
  game: (...args: any[]) => DEBUG_CONFIG.GAME.ENABLED && console.log('🎮', ...args),
  dice: (...args: any[]) => DEBUG_CONFIG.GAME.DICE_ROLLS && console.log('🎲', ...args),
  move: (...args: any[]) => DEBUG_CONFIG.GAME.MOVE_VALIDATION && console.log('✓', ...args),
  state: (...args: any[]) => DEBUG_CONFIG.GAME.STATE_CHANGES && console.log('🎮', ...args),
  backend: (...args: any[]) => DEBUG_CONFIG.GAME.BACKEND_SYNC && console.log('📥', ...args),

  // بخش AI
  ai: (...args: any[]) => DEBUG_CONFIG.AI.ENABLED && console.log('🤖', ...args),
  aiDecision: (...args: any[]) => DEBUG_CONFIG.AI.DECISIONS && console.log('🤖', ...args),
  aiExec: (...args: any[]) => DEBUG_CONFIG.AI.EXECUTION && console.log('🏃', ...args),
  aiRoll: (...args: any[]) => DEBUG_CONFIG.AI.AUTO_ROLL && console.log('🎲', ...args),

  // بخش تایمر
  timer: (...args: any[]) => DEBUG_CONFIG.TIMER.ENABLED && console.log('⏱️', ...args),
  timerCountdown: (...args: any[]) => DEBUG_CONFIG.TIMER.COUNTDOWN && console.log('⏱️', ...args),
  timerSync: (...args: any[]) => DEBUG_CONFIG.TIMER.SYNC && console.log('⏱️', ...args),
  timerRestore: (...args: any[]) => DEBUG_CONFIG.TIMER.RESTORATION && console.log('⏱️', ...args),
  timeout: (...args: any[]) => DEBUG_CONFIG.TIMER.TIMEOUT && console.log('⏱️', ...args),

  // بخش opening roll
  opening: (...args: any[]) => DEBUG_CONFIG.OPENING_ROLL.ENABLED && console.log('🎯', ...args),
  openingWinner: (...args: any[]) => DEBUG_CONFIG.OPENING_ROLL.WINNER && console.log('🎯', ...args),

  // بخش نتایج
  results: (...args: any[]) => DEBUG_CONFIG.RESULTS.ENABLED && console.log('🏆', ...args),
  setWinner: (...args: any[]) => DEBUG_CONFIG.RESULTS.SET_WINNER && console.log('🏆', ...args),
  matchWinner: (...args: any[]) => DEBUG_CONFIG.RESULTS.MATCH_WINNER && console.log('🏆', ...args),
  score: (...args: any[]) => DEBUG_CONFIG.RESULTS.SCORING && console.log('📊', ...args),

  // بخش UI
  ui: (...args: any[]) => DEBUG_CONFIG.UI.ENABLED && console.log('💬', ...args),
  visibility: (...args: any[]) => DEBUG_CONFIG.UI.VISIBILITY && console.log('👁️', ...args),
  share: (...args: any[]) => DEBUG_CONFIG.UI.SHARE && console.log('🔗', ...args),

  // خطاها (همیشه فعال)
  error: (...args: any[]) => DEBUG_CONFIG.ERRORS.ENABLED && console.error('❌', ...args),
  warn: (...args: any[]) => DEBUG_CONFIG.ERRORS.ENABLED && console.warn('⚠️', ...args),
  network: (...args: any[]) => DEBUG_CONFIG.ERRORS.NETWORK && console.error('❌ Network:', ...args),
  validation: (...args: any[]) => DEBUG_CONFIG.ERRORS.VALIDATION && console.warn('⚠️ Validation:', ...args),
};

/**
 * Performance monitoring
 */
export const perfLog = {
  start: (label: string) => {
    if (DEBUG_ENABLED) {
      console.time(`⚡ ${label}`);
    }
  },
  end: (label: string) => {
    if (DEBUG_ENABLED) {
      console.timeEnd(`⚡ ${label}`);
    }
  },
};
