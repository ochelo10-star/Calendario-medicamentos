import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedication } from '../context/MedicationContext';
import { ArrowLeft, Calendar, Edit3, ChevronRight, Bell, Music, Clock, Moon, Droplet, HelpCircle, LogOut, User } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useMedication();
  const [showHelp, setShowHelp] = useState(false);

  const toggleCalendar = () => updateSettings({ syncGoogleCalendar: !settings.syncGoogleCalendar });
  const toggleNotifications = () => updateSettings({ notificationsEnabled: !settings.notificationsEnabled });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center px-4 py-3 justify-between">
          <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold flex-1 text-center pr-10">Configuración</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 pb-28 pt-6">
        
        {/* Profile */}
        <Section title="Perfil">
             <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 dark:border-white/5">
                 <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                     <User size={24} />
                 </div>
                 <div className="flex-1">
                     <label className="text-xs text-gray-500 uppercase font-bold">Nombre del Paciente</label>
                     <input 
                        type="text" 
                        value={settings.patientName}
                        onChange={(e) => updateSettings({ patientName: e.target.value })}
                        className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-primary transition-colors"
                     />
                 </div>
             </div>
        </Section>

        {/* Sync */}
        <Section title="Sincronización">
            <SettingItem 
                icon={Calendar} 
                iconColor="text-primary" 
                iconBg="bg-primary/20"
                label="Google Calendar"
                subLabel="Sincronizar eventos médicos"
                action={<Toggle checked={settings.syncGoogleCalendar} onChange={toggleCalendar} />}
            />
            <SettingItem 
                icon={Edit3}
                iconColor="text-gray-600 dark:text-gray-300"
                iconBg="bg-gray-100 dark:bg-white/5"
                label="Calendario por defecto"
                action={
                   <Select 
                      value={settings.defaultCalendar}
                      onChange={(val) => updateSettings({ defaultCalendar: val })}
                      options={['Personal', 'Trabajo', 'Familia']}
                   />
                }
            />
        </Section>

        {/* Notifications */}
        <Section title="Notificaciones">
            <SettingItem 
                icon={Bell} 
                iconColor="text-primary" 
                iconBg="bg-primary/20"
                label="Permitir notificaciones"
                action={<Toggle checked={settings.notificationsEnabled} onChange={toggleNotifications} />}
            />
            <SettingItem 
                icon={Music}
                iconColor="text-gray-600 dark:text-gray-300"
                iconBg="bg-gray-100 dark:bg-white/5"
                label="Sonido de alerta"
                action={
                    <Select 
                      value={settings.sound}
                      onChange={(val) => updateSettings({ sound: val })}
                      options={['Campana', 'Radar', 'Cima', 'Silencio']}
                   />
                }
            />
             <SettingItem 
                icon={Clock}
                iconColor="text-gray-600 dark:text-gray-300"
                iconBg="bg-gray-100 dark:bg-white/5"
                label="Recordatorio previo"
                action={
                    <Select 
                      value={settings.reminderMinutes.toString() + ' min'}
                      onChange={(val) => updateSettings({ reminderMinutes: parseInt(val) })}
                      options={['5 min', '10 min', '15 min', '30 min', '1 hora']}
                   />
                }
            />
        </Section>

        {/* General */}
        <Section title="General">
            <SettingItem 
                icon={Moon}
                iconColor="text-gray-600 dark:text-gray-300"
                iconBg="bg-gray-100 dark:bg-white/5"
                label="Tema"
                action={
                    <Select 
                      value={settings.theme}
                      onChange={(val) => updateSettings({ theme: val as any })}
                      options={['system', 'light', 'dark']}
                      formatLabel={(val) => val === 'system' ? 'Sistema' : val === 'light' ? 'Claro' : 'Oscuro'}
                   />
                }
            />
            <SettingItem 
                icon={Droplet}
                iconColor="text-gray-600 dark:text-gray-300"
                iconBg="bg-gray-100 dark:bg-white/5"
                label="Unidades de dosis"
                action={
                    <Select 
                      value={settings.defaultUnit}
                      onChange={(val) => updateSettings({ defaultUnit: val })}
                      options={['mg', 'ml', 'g', 'pastilla']}
                   />
                }
            />
        </Section>

        {/* Support */}
        <Section title="Soporte y Cuenta" className="mb-8">
            <div onClick={() => setShowHelp(true)}>
                <SettingItem 
                    icon={HelpCircle}
                    iconColor="text-gray-600 dark:text-gray-300"
                    iconBg="bg-gray-100 dark:bg-white/5"
                    label="Ayuda y comentarios"
                    action={<ChevronRight size={20} className="text-gray-400" />}
                />
            </div>
             <SettingItem 
                icon={LogOut}
                iconColor="text-red-500"
                iconBg="bg-red-100 dark:bg-red-900/20"
                label="Cerrar Sesión"
                labelClass="text-red-500"
                action={null}
            />
        </Section>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2 font-light">Versión 2.5.0</p>
        
        {/* Help Modal Simulation */}
        {showHelp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
                <div className="bg-white dark:bg-surface-card p-6 rounded-2xl w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-2">Ayuda</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Para soporte técnico, contáctanos en soporte@meditrack.pro.
                    </p>
                    <button onClick={() => setShowHelp(false)} className="w-full py-2 bg-primary text-background-dark font-bold rounded-xl">Entendido</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

// Helper Components
const Section = ({ title, children, className }: { title: string, children?: React.ReactNode, className?: string }) => (
    <div className={`mt-6 ${className || ''}`}>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider px-2 pb-2 ml-2">{title}</h3>
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon: Icon, iconColor, iconBg, label, subLabel, action, labelClass }: any) => (
    <div className="flex items-center gap-4 px-4 py-3.5 justify-between border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group relative">
        <div className="flex items-center gap-3">
            <div className={`${iconColor} flex items-center justify-center rounded-xl ${iconBg} shrink-0 size-10`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col">
                <p className={`text-base font-medium leading-tight ${labelClass || 'text-slate-900 dark:text-white'}`}>{label}</p>
                {subLabel && <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{subLabel}</span>}
            </div>
        </div>
        <div className="shrink-0 relative z-10">
            {action}
        </div>
    </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
        <div className={`absolute top-[2px] start-[2px] bg-white rounded-full h-5 w-5 transition-transform ${checked ? 'translate-x-full' : ''}`}></div>
    </div>
);

const Select = ({ value, onChange, options, formatLabel }: { value: string, onChange: (val: string) => void, options: string[], formatLabel?: (val: string) => string }) => (
    <div className="flex items-center gap-2 relative">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {formatLabel ? formatLabel(value) : value}
        </p>
        <ChevronRight size={20} className="text-gray-400" />
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{formatLabel ? formatLabel(opt) : opt}</option>
            ))}
        </select>
    </div>
);

export default Settings;