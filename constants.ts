import { FormType, UserSettings } from './types';

export const FORM_TYPES: { type: FormType; icon: string }[] = [
  { type: 'Pastilla', icon: 'pill' },
  { type: 'Líquido', icon: 'droplet' },
  { type: 'Inyección', icon: 'syringe' },
  { type: 'Inhalador', icon: 'wind' },
];

export const MOCK_USER = {
  name: "Carlos", // Fallback only
  avatar: "https://picsum.photos/200",
  status: "Todo al día"
};

export const DEFAULT_SETTINGS: UserSettings = {
  patientName: 'Carlos',
  googleAccount: undefined,
  calendarPreferences: {
      enabled: false,
      calendarId: 'primary',
      autoSync: true,
      reminders: true,
      reminderMethod: 'popup',
      reminderMinutes: 10
  },
  notificationsEnabled: true,
  sound: 'Campana',
  reminderMinutes: 15,
  theme: 'system',
  defaultUnit: 'mg',
  lastSync: undefined
};

export const INITIAL_MEDICATIONS = [
  {
    id: '1',
    name: 'Ibuprofeno',
    dosage: 400,
    unit: 'mg',
    type: 'Pastilla',
    inventory: 12,
    times: ['14:00', '20:00'],
    instructions: 'Con comida',
    notes: 'Para el dolor de cabeza'
  },
  {
    id: '2',
    name: 'Omeprazol',
    dosage: 20,
    unit: 'mg',
    type: 'Pastilla',
    inventory: 5,
    times: ['08:00'],
    instructions: 'Ayunas'
  },
  {
    id: '3',
    name: 'Vitamina D',
    dosage: 1,
    unit: 'pastilla',
    type: 'Pastilla',
    inventory: 30,
    times: ['09:00'],
    instructions: 'Con desayuno'
  }
];