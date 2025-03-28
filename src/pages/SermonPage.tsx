import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sermon } from '@/lib/api';
import SermonPlayer from '@/components/SermonPlayer';
import useSermon from '@/hooks/useSermon';
import { Loader, AlertTriangle, WifiOff, RotateCw, RefreshCw, Wifi, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SermonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateSermon, retryGeneration, loading: hookLoading, error: hookError, networkError: hookNetworkError, retryCount, isOnline } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [purpose, setPurpose] = useState('patience');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    lastChecked: Date.now(),
    isOnline: isOnline
  });

  const audioUrl = sermon?.fullAudioUrl || '';
  const rawAudioUrl = sermon?.audio_url || '';
  const completeAudioUrl = audioUrl || (rawAudioUrl ? 
    `https://islamicaudio.techrealm.online${rawAudioUrl.startsWith('/') ? rawAudioUrl : '/' + rawAudioUrl}` : 
    '');

  useEffect(() => {
    if (generating) {
      setLoadingProgress(10);
      
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
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
      setPurpose(location.state.purpose || 'patience');
      setSermon(location.state as Sermon);
      
      if (location.state.audio_url && !location.state.fullAudioUrl) {
        const constructedUrl = `https://islamicaudio.techrealm.online${location.state.audio_url.startsWith('/') ? location.state.audio_url : '/' + location.state.audio_url}`;
        toast.warning('Audio URL issue detected', {
          description: `Complete audio URL should be: ${constructedUrl}`,
          duration: 8000,
        });
      }
    } else {
      handleGenerateNew();
    }
  }, [location]);

  useEffect(() => {
    setNetworkStatus(prev => ({
      lastChecked: Date.now(),
      isOnline: isOnline
    }));
    
    if (!isOnline && networkStatus.isOnline) {
      toast.error('Network offline', {
        description: 'Your device is offline. Please check your internet connection.',
      });
    } else if (isOnline && !networkStatus.isOnline) {
      toast.success('Connection restored', {
        description: 'Internet connection has been restored. You can retry generating the sermon.',
      });
      
      if (showError && hookNetworkError) {
        setShowError(null);
      }
    }
    
    const handleOnline = () => {
      toast.success('Connection restored', {
        description: 'Internet connection has been restored. You can retry generating the sermon.',
      });
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true
      }));
    };

    const handleOffline = () => {
      toast.error('Network offline', {
        description: 'Your device is offline. Please check your internet connection.',
      });
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, hookNetworkError, showError, networkStatus.isOnline]);

  useEffect(() => {
    const interval = setInterval(() => {
      const checkInterval = hookNetworkError ? 5000 : 15000;
      
      if (Date.now() - networkStatus.lastChecked > checkInterval) {
        setNetworkStatus(prev => ({
          lastChecked: Date.now(),
          isOnline: navigator.onLine
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hookNetworkError, networkStatus.lastChecked]);

  useEffect(() => {
    if (sermon && showError) {
      toast.error('Audio Error', {
        description: `We're having trouble with the audio. Raw URL: ${rawAudioUrl}`,
        duration: 8000,
      });
      setAudioError(true);
    }
  }, [sermon, showError, rawAudioUrl]);

  const handleClose = () => {
    navigate('/');
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setShowError(null);
    setLoadingProgress(10);
    setAudioError(false);
    
    try {
      toast.loading('Creating a new sermon...', { 
        description: 'Please wait while we generate your sermon.',
        duration: Infinity,
        id: 'new-sermon-generation'
      });
      
      const newSermon = await generateSermon(purpose);
      if (newSermon) {
        setSermon(newSermon);
        
        console.log("Sermon generated with:");
        console.log("- Raw audio URL:", newSermon.audio_url);
        console.log("- Full audio URL:", newSermon.fullAudioUrl);
        console.log("- Complete constructed URL:", newSermon.fullAudioUrl || 
          (newSermon.audio_url ? `https://islamicaudio.techrealm.online${newSermon.audio_url.startsWith('/') ? newSermon.audio_url : '/' + newSermon.audio_url}` : ''));
        
        if (!newSermon.fullAudioUrl && newSermon.audio_url) {
          const constructedUrl = `https://islamicaudio.techrealm.online${newSermon.audio_url.startsWith('/') ? newSermon.audio_url : '/' + newSermon.audio_url}`;
          toast.warning('Audio URL issue', {
            description: `Complete audio URL should be: ${constructedUrl}`,
            duration: 8000,
          });
        }
        
        setRetryAttempt(0);
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

  const handleRetry = async () => {
    if (!navigator.onLine) {
      toast.error('Still Offline', {
        description: 'You are still offline. Please check your internet connection before retrying.',
        duration: 5000
      });
      return;
    }
    
    setGenerating(true);
    setShowError(null);
    setLoadingProgress(10);
    setRetryAttempt(prev => prev + 1);
    
    toast.loading('Retrying sermon generation...', { 
      description: 'Please wait while we try again.',
      duration: Infinity,
      id: 'retry-sermon-generation'
    });
    
    const newSermon = await retryGeneration(purpose);
    
    if (newSermon) {
      setSermon(newSermon);
      toast.success('Sermon generated successfully', {
        description: 'Your sermon is now ready to play.',
      });
    } else {
      setShowError(retryAttempt >= 2 
        ? 'Multiple retry attempts failed. Using offline sermon instead.' 
        : 'Network still unavailable. Please check your connection and try again.');
    }
    
    setGenerating(false);
    toast.dismiss('retry-sermon-generation');
  };

  const checkNetworkStatus = () => {
    const isCurrentlyOnline = navigator.onLine;
    
    setNetworkStatus({
      lastChecked: Date.now(),
      isOnline: isCurrentlyOnline
    });
    
    if (isCurrentlyOnline) {
      toast.success('Network Check', {
        description: 'Your device appears to be online. You can try generating a sermon now.',
      });
    } else {
      toast.error('Network Check', {
        description: 'Your device is still offline. Please check your internet connection.',
      });
    }
    
    return isCurrentlyOnline;
  };

  const openAPIEndpoint = () => {
    window.open('https://islamicaudio.techrealm.online/generate-khutab', '_blank');
  };

  if (showError && sermon) {
    toast.warning('Using backup sermon', {
      description: `${showError}. Complete audio URL: ${completeAudioUrl}`,
      duration: 8000,
    });
  }

  if (!sermon || generating) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div className="text-center text-white max-w-md px-4">
          {hookNetworkError ? (
            <WifiOff className="h-12 w-12 mx-auto mb-6 text-red-500" />
          ) : (
            <Loader className="h-12 w-12 animate-spin mx-auto mb-6" />
          )}
          
          <p className="text-lg font-medium mb-2">
            {hookNetworkError ? 'Network Connection Error' : 'Generating sermon...'}
          </p>
          
          <p className="text-sm text-white/70 mb-6">
            {hookNetworkError 
              ? 'Unable to connect to sermon server' 
              : 'This may take 15-20 seconds'}
          </p>
          
          <div className="w-full max-w-md mb-8">
            <Progress 
              value={hookNetworkError ? 100 : loadingProgress} 
              className={`h-2 ${hookNetworkError ? 'bg-red-900/30' : 'bg-white/10'}`} 
            />
            {!hookNetworkError && (
              <p className="text-xs text-white/50 mt-2 text-right">{Math.round(loadingProgress)}%</p>
            )}
          </div>
          
          {hookNetworkError && (
            <Alert variant="destructive" className="mt-4 bg-red-900/60 border-red-800 text-white">
              <div className="flex items-center mb-2">
                <WifiOff className="h-5 w-5 mr-2" />
                <AlertTitle>Connection Error</AlertTitle>
              </div>
              <AlertDescription className="mt-2 text-white/90">
                Unable to connect to sermon server. Please check your internet connection.
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={checkNetworkStatus}
                    >
                      <Wifi className="h-3 w-3 mr-1" />
                      Check Status
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-white/70">
                    <span>API Endpoint:</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-white/90"
                      onClick={openAPIEndpoint}
                    >
                      Check API <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={handleRetry}
                      disabled={!isOnline}
                    >
                      {retryAttempt > 0 ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again ({retryAttempt})
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-4 w-4 mr-2" />
                          Retry
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={handleClose}
                    >
                      Return Home
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  console.log("SermonPage: Rendering with sermon data");
  console.log("- Raw URL:", rawAudioUrl);
  console.log("- Full URL:", audioUrl);
  console.log("- Complete constructed URL:", completeAudioUrl);

  return (
    <SermonPlayer
      title={sermon.title}
      text={sermon.text}
      audioUrl={completeAudioUrl}
      rawAudioUrl={rawAudioUrl}
      onClose={handleClose}
      onGenerateNew={handleGenerateNew}
      hasError={!!showError || audioError}
    />
  );
};

export default SermonPage;
