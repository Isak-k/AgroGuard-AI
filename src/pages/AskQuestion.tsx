import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageCircle, User, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { commentService } from '@/services/firestoreService';
import { mockDiseases } from '@/data/mockData';
import { toast } from 'sonner';

export default function AskQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useAuth();
  const { t } = useLanguage();
  
  const diseaseId = searchParams.get('diseaseId');
  const relatedDisease = diseaseId ? mockDiseases.find(d => d.id === diseaseId) : null;
  
  const [formData, setFormData] = useState({
    name: userData?.displayName || '',
    email: userData?.email || '',
    question: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save comment to Firestore
      const commentData = {
        userId: userData?.uid || 'demo-user',
        userName: formData.name,
        userEmail: formData.email,
        subject: relatedDisease ? `Question about ${relatedDisease.name.en}` : 'General Question',
        message: formData.question,
        category: 'question',
        relatedId: diseaseId || null,
        status: 'unread' as const
      };

      const success = await commentService.create(commentData);
      
      if (success) {
        toast.success(t('questionSent'));
        console.log('Question successfully saved to Firestore:', commentData);
        navigate(-1);
      } else {
        throw new Error('Failed to save comment');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('askQuestion')}</h1>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Related Disease */}
        {relatedDisease && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-farmer bg-primary/5 border-primary/20 mb-4"
          >
            <p className="text-sm text-muted-foreground">Related to:</p>
            <p className="font-bold text-foreground">{relatedDisease.name.en}</p>
          </motion.div>
        )}

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Your Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              We'll use this email to send you a response from our experts
            </p>
          </div>
        </motion.div>

        {/* Question Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Your Question *
          </label>
          <Textarea
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Describe your problem or ask a question about crop diseases and treatments..."
            className="min-h-[200px] text-lg rounded-xl resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Your question will be sent to our agricultural experts for review.
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-farmer mt-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Expert Review</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our agricultural experts will review your question and may add new diseases or treatments based on your findings.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Submit Button */}
      <div className="px-6 pb-8">
        <Button
          variant="farmer"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.question.trim() || !formData.name.trim() || !formData.email.trim()}
        >
          {isSubmitting ? (
            t('loading')
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t('submitQuestion')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
