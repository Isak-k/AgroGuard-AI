import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { debugLog, errorTracker } from '@/utils/debug';

export type UserRole = 'admin' | 'farmer';

interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
  language?: 'en' | 'om' | 'am';
  location?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        debugLog.warn('Auth loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  // Fetch user data from Firestore
  const fetchUserData = useCallback(async (firebaseUser: User) => {
    try {
      debugLog.firebase('fetchUserData', { uid: firebaseUser.uid });
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: data.role || 'farmer',
          language: data.language,
          location: data.location,
        };
        setUserData(userData);
        debugLog.firebase('User data loaded from Firestore', userData);
      } else {
        // Create default user document for new users
        const defaultData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'farmer'
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...defaultData,
          createdAt: new Date().toISOString()
        });
        setUserData(defaultData);
        debugLog.firebase('Created new user document', defaultData);
      }
    } catch (error) {
      debugLog.error('Error fetching user data', error);
      errorTracker.track(error instanceof Error ? error : new Error('Firebase fetch error'), 'AuthContext.fetchUserData');
      
      // Fallback for offline/demo mode
      const fallbackData: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'farmer'
      };
      setUserData(fallbackData);
      debugLog.firebase('Using fallback user data', fallbackData);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    debugLog.auth('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      debugLog.auth('Auth state changed', { 
        hasUser: !!firebaseUser, 
        uid: firebaseUser?.uid 
      });
      
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Add a small delay to prevent rapid state changes
      timeoutId = setTimeout(async () => {
        if (!isMounted) return;
        
        try {
          setUser(firebaseUser);
          
          if (firebaseUser) {
            await fetchUserData(firebaseUser);
          } else {
            setUserData(null);
            debugLog.auth('User signed out, cleared user data');
          }
          
          if (isMounted) {
            setLoading(false);
            debugLog.auth('Auth loading complete', { hasUser: !!firebaseUser });
          }
        } catch (error) {
          debugLog.error('Error in auth state change handler', error);
          errorTracker.track(error instanceof Error ? error : new Error('Auth state error'), 'AuthContext.onAuthStateChanged');
          
          // Still set loading to false to prevent infinite loading
          if (isMounted) {
            setLoading(false);
          }
        }
      }, 200); // Increased delay to 200ms
    }, (error) => {
      // Error callback for onAuthStateChanged
      debugLog.error('Auth state listener error', error);
      errorTracker.track(error, 'AuthContext.onAuthStateChanged.error');
      
      if (isMounted) {
        setLoading(false);
      }
    });

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
      debugLog.auth('Auth context cleanup');
    };
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(result.user);
  }, [fetchUserData]);

  const signUp = useCallback(async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document in Firestore
    const defaultData: UserData = {
      uid: result.user.uid,
      email: result.user.email,
      role: 'farmer'
    };
    await setDoc(doc(db, 'users', result.user.uid), {
      ...defaultData,
      createdAt: new Date().toISOString()
    });
    setUserData(defaultData);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUserData(null);
    setUser(null);
  }, []);

  const updateUserData = useCallback(async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserData,
    isAdmin: userData?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
