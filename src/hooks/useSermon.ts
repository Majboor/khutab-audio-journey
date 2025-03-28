
import { useState, useEffect } from 'react';
import { Sermon, generateKhutba, isOnline } from '@/lib/api';
import { toast } from 'sonner';

export const useSermon = () => {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline());

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      if (networkError) {
        toast.success('Connection restored', {
          description: 'Internet connection has been restored. You can retry generating the sermon.',
        });
      }
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
      toast.error('Network offline', {
        description: 'Your device is offline. Please check your internet connection.',
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    setOnlineStatus(isOnline());
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [networkError]);

  // Reset network error if it's been more than 15 seconds since the last attempt
  useEffect(() => {
    if (networkError && lastAttemptTime) {
      const now = Date.now();
      if (now - lastAttemptTime > 15000) { // 15 seconds
        setNetworkError(false);
      }
    }
  }, [networkError, lastAttemptTime]);

  const generateSermon = async (purpose: string) => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      setLastAttemptTime(Date.now());
      
      // Check if we're online before attempting to fetch
      if (!isOnline()) {
        setNetworkError(true);
        setError('Your device is offline. Please check your internet connection.');
        toast.error('Network Offline', {
          description: 'You are currently offline. Please check your internet connection.',
          duration: 8000,
        });
        return null;
      }
      
      // Add a timeout for the API call (15 seconds max)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const newSermon = await generateKhutba(purpose, controller.signal);
      clearTimeout(timeoutId);
      
      // If the sermon has an error type attached, handle appropriately
      if (newSermon && 'errorType' in newSermon && newSermon.errorType === 'network') {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
      
      setSermon(newSermon);
      setRetryCount(0); // Reset retry count on success
      return newSermon;
    } catch (error) {
      console.error('Error generating sermon:', error);
      
      // Determine if it's a network error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Network error') ||
         error.message.includes('network') ||
         error.message.includes('abort') ||
         error.message.includes('time') ||
         error.message.includes('AbortError'));
         
      if (isNetworkError) {
        setNetworkError(true);
        toast.error('Network Connection Error', {
          description: 'Unable to connect to sermon server. Please check your internet connection.',
          duration: 8000,
        });
      } else {
        toast.error('Error Generating Sermon', {
          description: errorMessage,
          duration: 5000,
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate a batch of sermons (for previous/next functionality)
  const generateBatchSermons = async (purpose: string, count: number = 3): Promise<Sermon[]> => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      setLastAttemptTime(Date.now());
      
      // Check if we're online before attempting to fetch
      if (!isOnline()) {
        setNetworkError(true);
        setError('Your device is offline. Please check your internet connection.');
        toast.error('Network Offline', {
          description: 'You are currently offline. Please check your internet connection.',
          duration: 8000,
        });
        return [];
      }

      // Generate the sermons one by one (as our API doesn't support batch generation)
      const sermons: Sermon[] = [];
      
      for (let i = 0; i < count; i++) {
        // Add a timeout for each API call (15 seconds max)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        try {
          const newSermon = await generateKhutba(purpose, controller.signal);
          clearTimeout(timeoutId);
          
          if (newSermon) {
            // If the sermon has an error type attached and it's the first one, handle appropriately
            if (i === 0 && 'errorType' in newSermon && newSermon.errorType === 'network') {
              setNetworkError(true);
            }
            
            sermons.push(newSermon);
          }
        } catch (innerError) {
          console.error(`Error generating sermon ${i+1}/${count}:`, innerError);
          clearTimeout(timeoutId);
          
          // If the first sermon fails, we need to set the error state
          if (i === 0) {
            const errorMessage = innerError instanceof Error ? innerError.message : 'Unknown error occurred';
            setError(errorMessage);
            
            const isNetworkError = innerError instanceof Error && 
              (innerError.message.includes('Failed to fetch') || 
               innerError.message.includes('Network error') ||
               innerError.message.includes('network') ||
               innerError.message.includes('abort') ||
               innerError.message.includes('time') ||
               innerError.message.includes('AbortError'));
               
            if (isNetworkError) {
              setNetworkError(true);
            }
          }
          
          // Continue trying to generate the remaining sermons
          continue;
        }
      }
      
      // If we couldn't generate any sermons, show an error
      if (sermons.length === 0) {
        if (!error) {
          setError('Failed to generate any sermons');
        }
        return [];
      }
      
      // If we're here, we managed to generate at least one sermon
      if (sermons.length > 0) {
        setSermon(sermons[0]);
        setRetryCount(0); // Reset retry count on success
      }
      
      return sermons;
    } catch (error) {
      console.error('Error in batch sermon generation:', error);
      
      // Determine if it's a network error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Network error') ||
         error.message.includes('network') ||
         error.message.includes('abort') ||
         error.message.includes('time') ||
         error.message.includes('AbortError'));
         
      if (isNetworkError) {
        setNetworkError(true);
        toast.error('Network Connection Error', {
          description: 'Unable to connect to sermon server. Please check your internet connection.',
          duration: 8000,
        });
      } else {
        toast.error('Error Generating Sermons', {
          description: errorMessage,
          duration: 5000,
        });
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  const retryGeneration = async (purpose: string) => {
    // Only increment retry count if we're online
    if (isOnline()) {
      setRetryCount(prev => prev + 1);
    } else {
      toast.error('Still Offline', {
        description: 'You are still offline. Please check your internet connection and try again.',
        duration: 5000,
      });
      return null;
    }
    return generateSermon(purpose);
  };

  return {
    sermon,
    loading,
    error,
    networkError,
    retryCount,
    generateSermon,
    generateBatchSermons,
    retryGeneration,
    isOnline: onlineStatus,
  };
};

export default useSermon;
