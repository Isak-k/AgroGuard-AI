import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, StarOff, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { diseaseService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockDiseases, type Disease } from '@/data/mockData';
import { toast } from 'sonner';

export function CommonDiseasesManagement() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const data = await diseaseService.getAll();
      setDiseases(data.length > 0 ? data : mockDiseases);
    } catch (error) {
      console.error('Error loading diseases:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setDiseases([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to diseases in Firestore rules.');
      } else {
        setDiseases(mockDiseases);
      }
    }
    setLoading(false);
  };

  const toggleFeatured = async (diseaseId: string, currentFeatured: boolean) => {
    setUpdating(diseaseId);
    try {
      const success = await diseaseService.update(diseaseId, { featured: !currentFeatured });
      if (success) {
        setDiseases(prev => prev.map(d => 
          d.id === diseaseId ? { ...d, featured: !currentFeatured } : d
        ));
        toast.success(
          !currentFeatured 
            ? 'Disease added to Common Diseases section' 
            : 'Disease removed from Common Diseases section'
        );
      } else {
        toast.error('Failed to update disease');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to diseases.'
          : 'Failed to update disease'
      );
    }
    setUpdating(null);
  };

  const featuredDiseases = diseases.filter(d => d.featured);
  const nonFeaturedDiseases = diseases.filter(d => !d.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Firestore permissions are blocking Diseases read/write for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header">Common Diseases Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage which diseases appear in the "Common Diseases" section on the home page
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Featured Diseases */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Featured Diseases ({featuredDiseases.length})</h3>
        </div>
        
        {featuredDiseases.length === 0 ? (
          <div className="card-farmer text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No diseases are currently featured</p>
            <p className="text-sm text-muted-foreground">Click the star icon on any disease below to feature it</p>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredDiseases.map((disease, index) => (
              <motion.div
                key={disease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-farmer bg-primary/5 border-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-foreground">{disease.name?.en || 'Unnamed Disease'}</h4>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">
                        Featured
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Crop: {disease.cropType || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {disease.symptoms?.en?.length || 0} symptoms • {disease.treatments?.length || 0} treatments
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(disease.id, disease.featured || false)}
                    disabled={updating === disease.id}
                    className="text-primary hover:text-primary/80"
                  >
                    {updating === disease.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4 fill-current" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Available Diseases */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <StarOff className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Available Diseases ({nonFeaturedDiseases.length})</h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {nonFeaturedDiseases.map((disease, index) => (
            <motion.div
              key={disease.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-farmer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{disease.name?.en || 'Unnamed Disease'}</h4>
                  <p className="text-sm text-muted-foreground">Crop: {disease.cropType || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {disease.symptoms?.en?.length || 0} symptoms • {disease.treatments?.length || 0} treatments
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFeatured(disease.id, disease.featured || false)}
                  disabled={updating === disease.id}
                  className="text-muted-foreground hover:text-primary"
                >
                  {updating === disease.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="card-farmer bg-accent/50 border-accent">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Featured Diseases</h3>
            <p className="text-sm text-muted-foreground">
              Featured diseases appear in the "Common Diseases" section on the home page. 
              Users will see these diseases first when they open the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}