import React, { useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { MOCK_USER } from '../constants';
import { Bell, RefreshCw, Activity, Calendar, Check, ArrowRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Home = () => {
  const { medications, logs, getDailyProgress, logDose, settings } = useMedication();
  const navigate = useNavigate();
  const today = new Date();
  const progress = getDailyProgress(today);
  const dateString = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  // Compute timeline items
  const timelineItems = useMemo(() => {
    const items: Array<{
      medId: string;
      name: string;
      time: string;
      instructions?: string;
      status: 'taken' | 'pending' | 'late' | 'future';
      dosage: string;
    }> = [];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    medications.forEach(med => {
      med.times.forEach(time => {
        const [h, m] = time.split(':').map(Number);
        const timeMinutes = h * 60 + m;
        
        // Check log status
        const log = logs.find(l => 
          l.medicationId === med.id && 
          l.dateKey === now.toISOString().split('T')[0] && 
          l.scheduledTime === time
        );

        let status: 'taken' | 'pending' | 'late' | 'future' = 'future';

        if (log?.status === 'taken') {
          status = 'taken';
        } else {
          if (timeMinutes < currentMinutes) {
             status = 'late'; // or pending but in the past
          } else if (timeMinutes - currentMinutes <= 60) {
             status = 'pending'; // Upcoming soon
          }
        }

        items.push({
          medId: med.id,
          name: med.name,
          time,
          instructions: med.instructions,
          status,
          dosage: `${med.dosage}${med.unit}`
        });
      });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, logs]);

  // Find next immediate dose
  const nextDose = timelineItems.find(item => item.status === 'pending' || (item.status === 'future' && !item.status.includes('taken')));

  const handleQuickTake = (medId: string, time: string) => {
    logDose(medId, time, 'taken');
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary" 
              style={{ backgroundImage: `url(${MOCK_USER.avatar})` }}
            ></div>
            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-background-dark"></div>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight text-slate-900 dark:text-white">Hola, {settings.patientName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{MOCK_USER.status}</p>
          </div>
        </div>
        <button className="flex items-center justify-center rounded-full size-10 bg-surface-light dark:bg-surface-dark text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
          <Bell size={20} />
        </button>
      </header>

      <main className="flex flex-col px-4 pt-4 gap-6">
        {/* Date & Sync */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tu Medicación</h1>
            <p className="text-primary text-sm font-medium flex items-center gap-1 mt-1">
              <RefreshCw size={14} className="animate-spin-slow" />
              Sincronizado
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Hoy</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{dateString}</p>
          </div>
        </div>

        {/* Hero Card: Next Dose */}
        {nextDose ? (
          <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-lg border border-gray-100 dark:border-white/5 group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-white/10">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                  <Activity size={14} />
                  Próxima Dosis
                </span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{nextDose.time}</span>
              </div>
              <div className="flex gap-4 items-center mb-6">
                <div className="size-16 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <PillIcon className="text-primary size-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">{nextDose.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{nextDose.dosage} • {nextDose.instructions || 'Sin instrucciones'}</p>
                </div>
              </div>
              <button 
                onClick={() => handleQuickTake(nextDose.medId, nextDose.time)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-background-dark font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98]"
              >
                <Check size={20} strokeWidth={3} />
                Marcar como tomada
              </button>
            </div>
          </div>
        ) : (
             <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-lg border border-gray-100 dark:border-white/5 p-8 text-center">
                 <div className="mx-auto size-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                     <Check size={32} className="text-primary"/>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">¡Todo listo por ahora!</h3>
                 <p className="text-gray-400">No tienes dosis pendientes inmediatas.</p>
             </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
              <Activity size={24} className="text-primary bg-primary/10 p-1 rounded-lg box-content" />
              <span className="text-xs font-bold text-gray-400">DIARIO</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{progress}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cumplimiento hoy</p>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 translate-x-1/4 translate-y-1/4">
              <Calendar size={120} />
            </div>
            <div className="flex items-start justify-between relative z-10">
              <Calendar size={24} className="text-blue-400 bg-blue-400/10 p-1 rounded-lg box-content" />
              <span className="text-xs font-bold text-gray-400">PENDIENTE</span>
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {timelineItems.filter(i => i.status !== 'taken').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dosis restantes</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <div className="pt-2">
          <h3 className="text-lg font-bold px-1 text-slate-900 dark:text-white">Tu Día</h3>
        </div>

        <section className="flex flex-col gap-3 relative pb-8">
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-white/10 z-0"></div>
          
          {timelineItems.map((item, idx) => {
             const isTaken = item.status === 'taken';
             const isNext = item === nextDose;
             
             return (
                 <div key={`${item.medId}-${item.time}`} className="relative z-10 pl-14">
                    <div className={clsx(
                        "absolute left-3 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full flex items-center justify-center transition-all",
                        isTaken ? "bg-surface-light dark:bg-surface-dark p-1 border border-gray-200 dark:border-white/10 size-6" : 
                        isNext ? "bg-primary p-1 shadow-[0_0_10px_rgba(25,230,94,0.4)] size-5" : 
                        "bg-surface-light dark:bg-surface-dark p-1 border border-gray-200 dark:border-white/10 size-4"
                    )}>
                        {isTaken && <Check size={14} className="text-gray-400" />}
                        {isNext && <div className="size-full bg-background-dark rounded-full"></div>}
                        {!isTaken && !isNext && <div className="size-full bg-gray-400 rounded-full"></div>}
                    </div>

                    <div 
                        onClick={() => navigate(`/meds/${item.medId}`, { state: { from: '/' } })}
                        className={clsx(
                        "p-3 rounded-lg border flex justify-between items-center transition-all cursor-pointer",
                        isTaken ? "bg-surface-light dark:bg-surface-dark/50 border-transparent opacity-60" :
                        isNext ? "bg-surface-light dark:bg-surface-dark border-l-4 border-l-primary shadow-sm py-4" :
                        "bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-white/5"
                    )}>
                        <div className="flex items-center gap-3">
                            {isNext && (
                                <div className="bg-gray-100 dark:bg-white/5 rounded-md size-10 flex items-center justify-center shrink-0">
                                    <PillIcon className="text-primary size-5" />
                                </div>
                            )}
                            <div>
                                <p className={clsx("text-sm font-semibold", isTaken && "line-through decoration-gray-500")}>
                                    {item.name} {item.dosage}
                                </p>
                                <p className={clsx("text-xs", isNext ? "text-primary font-medium" : "text-gray-500")}>
                                    {item.time} • {item.instructions || (isNext ? 'Próxima' : 'Programada')}
                                </p>
                            </div>
                        </div>
                        
                        {isTaken ? (
                            <span className="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-white/10 px-2 py-1 rounded">Tomada</span>
                        ) : isNext ? (
                             <button onClick={(e) => { e.stopPropagation(); handleQuickTake(item.medId, item.time); }} className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-background-dark transition-colors">
                                <Check size={18} />
                             </button>
                        ) : (
                            <ArrowRight size={18} className="text-gray-400" />
                        )}
                    </div>
                 </div>
             )
          })}
        </section>
      </main>

      {/* FAB */}
      <Link to="/add" className="fixed bottom-24 right-4 z-40 bg-primary text-background-dark rounded-2xl p-4 shadow-[0_4px_12px_rgba(25,230,94,0.4)] hover:shadow-[0_6px_16px_rgba(25,230,94,0.6)] transition-all active:scale-95 flex items-center gap-2 font-bold group">
        <Plus size={24} className="group-hover:rotate-90 transition-transform" />
        <span className="sr-only">Añadir dosis</span>
      </Link>
    </div>
  );
};

// Helper component for the Pill icon to avoid repetition
const PillIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" viewBox="0 0 24 24" 
        fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" stroke="currentColor" />
    </svg>
);

export default Home;