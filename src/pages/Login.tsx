import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Login() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/setup');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col hero-gradient">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center pt-10 pb-6 px-6"
      >
        <motion.img
          src={logo}
          alt="AgroGuard AI"
          className="w-28 h-28 rounded-3xl shadow-xl mb-4 object-contain"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <h1 className="text-3xl font-bold text-foreground">{t('appName')}</h1>
        <p className="text-muted-foreground mt-1">{t('tagline')}</p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-card rounded-t-3xl px-6 pt-8 pb-safe-bottom shadow-xl"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t('welcomeBack')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="pl-12 h-14 text-lg rounded-xl"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 text-lg rounded-xl"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="farmer"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                {t('login')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              {t('signup')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
