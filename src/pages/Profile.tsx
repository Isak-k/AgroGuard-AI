import { motion } from 'framer-motion';
import { User, MapPin, Globe, LogOut, ChevronRight, HelpCircle, Shield, Moon, Sun, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import logo from '@/assets/logo.png';

export default function Profile() {
  const { userData, signOut, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const location = userData?.location || localStorage.getItem('agroguard_location') || 'Not set';
  
  const languageLabels: Record<string, string> = {
    en: 'English',
    om: 'Afaan Oromoo',
    am: 'አማርኛ'
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    {
      icon: Globe,
      label: t('selectLanguage'),
      value: languageLabels[language],
      path: '/setup'
    },
    {
      icon: MapPin,
      label: t('selectLocation'),
      value: location,
      path: '/setup'
    },
    {
      icon: HelpCircle,
      label: t('askQuestion'),
      path: '/ask-question'
    },
    {
      icon: theme === 'dark' ? Moon : Sun,
      label: 'Theme',
      value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
      isThemeToggle: true
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-6 pb-8 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <img
            src={logo}
            alt="AgroGuard AI"
            className="w-10 h-10 rounded-xl object-contain bg-primary-foreground/10"
          />
          <h1 className="text-xl font-bold">{t('profile')}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-lg">
              {userData?.email || 'Demo User'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-primary-foreground/20 rounded-full text-sm">
                  Farmer
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Link */}
      {isAdmin && (
        <div className="px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/admin">
              <Button variant="farmer" className="w-full">
                <Shield className="w-5 h-5" />
                {t('adminDashboard')}
              </Button>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-6 py-6 space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            {item.isThemeToggle ? (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="card-farmer-interactive flex items-center gap-4 w-full text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  {item.value && (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <Link
                to={item.path!}
                className="card-farmer-interactive flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  {item.value && (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            )}
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <Button
            variant="destructive"
            className="w-full h-14"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            {loggingOut ? 'Logging out...' : t('logout')}
          </Button>
        </motion.div>
      </div>

      {/* Version Info */}
      <div className="px-6 text-center">
        <p className="text-sm text-muted-foreground">
          AgroGuard AI v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © 2024 AgroGuard. Helping Ethiopian Farmers.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
