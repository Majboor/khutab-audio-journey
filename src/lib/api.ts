
import { toast } from "sonner";

// Base URL for the API
const API_BASE_URL = 'https://islamicaudio.techrealm.online';

export interface Sermon {
  audio_url: string;
  text: string;
  title: string;
  fullAudioUrl?: string; // We'll add this with the complete URL
}

/**
 * Generate a new khutba sermon
 */
export const generateKhutba = async (purpose: string): Promise<Sermon> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-khutab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purpose }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data: Sermon = await response.json();
    
    // Construct the full audio URL
    data.fullAudioUrl = `${API_BASE_URL}${data.audio_url}`;
    
    return data;
  } catch (error) {
    console.error('Error generating khutba:', error);
    toast.error('Failed to generate sermon. Please try again.');
    throw error;
  }
};
