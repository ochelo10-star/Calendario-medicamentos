import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medication, MedicationLog, UserSettings, GoogleAccount } from '../types';
import { INITIAL_MEDICATIONS, DEFAULT_SETTINGS } from '../constants';

// Helper to generate consistent local YYYY-MM-DD keys
export const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface MedicationContextType {
  medications: Medication[];
  logs: MedicationLog[];
  settings: UserSettings;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped', date?: Date) => void;
  getDailyProgress: (date: Date) => number;
  getMedicationLogsForDate: (medId: string, date: Date) => MedicationLog | undefined;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  loginGoogle: (selectedAccount: GoogleAccount) => Promise<void>;
  logoutGoogle: () => void;
  syncWithCalendar: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider = ({ children }: { children?: ReactNode }) => {
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [logs, setLogs] = useState<MedicationLog[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply Theme Logic
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    } else {
      root.classList.add(settings.theme);
    }

  }, [settings]);

  // Actions
  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed = { ...med, id: crypto.randomUUID() };
    setMedications(prev => [...prev, newMed]);
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Google Login Logic
  const loginGoogle = async (selectedAccount: GoogleAccount) => {
      // Simulate API delay
      return new Promise<void>((resolve) => {
          setTimeout(() => {
              setSettings(prev => ({
                  ...prev,
                  googleAccount: selectedAccount,
                  calendarPreferences: {
                      ...prev.calendarPreferences,
                      enabled: true
                  }
              }));
              resolve();
          }, 1500);
      });
  };

  const logoutGoogle = () => {
      setSettings(prev => ({
          ...prev,
          googleAccount: undefined,
          lastSync: undefined,
          calendarPreferences: {
              ...prev.calendarPreferences,
              enabled: false
          }
      }));
  };

  const syncWithCalendar = async () => {
    if (!settings.googleAccount) return;
    
    // Simulation of a full sync process with network logs
    console.group('🔄 Google Calendar Sync Process');
    console.log(`%cAuthenticating as: ${settings.googleAccount.email}`, 'color: #4285F4; font-weight: bold;');
    console.log(`%cTarget Calendar: ${settings.calendarPreferences.calendarId}`, 'color: #34A853;');
    
    const overrides = settings.calendarPreferences.reminders ? {
        useDefault: false,
        overrides: [
            { method: settings.calendarPreferences.reminderMethod, minutes: settings.calendarPreferences.reminderMinutes }
        ]
    } : { useDefault: true };

    // Simulate batch request
    console.log('Sending Batch Request to https://www.googleapis.com/batch/calendar/v3...');
    
    medications.forEach(med => {
        med.times.forEach(time => {
             console.log(`%c[POST] Event: ${med.name} @ ${time}`, 'color: #FBBC05', {
                 summary: `Toma: ${med.name} ${med.dosage}${med.unit}`,
                 reminders: overrides,
                 start: { dateTime: `T${time}:00` }
             });
        });
    });

    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    
    console.log('%cSync Complete. 200 OK', 'color: #34A853; font-weight: bold;');
    console.groupEnd();

    setSettings(prev => ({
        ...prev,
        lastSync: Date.now()
    }));
  };

  const logDose = (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped', date?: Date) => {
    const targetDate = date || new Date();
    const dateKey = getDateKey(targetDate);

    const newLog: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId,
      timestamp: Date.now(),
      status,
      scheduledTime,
      dateKey
    };
    
    // Check if already logged for this specific slot on the specific date
    const exists = logs.find(l => 
      l.medicationId === medicationId && 
      l.dateKey === dateKey && 
      l.scheduledTime === scheduledTime
    );

    // Inventory Logic
    let shouldDecrement = false;
    let shouldIncrement = false;

    if (status === 'taken') {
        if (!exists || exists.status !== 'taken') {
            shouldDecrement = true;
        }
    } else {
        if (exists && exists.status === 'taken') {
            shouldIncrement = true;
        }
    }

    if (shouldDecrement) {
        setMedications(prev => prev.map(m => m.id === medicationId ? { ...m, inventory: Math.max(0, m.inventory - 1) } : m));
    } else if (shouldIncrement) {
        setMedications(prev => prev.map(m => m.id === medicationId ? { ...m, inventory: m.inventory + 1 } : m));
    }

    if (exists) {
        setLogs(prev => prev.map(l => l.id === exists.id ? newLog : l));
    } else {
        setLogs(prev => [...prev, newLog]);
    }

    // --- Google Calendar Mock Integration ---
    if (settings.calendarPreferences.enabled && settings.googleAccount) {
        const medName = medications.find(m => m.id === medicationId)?.name || 'Medicación';
        
        console.group('📅 Google Calendar Event Update');
        console.log(`%cUser: ${settings.googleAccount.email}`, 'color: #4285F4');
        console.log(`PATCH https://www.googleapis.com/calendar/v3/calendars/${settings.calendarPreferences.calendarId}/events/...`);
        console.log(`Payload: { status: '${status}', colorId: '${status === 'taken' ? '10' : '11'}' }`);
        console.groupEnd();
        
        if (settings.calendarPreferences.reminders) {
            // Logic regarding reminders
        }
    }
  };

  const getDailyProgress = (date: Date): number => {
    const dateKey = getDateKey(date);
    let totalDoses = 0;
    
    medications.forEach(med => {
      totalDoses += med.times.length;
    });

    if (totalDoses === 0) return 0;

    const takenToday = logs.filter(l => l.dateKey === dateKey && l.status === 'taken').length;
    return Math.round((takenToday / totalDoses) * 100);
  };

  const getMedicationLogsForDate = (medId: string, date: Date) => {
    const dateKey = getDateKey(date);
    return logs.find(l => l.medicationId === medId && l.dateKey === dateKey);
  };

  return (
    <MedicationContext.Provider value={{
      medications,
      logs,
      settings,
      addMedication,
      updateMedication,
      deleteMedication,
      logDose,
      getDailyProgress,
      getMedicationLogsForDate,
      updateSettings,
      loginGoogle,
      logoutGoogle,
      syncWithCalendar
    }}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (!context) throw new Error('useMedication must be used within a MedicationProvider');
  return context;
};