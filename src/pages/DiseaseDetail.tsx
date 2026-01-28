import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Pill, Shield, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { diseaseService, marketService } from '@/services/firestoreService';
import { mockDiseases, mockMarkets, type Disease, type Market } from '@/data/mockData';
import { useState, useEffect } from 'react';

export default function DiseaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  
  const location = localStorage.getItem('agroguard_location') || '';

  useEffect(() => {
    loadDiseaseData();
  }, [id]);

  const loadDiseaseData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load disease data
      const diseaseData = await diseaseService.getById(id);
      if (diseaseData) {
        setDisease(diseaseData);
      } else {
        // Fallback to mock data
        const mockDisease = mockDiseases.find(d => d.id === id);
        setDisease(mockDisease || null);
      }

      // Load markets data
      const marketsData = await marketService.getAll();
      setMarkets(marketsData.length > 0 ? marketsData : mockMarkets);
    } catch (error) {
      console.error('Error loading disease data:', error);
      // Fallback to mock data
      const mockDisease = mockDiseases.find(d => d.id === id);
      setDisease(mockDisease || null);
      setMarkets(mockMarkets);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading disease details...</span>
        </div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Disease not found</p>
          <Button variant="outline" onClick={() => navigate('/diseases')} className="mt-4">
            Back to Diseases
          </Button>
        </div>
      </div>
    );
  }

  const name = disease.name[language] || disease.name.en;
  const symptoms = disease.symptoms[language] || disease.symptoms.en;

  // Find markets that have chemicals for this disease
  const relevantMarkets = markets.filter(market => {
    if (location && market.location !== location) return false;
    return disease.treatments.some(treatment =>
      market.chemicals.some(c => c.chemicalId === treatment.chemicalId && c.available)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Image */}
      <div className="relative h-48 bg-primary-muted">
        {disease.images[0] ? (
          <img
            src={disease.images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-primary/50" />
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-lg p-6"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            {disease.cropType}
          </span>
          <h1 className="text-2xl font-bold text-foreground mb-2">{name}</h1>
        </motion.div>

        {/* Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <h2 className="section-header flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            {t('symptoms')}
          </h2>
          <div className="card-farmer">
            <ul className="space-y-3">
              {symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                  <span className="text-foreground">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Chemical Treatments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <h2 className="section-header flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            {t('treatment')}
          </h2>
          <div className="space-y-3">
            {disease.treatments.map((treatment, index) => {
              const safetyText = treatment.safetyInstructions[language] || treatment.safetyInstructions.en;
              
              return (
                <div key={index} className="card-farmer">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {treatment.chemicalName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('dosage')}:</span>
                      <span className="font-medium text-foreground">{treatment.dosage}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-xl">
                      <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-foreground text-sm">{safetyText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Available Markets */}
        {relevantMarkets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <h2 className="section-header flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              {t('availableAt')}
            </h2>
            <div className="space-y-3">
              {relevantMarkets.map(market => {
                const availableChemicals = market.chemicals.filter(c =>
                  disease.treatments.some(t => t.chemicalId === c.chemicalId) && c.available
                );
                
                return (
                  <Link
                    key={market.id}
                    to={`/markets/${market.id}`}
                    className="card-farmer-interactive flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-foreground">{market.name}</h3>
                      <p className="text-sm text-muted-foreground">{market.location}</p>
                      <div className="flex gap-2 mt-2">
                        {availableChemicals.map(c => (
                          <span
                            key={c.chemicalId}
                            className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium"
                          >
                            {c.chemicalName} - {c.price} {t('etb')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Ask Question Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Link to={`/ask-question?diseaseId=${disease.id}`}>
            <Button variant="farmer-outline" className="w-full">
              {t('askQuestion')}
            </Button>
          </Link>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
