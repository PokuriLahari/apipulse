import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';

export default function SlowAPIAlert() {
  const currentResponse = useAPIStore((state) => state.currentResponse);
  const slowThreshold = useAPIStore((state) => state.slowThreshold);
  const setSlowThreshold = useAPIStore((state) => state.setSlowThreshold);
  const [dismissed, setDismissed] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(slowThreshold.toString());

  useEffect(() => {
    setDismissed(false);
  }, [currentResponse]);

  if (dismissed || !currentResponse || currentResponse.responseTime <= slowThreshold) {
    return null;
  }

  const handleThresholdChange = (value) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setSlowThreshold(num);
    }
  };

  return (
    <div className="animate-slideDown fixed top-0 left-0 right-0 z-50 bg-red-900/90 border-b border-red-700 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0" />
          <span className="text-red-100 text-sm font-medium whitespace-nowrap">
            ⚠️ Slow Response Detected: {currentResponse.responseTime}ms — exceeds your threshold
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              value={tempThreshold}
              onChange={(e) => {
                setTempThreshold(e.target.value);
                handleThresholdChange(e.target.value);
              }}
              className="w-20 px-2 py-1 bg-red-800/50 border border-red-700 rounded text-red-100 text-xs font-mono focus:ring-2 focus:ring-red-500 outline-none"
            />
            <span className="text-red-200 text-xs whitespace-nowrap">ms</span>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-red-300 hover:text-red-100 hover:bg-red-800/50 rounded transition flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
