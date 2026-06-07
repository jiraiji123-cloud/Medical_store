import { Medicine } from '../types';

// Helper to construct dynamic date offset from today for realistic simulations
const getDateOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_MEDICINES: Medicine[] = [
  // ZONE A: Analgesics / Pain Relief (Shelves A-1 to A-4)
  {
    id: "med-1",
    name: "Tylenol Extra Strength",
    genericName: "Acetaminophen 500mg",
    category: "Pain Relief",
    shelfNo: "A-1",
    quantity: 120,
    minStock: 30,
    unit: "Tablets",
    price: 8.99,
    expiryDate: getDateOffset(450), // Expiring far in future
    storageTemp: "Room Temp",
    batchNumber: "TY88219",
    notes: "Take 1-2 tablets every 6 hours as needed. Max 8 tablets in 24 hours."
  },
  {
    id: "med-2",
    name: "Advil Liqui-Gels",
    genericName: "Ibuprofen 200mg",
    category: "Pain Relief",
    shelfNo: "A-2",
    quantity: 12, // LOW STOCK!
    minStock: 25,
    unit: "Capsules",
    price: 11.49,
    expiryDate: getDateOffset(180),
    storageTemp: "Room Temp",
    batchNumber: "ADV4401",
    notes: "Do not exceed 6 capsules in 24 hours unless directed by doctor."
  },
  {
    id: "med-3",
    name: "Bufferin Aspirin",
    genericName: "Aspirin 325mg buffered",
    category: "Pain Relief",
    shelfNo: "A-1",
    quantity: 45,
    minStock: 15,
    unit: "Tablets",
    price: 5.99,
    expiryDate: getDateOffset(-12), // EXPIRED 12 days ago!
    storageTemp: "Room Temp",
    batchNumber: "BUF9921",
    notes: "Buffered formula to prevent stomach irritation."
  },

  // ZONE B: Antibiotics / Infections (Shelves B-1 to B-4)
  {
    id: "med-4",
    name: "Amoxil Susp",
    genericName: "Amoxicillin 250mg/5ml",
    category: "Antibiotics",
    shelfNo: "B-1",
    quantity: 4, // CRITICAL LOW
    minStock: 10,
    unit: "Liquid (ml)",
    price: 18.50,
    expiryDate: getDateOffset(20), // EXPIRING SOON in 20 days!
    storageTemp: "Cool Place (<15°C)",
    batchNumber: "AMX501",
    notes: "Keep reconstituted suspension refrigerated. Discard unused portion after 14 days."
  },
  {
    id: "med-5",
    name: "Zithromax Z-Pak",
    genericName: "Azithromycin 250mg",
    category: "Antibiotics",
    shelfNo: "B-2",
    quantity: 35,
    minStock: 10,
    unit: "Tablets",
    price: 38.00,
    expiryDate: getDateOffset(290),
    storageTemp: "Room Temp",
    batchNumber: "ZPK1049",
    notes: "Strong antibiotic. Standard 5-day therapy pack."
  },

  // ZONE C: Respiratory & Allergies (Shelves C-1 to C-4)
  {
    id: "med-6",
    name: "Claritin 24hr",
    genericName: "Loratadine 10mg",
    category: "Respiratory",
    shelfNo: "C-1",
    quantity: 80,
    minStock: 20,
    unit: "Tablets",
    price: 19.99,
    expiryDate: getDateOffset(40), // Ok but upcoming
    storageTemp: "Room Temp",
    batchNumber: "CLA0021",
    notes: "Non-drowsy 24 hour allergy relief. One tablet daily."
  },
  {
    id: "med-7",
    name: "Ventolin HFA",
    genericName: "Albuterol Sulfate",
    category: "Respiratory",
    shelfNo: "C-3",
    quantity: 28,
    minStock: 8,
    unit: "Inhaler",
    price: 24.50,
    expiryDate: getDateOffset(15), // EXPIRING SOON in 15 days!
    storageTemp: "Room Temp",
    batchNumber: "VEN882",
    notes: "Keep mouthpiece cap clean. Instant rescue inhaler for asthma."
  },

  // ZONE D: Gastrointestinal (Shelves D-1 to D-4)
  {
    id: "med-8",
    name: "Prilosec OTC",
    genericName: "Omeprazole 20mg",
    category: "Gastrointestinal",
    shelfNo: "D-1",
    quantity: 90,
    minStock: 25,
    unit: "Tablets",
    price: 15.20,
    expiryDate: getDateOffset(540),
    storageTemp: "Room Temp",
    batchNumber: "PRX203",
    notes: "Acid reducer. Take on an empty stomach in the morning."
  },
  {
    id: "med-9",
    name: "Pepto-Bismol",
    genericName: "Bismuth Subsalicylate",
    category: "Gastrointestinal",
    shelfNo: "D-3",
    quantity: 18,
    minStock: 15,
    unit: "Liquid (ml)",
    price: 7.45,
    expiryDate: getDateOffset(-2), // EXPIRED 2 days ago!
    storageTemp: "Room Temp",
    batchNumber: "PEP92",
    notes: "Shake well before use. Relief for multiple stomach symptoms."
  },

  // ZONE E: Cardiac & Chronic conditions (Shelves E-1 to E-4)
  {
    id: "med-10",
    name: "Lipitor",
    genericName: "Atorvastatin Calcium 10mg",
    category: "Cardiac & Diabetes",
    shelfNo: "E-1",
    quantity: 140,
    minStock: 40,
    unit: "Tablets",
    price: 42.00,
    expiryDate: getDateOffset(380),
    storageTemp: "Room Temp",
    batchNumber: "LIP110",
    notes: "Cholesterol reduction agent. Administer once daily."
  },
  {
    id: "med-11",
    name: "Glucophage",
    genericName: "Metformin HCl 500mg",
    category: "Cardiac & Diabetes",
    shelfNo: "E-2",
    quantity: 200,
    minStock: 50,
    unit: "Tablets",
    price: 12.00,
    expiryDate: getDateOffset(600),
    storageTemp: "Room Temp",
    batchNumber: "GLU3029",
    notes: "Antidiabetic therapy for Type-2 Diabetes. Administer with meals."
  },

  // ZONE F: Dermatological & Topical (Shelves F-1 to F-4)
  {
    id: "med-12",
    name: "Cortizone-10 Cream",
    genericName: "Hydrocortisone 1%",
    category: "Dermatological",
    shelfNo: "F-1",
    quantity: 5, // LOW STOCK!
    minStock: 12,
    unit: "Cream (g)",
    price: 6.50,
    expiryDate: getDateOffset(120),
    storageTemp: "Room Temp",
    batchNumber: "CORT401",
    notes: "Anti-itch topical cream. External use only."
  },

  // ZONE R: Cold Chain (Biologicals & Refrigerated) (Shelves R-1 to R-2)
  {
    id: "med-13",
    name: "Lantus SoloStar",
    genericName: "Insulin Glargine 100 U/ml",
    category: "Cold Chain / Biologicals",
    shelfNo: "R-1",
    quantity: 15,
    minStock: 5,
    unit: "Injection",
    price: 95.00,
    expiryDate: getDateOffset(24), // EXPIRING SOON in 24 days!
    storageTemp: "Refrigerated (2-8°C)",
    batchNumber: "LNT8819",
    notes: "Keep refrigerated. Do not freeze. Once opened, can keep at room temp up to 28 days."
  },

  // ZONE S: Specials / Over-The-Counter (Shelves S-1 to S-4)
  {
    id: "med-14",
    name: "Centrum Men Multivitamin",
    genericName: "Multivitamin & Mineral Formula",
    category: "Vitamins & Supplements",
    shelfNo: "S-1",
    quantity: 50,
    minStock: 10,
    unit: "Tablets",
    price: 13.99,
    expiryDate: getDateOffset(300),
    storageTemp: "Room Temp",
    batchNumber: "CEN0193",
    notes: "Daily general wellness support tablet."
  }
];
