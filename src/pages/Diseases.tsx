import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { DiseaseCard } from '@/components/DiseaseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { diseaseService } from '@/services/firestoreService';
import { mockDiseases, type Disease } from '@/data/mockData';

export default function Diseases() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load diseases from Firestore (with fallback to mock data)
  const loadDiseases = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const diseasesData = await diseaseService.getAll();
      // Use Firestore data if available, otherwise fallback to mock data
      setDiseases(diseasesData.length > 0 ? diseasesData : mockDiseases);
      console.log(`Loaded ${diseasesData.length} diseases from Firestore`);
    } catch (error) {
      console.error('Error loading diseases:', error);
      // Fallback to mock data on error
      setDiseases(mockDiseases);
      console.log('Fallback to mock diseases');
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadDiseases();

    // Refresh data every 30 seconds to get updates from admin
    const interval = setInterval(() => loadDiseases(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Get unique crop types from loaded diseases
  const cropTypes = [...new Set(diseases.map(d => d.cropType))];

  // Filter diseases
  const filteredDiseases = diseases.filter(disease => {
    const name = disease.name[language] || disease.name.en;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = !selectedCrop || disease.cropType === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            {t('diseases')}
          </motion.h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDiseases(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchDisease')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-xl"
          />
        </motion.div>

        {/* Crop Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedCrop(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCrop
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Crops
          </button>
          {cropTypes.map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCrop === crop
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {crop}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Disease List */}
      <div className="px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading diseases...</span>
          </div>
        ) : filteredDiseases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No diseases found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term or crop type
            </p>
          </motion.div>
        ) : (
          filteredDiseases.map((disease, index) => (
            <DiseaseCard key={disease.id} disease={disease} index={index} />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
