
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, AlertTriangle, ExternalLink, Repeat, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";

interface SermonPlayerProps {
  title: string;
  text: string;
  audioUrl: string;
  rawAudioUrl?: string;
  onClose: () => void;
  onGenerateNew: () => void;
  hasError?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isLoadingNext?: boolean;
  onForeverModeToggle?: () => void;
  foreverMode?: boolean;
  onAudioEnded?: () => void;
  currentIndex?: number;
  totalSermons?: number;
}

const SermonPlayer: React.FC<SermonPlayerProps> = ({
  title,
  text,
  audioUrl,
  rawAudioUrl,
  onClose,
  onGenerateNew,
  hasError = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = true,
  isLoadingNext = false,
  onForeverModeToggle,
  foreverMode = false,
  onAudioEnded,
  currentIndex = 0,
  totalSermons = 1,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The direct URL from the prop
  const completeAudioUrl = audioUrl;

  const slides = [
    'https://cdn.pixabay.com/video/2020/03/07/33348-397122062_tiny.jpg',
    'https://ak.picdn.net/shutterstock/videos/3396445667/thumb/1.jpg',
  ];

  useEffect(() => {
    console.log("SermonPlayer received audioUrl:", audioUrl);
    console.log("Complete audio URL for player:", completeAudioUrl);
    if (rawAudioUrl) {
      console.log("SermonPlayer received rawAudioUrl:", rawAudioUrl);
    }
  }, [audioUrl, rawAudioUrl, completeAudioUrl]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000); // Change slide every 8 seconds while playing
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioLoading(false);
      console.log("Audio loaded successfully, duration:", audioRef.current.duration);
    }
  };

  const handleLoadedData = () => {
    setAudioLoading(false);
    setAudioError(false);
    setAudioInitialized(true);
    setAudioEnded(false);
    console.log("Audio data loaded successfully");
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio playback error:', e);
    console.error('Failed audio URL:', completeAudioUrl);
    setAudioError(true);
    setAudioLoading(false);
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    console.log("Audio playback ended, foreverMode:", foreverMode);
    setIsPlaying(false);
    setAudioEnded(true);
    
    if (onAudioEnded && foreverMode) {
      console.log("Triggering onAudioEnded callback for forever mode");
      onAudioEnded();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || audioError || hasError || audioLoading) {
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset audio position if it has ended
      if (audioEnded && audioRef.current.currentTime >= audioRef.current.duration) {
        audioRef.current.currentTime = 0;
        setAudioEnded(false);
      }
      
      // Create a new audio context if needed to help initiate playback
      if (!audioInitialized && window.AudioContext) {
        const audioContext = new AudioContext();
        audioContext.resume().then(() => {
          console.log("AudioContext resumed successfully");
        }).catch(err => {
          console.error("Error resuming AudioContext:", err);
        });
      }
      
      // Add explicit promise handling for play()
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Audio playback started successfully");
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            console.error('Audio URL that failed:', completeAudioUrl);
            setAudioError(true);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
      
      // If the audio had ended and user seeks back, reset the ended state
      if (audioEnded) {
        setAudioEnded(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Initialize the audio element and set explicit source
  useEffect(() => {
    // Only proceed if we have a valid audio URL and the errors are not present
    if (!completeAudioUrl || hasError) {
      setAudioError(true);
      setAudioLoading(false);
      return;
    }
    
    // Create and configure a new audio element
    const createAudioElement = () => {
      if (!audioRef.current) return;
      
      // Reset states
      setAudioError(false);
      setAudioLoading(true);
      setAudioInitialized(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioEnded(false);
      
      try {
        // Stop any current playback
        audioRef.current.pause();
        
        // Clear any existing source
        audioRef.current.removeAttribute('src');
        
        // Set the new source
        audioRef.current.src = completeAudioUrl;
        
        // Set initial volume
        audioRef.current.volume = volume;
        
        // Explicitly set crossOrigin to allow CORS requests if needed
        audioRef.current.crossOrigin = "anonymous";
        
        // Set preload to auto to start loading immediately
        audioRef.current.preload = "auto";
        
        // Force a load to initialize the audio
        audioRef.current.load();
        
        console.log("Audio source explicitly set to:", completeAudioUrl);
      } catch (err) {
        console.error("Error setting audio source:", err);
        setAudioError(true);
        setAudioLoading(false);
      }
    };
    
    // Initialize audio
    createAudioElement();
    
    // Add event listener for connecting audio hardware
    const handleHardwareConnected = () => {
      console.log("Audio hardware connected or changed, reinitializing...");
      createAudioElement();
    };
    
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', handleHardwareConnected);
    }
    
    // Clean up function
    return () => {
      if (audioRef.current) {
        // Ensure playback is stopped
        audioRef.current.pause();
        
        // Clear source and release resources
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      
      // Remove event listener
      if (navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', handleHardwareConnected);
      }
    };
  }, [completeAudioUrl, hasError, volume]);

  // Try to reinitialize audio if there was an error
  useEffect(() => {
    if (audioError && completeAudioUrl && !hasError && audioRef.current) {
      const retryTimer = setTimeout(() => {
        console.log("Attempting to reinitialize audio after error...");
        // Clear any existing source
        audioRef.current.removeAttribute('src');
        
        // Set the source again
        audioRef.current.src = completeAudioUrl;
        audioRef.current.load();
        setAudioError(false);
        setAudioLoading(true);
      }, 3000); // Wait 3 seconds before retry
      
      return () => clearTimeout(retryTimer);
    }
  }, [audioError, completeAudioUrl, hasError]);

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  // Auto-play when in forever mode
  useEffect(() => {
    if (foreverMode && !isPlaying && !audioLoading && !audioError && !hasError && audioInitialized) {
      console.log("Forever mode detected, attempting to auto-play");
      togglePlayPause();
    }
  }, [foreverMode, audioInitialized, audioLoading, audioError, hasError]);

  // Monitor audio ended state for forever mode
  useEffect(() => {
    if (audioEnded && foreverMode && !isPlaying && onNext && hasNext) {
      console.log("Audio ended in forever mode, proceeding to next sermon");
      // Small timeout to prevent rapid transitions
      const nextTimer = setTimeout(() => {
        onNext();
      }, 1000);
      
      return () => clearTimeout(nextTimer);
    }
  }, [audioEnded, foreverMode, isPlaying, onNext, hasNext]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in"
    >
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
              currentSlide === index ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center p-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="bg-white/10 backdrop-blur-md text-white"
            >
              {currentIndex + 1} of {totalSermons}
            </Badge>
            
            <Button
              variant={foreverMode ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full backdrop-blur-md text-white",
                foreverMode ? "bg-primary hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"
              )}
              onClick={onForeverModeToggle}
            >
              <Repeat className={cn(
                "h-4 w-4 mr-1",
                foreverMode && "text-primary-foreground"
              )} />
              Forever Mode
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              onClick={onGenerateNew}
            >
              Generate New
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6 text-shadow-lg animate-fade-in max-w-2xl">
            {title}
          </h1>
          
          {(hasError || audioError) && (
            <Alert variant="destructive" className="mb-6 bg-red-900/60 border-red-800 text-white max-w-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Audio Error</AlertTitle>
              <AlertDescription className="text-white/90">
                There was a problem loading the audio. The sermon text is still available to read.
                <div className="mt-2 text-xs bg-black/20 p-3 rounded overflow-auto">
                  <p className="mb-1">Complete Audio URL:</p>
                  <div className="flex items-center gap-2 font-mono break-all">
                    <code>{completeAudioUrl || 'Not available'}</code>
                    {completeAudioUrl && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full bg-white/10"
                        onClick={() => window.open(completeAudioUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {rawAudioUrl && (
                    <>
                      <p className="mt-2 mb-1">Raw API audio path:</p>
                      <code className="font-mono">{rawAudioUrl}</code>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="max-w-2xl max-h-[40vh] overflow-auto glass p-6 rounded-xl text-white/90 animate-fade-in delay-100 mb-8">
            <p className="text-balance">{text}</p>
          </div>
        </div>
        
        <div className="p-6 glass border-t border-white/10">
          <audio 
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={handleLoadedData}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            preload="auto"
            className="hidden"
          />
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="mx-4 flex-1"
                disabled={audioError || hasError || audioLoading}
              />
              <span className="text-xs text-white/80">{formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-white hover:bg-white/10"
                  onClick={toggleMute}
                  disabled={audioError || hasError || audioLoading}
                >
                  <VolumeIcon className="h-5 w-5" />
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                  disabled={audioError || hasError || audioLoading}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "rounded-full text-white",
                    hasPrevious ? "hover:bg-white/10" : "opacity-50 cursor-not-allowed"
                  )}
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-white hover:bg-white/10"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, currentTime - 10);
                      // Reset ended state if user skips back
                      if (audioEnded) {
                        setAudioEnded(false);
                      }
                    }
                  }}
                  disabled={audioError || hasError || audioLoading}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="default" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 ${audioError || hasError || audioLoading ? 'bg-gray-500 text-white/70 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90'}`}
                  onClick={togglePlayPause}
                  disabled={audioError || hasError || audioLoading}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-white hover:bg-white/10"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                    }
                  }}
                  disabled={audioError || hasError || audioLoading}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "rounded-full text-white",
                    !hasNext || isLoadingNext ? "opacity-50" : "hover:bg-white/10"
                  )}
                  onClick={onNext}
                  disabled={!hasNext || isLoadingNext}
                >
                  {isLoadingNext ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <div className="w-[100px] flex items-center justify-end">
                <Button
                  variant={foreverMode ? "default" : "ghost"} 
                  size="sm"
                  className={cn(
                    "rounded-full h-8",
                    foreverMode 
                      ? "bg-primary/90 text-primary-foreground hover:bg-primary" 
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                  onClick={onForeverModeToggle}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonPlayer;
