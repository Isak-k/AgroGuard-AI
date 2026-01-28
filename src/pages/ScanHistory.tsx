import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  History, 
  Bug, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  MapPin,
  Loader2,
  ChevronRight,
  Leaf,
  TrendingUp,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { getUserScanHistory, getUserDiseaseStats, ScanHistoryEntry } from '@/services/scanHistoryService';
import { format } from 'date-fns';

export default function ScanHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ScanHistoryEntry | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [historyData, statsData] = await Promise.all([
        getUserScanHistory(user.uid),
        getUserDiseaseStats(user.uid)
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <ShieldCheck className="w-5 h-5 text-success" />;
      case 'diseased':
        return <Bug className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success/10 border-success/30 text-success';
      case 'diseased':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-warning/10 border-warning/30 text-warning';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Scan History</h1>
            <p className="text-sm text-primary-foreground/80">Track your crop health over time</p>
          </div>
          <History className="w-8 h-8 text-primary-foreground/60" />
        </div>

        {/* Stats Cards */}
        {stats && stats.totalScans > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalScans}</p>
              <p className="text-xs text-primary-foreground/80">Total Scans</p>
            </div>
            <div className="bg-success/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-success-foreground">{stats.healthyCount}</p>
              <p className="text-xs text-primary-foreground/80">Healthy</p>
            </div>
            <div className="bg-destructive/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-destructive-foreground">{stats.diseasedCount}</p>
              <p className="text-xs text-primary-foreground/80">Diseases</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No scans yet</h3>
            <p className="text-muted-foreground mb-6">
              Start scanning your crops to build your history
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="btn-farmer inline-flex items-center gap-2 px-6 py-3"
            >
              <Leaf className="w-5 h-5" />
              Scan Your First Crop
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent Scans
            </h3>
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedEntry(entry)}
                className="card-farmer cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {entry.imageUrl ? (
                      <img 
                        src={entry.imageUrl} 
                        alt="Scan" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(entry.status)}
                      <h4 className="font-semibold text-foreground truncate">
                        {entry.analysis.diseaseName || 'Unknown'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(entry.createdAt, 'MMM d, yyyy')}
                      </span>
                      {entry.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {entry.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(entry.status)}`}>
                        {entry.analysis.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Most Common Diseases */}
        {stats && Object.keys(stats.diseaseTypes).length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Most Common Issues
            </h3>
            <div className="card-farmer">
              {Object.entries(stats.diseaseTypes)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([disease, count]) => (
                  <div key={disease} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground">{disease}</span>
                    <span className="text-sm text-muted-foreground">{count as number} scans</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-card w-full max-w-lg max-h-[85vh] rounded-t-3xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-48">
                {selectedEntry.imageUrl ? (
                  <img 
                    src={selectedEntry.imageUrl} 
                    alt="Scan" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedEntry.status)}
                    <h2 className="text-xl font-bold text-white">
                      {selectedEntry.analysis.diseaseName}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(selectedEntry.createdAt, 'MMMM d, yyyy')}
                  </span>
                  {selectedEntry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedEntry.location}
                    </span>
                  )}
                </div>

                {/* Confidence */}
                <div className={`px-4 py-3 rounded-xl border ${getStatusColor(selectedEntry.status)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Confidence Level</span>
                    <span className="text-lg font-bold">{selectedEntry.analysis.confidence}%</span>
                  </div>
                </div>

                {/* Description */}
                {selectedEntry.analysis.description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedEntry.analysis.description}</p>
                  </div>
                )}

                {/* Symptoms */}
                {selectedEntry.analysis.symptoms?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Symptoms
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedEntry.analysis.symptoms.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment */}
                {selectedEntry.analysis.treatment?.length > 0 && (
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Bug className="w-4 h-4 text-primary" />
                      Treatment
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {selectedEntry.analysis.treatment.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
