export type DosageUnit = 'mg' | 'ml' | 'g' | 'pastilla';
export type FormType = 'Pastilla' | 'Líquido' | 'Inyección' | 'Inhalador';

export interface UserSettings {
  patientName: string;
  syncGoogleCalendar: boolean;
  defaultCalendar: string;
  notificationsEnabled: boolean;
  sound: string;
  reminderMinutes: number;
  theme: 'system' | 'light' | 'dark';
  defaultUnit: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: DosageUnit;
  type: FormType;
  inventory: number;
  times: string[]; // Array of "HH:MM" strings
  instructions?: string;
  notes?: string;
  color?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: number; // Date.now()
  status: 'taken' | 'skipped' | 'late';
  scheduledTime: string; // "HH:MM"
  dateKey: string; // "YYYY-MM-DD"
}

export interface DayStats {
  total: number;
  taken: number;
  percentage: number;
}