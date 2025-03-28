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
  const { 
    generateSermon, 
    retryGeneration, 
    generateBatchSermons, 
    loading: hookLoading, 
    error: hookError, 
    networkError: hookNetworkError, 
    retryCount, 
    isOnline 
  } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [sermonHistory, setSermonHistory] = useState<Sermon[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [purpose, setPurpose] = useState('patience');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [foreverMode, setForeverMode] = useState(false);
  const [prefetchingNext, setPrefetchingNext] = useState(false);
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
    if (foreverMode && !generating && !prefetchingNext && sermonHistory.length > 0 && currentIndex === sermonHistory.length - 1) {
      handlePrefetchNext();
    }
  }, [foreverMode, generating, prefetchingNext, sermonHistory.length, currentIndex]);

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
      setSermonHistory([location.state as Sermon]);
      setCurrentIndex(0);
      
      if (location.state.audio_url && !location.state.fullAudioUrl) {
        const constructedUrl = `https://islamicaudio.techrealm.online${location.state.audio_url.startsWith('/') ? location.state.audio_url : '/' + location.state.audio_url}`;
        toast.warning('Audio URL issue detected', {
          description: `Complete audio URL should be: ${constructedUrl}`,
          duration: 8000,
        });
      }
      
      handlePrefetchNext();
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
      toast.loading('Creating new sermons...', { 
        description: 'Please wait while we generate your sermons.',
        duration: Infinity,
        id: 'new-sermon-generation'
      });
      
      const newSermons = await generateBatchSermons(purpose, 3);
      if (newSermons && newSermons.length > 0) {
        setSermonHistory(newSermons);
        setCurrentIndex(0);
        setSermon(newSermons[0]);
        
        console.log("Sermons generated:", newSermons.length);
        console.log("- Current sermon with audio URL:", newSermons[0].audio_url);
        
        if (!newSermons[0].fullAudioUrl && newSermons[0].audio_url) {
          const constructedUrl = `https://islamicaudio.techrealm.online${newSermons[0].audio_url.startsWith('/') ? newSermons[0].audio_url : '/' + newSermons[0].audio_url}`;
          toast.warning('Audio URL issue', {
            description: `Complete audio URL should be: ${constructedUrl}`,
            duration: 8000,
          });
        }
        
        setRetryAttempt(0);
      } else {
        setShowError('Failed to generate sermons. Please try again.');
      }
      
    } catch (error) {
      console.error('Error generating new sermons:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setShowError(errorMessage);
      
      toast.error('Failed to generate new sermons', {
        description: 'Please try again or select a different theme.'
      });
    } finally {
      setGenerating(false);
      toast.dismiss('new-sermon-generation');
    }
  };

  const handlePrefetchNext = async () => {
    if (!isOnline || generating || prefetchingNext) return;
    
    setPrefetchingNext(true);
    
    try {
      const newSermons = await generateBatchSermons(purpose, 3);
      
      if (newSermons && newSermons.length > 0) {
        setSermonHistory(prev => [...prev, ...newSermons]);
        console.log("Prefetched additional sermons:", newSermons.length);
      }
    } catch (error) {
      console.error('Error prefetching sermons:', error);
    } finally {
      setPrefetchingNext(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < sermonHistory.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSermon(sermonHistory[nextIndex]);
      setAudioError(false);
      
      if (nextIndex >= sermonHistory.length - 2 && !prefetchingNext) {
        handlePrefetchNext();
      }
    } else if (!prefetchingNext) {
      handlePrefetchNext();
      toast.info('Loading more sermons...', {
        description: 'Please wait while we generate the next sermon.'
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSermon(sermonHistory[prevIndex]);
      setAudioError(false);
    } else {
      toast.info('You are at the first sermon', {
        description: 'There are no previous sermons available.'
      });
    }
  };

  const toggleForeverMode = () => {
    setForeverMode(prev => !prev);
    toast.success(foreverMode ? 'Forever mode disabled' : 'Forever mode enabled', {
      description: foreverMode 
        ? 'Auto-play of next sermons has been disabled' 
        : 'Sermons will auto-play continuously'
    });
  };

  const handleAudioEnded = () => {
    if (foreverMode) {
      handleNext();
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
  console.log("- Current index:", currentIndex);
  console.log("- Sermon history length:", sermonHistory.length);
  console.log("- Forever mode:", foreverMode);

  return (
    <SermonPlayer
      title={sermon.title}
      text={sermon.text}
      audioUrl={completeAudioUrl}
      rawAudioUrl={rawAudioUrl}
      onClose={handleClose}
      onGenerateNew={handleGenerateNew}
      hasError={!!showError || audioError}
      onPrevious={handlePrevious}
      onNext={handleNext}
      hasPrevious={currentIndex > 0}
      hasNext={currentIndex < sermonHistory.length - 1 || !prefetchingNext}
      isLoadingNext={prefetchingNext && currentIndex === sermonHistory.length - 1}
      onForeverModeToggle={toggleForeverMode}
      foreverMode={foreverMode}
      onAudioEnded={handleAudioEnded}
      currentIndex={currentIndex}
      totalSermons={sermonHistory.length}
    />
  );
};

export default SermonPage;
