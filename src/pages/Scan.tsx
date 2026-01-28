import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, AlertTriangle, Check, ChevronRight, Cloud, CloudOff, RefreshCw, Leaf, Bug, ShieldCheck, Stethoscope, History, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary';
import { analyzeCropImage, testBackendConnection, DiseaseAnalysisResult } from '@/services/geminiService';
import { saveScanResult } from '@/services/scanHistoryService';

interface ScanResult {
  analysis: DiseaseAnalysisResult;
  cloudinaryUrl?: string;
  saved?: boolean;
}

export default function Scan() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error: uploadError } = useCloudinaryUpload();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');

  const isCloudinaryConfigured = CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME';

  const handleImageSelect = useCallback(async (file: File) => {
    // Create local preview immediately
    const url = URL.createObjectURL(file);
    setLocalImageUrl(url);
    setImageFile(file);
    setResult(null);
    setCloudinaryUrl(null);
    setUploadStatus('pending');

    // If Cloudinary is configured, upload in background
    if (isCloudinaryConfigured) {
      setUploadStatus('uploading');
      try {
        const response = await upload(file);
        setCloudinaryUrl(response.secure_url);
        setUploadStatus('success');
        toast.success('Image uploaded to cloud');
      } catch (err) {
        setUploadStatus('error');
        console.error('Upload error:', err);
        toast.error('Upload failed. You can still analyze locally.');
      }
    }
  }, [isCloudinaryConfigured, upload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image too large. Please use an image under 10MB.');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      handleImageSelect(file);
    }
    // Reset input value to allow re-selecting same file
    e.target.value = '';
  }, [handleImageSelect]);

  const handleCapture = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    
    try {
      // First test backend connection
      console.log('🔍 Testing backend connection...');
      const connectionOk = await testBackendConnection();
      
      if (!connectionOk) {
        toast.error('Cannot connect to analysis service. Please check if the backend server is running.');
        setIsAnalyzing(false);
        return;
      }

      console.log('✅ Backend connection successful, starting analysis...');
      
      // Use AI to analyze the image
      const response = await analyzeCropImage(imageFile);
      
      if (response.success && response.result) {
        const scanResult: ScanResult = {
          analysis: response.result,
          cloudinaryUrl: cloudinaryUrl || undefined,
          saved: false,
        };
        
        setResult(scanResult);

        if (response.result.isHealthy) {
          toast.success('Great news! Your plant appears healthy.');
        } else if (response.result.detected) {
          toast.warning(`Disease detected: ${response.result.diseaseName}`);
        } else {
          toast.info('Analysis complete. Please check the results.');
        }

        // Auto-save to history if user is logged in and cloudinary upload succeeded
        if (user?.uid && cloudinaryUrl) {
          setIsSaving(true);
          try {
            await saveScanResult(user.uid, cloudinaryUrl, response.result);
            setResult(prev => prev ? { ...prev, saved: true } : null);
            toast.success('Scan saved to history');
          } catch (saveError) {
            console.error('Failed to save scan:', saveError);
          }
          setIsSaving(false);
        }
      } else {
        toast.error(response.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, cloudinaryUrl, user]);

  const handleSaveToHistory = useCallback(async () => {
    if (!user?.uid || !result || !cloudinaryUrl) {
      toast.error('Cannot save: missing data or not logged in');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveScanResult(user.uid, cloudinaryUrl, result.analysis);
      setResult(prev => prev ? { ...prev, saved: true } : null);
      toast.success('Scan saved to history');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save scan');
    }
    setIsSaving(false);
  }, [user, result, cloudinaryUrl]);

  const resetScan = useCallback(() => {
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
    setLocalImageUrl(null);
    setImageFile(null);
    setCloudinaryUrl(null);
    setResult(null);
    setUploadStatus('pending');
  }, [localImageUrl]);

  const retryUpload = useCallback(async () => {
    if (imageFile && isCloudinaryConfigured) {
      setUploadStatus('uploading');
      try {
        const response = await upload(imageFile);
        setCloudinaryUrl(response.secure_url);
        setUploadStatus('success');
        toast.success('Image uploaded to cloud');
      } catch (err) {
        setUploadStatus('error');
        toast.error('Upload failed. You can still analyze locally.');
      }
    }
  }, [imageFile, isCloudinaryConfigured, upload]);

  // Get disease name based on current language
  const getDiseaseName = (analysis: DiseaseAnalysisResult) => {
    if (language === 'am' && analysis.diseaseNameAmharic) {
      return analysis.diseaseNameAmharic;
    }
    if (language === 'om' && analysis.diseaseNameOromifa) {
      return analysis.diseaseNameOromifa;
    }
    return analysis.diseaseName;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'medium': return 'text-warning bg-warning/10 border-warning/30';
      case 'low': return 'text-success bg-success/10 border-success/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          {t('scanCrop')}
        </motion.h1>
        <p className="text-muted-foreground mt-1">
          Take or upload a photo of the infected crop
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {!localImageUrl ? (
            // Image Capture/Upload Options
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Camera Preview Area */}
              <div className="aspect-square rounded-3xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border">
                <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center px-8">
                  Capture a clear photo of the infected leaves or plant parts
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="farmer"
                  className="h-16"
                  onClick={handleCapture}
                >
                  <Camera className="w-6 h-6" />
                  {t('takePhoto')}
                </Button>
                <Button
                  variant="farmer-outline"
                  className="h-16"
                  onClick={handleUpload}
                >
                  <Upload className="w-6 h-6" />
                  {t('uploadImage')}
                </Button>
              </div>

              {/* Cloudinary Status */}
              {isCloudinaryConfigured ? (
                <div className="card-farmer bg-success/10 border-success/20">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-success flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Cloud storage connected. Images will be saved for analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card-farmer bg-warning/10 border-warning/20">
                  <div className="flex items-center gap-3">
                    <CloudOff className="w-5 h-5 text-warning flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Cloud storage not configured. Images will only be analyzed locally.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Badge */}
              <div className="card-farmer bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Bug className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-foreground">Powered by AI Technology</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Advanced AI vision technology analyzes your crops and identifies diseases with high accuracy. 
                  Completely free to use with no limits.
                </p>
              </div>

              {/* Tips */}
              <div className="card-farmer bg-muted/50 border-border">
                <h3 className="font-bold text-foreground mb-2">Tips for best results:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Take photo in good lighting</li>
                  <li>• Focus on the infected area</li>
                  <li>• Include healthy parts for comparison</li>
                  <li>• Hold the camera steady</li>
                </ul>
              </div>
            </motion.div>
          ) : !result ? (
            // Image Preview & Analyze
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg">
                <img
                  src={localImageUrl}
                  alt="Crop scan"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={resetScan}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors"
                  disabled={isAnalyzing}
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>

                {/* Upload Status Badge */}
                {isCloudinaryConfigured && (
                  <div className="absolute top-4 left-4">
                    {uploadStatus === 'uploading' && (
                      <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur flex items-center gap-2 shadow-lg">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs font-medium">{progress}%</span>
                      </div>
                    )}
                    {uploadStatus === 'success' && (
                      <div className="px-3 py-1.5 rounded-full bg-success/90 backdrop-blur flex items-center gap-2 shadow-lg">
                        <Cloud className="w-4 h-4 text-success-foreground" />
                        <span className="text-xs font-medium text-success-foreground">Saved</span>
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <button
                        onClick={retryUpload}
                        className="px-3 py-1.5 rounded-full bg-warning/90 backdrop-blur flex items-center gap-2 shadow-lg hover:bg-warning transition-colors"
                        disabled={isUploading}
                      >
                        <RefreshCw className="w-4 h-4 text-warning-foreground" />
                        <span className="text-xs font-medium text-warning-foreground">Retry</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Analyzing Overlay */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-16 h-16 text-primary" />
                    </motion.div>
                    <p className="mt-4 font-semibold text-foreground">{t('analyzing')}</p>
                    <p className="text-sm text-muted-foreground">AI is examining your image...</p>
                  </motion.div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading to cloud...</span>
                    <span className="font-medium text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Analyze Button */}
              {!isAnalyzing && (
                <Button
                  variant="farmer"
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-5 h-5" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          ) : (
            // Results
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Result Header */}
              {result.analysis.isHealthy ? (
                <div className="card-farmer bg-success/10 border-success/30">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-7 h-7 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">Healthy Plant</h3>
                      <p className="text-xl font-bold text-success mt-1">
                        {getDiseaseName(result.analysis)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('confidence')}: {result.analysis.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : result.analysis.detected ? (
                <div className="card-farmer bg-destructive/10 border-destructive/30">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <Bug className="w-7 h-7 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{t('diseaseDetected')}</h3>
                      <p className="text-xl font-bold text-destructive mt-1">
                        {getDiseaseName(result.analysis)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">
                          {t('confidence')}: {result.analysis.confidence}%
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(result.analysis.severity)}`}>
                          {result.analysis.severity.toUpperCase()} SEVERITY
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-farmer bg-warning/10 border-warning/30">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-7 h-7 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Analysis Inconclusive</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.analysis.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {result.analysis.description && result.analysis.detected && (
                <div className="card-farmer">
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{result.analysis.description}</p>
                </div>
              )}

              {/* Symptoms */}
              {result.analysis.symptoms && result.analysis.symptoms.length > 0 && (
                <div className="card-farmer">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Symptoms
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.analysis.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-warning mt-1">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment */}
              {result.analysis.treatment && result.analysis.treatment.length > 0 && (
                <div className="card-farmer bg-primary/5 border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Recommended Treatment
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {result.analysis.treatment.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention */}
              {result.analysis.prevention && result.analysis.prevention.length > 0 && (
                <div className="card-farmer bg-success/5 border-success/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    Prevention Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.analysis.prevention.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected Crops */}
              {result.analysis.affectedCrops && result.analysis.affectedCrops.length > 0 && (
                <div className="card-farmer">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    Commonly Affected Crops
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.affectedCrops.map((crop, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud Storage Status */}
              {result.cloudinaryUrl && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Cloud className="w-4 h-4" />
                  <span>Image saved to cloud for future reference</span>
                </div>
              )}

              {/* Save to History Button */}
              {user && !result.saved && cloudinaryUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveToHistory}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save to History
                    </>
                  )}
                </Button>
              )}

              {result.saved && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Check className="w-4 h-4" />
                  <span>Saved to your scan history</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="farmer"
                  className="w-full"
                  onClick={resetScan}
                >
                  <Camera className="w-5 h-5" />
                  Scan Again
                </Button>
                <Button
                  variant="farmer-outline"
                  className="w-full"
                  onClick={() => navigate('/scan-history')}
                >
                  <History className="w-5 h-5" />
                  View History
                </Button>
              </div>

              {/* Image thumbnail */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src={localImageUrl} alt="Scanned" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your scanned image
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
