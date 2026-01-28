import { motion } from 'framer-motion';
import { Search, AlertTriangle, MapPin, Camera, ChevronRight, Bell, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { DiseaseCard } from '@/components/DiseaseCard';
import { diseaseService } from '@/services/firestoreService';
import { mockDiseases, type Disease } from '@/data/mockData';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

export default function Dashboard() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const [featuredDiseases, setFeaturedDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string>('light');
  
  const location = userData?.location || localStorage.getItem('agroguard_location') || 'Select Location';

  useEffect(() => {
    loadFeaturedDiseases();
  }, []);

  const loadFeaturedDiseases = async () => {
    setLoading(true);
    try {
      const diseases = await diseaseService.getFeatured();
      // If no featured diseases found, fallback to first 3 mock diseases
      setFeaturedDiseases(diseases.length > 0 ? diseases.slice(0, 3) : mockDiseases.slice(0, 3));
    } catch (error) {
      console.error('Error loading featured diseases:', error);
      setFeaturedDiseases(mockDiseases.slice(0, 3));
    }
    setLoading(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-6 pb-8 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="AgroGuard AI"
              className="w-12 h-12 rounded-xl object-contain bg-primary-foreground/10"
            />
            <div>
              <h1 className="font-bold text-xl">{t('appName')}</h1>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center relative hover:bg-primary-foreground/30 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
          </div>
        </motion.div>

        {/* Quick Scan CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/scan"
            className="flex items-center gap-4 bg-primary-foreground/20 rounded-2xl p-4 hover:bg-primary-foreground/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground flex items-center justify-center">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{t('scanCrop')}</h3>
              <p className="text-sm opacity-90">
                Take a photo to identify diseases
              </p>
            </div>
            <ChevronRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/diseases"
              className="card-farmer-interactive flex flex-col items-center py-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{t('diseases')}</span>
            </Link>
            
            <Link
              to="/markets"
              className="card-farmer-interactive flex flex-col items-center py-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-3">
                <MapPin className="w-7 h-7 text-secondary" />
              </div>
              <span className="font-semibold text-foreground">{t('markets')}</span>
            </Link>
          </div>
        </motion.div>

        {/* Common Diseases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">{t('commonDiseases')}</h2>
            <Link
              to="/diseases"
              className="text-primary font-medium text-sm flex items-center gap-1 hover:underline"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              featuredDiseases.map((disease, index) => (
                <DiseaseCard key={disease.id} disease={disease} index={index} />
              ))
            )}
          </div>
        </motion.div>

        {/* Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-farmer bg-accent/50 border-accent"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">Early Detection</h3>
              <p className="text-sm text-muted-foreground">
                Scan your crops regularly to catch diseases early. Early treatment can prevent up to 70% crop loss.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
