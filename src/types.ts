export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  shelfNo: string; // Format: [Zone]-[Number] e.g., "A-1"
  quantity: number;
  minStock: number;
  unit: string;
  price: number;
  expiryDate: string; // YYYY-MM-DD
  storageTemp: string; // "Room Temp", "Refrigerated (2-8°C)", "Cool Place (<15°C)"
  batchNumber: string;
  notes: string;
}

export interface AIRecommendation {
  name: string;
  genericName: string;
  category: string;
  suggestedShelf: string; // e.g., "A-1"
  suggestedMinStock: number;
  unit: string;
  price: number;
  storageTemp: string;
  notes?: string;
  explanation: string;
}

export type AlertType = 'expired' | 'critical_low' | 'expiring_soon' | 'low_stock';

export interface MedicineAlert {
  id: string;
  medicine: Medicine;
  type: AlertType;
  message: string;
}
