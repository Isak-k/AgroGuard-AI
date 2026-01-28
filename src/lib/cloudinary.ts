// Cloudinary configuration for unsigned uploads
// These are publishable values - safe to include in client-side code

export const CLOUDINARY_CONFIG = {
  cloudName: 'dc09vfass',
  uploadPreset: 'agroguard_upload',
  folder: 'agroguard/scans',
};

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
  resource_type: string;
}

export interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
}

/**
 * Upload an image to Cloudinary using unsigned upload
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the upload response
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
          resolve(response);
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.open('POST', CLOUDINARY_UPLOAD_URL);
    xhr.send(formData);
  });
}

/**
 * Get an optimized Cloudinary URL with transformations
 * @param publicId - The public ID of the uploaded image
 * @param options - Transformation options
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto' } = options;
  
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push('f_auto'); // Auto format (WebP, AVIF, etc.)
  
  const transformStr = transformations.join(',');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformStr}/${publicId}`;
}
