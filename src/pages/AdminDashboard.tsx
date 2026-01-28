import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, MessageCircle, Pill, MapPin, Shield, Loader2, FlaskConical, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DiseaseManagement } from '@/components/admin/DiseaseManagement';
import { DiseaseCategoryManagement } from '@/components/admin/DiseaseCategoryManagement';
import { CommonDiseasesManagement } from '@/components/admin/CommonDiseasesManagement';
import { ChemicalManagement } from '@/components/admin/ChemicalManagement';
import { MarketManagement } from '@/components/admin/MarketManagement';
import { PendingReviews } from '@/components/admin/PendingReviews';
import { UserComments } from '@/components/admin/UserComments';
import { pendingDiseaseService, commentService } from '@/services/firestoreService';
import { mockPendingDiseases, mockComments } from '@/data/mockData';
import logo from '@/assets/logo.png';

type AdminTab = 'pending' | 'comments' | 'diseases' | 'categories' | 'common' | 'chemicals' | 'markets';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load counts for badges
  useEffect(() => {
    async function loadCounts() {
      try {
        const [pendingData, commentsData] = await Promise.all([
          pendingDiseaseService.getAll(),
          commentService.getAll()
        ]);
        
        const pending = pendingData.filter(d => d.status === 'pending');
        const unread = commentsData.filter(c => c.status === 'unread');
        
        setPendingCount(pending.length > 0 ? pending.length : mockPendingDiseases.filter(d => d.status === 'pending').length);
        setUnreadCount(unread.length > 0 ? unread.length : mockComments.filter(c => c.status === 'unread').length);
      } catch (error) {
        setPendingCount(mockPendingDiseases.filter(d => d.status === 'pending').length);
        setUnreadCount(mockComments.filter(c => c.status === 'unread').length);
      }
    }
    loadCounts();
  }, []);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin && user) {
      navigate('/dashboard');
    }
  }, [isAdmin, authLoading, navigate, user]);

  const tabs = [
    { 
      key: 'pending' as AdminTab, 
      label: t('pendingReviews'), 
      icon: AlertTriangle, 
      count: pendingCount 
    },
    { 
      key: 'comments' as AdminTab, 
      label: t('userComments'), 
      icon: MessageCircle, 
      count: unreadCount 
    },
    { 
      key: 'diseases' as AdminTab, 
      label: t('manageDiseases'), 
      icon: Pill 
    },
    { 
      key: 'categories' as AdminTab, 
      label: 'Disease Categories', 
      icon: Shield 
    },
    { 
      key: 'common' as AdminTab, 
      label: 'Common Diseases', 
      icon: Star 
    },
    { 
      key: 'chemicals' as AdminTab, 
      label: 'Chemicals', 
      icon: FlaskConical 
    },
    { 
      key: 'markets' as AdminTab, 
      label: t('manageMarkets'), 
      icon: MapPin 
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6">
          You don't have permission to access the admin dashboard.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary font-medium hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={logo}
            alt="AgroGuard AI"
            className="w-10 h-10 rounded-xl object-contain bg-primary-foreground/10"
          />
          <div>
            <h1 className="text-xl font-bold">{t('adminDashboard')}</h1>
            <p className="text-sm text-primary-foreground/80">Manage your AgroGuard data</p>
          </div>
        </div>
      </div>

      {/* Tabs - Scrollable */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6"
      >
        {activeTab === 'pending' && <PendingReviews />}
        {activeTab === 'comments' && <UserComments />}
        {activeTab === 'diseases' && <DiseaseManagement />}
        {activeTab === 'categories' && <DiseaseCategoryManagement />}
        {activeTab === 'common' && <CommonDiseasesManagement />}
        {activeTab === 'chemicals' && <ChemicalManagement />}
        {activeTab === 'markets' && <MarketManagement />}
      </motion.div>
    </div>
  );
}
