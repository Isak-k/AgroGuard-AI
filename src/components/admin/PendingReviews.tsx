import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pendingDiseaseService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockPendingDiseases, type PendingDisease } from '@/data/mockData';
import { toast } from 'sonner';

export function PendingReviews() {
  const [pendingDiseases, setPendingDiseases] = useState<PendingDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const data = await pendingDiseaseService.getAll();
      // Filter for pending status only and use mock if empty
      const pending = data.filter(d => d.status === 'pending');
      setPendingDiseases(pending.length > 0 ? pending : mockPendingDiseases.filter(d => d.status === 'pending'));
    } catch (error) {
      console.error('Error loading pending diseases:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setPendingDiseases([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to pendingDiseases in Firestore rules.');
      } else {
        setPendingDiseases(mockPendingDiseases.filter(d => d.status === 'pending'));
      }
    }
    setLoading(false);
  };

  const handleApprove = async (item: PendingDisease) => {
    setProcessingId(item.id);
    try {
      const diseaseData = {
        name: {
          en: item.detectedDisease || 'Unknown Disease',
          om: item.detectedDisease || 'Unknown Disease',
          am: item.detectedDisease || 'Unknown Disease',
        },
        cropType: 'Unknown',
        images: item.imageUrl ? [item.imageUrl] : [],
        symptoms: {
          en: [],
          om: [],
          am: [],
        },
        treatments: [],
      };

      const newDiseaseId = await pendingDiseaseService.approve(item.id, diseaseData);
      if (newDiseaseId) {
        setPendingDiseases(prev => prev.filter(d => d.id !== item.id));
        toast.success('Approved: disease added to database');
      } else {
        toast.error('Failed to approve submission');
      }
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to diseases & pendingDiseases.'
          : 'Failed to approve disease'
      );
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await pendingDiseaseService.reject(id);
      if (success) {
        setPendingDiseases(prev => prev.filter(d => d.id !== id));
        toast.info('Submission rejected');
      } else {
        toast.error('Failed to reject submission');
      }
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin update on pendingDiseases.'
          : 'Failed to reject submission'
      );
    }
    setProcessingId(null);
  };

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
          Firestore permissions are blocking Pending Reviews read/write for this account.
        </p>
      </div>
    );
  }

  if (pendingDiseases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="section-header">Pending Reviews ({pendingDiseases.length})</h2>
      
      {pendingDiseases.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card-farmer"
        >
          <div className="flex gap-4">
            <img
              src={item.imageUrl}
              alt="Scan"
              className="w-20 h-20 rounded-xl object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <p className="font-bold text-foreground">
                {item.detectedDisease || 'Unknown Disease'}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence: {item.confidence}%
              </p>
              <p className="text-sm text-muted-foreground">{item.location}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              onClick={() => handleApprove(item)}
              disabled={processingId === item.id}
            >
              {processingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => handleReject(item.id)}
              disabled={processingId === item.id}
            >
              {processingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Reject
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
