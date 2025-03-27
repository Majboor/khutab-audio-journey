
import { toast } from "sonner";

// Base URL for the API
const API_BASE_URL = 'https://islamicaudio.techrealm.online';

export interface Sermon {
  audio_url: string;
  text: string;
  title: string;
  fullAudioUrl?: string; // We'll add this with the complete URL
  purpose?: string;      // Track the purpose for retries
  errorType?: 'network' | 'server' | 'other'; // Add the errorType property
}

// Sample sermon data for fallback/development purposes
const sampleSermon: Sermon = {
  audio_url: "/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav",
  text: "In the name of Allah, the Most Gracious, the Most Merciful. Today, we reflect on the virtue of patience in Islam. Patience, or 'sabr' in Arabic, is mentioned over 90 times in the Quran, highlighting its significance in our faith. The Prophet Muhammad (peace be upon him) said, 'Patience is light.' Through patience, we find strength in hardship, clarity in confusion, and peace in turmoil. Let us remember that Allah is with those who are patient, as mentioned in Surah Al-Baqarah: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' As we face life's challenges, let us cultivate patience in our hearts, knowing that with every difficulty comes ease.",
  title: "The Virtue of Patience in Islam",
  fullAudioUrl: "https://islamicaudio.techrealm.online/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav"
};

// Additional sample sermons for variety
const sampleSermons = [
  sampleSermon,
  {
    audio_url: "/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav",
    text: "Bismillah. The Prophet Muhammad (peace be upon him) said: 'The strong person is not the one who overcomes people with his strength, but the one who controls himself when angry.' Today we explore how controlling our anger leads to inner peace and stronger community bonds. Through mindfulness and remembrance of Allah, we can transform anger into patience and understanding. Remember the words from the Quran: 'Those who spend (in Allah's way) in prosperity and in adversity, who restrain anger and pardon people. And Allah loves the doers of good.'",
    title: "Managing Anger: The Islamic Approach to Emotional Control",
    fullAudioUrl: "https://islamicaudio.techrealm.online/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav"
  },
  {
    audio_url: "/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav",
    text: "In the name of Allah, the Most Compassionate, the Most Merciful. Gratitude (shukr) is central to our faith. The Quran repeatedly reminds us, 'If you are grateful, I will surely increase you [in favor].' By recognizing and appreciating Allah's countless blessings, we cultivate contentment and resilience. Gratitude transforms our perspective, allowing us to see challenges as opportunities for growth rather than obstacles. Let us practice gratitude daily through our prayers, actions, and interactions with others.",
    title: "The Power of Gratitude in Islamic Tradition",
    fullAudioUrl: "https://islamicaudio.techrealm.online/audio/the-transformative-power-of-patience-a-journey-of-self-discovery-and-unity_with_background.wav"
  }
];

/**
 * Function to check if the device is connected to the internet
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Generate a new khutba sermon
 */
export const generateKhutba = async (purpose: string, signal?: AbortSignal): Promise<Sermon> => {
  try {
    console.log(`Generating khutba for purpose: ${purpose}`);
    
    // First, check if we're online
    if (!isOnline()) {
      console.log("Device is offline, returning offline sermon");
      throw new Error("network_offline");
    }
    
    // Create a composite signal that combines the provided signal with a timeout
    let timeoutController: AbortController | null = null;
    let effectiveSignal = signal;
    
    if (!signal) {
      timeoutController = new AbortController();
      effectiveSignal = timeoutController.signal;
      // Reduce timeout to 10 seconds to improve perceived responsiveness
      setTimeout(() => timeoutController?.abort(), 10000); 
    }
    
    // Add network error detection and retry mechanism
    let retryCount = 0;
    const maxRetries = 2; // Increase to 2 retries for better success chance
    let lastError: Error | null = null;
    
    while (retryCount <= maxRetries) {
      try {
        // Log when attempting API calls, including retry information
        console.log(`API attempt ${retryCount + 1}/${maxRetries + 1} for purpose: ${purpose}`);
        
        // Attempt to call the API
        const response = await fetch(`${API_BASE_URL}/generate-khutab`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purpose }),
          signal: effectiveSignal,
        });

        // Clean up timeout controller if we created one
        if (timeoutController) {
          timeoutController = null;
        }

        if (!response.ok) {
          const errorData = await response.text();
          const errorMessage = `Server responded with ${response.status}: ${response.statusText}. ${errorData}`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const data: Sermon = await response.json();
        
        // Store the purpose in the sermon object for potential retries
        data.purpose = purpose;
        
        // Construct the full audio URL with the correct base URL
        if (data.audio_url) {
          data.fullAudioUrl = `${API_BASE_URL}${data.audio_url}`;
          console.log("Full audio URL:", data.fullAudioUrl);
        }
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`API attempt ${retryCount + 1} failed:`, lastError);
        
        // Check if we should retry
        const isNetworkError = 
          lastError.message.includes('Failed to fetch') || 
          lastError.message.includes('Network error') ||
          lastError.message.includes('network') ||
          lastError.message.includes('AbortError') ||
          lastError.message.includes('timed out') ||
          lastError.message.includes('abort') ||
          // Add CORS error detection
          lastError.message.includes('CORS') ||
          lastError.message.includes('cross-origin');
                             
        if (isNetworkError && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying API call (attempt ${retryCount+1}/${maxRetries+1})`);
          // Increase wait time between retries (exponential backoff)
          const waitTime = 500 * Math.pow(2, retryCount-1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If we get here, either it's not a network error or we've reached max retries
        throw lastError;
      }
    }
    
    // This code shouldn't be reached due to the while loop and throw above
    throw lastError || new Error('Unknown error occurred');
    
  } catch (error) {
    console.error('Error generating khutba:', error);
    
    // Determine error type
    let errorMessage: string;
    let errorType: 'network' | 'server' | 'other' = 'other';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for explicit offline state
      if (error.message === 'network_offline') {
        errorType = 'network';
        errorMessage = 'Your device is offline. Please check your internet connection.';
      }
      // Check for other network errors
      else if (
        error.message.includes('Failed to fetch') || 
        error.message.includes('Network error') ||
        error.message.includes('network') ||
        error.message.includes('AbortError') ||
        error.message.includes('timed out') ||
        error.message.includes('abort') ||
        error.message.includes('CORS') ||
        error.message.includes('cross-origin')
      ) {
        errorType = 'network';
        errorMessage = 'Network connection error. Unable to reach sermon server.';
      } else if (
        error.message.includes('500') || 
        error.message.includes('503') ||
        error.message.includes('server')
      ) {
        errorType = 'server';
        errorMessage = 'The sermon server is experiencing issues. Please try again later.';
      }
    } else {
      errorMessage = 'Unknown error occurred';
    }
    
    // Show specific error message based on error type
    if (errorType === 'network') {
      toast.error('Network Connection Error', {
        description: 'Unable to connect to sermon server. Please check your internet connection.',
        duration: 8000,
      });
    } else if (errorType === 'server') {
      toast.error('Server Error', {
        description: errorMessage,
        duration: 8000,
      });
    } else {
      // Show general error message
      toast.error('Failed to generate sermon', {
        description: errorMessage,
        duration: 8000,
      });
    }
    
    // Select a random sample sermon as fallback
    const randomIndex = Math.floor(Math.random() * sampleSermons.length);
    const fallbackSermon = sampleSermons[randomIndex];
    
    // Add the purpose to the title to make it seem more relevant
    const capitalizedPurpose = purpose.charAt(0).toUpperCase() + purpose.slice(1);
    const customizedTitle = `${fallbackSermon.title} - ${capitalizedPurpose}`;
    
    toast.warning('Using sample sermon data as fallback', {
      description: 'Real sermon generation is unavailable at the moment.',
      duration: 5000,
    });
    
    // Return fallback data with error information attached
    return {
      ...fallbackSermon,
      title: customizedTitle,
      purpose,
      errorType, // Here we're using the errorType directly (fixed the error)
    };
  }
};
