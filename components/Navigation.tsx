import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, CalendarDays, Pill, Settings } from 'lucide-react';
import clsx from 'clsx';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/calendar', icon: CalendarDays, label: 'Agenda' },
    { path: '/meds', icon: Pill, label: 'Meds' }, // Redirects to calendar or list for this demo
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-light/90 dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 pb-6 pt-3 px-6 shadow-2xl">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={clsx(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <Icon 
                  size={24} 
                  fill={isActive ? "currentColor" : "none"} 
                  className={isActive ? "drop-shadow-[0_0_8px_rgba(25,230,94,0.5)]" : ""}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
