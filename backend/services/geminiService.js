import dotenv from 'dotenv';
import { analyzeCropImageMock } from './mockAiService.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !GEMINI_API_KEY;

if (!GEMINI_API_KEY && !USE_MOCK_AI) {
  console.warn('⚠️  GEMINI_API_KEY not found. Using Mock AI service instead.');
}

/**
 * Analyze crop image for diseases using Gemini Vision AI or Mock AI
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCropImage(base64Image) {
  // Use Mock AI if enabled or if Gemini API key is not available
  if (USE_MOCK_AI || !GEMINI_API_KEY) {
    console.log('🤖 Using Mock AI service for analysis...');
    return await analyzeCropImageMock(base64Image);
  }

  try {
    console.log('🧠 Using Gemini AI service for analysis...');
    
    const prompt = `You are an expert agricultural pathologist and crop disease specialist. Analyze this image of a crop/plant and identify any diseases or health issues.

IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no code blocks, just pure JSON.

If you detect a disease or health issue, respond with this exact JSON structure:
{
  "detected": true,
  "diseaseName": "English name of the disease",
  "diseaseNameAmharic": "Disease name in Amharic script",
  "diseaseNameOromifa": "Disease name in Oromifa/Afaan Oromo",
  "confidence": 85,
  "description": "Brief description of the disease",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "affectedCrops": ["crop1", "crop2"],
  "severity": "medium",
  "isHealthy": false
}

If the plant appears healthy, respond with:
{
  "detected": false,
  "diseaseName": "Healthy Plant",
  "diseaseNameAmharic": "ጤናማ ተክል",
  "diseaseNameOromifa": "Biqiltuu Fayyaa",
  "confidence": 90,
  "description": "The plant appears to be healthy with no visible signs of disease.",
  "symptoms": [],
  "treatment": ["Continue regular care and monitoring"],
  "prevention": ["Maintain good agricultural practices", "Regular inspection"],
  "affectedCrops": [],
  "severity": "low",
  "isHealthy": true
}

If this is not a plant/crop image, respond with:
{
  "detected": false,
  "diseaseName": "Not a Plant Image",
  "confidence": 0,
  "description": "This does not appear to be an image of a plant or crop. Please upload a clear image of the affected plant.",
  "symptoms": [],
  "treatment": [],
  "prevention": [],
  "affectedCrops": [],
  "severity": "low",
  "isHealthy": false
}

Confidence should be a number between 0-100.
Severity should be "low", "medium", or "high".`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      // Handle quota exceeded - fallback to Mock AI
      if (errorData.error?.message?.includes('quota')) {
        console.log('📊 Gemini API quota exceeded, falling back to Mock AI...');
        return await analyzeCropImageMock(base64Image);
      }
      
      throw new Error(errorData.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    
    // Extract the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.log('🔄 No response from Gemini AI, falling back to Mock AI...');
      return await analyzeCropImageMock(base64Image);
    }

    // Clean the response - remove any markdown code blocks if present
    let cleanedResponse = textResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    // Parse the JSON response
    const result = JSON.parse(cleanedResponse);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error with Gemini AI, falling back to Mock AI:', error);
    // Fallback to Mock AI on any error
    return await analyzeCropImageMock(base64Image);
  }
}