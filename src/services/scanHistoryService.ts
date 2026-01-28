import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DiseaseAnalysisResult } from '@/services/geminiService';

export interface ScanHistoryEntry {
  id: string;
  userId: string;
  imageUrl: string;
  localImageUrl?: string;
  analysis: DiseaseAnalysisResult;
  location?: string;
  cropType?: string;
  createdAt: Date;
  status: 'healthy' | 'diseased' | 'inconclusive';
}

const COLLECTION_NAME = 'scanHistory';

/**
 * Save a scan result to Firestore
 */
export async function saveScanResult(
  userId: string,
  imageUrl: string,
  analysis: DiseaseAnalysisResult,
  location?: string
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      imageUrl,
      analysis,
      location: location || null,
      cropType: analysis.affectedCrops?.[0] || null,
      status: analysis.isHealthy ? 'healthy' : analysis.detected ? 'diseased' : 'inconclusive',
      createdAt: Timestamp.now(),
    });
    console.log('Scan saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan result:', error);
    return null;
  }
}

/**
 * Get scan history for a specific user
 */
export async function getUserScanHistory(
  userId: string,
  maxResults: number = 50
): Promise<ScanHistoryEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        imageUrl: data.imageUrl,
        analysis: data.analysis,
        location: data.location,
        cropType: data.cropType,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status,
      };
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return [];
  }
}

/**
 * Get all scan history (for admin)
 */
export async function getAllScanHistory(maxResults: number = 100): Promise<ScanHistoryEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        imageUrl: data.imageUrl,
        analysis: data.analysis,
        location: data.location,
        cropType: data.cropType,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status,
      };
    });
  } catch (error) {
    console.error('Error fetching all scan history:', error);
    return [];
  }
}

/**
 * Get disease statistics for a user
 */
export async function getUserDiseaseStats(userId: string) {
  try {
    const history = await getUserScanHistory(userId);
    
    const stats = {
      totalScans: history.length,
      healthyCount: history.filter(h => h.status === 'healthy').length,
      diseasedCount: history.filter(h => h.status === 'diseased').length,
      inconclusiveCount: history.filter(h => h.status === 'inconclusive').length,
      diseaseTypes: {} as Record<string, number>,
      cropTypes: {} as Record<string, number>,
    };
    
    history.forEach(entry => {
      if (entry.analysis.diseaseName && entry.analysis.detected) {
        stats.diseaseTypes[entry.analysis.diseaseName] = 
          (stats.diseaseTypes[entry.analysis.diseaseName] || 0) + 1;
      }
      if (entry.cropType) {
        stats.cropTypes[entry.cropType] = 
          (stats.cropTypes[entry.cropType] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error calculating disease stats:', error);
    return null;
  }
}
