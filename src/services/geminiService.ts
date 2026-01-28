/**
 * Gemini AI Service for Crop Disease Analysis
 * Now uses backend API for secure processing
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Debug: Log the backend URL to console
console.log('🔧 Backend URL from env:', import.meta.env.VITE_BACKEND_URL);
console.log('🔧 Final Backend URL:', BACKEND_API_URL);

/**
 * Test backend connection
 */
export async function testBackendConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing backend connection to:', BACKEND_API_URL);
    const response = await fetch(`${BACKEND_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Backend response not OK:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

export interface DiseaseAnalysisResult {
  detected: boolean;
  diseaseName: string;
  diseaseNameAmharic?: string;
  diseaseNameOromifa?: string;
  confidence: number;
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  affectedCrops: string[];
  severity: 'low' | 'medium' | 'high';
  isHealthy: boolean;
}

export interface GeminiAnalysisResponse {
  success: boolean;
  result?: DiseaseAnalysisResult;
  error?: string;
}

/**
 * Convert a File or image URL to base64
 */
async function imageToBase64(imageSource: File | string): Promise<string> {
  if (typeof imageSource === 'string') {
    // If it's a URL, fetch and convert
    const response = await fetch(imageSource);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // If it's a File, convert directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    });
  }
}

/**
 * Analyze crop image for diseases using backend API
 */
export async function analyzeCropImage(imageSource: File | string): Promise<GeminiAnalysisResponse> {
  try {
    console.log('🔍 Starting image analysis...');
    console.log('🌐 Backend URL:', BACKEND_API_URL);
    
    if (typeof imageSource === 'string') {
      console.log('📷 Processing URL image...');
      // Handle URL images by converting to base64
      const base64Image = await imageToBase64(imageSource);
      
      const response = await fetch(`${BACKEND_API_URL}/api/analyze-crop-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: `data:image/jpeg;base64,${base64Image}`
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const result = await response.json();
      console.log('✅ Analysis successful:', result.success);
      return result;
    } else {
      console.log('📷 Processing file upload...');
      // Handle File objects using FormData
      const formData = new FormData();
      formData.append('image', imageSource);

      const response = await fetch(`${BACKEND_API_URL}/api/analyze-crop`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const result = await response.json();
      console.log('✅ Analysis successful:', result.success);
      return result;
    }
  } catch (error) {
    console.error('💥 Error analyzing crop image:', error);
    
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🔌 Network connection failed');
      return {
        success: false,
        error: 'Unable to connect to analysis service. Please check if the backend server is running.',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
}
