import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Search, Plus, AlertCircle, Package, ArrowRight, Pill } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FORM_TYPES } from '../constants';
import clsx from 'clsx';

const MedicationList = () => {
  const { medications } = useMedication();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || med.type === filterType;
    return matchesSearch && matchesType;
  });

  const lowStockCount = medications.filter(m => m.inventory < 5).length;

  return (
    <div className="flex flex-col h-screen pb-24 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 pt-8 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Mis Medicamentos</h2>
            <Link to="/add" className="flex items-center justify-center size-10 rounded-full bg-primary text-background-dark hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                <Plus size={24} />
            </Link>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar medicamento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-light dark:bg-surface-dark border-none text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 outline-none shadow-sm"
            />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            <button 
                onClick={() => setFilterType('Todos')}
                className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                    filterType === 'Todos' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-gray-400"
                )}
            >
                Todos
            </button>
            {FORM_TYPES.map(f => (
                <button 
                    key={f.type}
                    onClick={() => setFilterType(f.type)}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                        filterType === f.type ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-gray-400"
                    )}
                >
                    {f.type}s
                </button>
            ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Alerts */}
        {lowStockCount > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 flex items-start gap-3">
                <AlertCircle className="text-orange-500 shrink-0" size={20} />
                <div>
                    <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400">Stock bajo detectado</h3>
                    <p className="text-xs text-orange-600 dark:text-orange-500/80 mt-0.5">Tienes {lowStockCount} medicamentos que se están agotando.</p>
                </div>
            </div>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
            {filteredMeds.length === 0 ? (
                <div className="text-center py-10">
                    <div className="inline-flex justify-center items-center size-16 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
                        <Package size={32} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-medium">No se encontraron medicamentos</p>
                </div>
            ) : (
                filteredMeds.map(med => (
                    <div 
                        key={med.id}
                        onClick={() => navigate(`/meds/${med.id}`, { state: { from: '/meds' } })}
                        className="group bg-white dark:bg-surface-card p-4 rounded-xl border border-transparent dark:border-white/5 shadow-sm active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                                    <Pill size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{med.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{med.dosage}{med.unit} • {med.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={clsx(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mb-1",
                                    med.inventory < 5 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                )}>
                                    <Package size={10} />
                                    <span>{med.inventory}</span>
                                </div>
                                <p className="text-xs text-gray-400">{med.times.length} dosis/día</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default MedicationList;