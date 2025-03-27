
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
  audio_url: "/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav",
  text: "In the name of Allah, the Most Gracious, the Most Merciful. Today, we reflect on the virtue of patience in Islam. Patience, or 'sabr' in Arabic, is mentioned over 90 times in the Quran, highlighting its significance in our faith. The Prophet Muhammad (peace be upon him) said, 'Patience is light.' Through patience, we find strength in hardship, clarity in confusion, and peace in turmoil. Let us remember that Allah is with those who are patient, as mentioned in Surah Al-Baqarah: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' As we face life's challenges, let us cultivate patience in our hearts, knowing that with every difficulty comes ease.",
  title: "The Virtue of Patience in Islam",
  fullAudioUrl: "https://islamicaudio.techrealm.online/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav"
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
      const errorData = await response.text();
      const errorMessage = `Server responded with ${response.status}: ${response.statusText}. ${errorData}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data: Sermon = await response.json();
    
    // Construct the full audio URL with the correct base URL
    if (data.audio_url) {
      data.fullAudioUrl = `${API_BASE_URL}${data.audio_url}`;
      console.log("Full audio URL:", data.fullAudioUrl);
    }
    
    return data;
  } catch (error) {
    console.error('Error generating khutba:', error);
    
    // Determine if it's a network error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = error instanceof Error && 
      (error.message.includes('Failed to fetch') || 
       error.message.includes('Network error') ||
       error.message.includes('network'));
    
    // Show specific error message based on error type
    if (isNetworkError) {
      toast.error('Network Connection Error', {
        description: 'Unable to connect to sermon server. Please check your internet connection.',
        duration: 8000,
      });
    } else {
      // Show error message in toast
      toast.error('Failed to generate sermon', {
        description: errorMessage,
        duration: 8000,
      });
    }
    
    // For development or when the API fails, return sample data
    toast.warning('Using sample sermon data as fallback', {
      description: 'Real sermon generation is unavailable at the moment.',
      duration: 5000,
    });
    
    // Return sample data as fallback with the correct audio URL
    return {
      ...sampleSermon,
      title: `${sampleSermon.title} - ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}`,
    };
  }
};
