import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ text, fullScreen = false }: LoadingSpinnerProps) {
  const { t } = useLanguage();
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
      >
        <Leaf className="w-8 h-8 text-primary" />
      </motion.div>
      <p className="text-muted-foreground font-medium">
        {text || t('loading')}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
