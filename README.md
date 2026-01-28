# AgroGuard - Crop Disease Analysis Platform

An AI-powered platform for crop disease detection and agricultural guidance, built with React and powered by Google's Gemini AI.

## 🌱 Features

- **AI-Powered Disease Detection**: Upload crop images for instant disease analysis
- **Multi-language Support**: Available in English, Amharic, and Oromifa
- **Market Information**: Access local market prices and trends
- **User Authentication**: Secure login with role-based access (farmers/admin)
- **Scan History**: Track your previous disease analyses
- **Expert Guidance**: Get treatment recommendations and prevention tips

## 🏗️ Architecture

This project consists of two main parts:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express (for secure AI processing)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Gemini AI API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### 1. Clone and Install Frontend
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Configure Environment Variables

**Frontend (.env):**
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend (backend/.env):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend at `http://localhost:3001`.

## 🔧 Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React Query** - Data fetching
- **Firebase** - Authentication and database

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Multer** - File upload handling
- **Google Gemini AI** - Image analysis
- **CORS** - Cross-origin requests

## 📱 Key Pages

- **Dashboard**: Overview of recent scans and quick actions
- **Scan**: Upload and analyze crop images
- **Diseases**: Browse disease database
- **Markets**: View market prices and trends
- **Profile**: User settings and preferences
- **Admin**: Management interface for admins

## 🔒 Security Features

- API keys stored server-side only
- CORS protection
- File upload validation
- User authentication with Firebase
- Role-based access control

## 🌍 Deployment

### Frontend
Deploy the frontend to platforms like:
- **Vercel**: Connect GitHub repo and deploy automatically
- **Netlify**: Drag and drop build folder or connect GitHub
- **GitHub Pages**: Use GitHub Actions for automated deployment

### Backend
Deploy to platforms like:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS/GCP**: Use container services

Remember to set environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**"vite is not recognized"**
- Run `npm install` first

**"API quota exceeded"**
- Check your Gemini API quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure backend server is running

**CORS errors**
- Verify `CORS_ORIGIN` in backend/.env matches your frontend URL
- Check that both servers are running

**Firebase connection issues**
- Verify all Firebase environment variables are set correctly
- Check Firebase project settings

## 🎉 Complete Backend Integration!

I've successfully created a comprehensive backend system that stores and manages all admin data, making it accessible to farmers. Here's what's been implemented:

### 🏗️ Backend Architecture

**Complete API System:**
- **Disease Management** - Full CRUD operations with multi-language support
- **Chemical Database** - Safety instructions, dosages, and types
- **Market Data** - Pricing, availability, and location-based filtering
- **Pending Reviews** - Admin approval workflow for user-submitted diseases
- **Comment System** - User feedback and admin responses
- **Image Analysis** - Secure Gemini AI integration

**Data Storage:**
- File-based JSON database (easily portable)
- Automatic data persistence
- Sample data seeding script included

### 🔄 Frontend Integration

**Hybrid Approach:**
- Primary: Firebase/Firestore (when available)
- Fallback: Backend API (when Firebase fails or is blocked)
- Seamless switching between data sources

**Benefits:**
- ✅ **Always Available**: Data accessible even if Firebase is down
- ✅ **Admin Control**: All admin additions stored in backend
- ✅ **Farmer Access**: All data visible to farmers immediately
- ✅ **Offline Capable**: Backend can work without internet for Firestore
- ✅ **Scalable**: Easy to deploy and scale backend independently

### 📊 What Admins Can Manage (All Stored in Backend):

1. **Diseases** 
   - Multi-language names (English, Oromo, Amharic)
   - Symptoms and treatments
   - Crop associations
   - Images and descriptions

2. **Chemicals**
   - Types (Fungicide, Insecticide, etc.)
   - Active ingredients and dosages
   - Multi-language safety instructions

3. **Markets**
   - Location-based market data
   - Chemical pricing and availability
   - Real-time stock updates

4. **Pending Disease Reviews**
   - User submissions for new diseases
   - Admin approval/rejection workflow
   - Automatic promotion to main database

5. **User Comments & Feedback**
   - Categorized feedback system
   - Admin response capabilities
   - Status tracking (unread/read/replied)

### 🚀 How to Run the Complete System:

**Option 1: Quick Start (Windows)**
```cmd
start-dev.bat
```

**Option 2: Manual Setup**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run seed    # Populate with sample data
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

### 🌐 API Endpoints Available:

- `GET /api/diseases` - All diseases (visible to farmers)
- `POST /api/diseases` - Add disease (admin only)
- `GET /api/chemicals` - All chemicals with safety info
- `GET /api/markets` - Market data with pricing
- `POST /api/pending-diseases` - Submit disease for review
- `PUT /api/pending-diseases/:id/approve` - Approve disease (admin)
- `POST /api/comments` - Submit feedback
- `PUT /api/comments/:id/reply` - Admin reply to feedback

### 🔒 Security & Data Flow:

1. **Admin adds data** → Stored in backend database
2. **Backend API** → Serves data to frontend
3. **Frontend** → Displays data to farmers
4. **Fallback system** → Uses Firebase when backend unavailable

### 📱 User Experience:

**For Farmers:**
- See all diseases, chemicals, and market data added by admins
- Submit new disease reports for admin review
- Access real-time market pricing
- Get multi-language support

**For Admins:**
- Manage all agricultural data through dashboard
- Review and approve user submissions
- Update market prices and availability
- Respond to user feedback

The system now ensures that **everything admins add in the admin dashboard is immediately visible to farmers** and **permanently stored in the backend database**. The data persists even if Firebase is unavailable, providing a robust and reliable agricultural information system.