
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sermon } from '@/lib/api';
import SermonPlayer from '@/components/SermonPlayer';
import useSermon from '@/hooks/useSermon';
import { Loader, AlertTriangle, WifiOff, RotateCw, RefreshCw, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SermonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateSermon, retryGeneration, loading, error, networkError, retryCount, isOnline } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [purpose, setPurpose] = useState('patience');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [networkStatus, setNetworkStatus] = useState({
    lastChecked: Date.now(),
    isOnline: isOnline
  });

  // Loading animation
  useEffect(() => {
    if (generating) {
      // Reset progress when starting generation
      setLoadingProgress(10);
      
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
      setPurpose(location.state.purpose || 'patience');
      setSermon(location.state as Sermon);
    } else {
      handleGenerateNew();
    }
  }, [location]);

  // Network status monitoring
  useEffect(() => {
    // Update network status
    setNetworkStatus(prev => ({
      lastChecked: Date.now(),
      isOnline: isOnline
    }));
    
    // Handle status changes
    if (!isOnline && networkStatus.isOnline) {
      // Just went offline
      toast.error('Network offline', {
        description: 'Your device is offline. Please check your internet connection.',
      });
    } else if (isOnline && !networkStatus.isOnline) {
      // Just came online
      toast.success('Connection restored', {
        description: 'Internet connection has been restored. You can retry generating the sermon.',
      });
      
      // Clear network error if we just came back online
      if (showError && networkError) {
        setShowError(null);
      }
    }
    
    // Setup listeners for online/offline events
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
  }, [isOnline, networkError, showError, networkStatus.isOnline]);

  // Periodically check network status in the background
  useEffect(() => {
    const interval = setInterval(() => {
      // If we have a network error, check connectivity more frequently
      const checkInterval = networkError ? 5000 : 15000; // 5 seconds if error, 15 seconds otherwise
      
      if (Date.now() - networkStatus.lastChecked > checkInterval) {
        setNetworkStatus(prev => ({
          lastChecked: Date.now(),
          isOnline: navigator.onLine
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [networkError, networkStatus.lastChecked]);

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
      
      const newSermon = await generateSermon(purpose);
      if (newSermon) {
        setSermon(newSermon);
        console.log("Sermon set with audio URL:", newSermon.fullAudioUrl || `https://islamicaudio.techrealm.online${newSermon.audio_url}`);
        setRetryAttempt(0); // Reset retry attempts on success
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
    // If we're still offline, show a message but don't retry
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

  if (showError && sermon) {
    toast.warning('Using backup sermon', {
      description: showError
    });
  }

  if (!sermon || generating) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div className="text-center text-white max-w-md px-4">
          {networkError ? (
            <WifiOff className="h-12 w-12 mx-auto mb-6 text-red-500" />
          ) : (
            <Loader className="h-12 w-12 animate-spin mx-auto mb-6" />
          )}
          
          <p className="text-lg font-medium mb-2">
            {networkError ? 'Network Connection Error' : 'Generating sermon...'}
          </p>
          
          <p className="text-sm text-white/70 mb-6">
            {networkError 
              ? 'Unable to connect to sermon server' 
              : 'This may take 15-20 seconds'}
          </p>
          
          <div className="w-full max-w-md mb-8">
            <Progress 
              value={networkError ? 100 : loadingProgress} 
              className={`h-2 ${networkError ? 'bg-red-900/30' : 'bg-white/10'}`} 
            />
            {!networkError && (
              <p className="text-xs text-white/50 mt-2 text-right">{Math.round(loadingProgress)}%</p>
            )}
          </div>
          
          {networkError && (
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
