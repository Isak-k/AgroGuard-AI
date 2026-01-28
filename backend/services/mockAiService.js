/**
 * Mock AI Service for Crop Disease Analysis
 * Provides realistic disease analysis without external API calls
 * Perfect for development, testing, and demonstration
 */

// Sample disease database for realistic responses
const diseaseDatabase = [
  {
    name: "Late Blight",
    nameAmharic: "ዘግይቶ ብሊት",
    nameOromifa: "Dhukkuba Boqqolloo",
    description: "A serious fungal disease that affects potato and tomato plants, causing dark lesions on leaves and stems.",
    symptoms: [
      "Dark brown or black lesions on leaves",
      "White fuzzy growth on underside of leaves", 
      "Stems may become infected and break",
      "Tubers develop brown rot"
    ],
    treatment: [
      "Remove and destroy infected plant parts immediately",
      "Apply copper-based fungicide spray",
      "Improve air circulation around plants",
      "Avoid overhead watering"
    ],
    prevention: [
      "Plant resistant varieties when available",
      "Ensure good drainage and air circulation",
      "Avoid watering leaves directly",
      "Remove plant debris at end of season"
    ],
    affectedCrops: ["Potato", "Tomato"],
    severity: "high"
  },
  {
    name: "Powdery Mildew",
    nameAmharic: "ዱቄታማ ሻጋታ",
    nameOromifa: "Dhukkuba Daakuu",
    description: "A common fungal disease that appears as white powdery spots on leaves and stems.",
    symptoms: [
      "White powdery spots on leaves",
      "Yellowing of affected leaves",
      "Stunted plant growth",
      "Distorted leaf shape"
    ],
    treatment: [
      "Apply baking soda solution (1 tsp per quart water)",
      "Use neem oil spray",
      "Remove affected leaves",
      "Improve air circulation"
    ],
    prevention: [
      "Plant in sunny locations with good air flow",
      "Avoid overhead watering",
      "Space plants properly",
      "Choose resistant varieties"
    ],
    affectedCrops: ["Cucumber", "Squash", "Tomato", "Bean"],
    severity: "medium"
  },
  {
    name: "Bacterial Wilt",
    nameAmharic: "የባክቴሪያ ዊልት",
    nameOromifa: "Dhukkuba Baakteeriyaa",
    description: "A bacterial disease that causes plants to wilt and die, often affecting the vascular system.",
    symptoms: [
      "Sudden wilting of leaves",
      "Brown streaks in stem when cut",
      "Yellowing of lower leaves first",
      "Plant death within days"
    ],
    treatment: [
      "Remove and destroy infected plants immediately",
      "Disinfect tools between plants",
      "Apply copper-based bactericide",
      "Improve soil drainage"
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Rotate crops annually",
      "Avoid working with wet plants",
      "Control insect vectors"
    ],
    affectedCrops: ["Tomato", "Pepper", "Eggplant", "Potato"],
    severity: "high"
  },
  {
    name: "Leaf Spot",
    nameAmharic: "የቅጠል ነጠብጣ",
    nameOromifa: "Tuqaa Baalaa",
    description: "A fungal disease causing circular spots on leaves, common in humid conditions.",
    symptoms: [
      "Small circular spots on leaves",
      "Spots may have yellow halos",
      "Leaves may turn yellow and drop",
      "Reduced plant vigor"
    ],
    treatment: [
      "Remove affected leaves",
      "Apply fungicide spray",
      "Improve air circulation",
      "Reduce leaf wetness"
    ],
    prevention: [
      "Water at soil level, not on leaves",
      "Space plants for good air flow",
      "Remove plant debris",
      "Use drip irrigation"
    ],
    affectedCrops: ["Bean", "Cucumber", "Tomato", "Pepper"],
    severity: "low"
  },
  {
    name: "Root Rot",
    nameAmharic: "የሥር ብስባሽ",
    nameOromifa: "Tortoruu Hidda",
    description: "A soil-borne disease that affects plant roots, causing poor growth and wilting.",
    symptoms: [
      "Stunted plant growth",
      "Yellowing leaves",
      "Wilting despite moist soil",
      "Dark, mushy roots"
    ],
    treatment: [
      "Improve soil drainage immediately",
      "Reduce watering frequency",
      "Apply fungicide to soil",
      "Remove severely affected plants"
    ],
    prevention: [
      "Ensure proper soil drainage",
      "Avoid overwatering",
      "Use raised beds if needed",
      "Rotate crops regularly"
    ],
    affectedCrops: ["Most vegetables", "Beans", "Peas", "Cucumber"],
    severity: "medium"
  }
];

const healthyResponses = [
  {
    name: "Healthy Plant",
    nameAmharic: "ጤናማ ተክል",
    nameOromifa: "Biqiltuu Fayyaa",
    description: "The plant appears to be healthy with no visible signs of disease. Continue with regular care and monitoring.",
    treatment: ["Continue regular watering and fertilizing", "Monitor for any changes", "Maintain good garden hygiene"],
    prevention: ["Keep up current care routine", "Regular inspection for early detection", "Maintain proper spacing and air circulation"]
  },
  {
    name: "Vigorous Growth",
    nameAmharic: "ጠንካራ እድገት", 
    nameOromifa: "Guddina Cimaa",
    description: "Excellent plant health with strong growth patterns. This plant shows optimal growing conditions.",
    treatment: ["Maintain current care routine", "Consider light pruning for better shape", "Continue monitoring"],
    prevention: ["Keep soil moisture consistent", "Maintain current fertilization schedule", "Watch for overcrowding"]
  }
];

/**
 * Analyze image characteristics to determine likely disease
 * This simulates AI analysis based on common patterns
 */
function analyzeImageCharacteristics(imageBuffer) {
  // Simulate analysis based on image properties
  const imageSize = imageBuffer.length;
  const timestamp = Date.now();
  
  // Create pseudo-random but consistent results based on image characteristics
  const seed = imageSize % 1000 + (timestamp % 10000);
  
  // 70% chance of detecting a disease, 30% healthy
  const isHealthy = (seed % 10) < 3;
  
  if (isHealthy) {
    const healthyResponse = healthyResponses[seed % healthyResponses.length];
    return {
      detected: false,
      isHealthy: true,
      confidence: 85 + (seed % 15), // 85-99% confidence
      disease: healthyResponse
    };
  }
  
  // Select disease based on image characteristics
  const diseaseIndex = seed % diseaseDatabase.length;
  const disease = diseaseDatabase[diseaseIndex];
  
  return {
    detected: true,
    isHealthy: false,
    confidence: 70 + (seed % 25), // 70-94% confidence
    disease: disease
  };
}

/**
 * Mock AI analysis function
 * @param {Buffer|string} imageData - Image buffer or base64 string
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCropImageMock(imageData) {
  try {
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Convert base64 to buffer if needed
    let imageBuffer;
    if (typeof imageData === 'string') {
      imageBuffer = Buffer.from(imageData, 'base64');
    } else {
      imageBuffer = imageData;
    }
    
    // Validate image size (basic check)
    if (imageBuffer.length < 100) {
      return {
        success: false,
        error: 'Image too small or corrupted. Please upload a clear image of the plant.'
      };
    }
    
    if (imageBuffer.length > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image too large. Please use an image under 10MB.'
      };
    }
    
    // Analyze image characteristics
    const analysis = analyzeImageCharacteristics(imageBuffer);
    const disease = analysis.disease;
    
    // Build response
    const result = {
      detected: analysis.detected,
      diseaseName: disease.name,
      diseaseNameAmharic: disease.nameAmharic,
      diseaseNameOromifa: disease.nameOromifa,
      confidence: analysis.confidence,
      description: disease.description,
      symptoms: disease.symptoms || [],
      treatment: disease.treatment || [],
      prevention: disease.prevention || [],
      affectedCrops: disease.affectedCrops || [],
      severity: disease.severity || 'medium',
      isHealthy: analysis.isHealthy
    };
    
    return {
      success: true,
      result: result
    };
    
  } catch (error) {
    console.error('Mock AI analysis error:', error);
    return {
      success: false,
      error: 'Failed to analyze image. Please try again.'
    };
  }
}

/**
 * Get random disease information for educational purposes
 */
export function getRandomDiseaseInfo() {
  const disease = diseaseDatabase[Math.floor(Math.random() * diseaseDatabase.length)];
  return disease;
}

/**
 * Search diseases by crop type
 */
export function searchDiseasesByCrop(cropType) {
  return diseaseDatabase.filter(disease => 
    disease.affectedCrops.some(crop => 
      crop.toLowerCase().includes(cropType.toLowerCase())
    )
  );
}

/**
 * Get disease by name
 */
export function getDiseaseByName(name) {
  return diseaseDatabase.find(disease => 
    disease.name.toLowerCase() === name.toLowerCase()
  );
}