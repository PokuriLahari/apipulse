import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('apipulse_darkmode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('apipulse_darkmode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:opacity-80 transition">
          <span>⚡</span>
          <span>APIpulse</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            to="/test"
            className={`px-3 md:px-4 py-2 rounded-lg transition font-medium text-sm ${
              isActive('/test')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            Test
          </Link>
          <Link
            to="/history"
            className={`px-3 md:px-4 py-2 rounded-lg transition font-medium text-sm ${
              isActive('/history')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            History
          </Link>
          <Link
            to="/dashboard"
            className={`px-3 md:px-4 py-2 rounded-lg transition font-medium text-sm ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-2 md:ml-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded-lg transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
