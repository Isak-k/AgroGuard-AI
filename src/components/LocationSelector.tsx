import { Check, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { locations } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface LocationSelectorProps {
  value?: string;
  onChange: (location: string) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground text-center">
        {t('selectLocation')}
      </h2>
      <p className="text-muted-foreground text-center text-sm">
        {t('locationRequired')}
      </p>

      {/* Search input */}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-12 h-14 text-lg rounded-xl"
        />
      </div>

      {/* Selected location display */}
      {value && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border-2 border-primary"
        >
          <MapPin className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">{value}</span>
          <Check className="w-6 h-6 text-primary ml-auto" />
        </motion.div>
      )}

      {/* Location list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden max-h-[300px] overflow-y-auto"
          >
            {filteredLocations.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">
                No locations found
              </p>
            ) : (
              filteredLocations.map((location, index) => (
                <motion.button
                  key={location}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => {
                    onChange(location);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-border last:border-b-0",
                    value === location
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-lg">{location}</span>
                  {value === location && (
                    <Check className="w-5 h-5 ml-auto text-primary" />
                  )}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
