import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';

export default function HistoryPage() {
  const history = useAPIStore((state) => state.history);
  const deleteHistoryItem = useAPIStore((state) => state.deleteHistoryItem);
  const clearHistory = useAPIStore((state) => state.clearHistory);

  const [selected, setSelected] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < 2) {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectedItems = useMemo(() => {
    return history.filter((item) => selected.has(item.id));
  }, [selected, history]);

  const compareData = useMemo(() => {
    if (selectedItems.length !== 2) return null;

    const [item1, item2] = selectedItems;
    const winner = item1.responseTime < item2.responseTime ? 1 : 2;

    return {
      item1,
      item2,
      winner,
      timeDiff: Math.abs(item1.responseTime - item2.responseTime),
    };
  }, [selectedItems]);

  const getStatusBadgeColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-900/30 text-green-300';
    if (status >= 300 && status < 400) return 'bg-yellow-900/30 text-yellow-300';
    if (status >= 400 && status < 500) return 'bg-red-900/30 text-red-300';
    if (status >= 500) return 'bg-red-900/50 text-red-300';
    return 'bg-gray-700/30 text-gray-300';
  };

  const getTimeBadgeColor = (ms) => {
    if (ms < 300) return 'bg-green-900/20 text-green-300';
    if (ms < 1000) return 'bg-yellow-900/20 text-yellow-300';
    return 'bg-red-900/20 text-red-300';
  };

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-medium">No history yet</p>
          <p className="text-gray-500 text-sm mt-1">Your API requests will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selected.size === 2 && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-300 text-sm">{selected.size} requests selected for comparison</span>
          <button
            onClick={() => setShowCompare(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium"
          >
            <span>🔀</span>
            Compare
          </button>
        </div>
      )}

      {showCompare && compareData && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Comparison</h3>
            <button
              onClick={() => setShowCompare(false)}
              className="text-gray-500 hover:text-gray-400"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[compareData.item1, compareData.item2].map((item, idx) => (
              <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                {compareData.winner === idx + 1 && (
                  <div className="mb-2 inline-block px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs font-semibold">
                    🏆 Faster
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">URL</p>
                    <p className="text-gray-300 truncate font-mono text-xs">{item.url}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500 text-xs">Method</p>
                      <p className="text-blue-300 font-mono">{item.method}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <p className={`font-mono font-semibold ${getStatusBadgeColor(item.status)}`}>
                        {item.isError ? 'Error' : item.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Response Time</p>
                    <p className={`font-mono font-semibold ${getTimeBadgeColor(item.responseTime)}`}>
                      {item.responseTime}ms
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Response Body Diff</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-900/50 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                <pre className="text-gray-300">
                  {JSON.stringify(compareData.item1.data, null, 2).substring(0, 500)}
                </pre>
              </div>
              <div className="bg-gray-900/50 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                <pre className="text-gray-300">
                  {JSON.stringify(compareData.item2.data, null, 2).substring(0, 500)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Request History</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-2 bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-300 rounded-lg transition text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            className={`bg-gray-900 rounded-lg border p-4 cursor-pointer transition ${
              selected.has(item.id)
                ? 'border-blue-500 bg-gray-800/50'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="mt-1 w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs font-mono font-semibold">
                      {item.method}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                        item.status
                      )}`}
                    >
                      {item.isError ? 'Error' : item.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${getTimeBadgeColor(item.responseTime)}`}>
                      {item.responseTime}ms
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate mt-2 font-mono">{item.url}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistoryItem(item.id);
                }}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
