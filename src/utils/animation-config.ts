/**
 * 🎬 Animation Configuration for Mobile Optimization
 * 
 * تنظیمات بهینه‌سازی انیمیشن برای موبایل
 * این فایل تنظیمات animation را بر اساس دستگاه تنظیم می‌کند
 */

/**
 * چک کردن آیا دستگاه موبایل است یا نه
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
};

/**
 * چک کردن performance دستگاه
 * (تعداد هسته‌های CPU و حافظه)
 */
export const getDevicePerformance = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';
  
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  // @ts-ignore - deviceMemory may not exist
  const deviceMemory = navigator.deviceMemory || 4;
  
  // Low-end: 1-2 cores, <3GB RAM
  if (hardwareConcurrency <= 2 || deviceMemory < 3) {
    return 'low';
  }
  
  // High-end: 6+ cores, 6GB+ RAM
  if (hardwareConcurrency >= 6 && deviceMemory >= 6) {
    return 'high';
  }
  
  // Medium: everything else
  return 'medium';
};

/**
 * تنظیمات Animation برای Checker Component
 */
export const getCheckerAnimationConfig = () => {
  const isMobile = isMobileDevice();
  const performance = getDevicePerformance();
  
  // 🔴 Low Performance (موبایل ضعیف)
  if (performance === 'low' || (isMobile && performance === 'medium')) {
    return {
      // Transition settings
      transition: {
        type: 'tween', // ساده‌تر از spring
        duration: 0.4, // 🎯 افزایش برای روون‌تری (0.4 ثانیه)
        ease: 'easeInOut', // 🎯 نرم‌تر از easeOut
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
        layout: {
          type: 'tween',
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      
      // Initial/Exit animations (ساده)
      initial: { opacity: 1, scale: 1 }, // بدون fade in
      exit: { opacity: 0, scale: 1 }, // بدون scale
      
      // Hover/Selection (غیرفعال)
      disableHoverEffects: true,
      disablePulseAnimation: true,
      
      // Layout animation
      layout: true, // 🎯 فعال برای حرکت روون‌تر
      layoutDependency: false, // بدون re-layout در هر تغییر
    };
  }
  
  // 🟡 Medium Performance (موبایل خوب - 80% مشتری‌ها)
  if (performance === 'medium') {
    return {
      transition: {
        type: 'spring',
        stiffness: 140, // 🎯 کمتر برای نرمی بیشتر
        damping: 16, // 🎯 کمتر برای bounce خفیف
        mass: 0.8, // 🎯 بیشتر برای وزن‌دار بودن حرکت
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
        layout: {
          type: 'spring',
          stiffness: 140,
          damping: 16,
          mass: 0.8,
        },
      },
      
      initial: { opacity: 0.8, scale: 0.9 },
      exit: { opacity: 0, scale: 0.8 },
      
      disableHoverEffects: isMobile, // موبایل hover نداره
      disablePulseAnimation: false,
      
      layout: true,
      layoutDependency: true,
    };
  }
  
  // 🟢 High Performance (دسکتاپ قوی)
  return {
    transition: {
      type: 'spring',
      stiffness: 180, // 🎯 نرم‌تر برای گرافیک خفن
      damping: 20, // 🎯 کمتر برای bounce طبیعی
      mass: 0.7, // 🎯 بیشتر برای احساس واقعی‌تر
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
      layout: {
        type: 'spring',
        stiffness: 180,
        damping: 20,
        mass: 0.7,
      },
    },
    
    initial: { opacity: 0, scale: 0.8 },
    exit: { opacity: 0, scale: 0.8 },
    
    disableHoverEffects: false,
    disablePulseAnimation: false,
    
    layout: true,
    layoutDependency: true,
  };
};

/**
 * تنظیمات Animation برای Board Rotation
 */
export const getBoardRotationConfig = () => {
  const isMobile = isMobileDevice();
  const performance = getDevicePerformance();
  
  if (performance === 'low' || (isMobile && performance === 'medium')) {
    return {
      type: 'tween' as const,
      duration: 0.4,
      ease: 'easeInOut' as const,
    };
  }
  
  if (performance === 'medium') {
    return {
      type: 'spring' as const,
      stiffness: 120,
      damping: 18,
      duration: 0.5,
    };
  }
  
  return {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    duration: 0.6,
  };
};

/**
 * چک کردن آیا باید AnimatePresence استفاده کنیم
 */
export const shouldUseAnimatePresence = (): boolean => {
  const performance = getDevicePerformance();
  return performance !== 'low';
};

/**
 * تنظیمات LayoutGroup
 */
export const getLayoutGroupConfig = () => {
  const performance = getDevicePerformance();
  
  return {
    // در performance پایین، layout animation رو غیرفعال کن
    disabled: performance === 'low',
  };
};

/**
 * Debug info - برای نمایش در console
 */
export const getAnimationDebugInfo = () => {
  return {
    isMobile: isMobileDevice(),
    performance: getDevicePerformance(),
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    checkerConfig: getCheckerAnimationConfig(),
  };
};

/**
 * Hook برای استفاده آسان در components
 */
export const useAnimationConfig = () => {
  return {
    isMobile: isMobileDevice(),
    performance: getDevicePerformance(),
    checker: getCheckerAnimationConfig(),
    board: getBoardRotationConfig(),
    shouldAnimate: shouldUseAnimatePresence(),
    layoutGroup: getLayoutGroupConfig(),
  };
};
