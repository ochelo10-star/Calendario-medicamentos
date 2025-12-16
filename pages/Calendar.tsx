import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { ChevronLeft, ChevronRight, RefreshCw, Pill, Calendar as CalendarIcon, Activity, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Calendar = () => {
  const { medications, logs, logDose } = useMedication();
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // Generate calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Daily List Logic
  const todayKey = currentDate.toISOString().split('T')[0];
  const selectedDateLabel = currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  const dailyMeds = medications.flatMap(med => 
    med.times.map(time => ({
      medId: med.id,
      name: med.name,
      dosage: `${med.dosage}${med.unit}`,
      time,
      type: med.type,
      instructions: med.instructions
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  const getLogStatus = (medId: string, time: string) => {
    return logs.find(l => l.medicationId === medId && l.scheduledTime === time && l.dateKey === todayKey)?.status === 'taken';
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const setDay = (day: number) => {
    setCurrentDate(new Date(year, month, day));
  };

  return (
    <div className="flex flex-col h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-background-light dark:bg-background-dark z-10">
        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Calendario</h2>
        <button className="flex items-center justify-center p-2 rounded-full bg-surface-light dark:bg-surface-dark/50 text-primary hover:bg-surface-dark transition-colors border border-gray-200 dark:border-white/5">
          <RefreshCw size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Calendar Widget */}
        <div className="px-4 mb-2">
          <div className="flex flex-col rounded-2xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-white/5">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4 px-2">
              <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-primary transition-colors">
                <ChevronLeft size={24} />
              </button>
              <p className="text-base font-bold text-slate-900 dark:text-white capitalize">{capitalizedMonth} {year}</p>
              <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-primary transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                <span key={d} className="text-center text-xs font-bold text-slate-400 uppercase">{d}</span>
              ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 gap-y-2">
              {paddingArray.map(i => <div key={`pad-${i}`} className="aspect-square"></div>)}
              
              {daysArray.map(day => {
                const isSelected = day === currentDate.getDate();
                const isToday = new Date().getDate() === day && new Date().getMonth() === month;
                
                return (
                  <button 
                    key={day} 
                    onClick={() => setDay(day)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center aspect-square text-sm rounded-full transition-all",
                      isSelected ? "font-bold text-background-dark" : "text-slate-500 dark:text-slate-400 font-medium hover:bg-white/5"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-1 bg-primary rounded-full shadow-[0_0_15px_rgba(25,230,94,0.4)] -z-10"></div>
                    )}
                    {day}
                    {/* Tiny dot for events (mock logic) */}
                    {day % 3 === 0 && !isSelected && (
                         <span className="w-1 h-1 bg-primary/50 rounded-full absolute bottom-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily List */}
        <div className="flex items-center justify-between px-6 mt-6 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Para hoy, {selectedDateLabel}</h3>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{dailyMeds.length} Medicaciones</span>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-8">
            {dailyMeds.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay medicación programada.</p>
            )}
            {dailyMeds.map((item, idx) => {
                const taken = getLogStatus(item.medId, item.time);
                return (
                    <div 
                        key={`${item.medId}-${item.time}`} 
                        onClick={() => navigate(`/meds/${item.medId}`, { state: { from: '/calendar' } })}
                        className={clsx(
                        "group relative flex items-center justify-between bg-white dark:bg-surface-card p-4 rounded-xl border border-transparent dark:border-white/5 shadow-sm transition-all cursor-pointer",
                        taken && "opacity-60"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "flex items-center justify-center h-12 w-12 rounded-lg",
                                taken ? "bg-green-900/40 text-primary" : "bg-slate-100 dark:bg-surface-dark text-slate-400"
                            )}>
                                <Pill size={24} />
                            </div>
                            <div className="flex flex-col">
                                <p className={clsx("text-slate-900 dark:text-white text-base font-bold leading-tight", taken && "line-through decoration-slate-500")}>
                                    {item.name} ({item.dosage})
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Activity size={14} className={taken ? "text-primary" : "text-slate-500"} />
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.time}</p>
                                    {item.instructions && (
                                        <>
                                            <span className="size-1 bg-slate-500 rounded-full"></span>
                                            <span className="text-xs text-slate-500 italic">{item.instructions}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                logDose(item.medId, item.time, taken ? 'skipped' : 'taken');
                            }}
                            className={clsx(
                                "flex items-center justify-center size-8 rounded-full border-2 transition-all",
                                taken ? "bg-primary border-primary" : "border-slate-600 hover:border-primary"
                            )}
                        >
                            <Check size={16} className={clsx("text-black transition-opacity", taken ? "opacity-100" : "opacity-0")} />
                        </button>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
};

export default Calendar;