import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedication } from '../context/MedicationContext';
import { ArrowLeft, Calendar, Edit3, ChevronRight, Bell, Music, Clock, Moon, Droplet, HelpCircle, LogOut, User, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Mail, MessageSquare, Plus, Check } from 'lucide-react';
import { GoogleAccount } from '../types';
import clsx from 'clsx';

// Simulación de cuentas que el navegador ya tiene en caché/cookies
const BROWSER_SESSIONS: GoogleAccount[] = [
    {
        name: "Juan Pérez",
        email: "juan.perez@gmail.com",
        avatar: "", 
        token: "session_token_123"
    },
    {
        name: "Familia Pérez",
        email: "casa.perez@gmail.com",
        avatar: "",
        token: "session_token_456"
    }
];

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, loginGoogle, logoutGoogle, syncWithCalendar } = useMedication();
  const [showHelp, setShowHelp] = useState(false);
  
  // Google Login State
  const [showLoginModal, setShowLoginModal] = useState(false);
  // 'chooser' = list of detected accounts
  // 'login' = enter email/password manual flow
  // 'consent' = permissions
  // 'processing' = spinner
  const [loginStep, setLoginStep] = useState<'chooser' | 'email' | 'password' | 'consent' | 'processing'>('chooser');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const toggleNotifications = () => updateSettings({ notificationsEnabled: !settings.notificationsEnabled });

  // Reset login state when modal opens
  useEffect(() => {
      if (showLoginModal) {
          setLoginStep('chooser'); // Always start with account chooser
          setEmailInput('');
          setPasswordInput('');
          setLoginError('');
          setShowPassword(false);
      }
  }, [showLoginModal]);

  const handleAccountSelect = (account: GoogleAccount) => {
      // Direct login simulation (Token exists in browser)
      setEmailInput(account.email);
      // We assume if it's in the chooser, it's authenticated in the browser context
      // so we skip password and go straight to consent/permissions
      setLoginStep('consent'); 
  };

  const handleUseAnotherAccount = () => {
      setEmailInput('');
      setLoginStep('email');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!emailInput.trim() || !emailInput.includes('@')) {
          setLoginError('Introduce una dirección de correo electrónico válida.');
          return;
      }
      setLoginError('');
      setLoginStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordInput.trim()) {
          setLoginError('Introduce una contraseña.');
          return;
      }
      setLoginError('');
      setLoginStep('consent');
  };

  const handleFinalConsent = async () => {
      setLoginStep('processing');
      
      // Look up if we selected a known browser session to get the name
      const knownAccount = BROWSER_SESSIONS.find(a => a.email === emailInput);
      
      const newAccount: GoogleAccount = {
          name: knownAccount ? knownAccount.name : (settings.patientName || 'Usuario'), 
          email: emailInput,
          avatar: '', 
          token: `mock-token-${Date.now()}`
      };

      await loginGoogle(newAccount);
      
      // Update local patient name if it's generic, to match the google account
      if (settings.patientName === 'Carlos' || settings.patientName === 'Usuario') {
          updateSettings({ patientName: newAccount.name.split(' ')[0] });
      }

      // Auto-trigger initial sync
      await syncWithCalendar();
      
      setShowLoginModal(false);
  };

  const handleManualSync = async () => {
      setIsSyncing(true);
      setSyncSuccess(false);
      await syncWithCalendar();
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
  };

  const updateCalendarPref = (key: string, value: any) => {
      updateSettings({
          calendarPreferences: {
              ...settings.calendarPreferences,
              [key]: value
          }
      });
  };

  const getLastSyncLabel = () => {
      if (!settings.lastSync) return 'Nunca';
      const date = new Date(settings.lastSync);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

        {/* Google Calendar Integration */}
        <Section title="Integraciones y Cuentas">
            {!settings.googleAccount ? (
                 <div className="p-4 flex flex-col items-center text-center">
                    <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-3">
                         <Calendar size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold mb-1">Conectar Google Calendar</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 px-4">
                        Sincroniza tus dosis automáticamente con tu calendario personal para no olvidar ninguna toma.
                    </p>
                    <button 
                        onClick={() => setShowLoginModal(true)}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-300 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <GoogleLogo className="size-5" />
                        <span>Iniciar sesión con Google</span>
                    </button>
                 </div>
            ) : (
                <>
                    {/* Account Header */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-3 mb-2">
                            {settings.googleAccount.avatar ? (
                                <img src={settings.googleAccount.avatar} alt="Avatar" className="size-10 rounded-full" />
                            ) : (
                                <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                    {settings.googleAccount.email.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold truncate text-slate-900 dark:text-white">{settings.googleAccount.name}</p>
                                <p className="text-xs text-gray-500 truncate">{settings.googleAccount.email}</p>
                            </div>
                            <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                             <button 
                                onClick={handleManualSync}
                                disabled={isSyncing}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                                    syncSuccess 
                                        ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-900/50 dark:text-green-400"
                                        : "bg-white dark:bg-surface-card border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                                )}
                             >
                                {isSyncing ? (
                                    <RefreshCw size={14} className="animate-spin" />
                                ) : syncSuccess ? (
                                    <Check size={14} />
                                ) : (
                                    <RefreshCw size={14} />
                                )}
                                {isSyncing ? 'Sincronizando...' : syncSuccess ? '¡Sincronizado!' : 'Sincronizar ahora'}
                             </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            Última sincronización: {getLastSyncLabel()}
                        </p>
                    </div>
                    
                    {/* Granular Alarm Config */}
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-3 mb-2">Configuración de Alarmas</h4>
                        
                        <SettingItem 
                            icon={Edit3}
                            iconColor="text-gray-600 dark:text-gray-300"
                            iconBg="bg-gray-100 dark:bg-white/5"
                            label="Calendario"
                            action={
                            <Select 
                                value={settings.calendarPreferences.calendarId}
                                onChange={(val) => updateCalendarPref('calendarId', val)}
                                options={['primary', 'family', 'work']}
                                formatLabel={(val) => val === 'primary' ? 'Principal' : val === 'family' ? 'Familia' : 'Trabajo'}
                            />
                            }
                        />

                        <SettingItem 
                            icon={settings.calendarPreferences.reminderMethod === 'email' ? Mail : MessageSquare}
                            iconColor="text-gray-600 dark:text-gray-300"
                            iconBg="bg-gray-100 dark:bg-white/5"
                            label="Tipo de alerta"
                            action={
                            <Select 
                                value={settings.calendarPreferences.reminderMethod}
                                onChange={(val) => updateCalendarPref('reminderMethod', val)}
                                options={['popup', 'email']}
                                formatLabel={(val) => val === 'popup' ? 'Notificación' : 'Correo'}
                            />
                            }
                        />

                        <SettingItem 
                            icon={Clock}
                            iconColor="text-gray-600 dark:text-gray-300"
                            iconBg="bg-gray-100 dark:bg-white/5"
                            label="Antelación"
                            subLabel="Cuándo avisar antes de la toma"
                            action={
                            <Select 
                                value={settings.calendarPreferences.reminderMinutes.toString()}
                                onChange={(val) => updateCalendarPref('reminderMinutes', parseInt(val))}
                                options={['0', '5', '10', '15', '30', '60', '1440']}
                                formatLabel={(val) => {
                                    if(val === '0') return 'Al momento';
                                    if(val === '60') return '1 hora antes';
                                    if(val === '1440') return '1 día antes';
                                    return `${val} min antes`;
                                }}
                            />
                            }
                        />
                    </div>
                    
                    <button 
                        onClick={logoutGoogle}
                        className="w-full text-center py-4 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Desconectar cuenta
                    </button>
                </>
            )}
        </Section>

        {/* Notifications (Local) */}
        <Section title="Notificaciones Locales (App)">
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
                label="Cerrar Sesión Local"
                labelClass="text-red-500"
                action={null}
            />
        </Section>
        
        {/* --- GOOGLE OAUTH SIMULATION MODAL --- */}
        {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}>
                <div 
                    className="bg-white text-gray-900 w-full max-w-[448px] min-h-[500px] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all relative" 
                    onClick={e => e.stopPropagation()}
                    style={{ fontFamily: 'Roboto, arial, sans-serif' }} 
                >
                    {loginStep === 'processing' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10">
                            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                            <p className="text-lg text-gray-600">Conectando cuenta...</p>
                        </div>
                    ) : loginStep === 'chooser' ? (
                        /* ACCOUNT CHOOSER SCREEN */
                        <div className="flex-1 flex flex-col p-8 md:p-10">
                            <div className="flex justify-center mb-6">
                                <GoogleLogo className="size-10" />
                            </div>
                            <h3 className="text-2xl text-center text-gray-900 font-normal mb-2">Elige una cuenta</h3>
                            <p className="text-base text-center text-gray-600 mb-8">para ir a MediTrack Pro</p>

                            <ul className="flex flex-col gap-0 w-full mb-4">
                                {BROWSER_SESSIONS.map((acc, idx) => (
                                    <li key={idx} 
                                        onClick={() => handleAccountSelect(acc)}
                                        className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 rounded-t-md"
                                    >
                                        <div className="size-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium text-lg shrink-0">
                                            {acc.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <span className="font-bold text-gray-800 text-sm">{acc.name}</span>
                                            <span className="text-sm text-gray-600 truncate">{acc.email}</span>
                                        </div>
                                    </li>
                                ))}
                                <li 
                                    onClick={handleUseAnotherAccount}
                                    className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                                >
                                    <div className="size-10 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                                        <User size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Usar otra cuenta</span>
                                </li>
                            </ul>
                            
                            <div className="mt-auto text-xs text-gray-500 text-center max-w-xs mx-auto leading-relaxed">
                                Para continuar, Google compartirá tu nombre, dirección de correo electrónico y foto de perfil con MediTrack Pro.
                            </div>
                        </div>
                    ) : loginStep === 'consent' ? (
                        /* CONSENT SCREEN */
                        <div className="flex-1 flex flex-col p-8 md:p-12">
                             <div className="flex items-center gap-2 mb-6">
                                <GoogleLogo className="size-6" />
                                <span className="text-gray-500 text-lg">Cuentas de Google</span>
                             </div>
                             
                             <h3 className="text-2xl text-gray-900 font-normal mb-6">
                                MediTrack Pro quiere acceder a tu cuenta de Google
                             </h3>

                             <div className="flex items-center gap-4 mb-8">
                                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl uppercase">
                                    {emailInput.charAt(0)}
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-800">{emailInput}</p>
                                    <p className="text-gray-500">Privacidad • Términos</p>
                                </div>
                             </div>

                             <p className="text-base text-gray-700 mb-4">Esto permitirá a MediTrack Pro:</p>
                             
                             <div className="flex gap-4 mb-4">
                                <div className="mt-1">
                                     <Calendar className="text-blue-600" size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Ver, editar, compartir y eliminar permanentemente todos los calendarios.
                                    </p>
                                    <p className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded w-fit">
                                        Permite definir alarmas
                                    </p>
                                </div>
                             </div>

                             <div className="mt-auto flex justify-end gap-3 pt-4">
                                 <button 
                                    onClick={() => setShowLoginModal(false)}
                                    className="px-6 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-full text-sm transition-colors"
                                 >
                                    Cancelar
                                 </button>
                                 <button 
                                    onClick={handleFinalConsent}
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full text-sm hover:bg-blue-700 shadow-md transition-all"
                                 >
                                    Continuar
                                 </button>
                             </div>
                        </div>
                    ) : (
                        /* MANUAL LOGIN FORM (Email/Password) */
                        <form onSubmit={loginStep === 'email' ? handleEmailSubmit : handlePasswordSubmit} className="flex-1 flex flex-col p-8 md:p-10">
                            <div className="flex justify-center mb-4">
                                <GoogleLogo className="size-12" />
                            </div>
                            
                            <h3 className="text-2xl text-center text-gray-900 font-normal mb-2">
                                {loginStep === 'email' ? 'Iniciar sesión' : 'Te damos la bienvenida'}
                            </h3>
                            
                            <p className="text-base text-center text-gray-800 mb-8">
                                {loginStep === 'email' ? 'Ir a MediTrack Pro' : (
                                    <button 
                                        type="button" 
                                        onClick={() => setLoginStep('email')} 
                                        className="inline-flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-full hover:bg-gray-50 text-sm font-medium"
                                    >
                                        <User size={14} />
                                        {emailInput}
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </p>

                            <div className="flex-1">
                                {loginStep === 'email' ? (
                                    <div className="relative mb-2">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            id="email"
                                            className={clsx(
                                                "peer w-full h-14 rounded-md border bg-white px-3 pt-3 outline-none transition-all placeholder-shown:pt-0 focus:border-2 focus:border-blue-600 focus:pt-3 text-gray-900",
                                                loginError ? "border-red-600 focus:border-red-600" : "border-gray-300"
                                            )}
                                            placeholder=" "
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                        />
                                        <label 
                                            htmlFor="email"
                                            className={clsx(
                                                "absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs font-medium pointer-events-none",
                                                loginError ? "text-red-600 peer-focus:text-red-600" : "peer-focus:text-blue-600"
                                            )}
                                        >
                                            Correo electrónico o teléfono
                                        </label>
                                        {loginError && (
                                            <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                                                <AlertTriangle size={14} />
                                                <span>{loginError}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative mb-2">
                                        <div className="relative">
                                            <input 
                                                autoFocus
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                className={clsx(
                                                    "peer w-full h-14 rounded-md border bg-white px-3 pt-3 outline-none transition-all placeholder-shown:pt-0 focus:border-2 focus:border-blue-600 focus:pt-3 text-gray-900 pr-10",
                                                    loginError ? "border-red-600 focus:border-red-600" : "border-gray-300"
                                                )}
                                                placeholder=" "
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                            />
                                            <label 
                                                htmlFor="password"
                                                className={clsx(
                                                    "absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs font-medium pointer-events-none",
                                                    loginError ? "text-red-600 peer-focus:text-red-600" : "peer-focus:text-blue-600"
                                                )}
                                            >
                                                Introduce tu contraseña
                                            </label>
                                        </div>
                                        {loginError && (
                                            <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                                                <AlertTriangle size={14} />
                                                <span>{loginError}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center mt-4">
                                            <input 
                                                type="checkbox" 
                                                id="showPass" 
                                                checked={showPassword} 
                                                onChange={() => setShowPassword(!showPassword)}
                                                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <label htmlFor="showPass" className="ml-3 text-sm text-gray-700">Mostrar contraseña</label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-10">
                                <button type="button" className="text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded">
                                    Crear cuenta
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-blue-700 shadow-md transition-all active:shadow-none"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* Help Modal */}
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

const GoogleLogo = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export default Settings;