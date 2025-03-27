
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SermonPlayerProps {
  title: string;
  text: string;
  audioUrl: string;
  onClose: () => void;
  onGenerateNew: () => void;
}

const SermonPlayer: React.FC<SermonPlayerProps> = ({
  title,
  text,
  audioUrl,
  onClose,
  onGenerateNew,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slideshow images
  const slides = [
    'https://cdn.pixabay.com/video/2020/03/07/33348-397122062_tiny.jpg',
    'https://ak.picdn.net/shutterstock/videos/3396445667/thumb/1.jpg',
  ];

  // Handle slideshow transition
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000); // Change slide every 8 seconds while playing
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length]);

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle audio loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek to position
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Handle volume change
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

  // Toggle mute
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

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Auto-play when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Auto-play failed:', error);
      });
      setIsPlaying(true);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in"
    >
      {/* Background Slideshow */}
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
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
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
        
        {/* Sermon Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6 text-shadow-lg animate-fade-in max-w-2xl">
            {title}
          </h1>
          
          <div className="max-w-2xl max-h-[40vh] overflow-auto glass p-6 rounded-xl text-white/90 animate-fade-in delay-100 mb-8">
            <p className="text-balance">{text}</p>
          </div>
        </div>
        
        {/* Audio Controls */}
        <div className="p-6 glass border-t border-white/10">
          <audio 
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
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
                >
                  <VolumeIcon className="h-5 w-5" />
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
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
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="default" 
                  size="icon" 
                  className="rounded-full h-12 w-12 bg-white text-black hover:bg-white/90"
                  onClick={togglePlayPause}
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
