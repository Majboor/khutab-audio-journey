
import { toast } from "sonner";

// Base URL for the API
const API_BASE_URL = 'https://islamicaudio.techrealm.online';

export interface Sermon {
  audio_url: string;
  text: string;
  title: string;
  fullAudioUrl?: string; // We'll add this with the complete URL
}

// Sample sermon data for fallback/development purposes
const sampleSermon: Sermon = {
  audio_url: "/audio/sermon_sample.wav",
  text: "In the name of Allah, the Most Gracious, the Most Merciful. Today, we reflect on the virtue of patience in Islam. Patience, or 'sabr' in Arabic, is mentioned over 90 times in the Quran, highlighting its significance in our faith. The Prophet Muhammad (peace be upon him) said, 'Patience is light.' Through patience, we find strength in hardship, clarity in confusion, and peace in turmoil. Let us remember that Allah is with those who are patient, as mentioned in Surah Al-Baqarah: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' As we face life's challenges, let us cultivate patience in our hearts, knowing that with every difficulty comes ease.",
  title: "The Virtue of Patience in Islam",
  fullAudioUrl: "https://islamicaudio.techrealm.online/audio/sermon_sample.wav"
};

/**
 * Generate a new khutba sermon
 */
export const generateKhutba = async (purpose: string): Promise<Sermon> => {
  try {
    console.log(`Generating khutba for purpose: ${purpose}`);
    
    // In production environment, attempt to call the API
    const response = await fetch(`${API_BASE_URL}/generate-khutab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purpose }),
    });

    if (!response.ok) {
      console.error(`Server responded with ${response.status}: ${response.statusText}`);
      throw new Error(`Server responded with ${response.status}`);
    }

    const data: Sermon = await response.json();
    
    // Construct the full audio URL
    data.fullAudioUrl = `${API_BASE_URL}${data.audio_url}`;
    
    return data;
  } catch (error) {
    console.error('Error generating khutba:', error);
    
    // For development or when the API fails, return sample data
    toast.warning('Using sample sermon data while API is unavailable', {
      description: 'Real sermon generation will be available soon',
      duration: 5000,
    });
    
    // Return sample data as fallback
    return {
      ...sampleSermon,
      title: `${sampleSermon.title} - ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}`,
    };
  }
};
