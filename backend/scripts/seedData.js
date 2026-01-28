import { diseaseDB, diseaseCategoryDB, chemicalDB, marketDB, commentDB } from '../services/database.js';

// Sample disease categories
const sampleDiseaseCategories = [
  {
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
    icon: 'Microscope'
  },
  {
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
    icon: 'Bug'
  },
  {
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
    icon: 'Zap'
  },
  {
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
    icon: 'Leaf'
  }
];

// Sample data to seed the database
const sampleDiseases = [
  {
    name: { 
      en: 'Late Blight', 
      om: 'Dhukkuba Booda', 
      am: 'የዘገየ በሽታ' 
    },
    cropType: 'Potato',
    categoryId: 'cat1', // Will be replaced with actual ID
    featured: true, // Featured in Common Diseases section
    images: ['https://example.com/late-blight.jpg'],
    symptoms: {
      en: ['Dark spots on leaves', 'White fuzzy growth on leaf undersides', 'Brown lesions on stems'],
      om: ['Bakka gurraacha baala irratti', 'Guddina adii baala jalatti', 'Madaa magariisa hidda irratti'],
      am: ['በቅጠሎች ላይ ጥቁር ነጠብጣቦች', 'በቅጠል ስር ነጭ ፈንገስ', 'በግንድ ላይ ቡናማ ቁስሎች']
    },
    treatments: [
      {
        chemicalId: 'chem1',
        chemicalName: 'Ridomil Gold MZ',
        dosage: '2.5 kg/ha',
        applicationMethod: 'Foliar spray'
      }
    ]
  },
  {
    name: { 
      en: 'Coffee Berry Disease', 
      om: 'Dhukkuba Buna', 
      am: 'የቡና ፍሬ በሽታ' 
    },
    cropType: 'Coffee',
    categoryId: 'cat1', // Will be replaced with actual ID
    featured: true, // Featured in Common Diseases section
    images: ['https://example.com/coffee-berry-disease.jpg'],
    symptoms: {
      en: ['Dark sunken spots on berries', 'Premature fruit drop', 'Reduced yield'],
      om: ['Bakka gurraacha ija buna irratti', 'Iji buna dafee bu\'uu', 'Oomisha hir\'achuu'],
      am: ['በቡና ፍሬ ላይ ጥቁር ጉድጓዶች', 'ፍሬው ቀደም ብሎ መውደቅ', 'ምርት መቀነስ']
    },
    treatments: [
      {
        chemicalId: 'chem2',
        chemicalName: 'Copper Oxychloride',
        dosage: '3 kg/ha',
        applicationMethod: 'Foliar spray'
      }
    ]
  }
];

const sampleChemicals = [
  {
    name: 'Ridomil Gold MZ',
    type: 'Fungicide',
    activeIngredient: 'Metalaxyl-M + Mancozeb',
    dosage: '2.5 kg/ha',
    safetyInstructions: {
      en: 'Wear protective clothing. Do not spray during windy conditions. Keep away from water sources.',
      om: 'Uffata eegumsa uffadhu. Qilleensa cimaa keessatti hin faffacaasin. Madda bishaanii irraa fageeessi.',
      am: 'መከላከያ ልብስ ይልበሱ። በነፋስ ጊዜ አይርጩ። ከውሃ ምንጮች ያርቁ።'
    }
  },
  {
    name: 'Copper Oxychloride',
    type: 'Fungicide',
    activeIngredient: 'Copper Oxychloride 50% WP',
    dosage: '3 kg/ha',
    safetyInstructions: {
      en: 'Use protective equipment. Avoid contact with skin and eyes. Store in cool, dry place.',
      om: 'Meeshaalee eegumsa fayyadami. Gogaa fi ija waliin wal qunnamtii dhowwi. Iddoo qabbanaawaa fi gogaa keessatti kuusi.',
      am: 'መከላከያ መሳሪያዎችን ይጠቀሙ። ከቆዳ እና ከዓይን ጋር መገናኘትን ያስወግዱ። በቀዝቃዛ እና ደረቅ ቦታ ያስቀምጡ።'
    }
  },
  {
    name: 'Dimethoate',
    type: 'Insecticide',
    activeIngredient: 'Dimethoate 40% EC',
    dosage: '1.5 L/ha',
    safetyInstructions: {
      en: 'Highly toxic. Use full protective equipment. Do not eat, drink or smoke during application.',
      om: 'Summii cimaa qaba. Meeshaalee eegumsa guutuu fayyadami. Yeroo fayyadamtu nyaachuu, dhuguu ykn tamboo hin xuuxin.',
      am: 'በጣም መርዛማ ነው። ሙሉ መከላከያ መሳሪያ ይጠቀሙ። በመርጨት ጊዜ አይብሉ፣ አይጠጡ ወይም አያጨሱ።'
    }
  }
];

const sampleMarkets = [
  {
    name: 'Robe Agricultural Center',
    location: 'Robe Town',
    region: 'Oromia',
    chemicals: [
      {
        chemicalId: 'chem1',
        chemicalName: 'Ridomil Gold MZ',
        price: 850,
        available: true,
        lastUpdated: '2024-01-27'
      },
      {
        chemicalId: 'chem2',
        chemicalName: 'Copper Oxychloride',
        price: 320,
        available: true,
        lastUpdated: '2024-01-27'
      }
    ]
  },
  {
    name: 'Goba Farmers Market',
    location: 'Goba Town',
    region: 'Oromia',
    chemicals: [
      {
        chemicalId: 'chem2',
        chemicalName: 'Copper Oxychloride',
        price: 310,
        available: true,
        lastUpdated: '2024-01-27'
      },
      {
        chemicalId: 'chem3',
        chemicalName: 'Dimethoate',
        price: 450,
        available: false,
        lastUpdated: '2024-01-25'
      }
    ]
  },
  {
    name: 'Sinana AgriSupply',
    location: 'Sinana',
    region: 'Oromia',
    chemicals: [
      {
        chemicalId: 'chem1',
        chemicalName: 'Ridomil Gold MZ',
        price: 900,
        available: true,
        lastUpdated: '2024-01-27'
      },
      {
        chemicalId: 'chem3',
        chemicalName: 'Dimethoate',
        price: 480,
        available: true,
        lastUpdated: '2024-01-26'
      }
    ]
  },
  {
    name: 'Ginir Crop Center',
    location: 'Ginir',
    region: 'Oromia',
    chemicals: [
      {
        chemicalId: 'chem1',
        chemicalName: 'Ridomil Gold MZ',
        price: 860,
        available: true,
        lastUpdated: '2024-01-27'
      },
      {
        chemicalId: 'chem2',
        chemicalName: 'Copper Oxychloride',
        price: 330,
        available: true,
        lastUpdated: '2024-01-27'
      }
    ]
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed disease categories first
    console.log('📂 Seeding disease categories...');
    const categoryIds = [];
    for (const category of sampleDiseaseCategories) {
      console.log(`Creating category: ${category.name.en}`);
      const id = await diseaseCategoryDB.create(category);
      if (id) {
        categoryIds.push(id);
        console.log(`✅ Created disease category: ${category.name.en} (ID: ${id})`);
      } else {
        console.log(`❌ Failed to create category: ${category.name.en}`);
      }
    }

    // Update category IDs in diseases
    sampleDiseases.forEach((disease, index) => {
      const catIndex = parseInt(disease.categoryId.replace('cat', '')) - 1;
      if (categoryIds[catIndex]) {
        disease.categoryId = categoryIds[catIndex];
        console.log(`Updated disease ${disease.name.en} with category ID: ${categoryIds[catIndex]}`);
      }
    });

    // Seed chemicals (referenced by diseases and markets)
    console.log('📦 Seeding chemicals...');
    const chemicalIds = [];
    for (const chemical of sampleChemicals) {
      const id = await chemicalDB.create(chemical);
      if (id) {
        chemicalIds.push(id);
        console.log(`✅ Created chemical: ${chemical.name}`);
      }
    }

    // Update chemical IDs in diseases and markets
    sampleDiseases.forEach((disease, index) => {
      disease.treatments.forEach(treatment => {
        const chemIndex = parseInt(treatment.chemicalId.replace('chem', '')) - 1;
        if (chemicalIds[chemIndex]) {
          treatment.chemicalId = chemicalIds[chemIndex];
        }
      });
    });

    sampleMarkets.forEach(market => {
      market.chemicals.forEach(chemical => {
        const chemIndex = parseInt(chemical.chemicalId.replace('chem', '')) - 1;
        if (chemicalIds[chemIndex]) {
          chemical.chemicalId = chemicalIds[chemIndex];
        }
      });
    });

    // Seed diseases
    console.log('🦠 Seeding diseases...');
    for (const disease of sampleDiseases) {
      const id = await diseaseDB.create(disease);
      if (id) {
        console.log(`✅ Created disease: ${disease.name.en}`);
      }
    }

    // Seed markets
    console.log('🏪 Seeding markets...');
    for (const market of sampleMarkets) {
      const id = await marketDB.create(market);
      if (id) {
        console.log(`✅ Created market: ${market.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${sampleDiseaseCategories.length} disease categories`);
    console.log(`   - ${sampleChemicals.length} chemicals`);
    console.log(`   - ${sampleDiseases.length} diseases`);
    console.log(`   - ${sampleMarkets.length} markets`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding - always execute when this file is run
console.log('🚀 Running seed script...');

// Add some sample comments for testing
const sampleComments = [
  {
    userId: 'user-123',
    userName: 'Ahmed Hassan',
    userEmail: 'ahmed.hassan@example.com',
    subject: 'Question about Late Blight Treatment',
    message: 'I noticed dark spots on my potato leaves in Robe Town. Could this be late blight? What treatment do you recommend?',
    category: 'question',
    relatedId: null,
    status: 'unread'
  },
  {
    userId: 'user-456',
    userName: 'Fatima Ali',
    userEmail: 'fatima.ali@example.com',
    subject: 'Coffee Disease Help',
    message: 'My coffee plants in Goba have dark spots on the berries. They are falling off early. Please help!',
    category: 'question',
    relatedId: null,
    status: 'unread'
  },
  {
    userId: 'user-789',
    userName: 'Mohammed Ibrahim',
    userEmail: 'mohammed.ibrahim@example.com',
    subject: 'Chemical Availability',
    message: 'Where can I find Ridomil Gold MZ in Sinana? The local shops don\'t have it.',
    category: 'general',
    relatedId: null,
    status: 'read',
    reply: 'Thank you for your question. You can find Ridomil Gold MZ at Sinana AgriSupply. Please check our Markets section for more details.',
    repliedBy: 'Admin',
    repliedAt: '2026-01-26T10:00:00Z',
    readAt: '2026-01-26T09:00:00Z'
  },
  {
    userId: 'user-101',
    userName: 'Meron Tadesse',
    userEmail: 'meron.tadesse@example.com',
    subject: 'Crop Disease in Ginir',
    message: 'I have some unusual symptoms on my barley crop in Ginir. Can someone help identify the disease?',
    category: 'question',
    relatedId: null,
    status: 'unread'
  }
];

async function seedComments() {
  console.log('💬 Seeding sample comments...');
  for (const comment of sampleComments) {
    const id = await commentDB.create(comment);
    if (id) {
      console.log(`✅ Created comment from: ${comment.userName}`);
    }
  }
}

seedDatabase().then(async () => {
  await seedComments();
  console.log('✅ Seeding completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

export { seedDatabase };