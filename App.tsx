import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MedicationProvider } from './context/MedicationContext';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import MedicationList from './pages/MedicationList';
import AddMedication from './pages/AddMedication';
import MedicationDetail from './pages/MedicationDetail';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

const AppContent = () => {
  const location = useLocation();
  // Hide bottom nav on specific pages
  const hideNav = ['/add', '/settings'].includes(location.pathname) || location.pathname.startsWith('/meds/') || location.pathname.startsWith('/edit/');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/meds" element={<MedicationList />} />
        <Route path="/add" element={<AddMedication />} />
        <Route path="/edit/:id" element={<AddMedication />} />
        <Route path="/meds/:id" element={<MedicationDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!hideNav && <Navigation />}
    </>
  );
};

function App() {
  return (
    <MedicationProvider>
      <Router>
        <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative">
          <AppContent />
        </div>
      </Router>
    </MedicationProvider>
  );
}

export default App;