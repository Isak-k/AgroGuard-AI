import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Language = 'en' | 'om' | 'am';

interface Translations {
  [key: string]: {
    en: string;
    om: string;
    am: string;
  };
}

// Core translations for the app
const translations: Translations = {
  // Common
  appName: {
    en: 'AgroGuard AI',
    om: 'AgroGuard AI',
    am: 'አግሮጋርድ AI'
  },
  tagline: {
    en: 'Protect Your Crops',
    om: 'Midhaan Kee Eegi',
    am: 'ሰብልዎን ይጠብቁ'
  },
  loading: {
    en: 'Loading...',
    om: 'Fe\'aa jira...',
    am: 'በመጫን ላይ...'
  },
  
  // Auth
  login: {
    en: 'Login',
    om: 'Seeni',
    am: 'ግባ'
  },
  signup: {
    en: 'Sign Up',
    om: 'Galmaa\'i',
    am: 'ይመዝገቡ'
  },
  logout: {
    en: 'Logout',
    om: 'Ba\'i',
    am: 'ውጣ'
  },
  email: {
    en: 'Email',
    om: 'Email',
    am: 'ኢሜይል'
  },
  password: {
    en: 'Password',
    om: 'Jecha Iccitii',
    am: 'የይለፍ ቃል'
  },
  confirmPassword: {
    en: 'Confirm Password',
    om: 'Jecha Iccitii Mirkaneessi',
    am: 'የይለፍ ቃል አረጋግጥ'
  },
  welcomeBack: {
    en: 'Welcome Back',
    om: 'Baga Deebitee',
    am: 'እንኳን ደህና መጡ'
  },
  createAccount: {
    en: 'Create Account',
    om: 'Herrega Uumi',
    am: 'መለያ ፍጠር'
  },
  
  // Language Selection
  selectLanguage: {
    en: 'Select Your Language',
    om: 'Afaan Kee Filadhu',
    am: 'ቋንቋዎን ይምረጡ'
  },
  english: {
    en: 'English',
    om: 'Ingliffaa',
    am: 'እንግሊዝኛ'
  },
  afaanOromo: {
    en: 'Afaan Oromo',
    om: 'Afaan Oromoo',
    am: 'ኦሮምኛ'
  },
  amharic: {
    en: 'Amharic',
    om: 'Amaariffaa',
    am: 'አማርኛ'
  },
  continue: {
    en: 'Continue',
    om: 'Itti Fufi',
    am: 'ቀጥል'
  },
  
  // Location
  selectLocation: {
    en: 'Select Your Location',
    om: 'Bakka Kee Filadhu',
    am: 'ቦታዎን ይምረጡ'
  },
  locationRequired: {
    en: 'Location is required to see local markets',
    om: 'Gabaa naannoo ilaaluuf bakka barbaachisa',
    am: 'የአከባቢ ገበያዎችን ለማየት ቦታ ያስፈልጋል'
  },
  
  // Navigation
  home: {
    en: 'Home',
    om: 'Mana',
    am: 'መነሻ'
  },
  scan: {
    en: 'Scan',
    om: 'Skaani',
    am: 'ስካን'
  },
  diseases: {
    en: 'Diseases',
    om: 'Dhukkuboota',
    am: 'በሽታዎች'
  },
  markets: {
    en: 'Markets',
    om: 'Gabaa',
    am: 'ገበያዎች'
  },
  profile: {
    en: 'Profile',
    om: 'Eenyummaa',
    am: 'መገለጫ'
  },
  
  // Diseases
  commonDiseases: {
    en: 'Common Diseases',
    om: 'Dhukkuboota Beekamoo',
    am: 'የተለመዱ በሽታዎች'
  },
  searchDisease: {
    en: 'Search diseases...',
    om: 'Dhukkuba barbaadi...',
    am: 'በሽታዎችን ይፈልጉ...'
  },
  symptoms: {
    en: 'Symptoms',
    om: 'Mallattoo',
    am: 'ምልክቶች'
  },
  treatment: {
    en: 'Treatment',
    om: 'Yaalii',
    am: 'ህክምና'
  },
  chemicals: {
    en: 'Chemicals',
    om: 'Keemikaala',
    am: 'ኬሚካሎች'
  },
  dosage: {
    en: 'Dosage',
    om: 'Safartuulee',
    am: 'መጠን'
  },
  safetyInstructions: {
    en: 'Safety Instructions',
    om: 'Qajeelfama Nageenya',
    am: 'የደህንነት መመሪያዎች'
  },
  
  // Scanning
  scanCrop: {
    en: 'Scan Your Crop',
    om: 'Midhaan Kee Skaani',
    am: 'ሰብልዎን ይቃኙ'
  },
  takePhoto: {
    en: 'Take Photo',
    om: 'Suuraa Kaasi',
    am: 'ፎቶ አንሳ'
  },
  uploadImage: {
    en: 'Upload Image',
    om: 'Suuraa Olkaa\'i',
    am: 'ምስል አስገባ'
  },
  analyzing: {
    en: 'Analyzing...',
    om: 'Xiinxalaa jira...',
    am: 'በመተንተን ላይ...'
  },
  diseaseDetected: {
    en: 'Disease Detected',
    om: 'Dhukkubni Argame',
    am: 'በሽታ ተገኝቷል'
  },
  confidence: {
    en: 'Confidence',
    om: 'Amanamummaa',
    am: 'እምነት'
  },
  lowConfidence: {
    en: 'Low confidence - Please consult an expert',
    om: 'Amanamummaa gadi - Oggeessa mariisiisi',
    am: 'ዝቅተኛ እምነት - እባክዎ ባለሙያ ያማክሩ'
  },
  sentForReview: {
    en: 'Sent for expert review',
    om: 'Ilaalcha oggeessaaf ergame',
    am: 'ለባለሙያ ግምገማ ተልኳል'
  },
  
  // Markets
  availableAt: {
    en: 'Available at',
    om: 'Argama',
    am: 'ይገኛል በ'
  },
  price: {
    en: 'Price',
    om: 'Gatii',
    am: 'ዋጋ'
  },
  etb: {
    en: 'ETB',
    om: 'ETB',
    am: 'ብር'
  },
  
  // Comments
  askQuestion: {
    en: 'Ask a Question',
    om: 'Gaaffii Gaafadhu',
    am: 'ጥያቄ ጠይቅ'
  },
  submitQuestion: {
    en: 'Submit Question',
    om: 'Gaaffii Ergi',
    am: 'ጥያቄ ላክ'
  },
  questionSent: {
    en: 'Question sent to experts',
    om: 'Gaaffiin oggeessota ergame',
    am: 'ጥያቄ ለባለሙያዎች ተልኳል'
  },
  
  // Admin
  adminDashboard: {
    en: 'Admin Dashboard',
    om: 'Daashboordii Bulchiinsaa',
    am: 'የአስተዳዳሪ ዳሽቦርድ'
  },
  manageDiseases: {
    en: 'Manage Diseases',
    om: 'Dhukkuboota Bulchi',
    am: 'በሽታዎችን አስተዳድር'
  },
  manageChemicals: {
    en: 'Manage Chemicals',
    om: 'Keemikaala Bulchi',
    am: 'ኬሚካሎችን አስተዳድር'
  },
  manageMarkets: {
    en: 'Manage Markets',
    om: 'Gabaa Bulchi',
    am: 'ገበያዎችን አስተዳድር'
  },
  pendingReviews: {
    en: 'Pending Reviews',
    om: 'Ilaalcha Eeguu',
    am: 'በመጠባበቅ ላይ ያሉ ግምገማዎች'
  },
  userComments: {
    en: 'User Comments',
    om: 'Yaada Fayyadamtoota',
    am: 'የተጠቃሚ አስተያየቶች'
  },
  approve: {
    en: 'Approve',
    om: 'Fudhi',
    am: 'ፈቅድ'
  },
  reject: {
    en: 'Reject',
    om: 'Didi',
    am: 'አይቀበሉ'
  },
  add: {
    en: 'Add',
    om: 'Ida\'i',
    am: 'ጨምር'
  },
  edit: {
    en: 'Edit',
    om: 'Sirreessi',
    am: 'አርትዕ'
  },
  delete: {
    en: 'Delete',
    om: 'Haqi',
    am: 'ሰርዝ'
  },
  save: {
    en: 'Save',
    om: 'Olkaa\'i',
    am: 'አስቀምጥ'
  },
  cancel: {
    en: 'Cancel',
    om: 'Haqi',
    am: 'ተወው'
  },
  
  // Status
  online: {
    en: 'Online',
    om: 'Toora irra',
    am: 'ኦንላይን'
  },
  offline: {
    en: 'Offline',
    om: 'Toora ala',
    am: 'ከመስመር ውጪ'
  },
  syncing: {
    en: 'Syncing...',
    om: 'Walsimsiisaa jira...',
    am: 'በማመሳሰል ላይ...'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { userData, updateUserData } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load from localStorage first, then from user data
    const stored = localStorage.getItem('agroguard_language') as Language;
    if (stored) {
      setLanguageState(stored);
    } else if (userData?.language) {
      setLanguageState(userData.language);
    }
  }, [userData?.language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agroguard_language', lang);
    
    // Also update in Firestore if user is logged in
    if (userData) {
      await updateUserData({ language: lang });
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
