import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'om', name: 'Afaan Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
] as const;

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground text-center mb-6">
        {t('selectLanguage')}
      </h2>
      
      <div className="space-y-3">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
              language === lang.code
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-3xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground text-lg">{lang.nativeName}</p>
              <p className="text-sm text-muted-foreground">{lang.name}</p>
            </div>
            {language === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
