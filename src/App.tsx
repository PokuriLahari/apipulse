import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SlowAPIAlert from './components/SlowAPIAlert';
import TestPage from './pages/TestPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen">
        <Navbar />
        <SlowAPIAlert />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate to="/test" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
