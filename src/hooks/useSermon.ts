
import { useState } from 'react';
import { Sermon, generateKhutba } from '@/lib/api';
import { toast } from 'sonner';

export const useSermon = () => {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);

  const generateSermon = async (purpose: string) => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      const newSermon = await generateKhutba(purpose);
      setSermon(newSermon);
      return newSermon;
    } catch (error) {
      console.error('Error generating sermon:', error);
      
      // Determine if it's a network error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Network error') ||
         error.message.includes('network'));
         
      if (isNetworkError) {
        setNetworkError(true);
      }
      
      // Error toast will be handled by the generateKhutba function
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sermon,
    loading,
    error,
    networkError,
    generateSermon,
  };
};

export default useSermon;
