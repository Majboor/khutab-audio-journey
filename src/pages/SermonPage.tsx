
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sermon } from '@/lib/api';
import SermonPlayer from '@/components/SermonPlayer';
import useSermon from '@/hooks/useSermon';
import { Loader, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const SermonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateSermon, loading, error } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

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
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Generating sermon...</p>
          <p className="text-sm text-white/70 mt-2 mb-6">This may take 20-30 seconds</p>
          
          {showError && (
            <Alert variant="destructive" className="mt-4 bg-red-900/60 border-red-800 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Occurred</AlertTitle>
              <AlertDescription className="mt-2 text-white/90">
                {showError}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 mt-2"
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
