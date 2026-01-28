import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LocationSelector } from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

type SetupStep = 'language' | 'location';

export default function Setup() {
  const { updateUserData, userData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<SetupStep>('language');
  const [location, setLocation] = useState(userData?.location || '');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (step === 'language') {
      setStep('location');
    } else if (step === 'location') {
      if (!location) {
        toast.error('Please select your location');
        return;
      }
      setSaving(true);
      try {
        // Save location to user data
        await updateUserData({ location });
        localStorage.setItem('agroguard_location', location);
        toast.success('Setup complete!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving location:', error);
        toast.error('Failed to save. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'location') {
      setStep('language');
    }
  };

  const canContinue = step === 'language' || (step === 'location' && location);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-6 pt-6"
      >
        <img
          src={logo}
          alt="AgroGuard AI"
          className="w-12 h-12 rounded-xl object-contain"
        />
        <div>
          <h1 className="font-bold text-lg text-foreground">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground">Setup your preferences</p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-2">
          <div className={`h-2 flex-1 rounded-full transition-colors ${step === 'language' || step === 'location' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 flex-1 rounded-full transition-colors ${step === 'location' ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span className={step === 'language' ? 'text-primary font-medium' : ''}>{t('selectLanguage')}</span>
          <span className={step === 'location' ? 'text-primary font-medium' : ''}>{t('selectLocation')}</span>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 px-6 py-8"
      >
        {step === 'language' && <LanguageSelector />}
        {step === 'location' && (
          <LocationSelector
            value={location}
            onChange={setLocation}
          />
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          variant="farmer"
          className="w-full"
          onClick={handleContinue}
          disabled={!canContinue || saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : step === 'location' ? (
            <>
              <Check className="w-5 h-5" />
              Get Started
            </>
          ) : (
            <>
              {t('continue')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>

        {step !== 'language' && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleBack}
            disabled={saving}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
