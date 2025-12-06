/**
 * Backend Connection Monitor Hook
 * 
 * تشخیص قطع شدن و وصل شدن backend
 * نمایش snackbar هنگام disconnect که نره از صفحه
 * خودکار بستن snackbar وقتی backend وصل شد
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'src/components/snackbar';

interface UseBackendConnectionProps {
  /**
   * فعال بودن monitoring (فقط وقتی بازی شروع شده)
   */
  enabled?: boolean;
  
  /**
   * تابعی که backend رو چک می‌کنه
   * باید true برگردونه اگه وصله، false اگه قطعه
   */
  checkConnection: () => Promise<boolean>;
  
  /**
   * هر چند ثانیه یکبار چک کنه (default: 5 ثانیه)
   */
  intervalSeconds?: number;
}

/**
 * Hook برای monitor کردن وضعیت backend
 * 
 * استفاده:
 * ```ts
 * useBackendConnection({
 *   enabled: !!backendGameId,
 *   checkConnection: async () => {
 *     try {
 *       await axios.get('/health');
 *       return true;
 *     } catch {
 *       return false;
 *     }
 *   }
 * });
 * ```
 */
export function useBackendConnection({
  enabled = true,
  checkConnection,
  intervalSeconds = 5,
}: UseBackendConnectionProps) {
  const [isConnected, setIsConnected] = useState(true);
  const toastIdRef = useRef<string | number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      // اگه disabled شد، پاک کن toast و interval
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsConnected(true);
      return;
    }

    const check = async () => {
      let connected = false;
      
      try {
        connected = await checkConnection();
      } catch (error) {
        // خطا = disconnect
        connected = false;
      }
      
      // اگه الان disconnect هست و قبلاً connected بود
      if (!connected && isConnected) {
        console.warn('⚠️ Backend disconnected!');
        setIsConnected(false);
        
        // نمایش toast که نره (duration: Infinity)
        if (!toastIdRef.current) {
          toastIdRef.current = toast.error(
            'Backend connection lost. Waiting for reconnection...',
            {
              duration: Infinity,
              description: 'Please check if backend server is running',
            }
          );
        }
      }
      // اگه الان connected هست و قبلاً disconnect بود
      else if (connected && !isConnected) {
        console.log('✅ Backend reconnected!');
        setIsConnected(true);
        
        // بستن toast disconnect
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
        
        // نمایش موفقیت
        toast.success('Backend reconnected!', {
          duration: 3000,
        });
      }
    };

    // اولین check فوری
    check();

    // بعدی هر N ثانیه
    intervalRef.current = setInterval(check, intervalSeconds * 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [enabled, checkConnection, intervalSeconds, isConnected]);

  return { isConnected };
}
