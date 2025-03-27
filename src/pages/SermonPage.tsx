
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sermon } from '@/lib/api';
import SermonPlayer from '@/components/SermonPlayer';
import useSermon from '@/hooks/useSermon';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

const SermonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateSermon, loading } = useSermon();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Check if sermon data exists in location state
    if (location.state && 'audio_url' in location.state) {
      setSermon(location.state as Sermon);
    } else {
      // If accessed directly without sermon data, generate a default one
      handleGenerateNew();
    }
  }, [location]);

  const handleClose = () => {
    navigate('/');
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    
    try {
      toast.loading('Creating a new sermon...', { 
        description: 'Please wait while we generate your sermon.',
        duration: Infinity,
        id: 'new-sermon-generation'
      });
      
      const newSermon = await generateSermon('patience');
      if (newSermon) {
        setSermon(newSermon);
      }
      
      toast.dismiss('new-sermon-generation');
    } catch (error) {
      console.error('Error generating new sermon:', error);
      toast.error('Failed to generate new sermon', {
        description: 'Please try again or select a different theme.'
      });
    } finally {
      setGenerating(false);
      toast.dismiss('new-sermon-generation');
    }
  };

  if (!sermon || generating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Generating sermon...</p>
          <p className="text-sm text-white/70 mt-2">This may take 20-30 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <SermonPlayer
      title={sermon.title}
      text={sermon.text}
      audioUrl={sermon.fullAudioUrl || `https://islamicaudio.techrealm.online${sermon.audio_url}`}
      onClose={handleClose}
      onGenerateNew={handleGenerateNew}
    />
  );
};

export default SermonPage;
