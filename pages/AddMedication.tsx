import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedication } from '../context/MedicationContext';
import { X, QrCode, ChevronDown, PlusCircle, Calendar as CalIcon, Bell, Info, Trash2 } from 'lucide-react';
import { FORM_TYPES } from '../constants';
import { FormType, DosageUnit } from '../types';
import clsx from 'clsx';

const AddMedication = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addMedication, updateMedication, medications } = useMedication();

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<DosageUnit>('mg');
  const [type, setType] = useState<FormType>('Pastilla');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [inventory, setInventory] = useState('10');
  const [notes, setNotes] = useState('');
  
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
        const med = medications.find(m => m.id === id);
        if (med) {
            setName(med.name);
            setDose(med.dosage.toString());
            setUnit(med.unit);
            setType(med.type);
            setTimes(med.times);
            setInventory(med.inventory.toString());
            setNotes(med.notes || '');
        }
    }
  }, [id, isEditing, medications]);

  const handleSave = () => {
    if (!name || !dose) return; // Simple validation
    
    const medData = {
      name,
      dosage: Number(dose),
      unit,
      type,
      inventory: Number(inventory),
      times: times.sort(),
      notes,
      instructions: 'Según indicación'
    };

    if (isEditing && id) {
        updateMedication(id, medData);
    } else {
        addMedication(medData);
    }
    navigate(-1);
  };

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
        setTimes(times.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index] = val;
    setTimes(newTimes);
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-2 shrink-0">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <X size={28} className="text-slate-900 dark:text-white" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEditing ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h2>
        <button onClick={handleSave} className="px-2 py-1">
          <p className="text-primary text-base font-bold">Guardar</p>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-10 px-4">
        {/* Name */}
        <div className="py-4">
          <label className="flex flex-col w-full gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Nombre del medicamento</span>
            <div className="flex w-full items-center rounded-xl overflow-hidden shadow-sm bg-white dark:bg-surface-dark border border-transparent focus-within:ring-2 focus-within:ring-primary/50">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-white h-14 px-4 outline-none placeholder:text-slate-400"
                placeholder="Ej. Ibuprofeno" 
              />
              <button className="pr-4 pl-2 text-primary">
                <QrCode size={24} />
              </button>
            </div>
          </label>
        </div>

        {/* Dosage */}
        <div className="flex gap-3 pb-4">
          <label className="flex flex-col flex-[2] gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Dosis</span>
            <input 
              type="number"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="w-full rounded-xl border-none bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-14 px-4 shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="500" 
            />
          </label>
          <label className="flex flex-col flex-1 gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Unidad</span>
            <div className="relative">
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value as DosageUnit)}
                className="w-full rounded-xl border-none bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-14 pl-4 pr-8 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="pastilla">pastilla</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={20} />
            </div>
          </label>
        </div>

        {/* Inventory */}
        <div className="pb-4">
            <label className="flex flex-col w-full gap-2">
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Inventario actual</span>
                <input 
                type="number"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full rounded-xl border-none bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-14 px-4 shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Cantidad restante" 
                />
            </label>
        </div>

        {/* Type Chips */}
        <div className="pt-2 pb-4">
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Forma farmacéutica</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {FORM_TYPES.map((f) => {
               const isActive = type === f.type;
               return (
                 <button 
                   key={f.type}
                   onClick={() => setType(f.type)}
                   className={clsx(
                     "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 transition-all border",
                     isActive 
                       ? "border-primary bg-primary/20 text-primary" 
                       : "border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                   )}
                 >
                   <span className="text-sm font-semibold">{f.type}</span>
                 </button>
               )
            })}
          </div>
        </div>

        {/* Frequency */}
        <div className="pt-2">
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Frecuencia y Horarios</h3>
          <div className="rounded-xl bg-white dark:bg-surface-dark p-1 flex shadow-sm mb-4">
            <button className="flex-1 rounded-lg bg-primary text-black py-2 text-sm font-bold shadow-sm">Diaria</button>
            <button className="flex-1 rounded-lg text-slate-500 dark:text-gray-400 py-2 text-sm font-medium">Intervalo</button>
            <button className="flex-1 rounded-lg text-slate-500 dark:text-gray-400 py-2 text-sm font-medium">Necesidad</button>
          </div>

          <div className="flex flex-col gap-2 pb-6">
            {times.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-surface-dark p-4 shadow-sm group">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white">
                            <Bell size={20} />
                        </div>
                        <input 
                            type="time" 
                            value={t} 
                            onChange={(e) => updateTime(idx, e.target.value)}
                            className="bg-transparent text-xl font-bold text-slate-900 dark:text-white outline-none"
                        />
                    </div>
                    {/* Remove button */}
                    {times.length > 1 ? (
                        <button onClick={() => removeTimeSlot(idx)} className="text-gray-400 hover:text-red-500">
                             <Trash2 size={20} />
                        </button>
                    ) : (
                        <div className="relative inline-block w-12 h-6 rounded-full bg-primary cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 bg-white size-5 rounded-full shadow-sm"></div>
                        </div>
                    )}
                </div>
            ))}
            
            <button onClick={addTimeSlot} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 p-4 text-slate-500 hover:text-primary transition-colors">
                <PlusCircle size={20} />
                <span className="font-medium">Agregar horario</span>
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-2 pb-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Configuración</h3>
            <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-surface-dark overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <CalIcon size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Google Calendar</p>
                            <p className="text-xs text-slate-500">Sincronizar eventos</p>
                        </div>
                    </div>
                    {/* Toggle off */}
                    <div className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 relative">
                        <div className="absolute left-0.5 top-0.5 bg-white size-5 rounded-full shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Notes */}
        <div className="pb-8">
             <label className="flex flex-col w-full gap-2">
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Notas adicionales</span>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-[100px] rounded-xl border-none bg-white dark:bg-surface-dark text-slate-900 dark:text-white p-4 shadow-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                    placeholder="Ej. Tomar con alimentos..."
                ></textarea>
            </label>
        </div>

      </main>
    </div>
  );
};

export default AddMedication;