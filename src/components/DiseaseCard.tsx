import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Disease } from '@/data/mockData';

interface DiseaseCardProps {
  disease: Disease;
  index?: number;
}

export function DiseaseCard({ disease, index = 0 }: DiseaseCardProps) {
  const { language } = useLanguage();

  // Safe access to disease properties with fallbacks
  const name = disease.name?.[language] || disease.name?.en || 'Unknown Disease';
  const firstSymptom = disease.symptoms?.[language]?.[0] || 
                      disease.symptoms?.en?.[0] || 
                      'No symptoms available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/diseases/${disease.id}`}
        className="card-farmer-interactive flex items-center gap-4"
      >
        {/* Disease Image or Icon */}
        <div className="w-16 h-16 rounded-xl bg-primary-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {disease.images?.[0] ? (
            <img
              src={disease.images[0]}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <AlertTriangle className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-lg truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {firstSymptom}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            {disease.cropType}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
      </Link>
    </motion.div>
  );
}
