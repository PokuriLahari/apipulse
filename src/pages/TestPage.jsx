import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Square } from 'lucide-react';
import RequestBuilder from '../components/RequestBuilder';
import ResponseViewer from '../components/ResponseViewer';
import CollectionsSidebar from '../components/CollectionsSidebar';
import PollingPanel from '../components/PollingPanel';
import useAPIStore from '../store/useAPIStore';

function truncateMiddle(str, max = 56) {
  if (!str || str.length <= max) return str;
  const side = Math.floor((max - 1) / 2);
  return `${str.slice(0, side)}…${str.slice(-side)}`;
}

export default function TestPage() {
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const pollingEnabled = useAPIStore((s) => s.pollingConfig.enabled);
  const pollingConfig = useAPIStore((s) => s.pollingConfig);
  const stopPolling = useAPIStore((s) => s.stopPolling);

  useEffect(() => {
    document.title = 'APIpulse - Test';
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const intervalSec = Math.round((pollingConfig.interval || 5000) / 100) / 10;

  return (
    <div className="space-y-6">
      {pollingEnabled && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-lg border border-red-900/60 bg-red-950/40 text-red-100 text-sm">
          <p className="font-medium min-w-0">
            <span className="mr-1.5" aria-hidden>
              🔴
            </span>
            Live Polling Active —{' '}
            <span className="text-red-200/90 font-mono break-all">
              {truncateMiddle(pollingConfig.url || '')}
            </span>{' '}
            <span className="text-red-300/80 whitespace-nowrap">every {intervalSec}s</span>
          </p>
          <button
            type="button"
            onClick={() => stopPolling()}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-900/70 hover:bg-red-800 border border-red-700 text-white text-sm font-semibold transition"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Tester</h1>
        <p className="text-gray-400">Test your API endpoints in real-time</p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileCollectionsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm font-medium"
            aria-expanded={mobileCollectionsOpen}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Collections
            </span>
            {mobileCollectionsOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        <div
          className={`${mobileCollectionsOpen ? 'block' : 'hidden'} lg:block lg:min-w-0`}
        >
          <CollectionsSidebar
            className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]"
            onMobileNavigate={() => setMobileCollectionsOpen(false)}
          />
        </div>

        <div className="lg:col-span-2 space-y-6 min-w-0">
          <RequestBuilder />
          <ResponseViewer />
          <PollingPanel />

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Reference</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 font-medium">HTTP Methods</p>
                <p className="text-gray-500 text-xs mt-1">
                  Use GET to fetch data, POST to create, PUT/PATCH to update, DELETE to remove
                </p>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <p className="text-gray-400 font-medium">Headers Format</p>
                <p className="text-gray-500 text-xs mt-1">Provide headers as valid JSON object</p>
                <pre className="bg-gray-800 rounded p-2 mt-2 text-gray-300 text-xs overflow-x-auto">
                  {`{
  "Authorization": "Bearer TOKEN",
  "Content-Type": "application/json"
}`}
                </pre>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <p className="text-gray-400 font-medium">Keyboard Shortcut</p>
                <p className="text-gray-500 text-xs mt-1">
                  Press <span className="bg-gray-800 px-1 rounded">Ctrl+Enter</span> to send request
                </p>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <p className="text-gray-400 font-medium">Status Codes</p>
                <ul className="text-gray-500 text-xs mt-1 space-y-1">
                  <li>
                    <span className="text-green-400">2xx</span> - Success
                  </li>
                  <li>
                    <span className="text-yellow-400">3xx</span> - Redirect
                  </li>
                  <li>
                    <span className="text-red-400">4xx</span> - Client Error
                  </li>
                  <li>
                    <span className="text-red-500">5xx</span> - Server Error
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
