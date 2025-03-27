
import { useState } from 'react';
import { Sermon, generateKhutba } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

export const useSermon = () => {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();

  const generateSermon = async (purpose: string) => {
    try {
      setLoading(true);
      const newSermon = await generateKhutba(purpose);
      setSermon(newSermon);
      return newSermon;
    } catch (error) {
      console.error('Error generating sermon:', error);
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
    generateSermon,
  };
};

export default useSermon;
