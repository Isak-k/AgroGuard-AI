import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeCropImage } from './services/geminiService.js';
import { 
  diseaseRoutes, 
  diseaseCategoryRoutes,
  chemicalRoutes, 
  marketRoutes, 
  pendingDiseaseRoutes, 
  commentRoutes 
} from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
const isDebug = process.env.DEBUG === 'true';

// Development debugging utilities
const debugLog = {
  info: (message, ...args) => {
    if (isDev && isDebug) {
      console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
  error: (message, error, ...args) => {
    if (isDev) {
      console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error, ...args);
    }
  },
  api: (method, path, statusCode, duration) => {
    if (isDev) {
      const emoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
      console.log(`${emoji} [API] ${method} ${path} - ${statusCode} (${duration}ms)`);
    }
  }
};

// Request logging middleware for development
if (isDev) {
  app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    debugLog.info(`Incoming ${req.method} ${req.path}`, {
      headers: req.headers,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    });
    
    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      debugLog.api(req.method, req.path, res.statusCode, duration);
      
      if (isDebug) {
        debugLog.info(`Response for ${req.method} ${req.path}`, data);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  });
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Health check endpoint with enhanced debugging info
app.get('/health', (req, res) => {
  const healthData = { 
    status: 'OK', 
    message: 'AgroGuard Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: isDebug,
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  };
  
  if (isDev) {
    healthData.env = {
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***SET***' : 'NOT_SET',
      USE_MOCK_AI: process.env.USE_MOCK_AI
    };
  }
  
  res.json(healthData);
});

// API Routes
app.use('/api/diseases', diseaseRoutes);
app.use('/api/disease-categories', diseaseCategoryRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/pending-diseases', pendingDiseaseRoutes);
app.use('/api/comments', commentRoutes);

// Crop disease analysis endpoint
app.post('/api/analyze-crop', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    debugLog.info('Crop analysis request received', {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      mimetype: req.file?.mimetype
    });
    
    if (!req.file) {
      debugLog.error('No image file provided in crop analysis request');
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    debugLog.info(`Image converted to base64, size: ${base64Image.length} characters`);
    
    // Analyze the image
    const result = await analyzeCropImage(base64Image);
    
    const duration = Date.now() - startTime;
    debugLog.info(`Crop analysis completed in ${duration}ms`, { success: result.success });
    
    res.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    debugLog.error(`Crop analysis failed after ${duration}ms`, error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      ...(isDev && { stack: error.stack })
    });
  }
});

// Analyze crop from base64 endpoint (for URL images)
app.post('/api/analyze-crop-base64', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No base64 image data provided'
      });
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const result = await analyzeCropImage(base64Data);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing crop image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  debugLog.error('Unhandled middleware error', error, {
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: isDev ? error.message : 'Internal server error',
    ...(isDev && { stack: error.stack, code: error.code })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AgroGuard Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌱 Crop analysis: http://localhost:${PORT}/api/analyze-crop`);
  console.log(`💊 Diseases API: http://localhost:${PORT}/api/diseases`);
  console.log(`🧪 Chemicals API: http://localhost:${PORT}/api/chemicals`);
  console.log(`🏪 Markets API: http://localhost:${PORT}/api/markets`);
  
  if (isDev) {
    console.log(`\n🛠️  Development Mode Enabled`);
    console.log(`   Debug logging: ${isDebug ? 'ON' : 'OFF'}`);
    console.log(`   CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    console.log(`   Mock AI: ${process.env.USE_MOCK_AI === 'true' ? 'ON' : 'OFF'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Test endpoints for development
    console.log(`\n🧪 Development Test Endpoints:`);
    console.log(`   GET  /health - Health check with debug info`);
    console.log(`   POST /api/analyze-crop - Test crop analysis`);
    console.log(`   GET  /api/diseases - List all diseases`);
    console.log(`   GET  /api/markets - List all markets`);
  }
});