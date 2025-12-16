import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMedication, getDateKey } from '../context/MedicationContext';
import { ChevronLeft, Pill, Check, Clock, Calendar, RefreshCw, Trash2, ArchiveRestore } from 'lucide-react';
import clsx from 'clsx';

const MedicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { medications, deleteMedication, logs, logDose } = useMedication();
  
  const med = medications.find(m => m.id === id);

  // If accessed directly, default to list
  const backPath = location.state?.from || '/meds';

  if (!med) {
    return <div className="p-10 text-center text-white">Medicamento no encontrado</div>;
  }

  const handleDelete = () => {
      if(confirm('¿Eliminar este medicamento?')) {
          deleteMedication(med.id);
          // Always go to inventory list after delete, as it is a management action
          navigate('/meds');
      }
  }

  // Calculate history for this med
  const medLogs = logs.filter(l => l.medicationId === med.id).sort((a,b) => b.timestamp - a.timestamp);

  const handleTakeNextDose = () => {
      const today = new Date();
      const todayKey = getDateKey(today);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Find the first dose of today that hasn't been taken
      // Simple logic: find first time slot not in logs for today
      // Or if all are taken, maybe don't allow? Or just log the next one in sequence even if passed?
      
      const sortedTimes = [...med.times].sort();
      
      // Find first one not taken
      const nextTime = sortedTimes.find(time => {
          return !logs.find(l => 
              l.medicationId === med.id && 
              l.dateKey === todayKey && 
              l.scheduledTime === time && 
              l.status === 'taken'
          );
      });

      if (nextTime) {
          logDose(med.id, nextTime, 'taken', today);
          alert(`Dosis de las ${nextTime} marcada como tomada.`);
      } else {
          alert('Ya has registrado todas las dosis de hoy para este medicamento.');
      }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-10 flex flex-col">
       {/* Top Bar */}
       <div className="flex items-center px-4 py-3 justify-between sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
         <button 
            onClick={() => navigate(backPath)} 
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
         >
            <ChevronLeft size={24} />
         </button>
         <h2 className="text-lg font-bold">Detalle</h2>
         <button 
            onClick={() => navigate(`/edit/${med.id}`)}
            className="flex items-center justify-center h-10 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
         >
            <p className="text-primary font-bold">Editar</p>
         </button>
       </div>

       <div className="flex-1 overflow-y-auto">
            {/* Header Info */}
            <div className="flex flex-col items-center pt-4 pb-6 px-4">
                <div className="relative mb-6">
                    <div className="size-32 rounded-full p-1 border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <div className="size-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-xl">
                             <Pill size={48} className="text-slate-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-surface-light dark:bg-surface-dark p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                        <Pill size={20} className="text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">{med.name}</h1>
                <p className="text-slate-500 dark:text-gray-400 font-medium">{med.dosage}{med.unit} • {med.type}</p>
            </div>

            {/* Actions */}
            <div className="px-4 mb-8">
                <div className="flex gap-3">
                    <button 
                        onClick={handleTakeNextDose}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-[#112116]"
                    >
                        <Check size={20} strokeWidth={3} />
                        <span className="text-sm font-bold tracking-wide">Marcar Tomado</span>
                    </button>
                    <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <ArchiveRestore size={20} />
                        <span className="text-sm font-bold tracking-wide">Posponer</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 mb-8">
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/5">
                    <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-white/5">
                        <div className="p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={20} />
                                <span className="text-xs font-bold uppercase opacity-80">Frecuencia</span>
                            </div>
                            <p className="text-sm font-semibold">Cada {24 / med.times.length} horas</p>
                        </div>
                        <div className="p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <ArchiveRestore size={20} />
                                <span className="text-xs font-bold uppercase opacity-80">Inventario</span>
                            </div>
                            <p className={clsx("text-sm font-semibold", med.inventory < 5 ? "text-red-500" : "")}>{med.inventory} {med.unit}s</p>
                        </div>
                        <div className="p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Calendar size={20} />
                                <span className="text-xs font-bold uppercase opacity-80">Próxima</span>
                            </div>
                            <p className="text-sm font-semibold">{med.times[0]}</p>
                        </div>
                        <div className="p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <RefreshCw size={20} />
                                <span className="text-xs font-bold uppercase opacity-80">Sync</span>
                            </div>
                            <p className="text-sm font-semibold">Google Calendar</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center justify-between px-6">
                    <h3 className="text-lg font-bold">Historial Reciente</h3>
                    <button className="text-xs font-bold text-primary uppercase">Ver todo</button>
                </div>
                <div className="px-4 flex flex-col gap-3">
                    {medLogs.length > 0 ? medLogs.slice(0, 3).map(log => (
                         <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={clsx("size-10 rounded-full flex items-center justify-center", log.status === 'taken' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500")}>
                                    <Check size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{log.status === 'taken' ? 'Tomada' : 'Saltada'}</span>
                                    <span className="text-xs text-slate-500">{log.scheduledTime} • {log.dateKey}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                {log.status === 'taken' ? 'A tiempo' : 'Omitida'}
                            </span>
                        </div>
                    )) : (
                        <p className="text-center text-sm text-gray-500 py-4">Sin historial reciente</p>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="px-4 mb-6">
                <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={20} />
                    <span className="text-sm font-bold">Eliminar Medicamento</span>
                </button>
            </div>
       </div>
    </div>
  );
};

export default MedicationDetail;