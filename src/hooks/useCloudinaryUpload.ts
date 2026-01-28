import { useState, useCallback } from 'react';
import { uploadToCloudinary, CloudinaryUploadResponse } from '@/lib/cloudinary';

export interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<CloudinaryUploadResponse>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File): Promise<CloudinaryUploadResponse> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await uploadToCloudinary(file, (prog) => {
        setProgress(prog);
      });
      
      setProgress(100);
      setIsUploading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      throw err;
    }
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
