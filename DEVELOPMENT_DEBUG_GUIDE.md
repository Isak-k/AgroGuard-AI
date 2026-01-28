# AgroGuard Development & Debug Guide

## 🛠️ Development Environment Setup

### Quick Start
```bash
# Start both frontend and backend in debug mode
npm run start:debug

# Or use the batch file (Windows)
start-dev-debug.bat

# Or start individually
npm run backend:dev    # Backend with debug logging
npm run dev:debug      # Frontend with DevTools
```

### Environment Configuration

#### Frontend (.env.development)
```env
VITE_DEBUG=true
VITE_VERBOSE_LOGGING=true
VITE_MOBILE_DEBUG=true
VITE_API_BASE_URL=http://localhost:3001
```

#### Backend (backend/.env)
```env
NODE_ENV=development
DEBUG=true
VERBOSE_LOGGING=true
USE_MOCK_AI=true
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

## 🔧 Debug Tools & Features

### 1. DevTools Panel (🛠️ Button)
- **Location**: Top-right corner of the app
- **Features**:
  - System information display
  - Real-time console log capture
  - Quick actions (clear logs, export debug info, test API)
  - Error testing capabilities

### 2. Performance Monitor (📊 Button)
- **Location**: Bottom-right corner of the app
- **Features**:
  - Render performance metrics
  - Memory usage tracking
  - Network request monitoring
  - Error counting
  - Manual garbage collection

### 3. Enhanced Error Boundary
- **Features**:
  - Detailed error information in development
  - Error categorization (Firebase, Theme, Network, etc.)
  - Copy debug information to clipboard
  - Development tips and suggestions

### 4. Backend Debug Logging
- **Features**:
  - Request/response logging
  - Performance timing
  - Error tracking with context
  - Health endpoint with debug info

## 📱 Mobile Development & APK Testing

### Mobile Debug Mode
```bash
# Start with mobile debugging enabled
npm run dev:mobile
```

### Mobile Debug Features
- On-screen debug overlay for mobile devices
- Touch-friendly debug information
- Network connectivity testing
- Performance monitoring for mobile

### APK Testing Workflow
1. Build debug version: `npm run build:debug`
2. Test locally: `npm run preview:debug`
3. Deploy to mobile testing environment
4. Use mobile debug overlay for real-time debugging

## 🚀 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:debug` | Start frontend with debug tools |
| `npm run dev:mobile` | Start with mobile debugging |
| `npm run backend:dev` | Start backend with debug logging |
| `npm run start:debug` | Start both frontend and backend |
| `npm run build:debug` | Build with debug information |
| `npm run preview:debug` | Preview debug build |
| `npm run health` | Check backend health |

## 🔍 Debugging Techniques

### 1. Console Debugging
```javascript
import { debugLog } from '@/utils/debug';

// Different log levels
debugLog.info('Information message', data);
debugLog.warn('Warning message', data);
debugLog.error('Error message', error);
debugLog.success('Success message', data);

// Specialized logging
debugLog.api('GET', '/api/diseases', requestData, responseData);
debugLog.component('MyComponent', 'render', props);
debugLog.auth('login', userData);
debugLog.firebase('document-read', docData);
debugLog.navigation('Dashboard', 'Profile', routeData);
```

### 2. Performance Monitoring
```javascript
import { perfMonitor } from '@/utils/debug';

const startTime = perfMonitor.start('operation-name');
// ... your code ...
perfMonitor.end('operation-name', startTime);
```

### 3. Error Tracking
```javascript
import { errorTracker } from '@/utils/debug';

try {
  // risky operation
} catch (error) {
  errorTracker.track(error, 'component-context');
}
```

### 4. Mobile Debugging
```javascript
import { mobileDebug } from '@/utils/debug';

mobileDebug.log('Mobile-specific debug message', data);
```

## 🌐 API Testing & Debugging

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Endpoints
- `GET /health` - Backend health with debug info
- `POST /api/analyze-crop` - Test crop analysis
- `GET /api/diseases` - List diseases
- `GET /api/markets` - List markets

### Debug API Calls
The DevTools panel includes an "Test API" button that automatically tests the backend connection.

## 🐛 Common Issues & Solutions

### 1. Frontend Won't Start
- Check if port 8080 is available
- Verify environment variables in `.env.development`
- Clear browser cache and localStorage
- Check DevTools console for errors

### 2. Backend Connection Issues
- Verify backend is running on port 3001
- Check CORS configuration in `backend/.env`
- Test health endpoint: `npm run health`
- Review backend console logs

### 3. Mobile Debug Issues
- Ensure mobile debug mode is enabled: `VITE_MOBILE_DEBUG=true`
- Check network connectivity between mobile device and development server
- Use `npm run dev:mobile` for mobile-accessible development server

### 4. Performance Issues
- Use Performance Monitor to identify bottlenecks
- Check memory usage and potential leaks
- Monitor network request frequency
- Use browser DevTools Performance tab

## 📊 Debug Information Export

### DevTools Export
Click "Export Debug Info" in the DevTools panel to download a JSON file containing:
- System information
- Error logs
- User state
- Environment configuration
- Recent console logs

### Error Boundary Export
When an error occurs, click "Copy Debug Info" to copy detailed error information including:
- Error details and stack trace
- Component stack
- System information
- Timestamp and context

## 🔄 Development Workflow

### Recommended Edit-Rebuild-Test Cycle
1. Make code changes
2. Save files (auto-reload enabled)
3. Check DevTools panel for any errors
4. Monitor Performance Monitor for performance impact
5. Test functionality
6. Check mobile debug overlay if testing mobile features
7. Export debug info if issues occur

### Fast Rebuild Configuration
- Vite HMR (Hot Module Replacement) enabled
- Source maps enabled for debugging
- Fast refresh for React components
- Automatic backend restart on file changes

## 🎯 Production vs Development

### Development Features (Disabled in Production)
- DevTools panel
- Performance Monitor
- Verbose console logging
- Error boundary debug information
- Mobile debug overlay
- Source maps

### Environment Detection
```javascript
import { isDev, isDebug } from '@/utils/debug';

if (isDev) {
  // Development-only code
}

if (isDebug) {
  // Debug-only code
}
```

## 📝 Debug Logging Best Practices

1. **Use appropriate log levels**: info, warn, error, success
2. **Include context**: component name, operation, relevant data
3. **Avoid logging sensitive information**: passwords, API keys, personal data
4. **Use structured logging**: consistent format and data structure
5. **Clean up debug code**: remove or disable debug logs before production

## 🚀 Performance Optimization Tips

1. **Monitor render counts**: Use Performance Monitor to track excessive re-renders
2. **Check memory usage**: Watch for memory leaks in long-running sessions
3. **Optimize network requests**: Monitor request frequency and size
4. **Use React DevTools**: Install React DevTools browser extension
5. **Profile with browser tools**: Use Chrome DevTools Performance tab

---

## 🆘 Getting Help

If you encounter issues:
1. Check the DevTools panel for errors
2. Export debug information
3. Review this guide for common solutions
4. Check browser console for additional details
5. Test with a fresh browser session (incognito mode)

Happy debugging! 🐛➡️✨