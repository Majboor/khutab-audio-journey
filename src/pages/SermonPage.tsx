
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sermon } from '@/lib/api';
import SermonPlayer from '@/components/SermonPlayer';
import useSermon from '@/hooks/useSermon';
import { Loader, AlertTriangle, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SermonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateSermon, loading, error } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Loading animation
  useEffect(() => {
    if (generating) {
      // Simulate progress during generation (purely visual feedback)
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          // Gradually increase up to 90% (final 10% when actually complete)
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + (90 - prev) * 0.1;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (sermon) {
      setLoadingProgress(100);
    }
  }, [generating, sermon]);

  useEffect(() => {
    if (location.state && 'audio_url' in location.state) {
      setSermon(location.state as Sermon);
    } else {
      handleGenerateNew();
    }
  }, [location]);

  const handleClose = () => {
    navigate('/');
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setShowError(null);
    setLoadingProgress(10); // Start progress at 10%
    
    try {
      toast.loading('Creating a new sermon...', { 
        description: 'Please wait while we generate your sermon.',
        duration: Infinity,
        id: 'new-sermon-generation'
      });
      
      const newSermon = await generateSermon('patience');
      if (newSermon) {
        setSermon(newSermon);
        console.log("Sermon set with audio URL:", newSermon.fullAudioUrl || `https://islamicaudio.techrealm.online${newSermon.audio_url}`);
      } else {
        setShowError('Failed to generate sermon. Please try again.');
      }
      
    } catch (error) {
      console.error('Error generating new sermon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setShowError(errorMessage);
      
      toast.error('Failed to generate new sermon', {
        description: 'Please try again or select a different theme.'
      });
    } finally {
      setGenerating(false);
      toast.dismiss('new-sermon-generation');
    }
  };

  if (showError && sermon) {
    toast.error('Using backup sermon', {
      description: showError
    });
  }

  if (!sermon || generating) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div className="text-center text-white max-w-md px-4">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-6" />
          <p className="text-lg font-medium mb-2">Generating sermon...</p>
          <p className="text-sm text-white/70 mb-6">This may take 20-30 seconds</p>
          
          <div className="w-full max-w-md mb-8">
            <Progress value={loadingProgress} className="h-2 bg-white/10" />
            <p className="text-xs text-white/50 mt-2 text-right">{Math.round(loadingProgress)}%</p>
          </div>
          
          {showError && (
            <Alert variant="destructive" className="mt-4 bg-red-900/60 border-red-800 text-white">
              <div className="flex items-center mb-2">
                <WifiOff className="h-5 w-5 mr-2" />
                <AlertTitle>Connection Error</AlertTitle>
              </div>
              <AlertDescription className="mt-2 text-white/90">
                {showError}
                <div className="mt-4 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={handleGenerateNew}
                  >
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={handleClose}
                  >
                    Return Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  const audioUrl = sermon.fullAudioUrl || `https://islamicaudio.techrealm.online${sermon.audio_url}`;
  console.log("Final audio URL being passed to SermonPlayer:", audioUrl);

  return (
    <SermonPlayer
      title={sermon.title}
      text={sermon.text}
      audioUrl={audioUrl}
      onClose={handleClose}
      onGenerateNew={handleGenerateNew}
      hasError={!!showError}
    />
  );
};

export default SermonPage;
