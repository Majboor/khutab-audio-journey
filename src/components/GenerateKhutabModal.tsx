
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { generateKhutba } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface GenerateKhutabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: string;
}

const GenerateKhutabModal: React.FC<GenerateKhutabModalProps> = ({ 
  open, 
  onOpenChange,
  selectedCategory
}) => {
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState(selectedCategory || 'patience');
  const { toast } = useToast();
  const navigate = useNavigate();

  const purposes = [
    { value: 'fundamentals', label: 'Islamic Fundamentals' },
    { value: 'topics', label: 'Specific Topics' },
    { value: 'motivation', label: 'Spiritual Motivation' },
    { value: 'guidance', label: 'Practical Guidance' },
    { value: 'community', label: 'Community Connection' },
    { value: 'reflection', label: 'Personal Reflection' },
    { value: 'patience', label: 'Patience & Resilience' },
  ];

  const handleGenerateKhutba = async () => {
    try {
      setLoading(true);
      // We're passing just the purpose value (one word) to the API
      const sermon = await generateKhutba(purpose);
      
      // Navigate to the sermon page with the sermon data
      navigate('/sermon', { state: sermon });
      
      onOpenChange(false); // Close modal after successful generation
    } catch (error) {
      console.error('Error generating khutba:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate sermon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold mb-4">Generate Sermon</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground text-center mb-4">
            Select a theme for your sermon:
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {purposes.map((option) => (
              <Button
                key={option.value}
                variant={purpose === option.value ? "default" : "outline"}
                className={`justify-start text-left h-auto py-3 px-4 ${
                  purpose === option.value ? 'ring-2 ring-primary/10' : ''
                }`}
                onClick={() => setPurpose(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <Button 
            className="w-full mt-6"
            onClick={handleGenerateKhutba}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Sermon'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateKhutabModal;
