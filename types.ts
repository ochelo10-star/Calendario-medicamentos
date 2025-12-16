export type DosageUnit = 'mg' | 'ml' | 'g' | 'pastilla';
export type FormType = 'Pastilla' | 'Líquido' | 'Inyección' | 'Inhalador';

export interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
  token?: string;
}

export interface CalendarPreferences {
  enabled: boolean;
  calendarId: string;
  autoSync: boolean;
  reminders: boolean;
  reminderMethod: 'popup' | 'email';
  reminderMinutes: number;
}

export interface UserSettings {
  patientName: string;
  googleAccount?: GoogleAccount;
  calendarPreferences: CalendarPreferences;
  notificationsEnabled: boolean;
  sound: string;
  reminderMinutes: number; // Local app notifications
  theme: 'system' | 'light' | 'dark';
  defaultUnit: string;
  lastSync?: number; // Timestamp
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