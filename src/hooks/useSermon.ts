
import { useState, useEffect } from 'react';
import { Sermon, generateKhutba } from '@/lib/api';
import { toast } from 'sonner';

export const useSermon = () => {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);

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
      
      // Add a timeout for the API call (30 seconds max)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const newSermon = await generateKhutba(purpose, controller.signal);
      clearTimeout(timeoutId);
      
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

  const retryGeneration = async (purpose: string) => {
    setRetryCount(prev => prev + 1);
    return generateSermon(purpose);
  };

  // Check online status
  const checkOnlineStatus = () => {
    return navigator.onLine;
  };

  return {
    sermon,
    loading,
    error,
    networkError,
    retryCount,
    generateSermon,
    retryGeneration,
    isOnline: checkOnlineStatus(),
  };
};

export default useSermon;
