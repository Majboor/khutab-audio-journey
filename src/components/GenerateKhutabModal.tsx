
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader, Play, AlertTriangle } from 'lucide-react';
import { generateKhutba } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [previewData, setPreviewData] = useState<any>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const { toast: uiToast } = useToast();
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

  // Reset audio states when modal opens/closes
  useEffect(() => {
    if (!open) {
      setAudioError(false);
      setAudioLoaded(false);
      setPreviewData(null);
    }
  }, [open]);

  const handleGenerateKhutba = async () => {
    try {
      setLoading(true);
      setPreviewData(null);
      setAudioError(false);
      setAudioLoaded(false);
      
      // Show loading toast
      toast.loading('Generating your sermon...', {
        description: 'This may take 20-30 seconds',
        duration: Infinity, // Will be dismissed manually
        id: 'sermon-generation'
      });
      
      // Use a direct POST request approach
      const sermon = await generateKhutba(purpose);
      
      // Process the audio URL if it exists
      if (sermon && sermon.audio_url) {
        // Ensure we have a valid URL by adding the API_BASE_URL if needed
        if (sermon.audio_url.startsWith('/')) {
          sermon.fullAudioUrl = `${API_BASE_URL}${sermon.audio_url}`;
        } else if (!sermon.audio_url.startsWith('http')) {
          sermon.fullAudioUrl = `${API_BASE_URL}/${sermon.audio_url}`;
        } else {
          sermon.fullAudioUrl = sermon.audio_url;
        }
        console.log("Full audio URL:", sermon.fullAudioUrl);
      } else {
        setAudioError(true);
        toast.error('Audio not available', {
          description: 'The sermon was generated, but audio is not available.'
        });
      }
      
      // Set preview data for audio player
      setPreviewData(sermon);
      
      // Dismiss the loading toast
      toast.dismiss('sermon-generation');
      
      // Show success toast
      toast.success('Sermon generated successfully!', {
        description: 'Your sermon is ready to be viewed',
        duration: 3000
      });
      
      // Navigate to the sermon page with the sermon data
      navigate('/sermon', { state: sermon });
      
      onOpenChange(false); // Close modal after successful generation
    } catch (error) {
      console.error('Error generating khutba:', error);
      // Dismiss the loading toast
      toast.dismiss('sermon-generation');
      
      // Show error toast with UI toast for better visibility
      uiToast({
        title: 'Error',
        description: 'Failed to generate sermon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    setAudioLoaded(false);
    console.error('Audio loading error');
    
    if (previewData) {
      // Update the toast to inform about audio issues
      toast.error('Audio Error', {
        description: 'There was a problem loading the audio. The sermon text is still available.',
        duration: 5000,
      });
    }
  };

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    setAudioError(false);
    console.log('Audio loaded successfully');
  };

  const renderAudioPreview = () => {
    if (!previewData || !previewData.audio_url) return null;
    
    const audioUrl = previewData.fullAudioUrl || `${API_BASE_URL}${previewData.audio_url}`;
    
    return (
      <div className="mt-4 p-4 bg-muted rounded-md">
        <h4 className="font-medium mb-2 flex items-center">
          <Play className="w-4 h-4 mr-2" /> Audio Preview
        </h4>
        
        {audioError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Audio Error</AlertTitle>
            <AlertDescription>
              There was a problem loading the audio. The sermon text is still available.
            </AlertDescription>
          </Alert>
        )}
        
        <audio 
          controls 
          src={audioUrl} 
          className="w-full"
          onError={handleAudioError}
          onLoadedData={handleAudioLoaded}
        />
        
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Original URL: <code>{previewData.audio_url}</code></p>
          <p>Full URL: <code>{audioUrl}</code></p>
          <p>Status: {audioLoaded ? 'Loaded ✓' : audioError ? 'Error loading audio ✗' : 'Loading...'}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold mb-4">Generate Sermon</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Select a theme for your sermon. Generation may take 20-30 seconds.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
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
          
          {previewData && renderAudioPreview()}
          
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
