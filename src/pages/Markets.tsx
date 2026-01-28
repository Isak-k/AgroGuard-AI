import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { MarketCard } from '@/components/MarketCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { marketService } from '@/services/firestoreService';
import { mockMarkets, locations, type Market } from '@/data/mockData';

export default function Markets() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    localStorage.getItem('agroguard_location')
  );
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load markets from Firestore (with fallback to mock data)
  const loadMarkets = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const marketsData = await marketService.getAll();
      // Use Firestore data if available, otherwise fallback to mock data
      setMarkets(marketsData.length > 0 ? marketsData : mockMarkets);
      console.log(`Loaded ${marketsData.length} markets from Firestore`);
    } catch (error) {
      console.error('Error loading markets:', error);
      // Fallback to mock data on error
      setMarkets(mockMarkets);
      console.log('Fallback to mock markets');
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadMarkets();

    // Refresh data every 30 seconds to get updates from admin
    const interval = setInterval(() => loadMarkets(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter markets
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !selectedLocation || market.location === selectedLocation;
    return matchesSearch && matchesLocation;
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
            {t('markets')}
          </motion.h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMarkets(true)}
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
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-xl"
          />
        </motion.div>

        {/* Location Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedLocation(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              !selectedLocation
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <MapPin className="w-4 h-4" />
            All Locations
          </button>
          {locations.slice(0, 5).map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedLocation === loc
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {loc}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Market List */}
      <div className="px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading markets...</span>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No markets found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different location
            </p>
          </motion.div>
        ) : (
          filteredMarkets.map((market, index) => (
            <MarketCard key={market.id} market={market} index={index} />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
