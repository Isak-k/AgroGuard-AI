import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Package, Check, X, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { mockMarkets } from '@/data/mockData';

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const market = mockMarkets.find(m => m.id === id);

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Market not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground px-6 pt-6 pb-8 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('markets')}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-2">{market.name}</h2>
          <div className="flex items-center gap-2 opacity-90">
            <MapPin className="w-5 h-5" />
            <span>{market.location}, {market.region}</span>
          </div>
        </motion.div>
      </div>

      {/* Chemical List */}
      <div className="px-6 py-6">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="section-header flex items-center gap-2"
        >
          <Package className="w-5 h-5 text-primary" />
          {t('chemicals')} ({market.chemicals.length})
        </motion.h2>

        <div className="space-y-3">
          {market.chemicals.map((chemical, index) => (
            <motion.div
              key={chemical.chemicalId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card-farmer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">
                  {chemical.chemicalName}
                </h3>
                {chemical.available ? (
                  <span className="badge-success flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="badge-danger flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {chemical.price} <span className="text-base">{t('etb')}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Updated: {new Date(chemical.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
