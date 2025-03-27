
import { useState } from 'react';
import { Sermon, generateKhutba } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

export const useSermon = () => {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  const generateSermon = async (purpose: string) => {
    try {
      setLoading(true);
      setError(null);
      const newSermon = await generateKhutba(purpose);
      setSermon(newSermon);
      return newSermon;
    } catch (error) {
      console.error('Error generating sermon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      uiToast({
        title: 'Error',
        description: 'Failed to generate sermon. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sermon,
    loading,
    error,
    generateSermon,
  };
};

export default useSermon;
