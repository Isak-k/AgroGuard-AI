// Mock data for diseases, chemicals, and markets
// This simulates what would come from Firestore

export interface Disease {
  id: string;
  name: {
    en: string;
    om: string;
    am: string;
  };
  cropType: string;
  categoryId?: string; // Reference to disease category
  featured?: boolean; // Whether this disease appears in "Common Diseases" section
  images: string[];
  symptoms: {
    en: string[];
    om: string[];
    am: string[];
  };
  treatments: ChemicalTreatment[];
}

export interface DiseaseCategory {
  id: string;
  name: {
    en: string;
    om: string;
    am: string;
  };
  description: {
    en: string;
    om: string;
    am: string;
  };
  color: string; // Hex color for UI display
  icon: string; // Icon name for UI display
  createdAt?: string;
  updatedAt?: string;
}

export interface ChemicalTreatment {
  chemicalId: string;
  chemicalName: string;
  dosage: string;
  safetyInstructions: {
    en: string;
    om: string;
    am: string;
  };
}

export interface Chemical {
  id: string;
  name: string;
  type: string;
  activeIngredient: string;
  dosage: string;
  safetyInstructions: {
    en: string;
    om: string;
    am: string;
  };
}

export interface Market {
  id: string;
  name: string;
  location: string;
  region: string;
  chemicals: MarketChemical[];
}

export interface MarketChemical {
  chemicalId: string;
  chemicalName: string;
  price: number;
  available: boolean;
  lastUpdated: string;
}

export interface PendingDisease {
  id: string;
  imageUrl: string;
  location: string;
  detectedDisease?: string;
  confidence: number;
  userId: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Comment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject?: string;
  message: string;
  category?: string;
  relatedId?: string;
  status: 'unread' | 'read' | 'replied';
  submittedAt?: string;
  createdAt?: string;
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  readAt?: string;
  // Legacy fields for backward compatibility
  commentText?: string;
  location?: string;
  relatedDiseaseId?: string;
}

// Re-export locations from Ethiopia locations file
import { getAllLocations } from './ethiopiaLocations';

// Ethiopian locations - comprehensive list
export const locations = getAllLocations();

// Mock disease categories
export const mockDiseaseCategories: DiseaseCategory[] = [
  {
    id: 'cat-1',
    name: {
      en: 'Fungal Diseases',
      om: 'Dhukkuboota Bosona',
      am: 'የፈንገስ በሽታዎች'
    },
    description: {
      en: 'Diseases caused by fungal pathogens that affect plant tissues',
      om: 'Dhukkuboota bosona sababa taasisan kanneen qaamolee biqiltuu miidhan',
      am: 'በፈንገስ አምራቾች የሚከሰቱ እና የእፅዋት ሕብረ ሰውነትን የሚጎዱ በሽታዎች'
    },
    color: '#8B5CF6',
    icon: 'Microscope',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-2',
    name: {
      en: 'Bacterial Diseases',
      om: 'Dhukkuboota Baakteeriyaa',
      am: 'የባክቴሪያ በሽታዎች'
    },
    description: {
      en: 'Diseases caused by bacterial infections in plants',
      om: 'Dhukkuboota baakteeriyaan biqiltoota keessatti uumaman',
      am: 'በእፅዋት ውስጥ በባክቴሪያ ኢንፌክሽን የሚከሰቱ በሽታዎች'
    },
    color: '#EF4444',
    icon: 'Bug',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-3',
    name: {
      en: 'Viral Diseases',
      om: 'Dhukkuboota Vaayirasii',
      am: 'የቫይረስ በሽታዎች'
    },
    description: {
      en: 'Plant diseases caused by viral infections',
      om: 'Dhukkuboota biqiltootaa vaayirasiin uumaman',
      am: 'በቫይረስ ኢንፌክሽን የሚከሰቱ የእፅዋት በሽታዎች'
    },
    color: '#F59E0B',
    icon: 'Zap',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-4',
    name: {
      en: 'Nutritional Disorders',
      om: 'Rakkoolee Soorataa',
      am: 'የአመጋገብ መዛባቶች'
    },
    description: {
      en: 'Plant health issues caused by nutrient deficiencies or excesses',
      om: 'Dhimmoota fayyaa biqiltootaa hanqina ykn garmalee soorataan uumaman',
      am: 'በንጥረ ነገር እጥረት ወይም ከመጠን በላይ መኖር የሚከሰቱ የእፅዋት ጤንነት ችግሮች'
    },
    color: '#10B981',
    icon: 'Leaf',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-5',
    name: {
      en: 'Environmental Stress',
      om: 'Dhiphina Naannoo',
      am: 'የአካባቢ ጭንቀት'
    },
    description: {
      en: 'Plant disorders caused by environmental factors like drought, heat, or cold',
      om: 'Rakkoolee biqiltootaa wantoota naannoo akka gogiinsa, ho\'aa, ykn qorraatiin uumaman',
      am: 'እንደ ድርቅ፣ ሙቀት ወይም ቅዝቃዜ ባሉ የአካባቢ ሁኔታዎች የሚከሰቱ የእፅዋት መዛባቶች'
    },
    color: '#6B7280',
    icon: 'Cloud',
    createdAt: '2024-01-15T10:00:00Z'
  }
];
export const mockDiseases: Disease[] = [
  {
    id: 'disease-1',
    name: {
      en: 'Late Blight',
      om: 'Dhukkuba Boqqolloo',
      am: 'ዘግይቶ ብሊት'
    },
    cropType: 'Potato',
    categoryId: 'cat-1', // Fungal Diseases
    featured: true, // Featured in Common Diseases section
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82ber3d5?w=400',
    ],
    symptoms: {
      en: [
        'Dark brown or black lesions on leaves',
        'White fuzzy growth on underside of leaves',
        'Stems may become infected and break',
        'Tubers develop brown rot'
      ],
      om: [
        'Madaa gurraacha baala irratti',
        'Guddinni adii jala baala irratti',
        'Hiddi faalama ta\'uu danda\'a',
        'Qubeen tortoruu gurraacha ta\'a'
      ],
      am: [
        'ጥቁር ወይም ቡናማ ቁስሎች በቅጠሎች ላይ',
        'ነጭ ጸጉራማ እድገት ከቅጠሎች ስር',
        'ግንዶች ሊበከሉ ይችላሉ',
        'ድንች ቡናማ ብስባሽ ያዳብራል'
      ]
    },
    treatments: [
      {
        chemicalId: 'chem-1',
        chemicalName: 'Ridomil Gold MZ',
        dosage: '2.5 kg/ha',
        safetyInstructions: {
          en: 'Wear protective gloves and mask. Do not apply near water sources.',
          om: 'Guwantii fi maaskii uffadhu. Bishaanitti dhiyaatti hin fayyadamin.',
          am: 'የመከላከያ ጓንት እና ማስክ ያድርጉ። ከውሃ ምንጮች አጠገብ አይጠቀሙ።'
        }
      }
    ]
  },
  {
    id: 'disease-2',
    name: {
      en: 'Tomato Yellow Leaf Curl',
      om: 'Baala Timaatimii Keelloo',
      am: 'የቲማቲም ቢጫ ቅጠል ጠመዝማዛ'
    },
    cropType: 'Tomato',
    categoryId: 'cat-3', // Viral Diseases
    featured: true, // Featured in Common Diseases section
    images: [],
    symptoms: {
      en: [
        'Yellowing of leaf margins',
        'Upward curling of leaves',
        'Stunted plant growth',
        'Reduced fruit production'
      ],
      om: [
        'Keellayuu daaraa baalaa',
        'Baalli ol maruu',
        'Guddina biqiltuu gadi bu\'e',
        'Oomisha frii gadi bu\'e'
      ],
      am: [
        'የቅጠሎች ጠርዝ መቢያጨት',
        'ቅጠሎች ወደ ላይ መጠማዘዝ',
        'የተዘገየ የተክል እድገት',
        'የቀነሰ ፍሬ ምርት'
      ]
    },
    treatments: [
      {
        chemicalId: 'chem-2',
        chemicalName: 'Imidacloprid',
        dosage: '200 ml/ha',
        safetyInstructions: {
          en: 'Apply in early morning or evening. Keep away from bees.',
          om: 'Ganama yookin galgala fayyadami. Kanniisa irraa fagaadhu.',
          am: 'ማለዳ ወይም ምሽት ይተግብሩ። ንቦችን ያርቁ።'
        }
      }
    ]
  },
  {
    id: 'disease-3',
    name: {
      en: 'Coffee Berry Disease',
      om: 'Dhukkuba Bunaa',
      am: 'የቡና ፍሬ በሽታ'
    },
    cropType: 'Coffee',
    categoryId: 'cat-1', // Fungal Diseases
    featured: true, // Featured in Common Diseases section
    images: [],
    symptoms: {
      en: [
        'Dark sunken lesions on berries',
        'Premature berry drop',
        'Brown-black spots on flowers',
        'Twig dieback'
      ],
      om: [
        'Madaa gurraacha frii irratti',
        'Frii dursee kufu',
        'Tuqaa gurraacha daraaraa irratti',
        'Dameen du\'u'
      ],
      am: [
        'ጥቁር የገባ ቁስሎች በፍሬዎች ላይ',
        'ያለጊዜው ፍሬ መውደቅ',
        'ቡናማ-ጥቁር ነጠብጣቦች በአበቦች ላይ',
        'ቅርንጫፍ መሞት'
      ]
    },
    treatments: [
      {
        chemicalId: 'chem-3',
        chemicalName: 'Copper Hydroxide',
        dosage: '3 kg/ha',
        safetyInstructions: {
          en: 'Apply at first sign of disease. Repeat every 2 weeks during wet season.',
          om: 'Mallattoo jalqabaa irratti fayyadami. Torban 2tti irra deebi\'i.',
          am: 'በሽታው ሲታይ ይተግብሩ። በየ2 ሳምንቱ ይድገሙ።'
        }
      }
    ]
  },
  {
    id: 'disease-4',
    name: {
      en: 'Maize Streak Virus',
      om: 'Vaayirasii Boqqolloo',
      am: 'የበቆሎ ስትሪክ ቫይረስ'
    },
    cropType: 'Maize',
    categoryId: 'cat-3', // Viral Diseases
    images: [],
    symptoms: {
      en: [
        'Yellow streaks along leaf veins',
        'Stunted growth',
        'Small, malformed cobs',
        'Reduced grain fill'
      ],
      om: [
        'Sarara keelloo hiddaa baalaa irratti',
        'Guddina gadi bu\'e',
        'Boqqolloo xiqqaa, hin toliin',
        'Midhaanii hir\'ate'
      ],
      am: [
        'ቢጫ ጭረቶች በቅጠል ደም ስሮች ላይ',
        'የተዘገየ እድገት',
        'ትንሽ፣ የተበላሸ ጆሮ',
        'የቀነሰ ዘር ሙላት'
      ]
    },
    treatments: [
      {
        chemicalId: 'chem-4',
        chemicalName: 'Thiamethoxam',
        dosage: '150 ml/ha',
        safetyInstructions: {
          en: 'Control leafhopper vectors. Apply as seed treatment or foliar spray.',
          om: 'Qamilee to\'adhu. Sanyii yookin baala irratti biifi.',
          am: 'ቅጠል ዘሪዎችን ይቆጣጠሩ። እንደ ዘር ህክምና ወይም ቅጠል ይረጩ።'
        }
      }
    ]
  },
  {
    id: 'disease-5',
    name: {
      en: 'Wheat Rust',
      om: 'Kosii Qamadii',
      am: 'የስንዴ ዝገት'
    },
    cropType: 'Wheat',
    categoryId: 'cat-1', // Fungal Diseases
    images: [],
    symptoms: {
      en: [
        'Orange-brown pustules on leaves and stems',
        'Yellowing and drying of leaves',
        'Reduced grain quality',
        'Shriveled kernels'
      ],
      om: [
        'Dhoqqee burtukaana-magaala baala fi hidda irratti',
        'Keellayuu fi goguu baalaa',
        'Qulqullina midhaan gadi bu\'e',
        'Sanyiin wawwaate'
      ],
      am: [
        'ብርቱካናማ-ቡናማ ቁስሎች በቅጠሎች እና ግንዶች ላይ',
        'ቢጫ መሆን እና መድረቅ ቅጠሎች',
        'የቀነሰ የእህል ጥራት',
        'የተሸበሸቡ ዘሮች'
      ]
    },
    treatments: [
      {
        chemicalId: 'chem-5',
        chemicalName: 'Propiconazole',
        dosage: '500 ml/ha',
        safetyInstructions: {
          en: 'Apply at first sign of rust. Avoid spraying in windy conditions.',
          om: 'Mallattoo jalqabaa irratti biifi. Qilleensa cimaa keessa hin biisin.',
          am: 'ዝገት ሲታይ ይተግብሩ። በነፋሻማ ሁኔታ ከመርጨት ይቆጠቡ።'
        }
      }
    ]
  }
];

// Mock chemicals data
export const mockChemicals: Chemical[] = [
  {
    id: 'chem-1',
    name: 'Ridomil Gold MZ',
    type: 'Fungicide',
    activeIngredient: 'Metalaxyl-M + Mancozeb',
    dosage: '2.5 kg/ha',
    safetyInstructions: {
      en: 'Wear protective equipment. Do not apply near water.',
      om: 'Meeshaa eegumsa uffadhu. Bishaanitti hin dhiyaatin.',
      am: 'የመከላከያ መሣሪያ ያድርጉ። ከውሃ አጠገብ አይተግብሩ።'
    }
  },
  {
    id: 'chem-2',
    name: 'Imidacloprid',
    type: 'Insecticide',
    activeIngredient: 'Imidacloprid 200 SL',
    dosage: '200 ml/ha',
    safetyInstructions: {
      en: 'Harmful to bees. Apply early morning or evening.',
      om: 'Kanniisaaf miidhaa. Ganama yookin galgala fayyadami.',
      am: 'ለንቦች ጎጂ ነው። ማለዳ ወይም ምሽት ይተግብሩ።'
    }
  },
  {
    id: 'chem-3',
    name: 'Copper Hydroxide',
    type: 'Fungicide',
    activeIngredient: 'Copper Hydroxide 77% WP',
    dosage: '3 kg/ha',
    safetyInstructions: {
      en: 'Avoid contact with skin. Use respirator mask.',
      om: 'Gogaa waliin wal hin tuqin. Maaskii fayyadami.',
      am: 'ከቆዳ ጋር ንክኪ ያስወግዱ። የመተንፈሻ ማስክ ይጠቀሙ።'
    }
  },
  {
    id: 'chem-4',
    name: 'Thiamethoxam',
    type: 'Insecticide',
    activeIngredient: 'Thiamethoxam 25% WG',
    dosage: '150 ml/ha',
    safetyInstructions: {
      en: 'Systemic insecticide. Follow label instructions.',
      om: 'Keemikaala siistamii. Qajeelfama hordofi.',
      am: 'ስርዓታዊ ፀረ-ነፍሳት። የመለያ መመሪያዎችን ይከተሉ።'
    }
  },
  {
    id: 'chem-5',
    name: 'Propiconazole',
    type: 'Fungicide',
    activeIngredient: 'Propiconazole 25% EC',
    dosage: '500 ml/ha',
    safetyInstructions: {
      en: 'Do not mix with other pesticides. Store in cool place.',
      om: 'Keemikaalota biroo waliin hin makiin. Bakka qorraa kaa\'i.',
      am: 'ከሌሎች ፀረ-ተባዮች ጋር አይቀላቅሉ። ቀዝቃዛ ቦታ ያስቀምጡ።'
    }
  }
];

// Mock markets data
export const mockMarkets: Market[] = [
  {
    id: 'market-1',
    name: 'Robe Agricultural Center',
    location: 'Robe Town',
    region: 'Oromia',
    chemicals: [
      { chemicalId: 'chem-1', chemicalName: 'Ridomil Gold MZ', price: 850, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-2', chemicalName: 'Imidacloprid', price: 420, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-3', chemicalName: 'Copper Hydroxide', price: 380, available: false, lastUpdated: '2024-01-10' }
    ]
  },
  {
    id: 'market-2',
    name: 'Goba Farmers Market',
    location: 'Goba Town',
    region: 'Oromia',
    chemicals: [
      { chemicalId: 'chem-1', chemicalName: 'Ridomil Gold MZ', price: 880, available: true, lastUpdated: '2024-01-14' },
      { chemicalId: 'chem-4', chemicalName: 'Thiamethoxam', price: 560, available: true, lastUpdated: '2024-01-14' },
      { chemicalId: 'chem-5', chemicalName: 'Propiconazole', price: 720, available: true, lastUpdated: '2024-01-12' }
    ]
  },
  {
    id: 'market-3',
    name: 'Sinana AgriSupply',
    location: 'Sinana',
    region: 'Oromia',
    chemicals: [
      { chemicalId: 'chem-1', chemicalName: 'Ridomil Gold MZ', price: 820, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-2', chemicalName: 'Imidacloprid', price: 400, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-3', chemicalName: 'Copper Hydroxide', price: 360, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-4', chemicalName: 'Thiamethoxam', price: 540, available: true, lastUpdated: '2024-01-14' },
      { chemicalId: 'chem-5', chemicalName: 'Propiconazole', price: 690, available: true, lastUpdated: '2024-01-13' }
    ]
  },
  {
    id: 'market-4',
    name: 'Ginir Crop Center',
    location: 'Ginir',
    region: 'Oromia',
    chemicals: [
      { chemicalId: 'chem-1', chemicalName: 'Ridomil Gold MZ', price: 860, available: true, lastUpdated: '2024-01-14' },
      { chemicalId: 'chem-3', chemicalName: 'Copper Hydroxide', price: 375, available: true, lastUpdated: '2024-01-13' }
    ]
  },
  {
    id: 'market-5',
    name: 'Agarfa Agricultural Supply',
    location: 'Agarfa',
    region: 'Oromia',
    chemicals: [
      { chemicalId: 'chem-2', chemicalName: 'Imidacloprid', price: 410, available: true, lastUpdated: '2024-01-15' },
      { chemicalId: 'chem-4', chemicalName: 'Thiamethoxam', price: 550, available: true, lastUpdated: '2024-01-14' },
      { chemicalId: 'chem-5', chemicalName: 'Propiconazole', price: 700, available: false, lastUpdated: '2024-01-12' }
    ]
  }
];

// Mock pending diseases (for admin)
export const mockPendingDiseases: PendingDisease[] = [
  {
    id: 'pending-1',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    location: 'Goba Town',
    detectedDisease: 'Unknown Leaf Spot',
    confidence: 45,
    userId: 'user-123',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'pending-2',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    location: 'Sinana',
    detectedDisease: 'Possible Wilt Disease',
    confidence: 38,
    userId: 'user-456',
    createdAt: '2024-01-14T14:20:00Z',
    status: 'pending'
  },
  {
    id: 'pending-3',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400',
    location: 'Ginir',
    detectedDisease: 'Rust Disease',
    confidence: 62,
    userId: 'user-789',
    createdAt: '2024-01-16T09:15:00Z',
    status: 'pending'
  }
];

// Mock comments (for admin)
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    userId: 'user-123',
    userName: 'John Farmer',
    userEmail: 'john@example.com',
    subject: 'Tomato Disease Question',
    message: 'My tomato plants have yellow spots. What chemical should I use?',
    category: 'question',
    relatedId: 'disease-2',
    status: 'unread',
    submittedAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    // Legacy fields for backward compatibility
    commentText: 'My tomato plants have yellow spots. What chemical should I use?',
    location: 'Robe Town',
    relatedDiseaseId: 'disease-2'
  },
  {
    id: 'comment-2',
    userId: 'user-789',
    userName: 'Mary Farmer',
    userEmail: 'mary@example.com',
    subject: 'Chemical Availability',
    message: 'Where can I find Ridomil Gold in Goba?',
    category: 'general',
    status: 'read',
    submittedAt: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-14T16:45:00Z',
    readAt: '2024-01-15T08:00:00Z',
    // Legacy fields for backward compatibility
    commentText: 'Where can I find Ridomil Gold in Goba?',
    location: 'Goba Town'
  },
  {
    id: 'comment-3',
    userId: 'user-456',
    userName: 'Ahmed Farmer',
    userEmail: 'ahmed@example.com',
    subject: 'Crop Disease Help',
    message: 'I need help identifying a disease affecting my barley crop in Sinana.',
    category: 'question',
    status: 'unread',
    submittedAt: '2024-01-16T11:30:00Z',
    createdAt: '2024-01-16T11:30:00Z',
    // Legacy fields for backward compatibility
    commentText: 'I need help identifying a disease affecting my barley crop in Sinana.',
    location: 'Sinana'
  }
];
