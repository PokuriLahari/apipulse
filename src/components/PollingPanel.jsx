import { useState, useEffect } from 'react';
import { Play, Square, Activity } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';

export default function PollingPanel() {
  const draftRequest = useAPIStore((s) => s.draftRequest);
  const pollingConfig = useAPIStore((s) => s.pollingConfig);
  const pollingStats = useAPIStore((s) => s.pollingStats);
  const startPolling = useAPIStore((s) => s.startPolling);
  const stopPolling = useAPIStore((s) => s.stopPolling);
  const setPollingInterval = useAPIStore((s) => s.setPollingInterval);

  const [intervalInput, setIntervalInput] = useState(String(pollingConfig.interval || 5000));

  useEffect(() => {
    if (!pollingConfig.enabled) {
      setIntervalInput(String(pollingConfig.interval || 5000));
    }
  }, [pollingConfig.enabled, pollingConfig.interval]);

  const handleStart = () => {
    const { url, method, headers: headersStr, body: bodyStr } = draftRequest;
    if (!url.trim()) {
      alert('Enter a URL in the request builder before starting polling.');
      return;
    }

    let headersObj = {};
    if (headersStr.trim()) {
      try {
        headersObj = JSON.parse(headersStr);
      } catch {
        alert('Headers must be valid JSON to poll.');
        return;
      }
    }

    let bodyObj = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyStr.trim()) {
      try {
        bodyObj = JSON.parse(bodyStr);
      } catch {
        alert('Body must be valid JSON to poll.');
        return;
      }
    }

    const ms = Math.max(250, parseInt(intervalInput, 10) || 5000);
    startPolling({
      url: url.trim(),
      method,
      headers: headersObj,
      body: bodyObj,
      interval: ms,
    });
  };

  const handleIntervalBlur = () => {
    const ms = Math.max(250, parseInt(intervalInput, 10) || 5000);
    setIntervalInput(String(ms));
    setPollingInterval(ms);
  };

  const active = pollingConfig.enabled;
  const secs = Math.round((pollingConfig.interval || 5000) / 100) / 10;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 space-y-4">
      <div className="flex items-center gap-2 text-white font-semibold text-sm">
        <Activity className="w-4 h-4 text-amber-400" />
        Polling
      </div>

      <p className="text-xs text-gray-500">
        Repeats the current request builder URL, method, headers, and body on a timer. Each run is
        logged to history like a normal send.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Interval (ms)</label>
          <input
            type="number"
            min={250}
            step={250}
            value={intervalInput}
            onChange={(e) => setIntervalInput(e.target.value)}
            onBlur={handleIntervalBlur}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {!active ? (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition"
          >
            <Play className="w-4 h-4" />
            Start polling
          </button>
        ) : (
          <button
            type="button"
            onClick={() => stopPolling()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-800/70 border border-red-800 text-red-100 text-sm font-semibold transition"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      {active && (
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2 text-xs text-gray-400 space-y-1 font-mono">
          <p>
            <span className="text-gray-500">Runs:</span>{' '}
            <span className="text-gray-200">{pollingStats.totalRuns}</span>
          </p>
          <p>
            <span className="text-gray-500">Last run:</span>{' '}
            <span className="text-gray-200">
              {pollingStats.lastRunAt ? new Date(pollingStats.lastRunAt).toLocaleTimeString() : '—'}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Consecutive errors (4xx/5xx/network):</span>{' '}
            <span className={pollingStats.consecutiveErrors > 0 ? 'text-red-400' : 'text-emerald-400'}>
              {pollingStats.consecutiveErrors}
            </span>
          </p>
          <p className="text-gray-500 truncate pt-1 border-t border-gray-700/80 mt-2">
            Every {secs}s · {pollingConfig.method} {pollingConfig.url}
          </p>
        </div>
      )}
    </div>
  );
}
