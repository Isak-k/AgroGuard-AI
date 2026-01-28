# AgroGuard Backend API

A comprehensive backend service for crop disease analysis, chemical management, and market data using Google's Gemini AI.

## 🌟 Features

- 🔒 **Secure API key handling** (server-side only)
- 📸 **Image upload and analysis** with Gemini AI
- 🌱 **Disease management** (CRUD operations)
- 🧪 **Chemical database** with safety instructions
- 🏪 **Market data** with pricing and availability
- 💬 **Comment system** for user feedback
- 📋 **Pending disease reviews** for admin approval
- 🚀 **RESTful API** with comprehensive endpoints
- 📁 **File-based database** (JSON storage)

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Seed database with sample data:**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Health & Status
```http
GET /health
```
Returns server status and version information.

### 🌱 Disease Management

#### Get All Diseases
```http
GET /api/diseases
```

#### Get Disease by ID
```http
GET /api/diseases/:id
```

#### Search Diseases by Crop Type
```http
GET /api/diseases/search/:cropType
```

#### Create Disease (Admin)
```http
POST /api/diseases
Content-Type: application/json

{
  "name": {
    "en": "Late Blight",
    "om": "Dhukkuba Booda",
    "am": "የዘገየ በሽታ"
  },
  "cropType": "Potato",
  "images": ["https://example.com/image.jpg"],
  "symptoms": {
    "en": ["Dark spots on leaves"],
    "om": ["Bakka gurraacha baala irratti"],
    "am": ["በቅጠሎች ላይ ጥቁር ነጠብጣቦች"]
  },
  "treatments": [
    {
      "chemicalId": "chemical_id_here",
      "chemicalName": "Ridomil Gold MZ",
      "dosage": "2.5 kg/ha",
      "applicationMethod": "Foliar spray"
    }
  ]
}
```

#### Update Disease (Admin)
```http
PUT /api/diseases/:id
```

#### Delete Disease (Admin)
```http
DELETE /api/diseases/:id
```

### 🧪 Chemical Management

#### Get All Chemicals
```http
GET /api/chemicals
```

#### Get Chemical by ID
```http
GET /api/chemicals/:id
```

#### Get Chemicals by Type
```http
GET /api/chemicals/type/:type
```

#### Create Chemical (Admin)
```http
POST /api/chemicals
Content-Type: application/json

{
  "name": "Ridomil Gold MZ",
  "type": "Fungicide",
  "activeIngredient": "Metalaxyl-M + Mancozeb",
  "dosage": "2.5 kg/ha",
  "safetyInstructions": {
    "en": "Wear protective clothing...",
    "om": "Uffata eegumsa uffadhu...",
    "am": "መከላከያ ልብስ ይልበሱ..."
  }
}
```

#### Update Chemical (Admin)
```http
PUT /api/chemicals/:id
```

#### Delete Chemical (Admin)
```http
DELETE /api/chemicals/:id
```

### 🏪 Market Management

#### Get All Markets
```http
GET /api/markets
```

#### Get Market by ID
```http
GET /api/markets/:id
```

#### Get Markets by Location
```http
GET /api/markets/location/:location
```

#### Get Market Chemicals
```http
GET /api/markets/:id/chemicals
```

#### Create Market (Admin)
```http
POST /api/markets
Content-Type: application/json

{
  "name": "Haramaya Agricultural Center",
  "location": "Haramaya",
  "region": "Oromia",
  "chemicals": [
    {
      "chemicalId": "chemical_id_here",
      "chemicalName": "Ridomil Gold MZ",
      "price": 850,
      "available": true,
      "lastUpdated": "2024-01-27"
    }
  ]
}
```

#### Update Market (Admin)
```http
PUT /api/markets/:id
```

#### Update Chemical Price/Availability in Market
```http
PUT /api/markets/:id/chemicals/:chemicalId
Content-Type: application/json

{
  "price": 900,
  "available": true
}
```

#### Delete Market (Admin)
```http
DELETE /api/markets/:id
```

### 📋 Pending Disease Reviews

#### Get All Pending Diseases
```http
GET /api/pending-diseases
```

#### Get Pending Diseases by Status
```http
GET /api/pending-diseases/status/:status
```

#### Submit Disease for Review
```http
POST /api/pending-diseases
Content-Type: application/json

{
  "submittedBy": "user_id",
  "submitterName": "John Farmer",
  "cropType": "Tomato",
  "location": "Addis Ababa",
  "images": ["https://example.com/disease.jpg"],
  "description": "Strange spots appearing on my tomato leaves",
  "symptoms": ["Brown spots", "Yellowing leaves"]
}
```

#### Approve Pending Disease (Admin)
```http
PUT /api/pending-diseases/:id/approve
Content-Type: application/json

{
  "diseaseData": {
    "name": { "en": "Tomato Blight", "om": "", "am": "" },
    "cropType": "Tomato",
    "symptoms": { "en": ["Brown spots"], "om": [], "am": [] },
    "treatments": []
  }
}
```

#### Reject Pending Disease (Admin)
```http
PUT /api/pending-diseases/:id/reject
Content-Type: application/json

{
  "reason": "Insufficient information provided"
}
```

### 💬 Comment System

#### Get All Comments
```http
GET /api/comments
```

#### Get Comments by Status
```http
GET /api/comments/status/:status
```

#### Get Comments by User
```http
GET /api/comments/user/:userId
```

#### Submit Comment
```http
POST /api/comments
Content-Type: application/json

{
  "userId": "user_id",
  "userName": "John Farmer",
  "userEmail": "john@example.com",
  "subject": "App Feedback",
  "message": "Great app! Very helpful for disease identification.",
  "category": "feedback"
}
```

#### Mark Comment as Read (Admin)
```http
PUT /api/comments/:id/read
```

#### Reply to Comment (Admin)
```http
PUT /api/comments/:id/reply
Content-Type: application/json

{
  "reply": "Thank you for your feedback!",
  "repliedBy": "Admin Team"
}
```

### 📸 Image Analysis

#### Analyze Crop Image (File Upload)
```http
POST /api/analyze-crop
Content-Type: multipart/form-data

Body:
- image: Image file (JPEG, PNG, etc.)
```

#### Analyze Crop Image (Base64)
```http
POST /api/analyze-crop-base64
Content-Type: application/json

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

## 📊 Response Format

All API endpoints return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🗄️ Data Storage

The backend uses a file-based JSON database with the following structure:

```
backend/data/
├── diseases.json          # Disease database
├── chemicals.json         # Chemical database  
├── markets.json          # Market database
├── pending-diseases.json # Pending reviews
└── comments.json         # User feedback
```

## 🔒 Security Features

- **API keys stored server-side only**
- **CORS protection** with configurable origins
- **File upload validation** (10MB limit, images only)
- **Input sanitization** and validation
- **Error message sanitization**
- **Request rate limiting** (can be added)

## 🌍 Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

**Heroku:**
```bash
git push heroku main
```

**Railway:**
Connect your GitHub repository

**DigitalOcean App Platform:**
Deploy from GitHub with auto-deploy

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoring

- **Health endpoint:** `/health`
- **Logs:** Console output with timestamps
- **Error tracking:** All errors logged with context
- **Performance:** Response times logged

## 🔧 Development

### Adding New Endpoints

1. Create route file in `routes/`
2. Add database operations in `services/database.js`
3. Import and use in `server.js`
4. Update this README

### Database Schema

Each collection follows this pattern:
```json
{
  "id": "unique_id",
  "createdAt": "2024-01-27T10:00:00.000Z",
  "updatedAt": "2024-01-27T10:00:00.000Z",
  ...data
}
```

## 🆘 Troubleshooting

**Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

**Database file permissions:**
```bash
chmod 755 backend/data/
chmod 644 backend/data/*.json
```

**CORS errors:**
- Check `CORS_ORIGIN` in `.env`
- Verify frontend URL matches exactly

**Gemini API errors:**
- Check API key validity
- Monitor quota usage
- Verify network connectivity

## 📝 License

MIT License - see LICENSE file for details.