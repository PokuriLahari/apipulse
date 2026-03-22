import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';

export default function ResponseViewer() {
  const currentResponse = useAPIStore((state) => state.currentResponse);
  const pollingActive = useAPIStore((state) => state.pollingConfig.enabled);
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-600 text-gray-100';
    if (status >= 200 && status < 300) return 'bg-green-900/50 text-green-300 border border-green-700';
    if (status >= 300 && status < 400) return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    return 'bg-red-900/50 text-red-300 border border-red-700';
  };

  const getTimeColor = (ms) => {
    if (ms < 300) return 'text-green-400';
    if (ms < 1000) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleCopy = () => {
    if (currentResponse) {
      navigator.clipboard.writeText(JSON.stringify(currentResponse.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const outerBorder = pollingActive
    ? 'border-2 border-red-500 animate-pulse'
    : 'border border-gray-800';

  if (!currentResponse) {
    return (
      <div
        className={`bg-gray-900 rounded-lg p-8 flex items-center justify-center min-h-96 text-center ${outerBorder}`}
      >
        <div className="text-gray-400">
          <p className="text-lg font-medium">No response yet</p>
          <p className="text-sm mt-1">Send a request to see the response</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg p-6 space-y-4 animate-fadeIn ${outerBorder}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentResponse.status)}`}>
            {currentResponse.isError ? 'Error' : currentResponse.status}
          </span>
          <span className={`text-sm font-medium ${getTimeColor(currentResponse.responseTime)}`}>
            {currentResponse.responseTime}ms
          </span>
          {currentResponse.url && (
            <span className="text-xs text-gray-500 truncate max-w-xs">{currentResponse.url}</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition flex items-center gap-2 text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Response Body</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {typeof currentResponse.data === 'object' ? (
            <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(currentResponse.data, null, 2)}
            </pre>
          ) : (
            <pre className="text-gray-300 text-sm font-mono">{String(currentResponse.data)}</pre>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowHeaders(!showHeaders)}
        className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition font-medium text-sm"
      >
        {showHeaders ? '▼' : '▶'} Response Headers
      </button>

      {showHeaders && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <pre className="text-gray-300 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
            {JSON.stringify(currentResponse.headers, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
