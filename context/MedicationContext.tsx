import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medication, MedicationLog, UserSettings } from '../types';
import { INITIAL_MEDICATIONS, DEFAULT_SETTINGS } from '../constants';

interface MedicationContextType {
  medications: Medication[];
  logs: MedicationLog[];
  settings: UserSettings;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped') => void;
  getDailyProgress: (date: Date) => number;
  getMedicationLogsForDate: (medId: string, date: Date) => MedicationLog | undefined;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
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

  const logDose = (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped') => {
    const dateKey = new Date().toISOString().split('T')[0];
    const newLog: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId,
      timestamp: Date.now(),
      status,
      scheduledTime,
      dateKey
    };
    
    // Check if already logged for this specific slot today
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
  };

  const getDailyProgress = (date: Date): number => {
    const dateKey = date.toISOString().split('T')[0];
    let totalDoses = 0;
    
    medications.forEach(med => {
      totalDoses += med.times.length;
    });

    if (totalDoses === 0) return 0;

    const takenToday = logs.filter(l => l.dateKey === dateKey && l.status === 'taken').length;
    return Math.round((takenToday / totalDoses) * 100);
  };

  const getMedicationLogsForDate = (medId: string, date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
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
      updateSettings
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