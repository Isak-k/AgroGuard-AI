import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DevTools } from "@/components/DevTools";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { PWAInstall } from "@/components/PWAInstall";
import { debugLog } from "@/utils/debug";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Diseases from "./pages/Diseases";
import DiseaseDetail from "./pages/DiseaseDetail";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import Scan from "./pages/Scan";
import ScanHistory from "./pages/ScanHistory";
import Profile from "./pages/Profile";
import AskQuestion from "./pages/AskQuestion";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ErrorDiagnosis from "./pages/ErrorDiagnosis";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

const App = () => {
  debugLog.component('App', 'render');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-center" richColors />
                <DevTools />
                <PerformanceMonitor />
                <PWAInstall />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/test" element={
                      <div className="min-h-screen bg-background flex items-center justify-center">
                        <div className="text-center max-w-md p-6">
                          <h1 className="text-2xl font-bold text-foreground mb-4">🧪 Test Page</h1>
                          <p className="text-muted-foreground mb-6">If you can see this, the basic routing is working.</p>
                          
                          <div className="space-y-3">
                            <div className="p-3 bg-muted rounded text-sm">
                              <strong>Environment:</strong> {import.meta.env.MODE}
                            </div>
                            <div className="p-3 bg-muted rounded text-sm">
                              <strong>Debug Mode:</strong> {import.meta.env.VITE_DEBUG === 'true' ? 'ON' : 'OFF'}
                            </div>
                            <div className="p-3 bg-muted rounded text-sm">
                              <strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}
                            </div>
                          </div>
                          
                          <div className="mt-6 space-x-4">
                            <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
                            <Link to="/dashboard" className="text-primary hover:underline">Go to Dashboard</Link>
                            <Link to="/" className="text-primary hover:underline">Go to Home</Link>
                          </div>
                        </div>
                      </div>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/diseases" element={<Diseases />} />
                    <Route path="/diseases/:id" element={<DiseaseDetail />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/markets/:id" element={<MarketDetail />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/scan-history" element={<ScanHistory />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/ask-question" element={<AskQuestion />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/error-diagnosis" element={<ErrorDiagnosis />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
