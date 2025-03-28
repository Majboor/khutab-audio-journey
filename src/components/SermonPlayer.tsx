import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SermonPlayerProps {
  title: string;
  text: string;
  audioUrl: string;
  rawAudioUrl?: string;
  onClose: () => void;
  onGenerateNew: () => void;
  hasError?: boolean;
}

const SermonPlayer: React.FC<SermonPlayerProps> = ({
  title,
  text,
  audioUrl,
  rawAudioUrl,
  onClose,
  onGenerateNew,
  hasError = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = [
    'https://cdn.pixabay.com/video/2020/03/07/33348-397122062_tiny.jpg',
    'https://ak.picdn.net/shutterstock/videos/3396445667/thumb/1.jpg',
  ];

  useEffect(() => {
    console.log("SermonPlayer received audioUrl:", audioUrl);
    if (rawAudioUrl) {
      console.log("SermonPlayer received rawAudioUrl:", rawAudioUrl);
    }
  }, [audioUrl, rawAudioUrl]);

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
    console.log("Audio data loaded successfully");
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio playback error:', e);
    setAudioError(true);
    setAudioLoading(false);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setAudioError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
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

  useEffect(() => {
    if (audioRef.current && !hasError) {
      setAudioError(false);
      setAudioLoading(true);
      
      const playTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error('Auto-play failed:', error);
            setAudioError(true);
          });
          setIsPlaying(true);
        }
      }, 1000);
      
      return () => {
        clearTimeout(playTimer);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [hasError, audioUrl]);

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

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
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            onClick={onGenerateNew}
          >
            Generate New
          </Button>
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
                {rawAudioUrl && (
                  <div className="mt-2 text-xs bg-black/20 p-2 rounded">
                    <p>Raw API audio URL: <code className="font-mono">{rawAudioUrl}</code></p>
                  </div>
                )}
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
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={handleLoadedData}
            onEnded={() => setIsPlaying(false)}
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
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-white hover:bg-white/10"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, currentTime - 10);
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
              </div>
              
              <div className="w-[100px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonPlayer;
