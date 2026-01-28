import { MapPin, ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Market } from '@/data/mockData';

interface MarketCardProps {
  market: Market;
  index?: number;
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
  const { t } = useLanguage();
  
  const availableCount = market.chemicals.filter(c => c.available).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/markets/${market.id}`}
        className="card-farmer-interactive flex items-center gap-4"
      >
        {/* Market Icon */}
        <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-7 h-7 text-secondary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-lg truncate">
            {market.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{market.location}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {availableCount} {t('chemicals')}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
      </Link>
    </motion.div>
  );
}
