import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { backendService } from './backendService';
import type { Disease, DiseaseCategory, Chemical, Market, PendingDisease, Comment } from '@/data/mockData';

export function isFirestorePermissionDenied(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return (
    !!e &&
    (e.code === 'permission-denied' ||
      (typeof e.message === 'string' && e.message.toLowerCase().includes('insufficient permissions')))
  );
}

// Collection references
const COLLECTIONS = {
  diseases: 'diseases',
  diseaseCategories: 'disease-categories',
  chemicals: 'chemicals',
  markets: 'markets',
  pendingDiseases: 'pendingDiseases',
  comments: 'comments',
} as const;

// Generic CRUD helpers with backend fallback
async function getAll<T>(collectionName: string): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error fetching ${collectionName} from Firestore:`, error);
    if (isFirestorePermissionDenied(error)) {
      console.log(`Falling back to backend for ${collectionName}`);
      return await backendService.getAll<T>(collectionName);
    }
    return [];
  }
}

async function getById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${id} from Firestore:`, error);
    if (isFirestorePermissionDenied(error)) {
      console.log(`Falling back to backend for ${collectionName}/${id}`);
      return await backendService.getById<T>(collectionName, id);
    }
    return null;
  }
}

async function create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating ${collectionName} in Firestore:`, error);
    if (isFirestorePermissionDenied(error)) {
      console.log(`Falling back to backend for creating ${collectionName}`);
      return await backendService.create<T>(collectionName, data);
    }
    return null;
  }
}

async function update<T>(collectionName: string, id: string, data: Partial<T>): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id} in Firestore:`, error);
    if (isFirestorePermissionDenied(error)) {
      console.log(`Falling back to backend for updating ${collectionName}/${id}`);
      return await backendService.update<T>(collectionName, id, data);
    }
    return false;
  }
}

async function remove(collectionName: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id} from Firestore:`, error);
    if (isFirestorePermissionDenied(error)) {
      console.log(`Falling back to backend for deleting ${collectionName}/${id}`);
      return await backendService.delete(collectionName, id);
    }
    return false;
  }
}

// Disease Category CRUD
export const diseaseCategoryService = {
  getAll: () => getAll<DiseaseCategory>(COLLECTIONS.diseaseCategories),
  getById: (id: string) => getById<DiseaseCategory>(COLLECTIONS.diseaseCategories, id),
  create: (data: Omit<DiseaseCategory, 'id'>) => create<DiseaseCategory>(COLLECTIONS.diseaseCategories, data),
  update: (id: string, data: Partial<DiseaseCategory>) => update<DiseaseCategory>(COLLECTIONS.diseaseCategories, id, data),
  delete: (id: string) => remove(COLLECTIONS.diseaseCategories, id),
};

// Disease CRUD
export const diseaseService = {
  getAll: () => getAll<Disease>(COLLECTIONS.diseases),
  getById: (id: string) => getById<Disease>(COLLECTIONS.diseases, id),
  create: (data: Omit<Disease, 'id'>) => create<Disease>(COLLECTIONS.diseases, data),
  update: (id: string, data: Partial<Disease>) => update<Disease>(COLLECTIONS.diseases, id, data),
  delete: (id: string) => remove(COLLECTIONS.diseases, id),
  searchByCrop: async (cropType: string) => {
    try {
      const diseases = await getAll<Disease>(COLLECTIONS.diseases);
      return diseases.filter(disease => 
        disease.cropType.toLowerCase().includes(cropType.toLowerCase())
      );
    } catch (error) {
      console.log('Falling back to backend for disease search');
      return await backendService.searchDiseasesByCrop(cropType);
    }
  },
  getFeatured: async () => {
    try {
      const diseases = await getAll<Disease>(COLLECTIONS.diseases);
      return diseases.filter(disease => disease.featured === true);
    } catch (error) {
      console.log('Falling back to backend for featured diseases');
      return await backendService.getFeaturedDiseases();
    }
  },
};

// Chemical CRUD
export const chemicalService = {
  getAll: () => getAll<Chemical>(COLLECTIONS.chemicals),
  getById: (id: string) => getById<Chemical>(COLLECTIONS.chemicals, id),
  create: (data: Omit<Chemical, 'id'>) => create<Chemical>(COLLECTIONS.chemicals, data),
  update: (id: string, data: Partial<Chemical>) => update<Chemical>(COLLECTIONS.chemicals, id, data),
  delete: (id: string) => remove(COLLECTIONS.chemicals, id),
  getByType: async (type: string) => {
    try {
      const chemicals = await getAll<Chemical>(COLLECTIONS.chemicals);
      return chemicals.filter(chemical => 
        chemical.type.toLowerCase() === type.toLowerCase()
      );
    } catch (error) {
      console.log('Falling back to backend for chemical type filter');
      return await backendService.getChemicalsByType(type);
    }
  },
};

// Market CRUD
export const marketService = {
  getAll: () => getAll<Market>(COLLECTIONS.markets),
  getById: (id: string) => getById<Market>(COLLECTIONS.markets, id),
  create: (data: Omit<Market, 'id'>) => create<Market>(COLLECTIONS.markets, data),
  update: (id: string, data: Partial<Market>) => update<Market>(COLLECTIONS.markets, id, data),
  delete: (id: string) => remove(COLLECTIONS.markets, id),
  getByLocation: async (location: string) => {
    try {
      const markets = await getAll<Market>(COLLECTIONS.markets);
      return markets.filter(market => 
        market.location.toLowerCase().includes(location.toLowerCase()) ||
        market.region.toLowerCase().includes(location.toLowerCase())
      );
    } catch (error) {
      console.log('Falling back to backend for market location filter');
      return await backendService.getMarketsByLocation(location);
    }
  },
  getChemicals: async (marketId: string) => {
    try {
      const market = await getById<Market>(COLLECTIONS.markets, marketId);
      return market?.chemicals || [];
    } catch (error) {
      console.log('Falling back to backend for market chemicals');
      return await backendService.getMarketChemicals(marketId);
    }
  },
  updateChemical: async (marketId: string, chemicalId: string, updates: { price?: number; available?: boolean }) => {
    try {
      const market = await getById<Market>(COLLECTIONS.markets, marketId);
      if (!market) return false;

      const chemicals = market.chemicals || [];
      const chemicalIndex = chemicals.findIndex(c => c.chemicalId === chemicalId);
      if (chemicalIndex === -1) return false;

      if (updates.price !== undefined) chemicals[chemicalIndex].price = updates.price;
      if (updates.available !== undefined) chemicals[chemicalIndex].available = updates.available;
      chemicals[chemicalIndex].lastUpdated = new Date().toISOString().split('T')[0];

      return await update<Market>(COLLECTIONS.markets, marketId, { chemicals });
    } catch (error) {
      console.log('Falling back to backend for market chemical update');
      return await backendService.updateMarketChemical(marketId, chemicalId, updates);
    }
  },
};

// Pending Disease CRUD
export const pendingDiseaseService = {
  getAll: () => getAll<PendingDisease>(COLLECTIONS.pendingDiseases),
  getById: (id: string) => getById<PendingDisease>(COLLECTIONS.pendingDiseases, id),
  create: (data: Omit<PendingDisease, 'id'>) => create<PendingDisease>(COLLECTIONS.pendingDiseases, data),
  update: (id: string, data: Partial<PendingDisease>) => update<PendingDisease>(COLLECTIONS.pendingDiseases, id, data),
  delete: (id: string) => remove(COLLECTIONS.pendingDiseases, id),
  approve: async (id: string, diseaseData: Omit<Disease, 'id'>) => {
    try {
      // Create new disease from pending
      const newDiseaseId = await diseaseService.create(diseaseData);
      if (newDiseaseId) {
        // Update pending status
        await update<PendingDisease>(COLLECTIONS.pendingDiseases, id, { 
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedDiseaseId: newDiseaseId
        });
        return newDiseaseId;
      }
      return null;
    } catch (error) {
      console.log('Falling back to backend for pending disease approval');
      return await backendService.approvePendingDisease(id, diseaseData) ? 'approved' : null;
    }
  },
  reject: async (id: string, reason?: string) => {
    try {
      return await update<PendingDisease>(COLLECTIONS.pendingDiseases, id, { 
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'No reason provided'
      });
    } catch (error) {
      console.log('Falling back to backend for pending disease rejection');
      return await backendService.rejectPendingDisease(id, reason);
    }
  },
  getByStatus: async (status: string) => {
    try {
      const pendingDiseases = await getAll<PendingDisease>(COLLECTIONS.pendingDiseases);
      return pendingDiseases.filter(disease => disease.status === status);
    } catch (error) {
      console.log('Falling back to backend for pending diseases by status');
      return await backendService.getPendingDiseasesByStatus(status);
    }
  },
};

// Comment CRUD
export const commentService = {
  getAll: () => getAll<Comment>(COLLECTIONS.comments),
  getById: (id: string) => getById<Comment>(COLLECTIONS.comments, id),
  create: (data: Omit<Comment, 'id'>) => create<Comment>(COLLECTIONS.comments, data),
  markAsRead: (id: string) => update<Comment>(COLLECTIONS.comments, id, { 
    status: 'read',
    readAt: new Date().toISOString()
  }),
  markAsReplied: (id: string, reply: string, repliedBy?: string) => update<Comment>(COLLECTIONS.comments, id, { 
    status: 'replied',
    reply,
    repliedBy: repliedBy || 'Admin',
    repliedAt: new Date().toISOString()
  }),
  delete: (id: string) => remove(COLLECTIONS.comments, id),
  getByStatus: async (status: string) => {
    try {
      const comments = await getAll<Comment>(COLLECTIONS.comments);
      return comments.filter(comment => comment.status === status);
    } catch (error) {
      console.log('Falling back to backend for comments by status');
      return await backendService.getCommentsByStatus(status);
    }
  },
  getByUser: async (userId: string) => {
    try {
      const comments = await getAll<Comment>(COLLECTIONS.comments);
      return comments.filter(comment => comment.userId === userId);
    } catch (error) {
      console.log('Falling back to backend for comments by user');
      return await backendService.getCommentsByUser(userId);
    }
  },
};
