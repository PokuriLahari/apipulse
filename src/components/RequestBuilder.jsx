import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';
import AuthPanel from './AuthPanel';

function appendQueryParams(urlString, params) {
  const trimmed = urlString.trim();
  if (!trimmed || !params || !Object.keys(params).length) return urlString;
  const sep = trimmed.includes('?') ? '&' : '?';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    q.set(k, String(v));
  }
  return `${trimmed}${sep}${q.toString()}`;
}

export default function RequestBuilder() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  \n}');
  const [loading, setLoading] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [authActive, setAuthActive] = useState(false);

  const authPanelRef = useRef(null);

  const runRequest = useAPIStore((state) => state.runRequest);
  const loadedRequest = useAPIStore((state) => state.loadedRequest);
  const clearLoadedRequest = useAPIStore((state) => state.clearLoadedRequest);
  const setDraftRequest = useAPIStore((state) => state.setDraftRequest);

  useEffect(() => {
    if (!loadedRequest) return;

    setUrl(loadedRequest.url || '');
    setMethod(loadedRequest.method || 'GET');

    const h = loadedRequest.headers;
    if (h != null && typeof h === 'object') {
      setHeaders(JSON.stringify(h, null, 2));
    } else if (typeof h === 'string') {
      setHeaders(h);
    } else {
      setHeaders('{}');
    }

    const b = loadedRequest.body;
    if (b !== undefined && b !== null) {
      setBody(typeof b === 'object' ? JSON.stringify(b, null, 2) : String(b));
    } else {
      setBody('{\n  \n}');
    }

    clearLoadedRequest();
  }, [loadedRequest, clearLoadedRequest]);

  useEffect(() => {
    setDraftRequest({ url, method, headers, body });
  }, [url, method, headers, body, setDraftRequest]);

  useEffect(() => {
    setAuthActive(authPanelRef.current?.isAuthActive?.() ?? false);
  }, []);

  const handleSendRequest = useCallback(async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      let parsedHeaders = {};
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch {
          alert('Invalid JSON in headers');
          setLoading(false);
          return;
        }
      }

      const authHeaders = authPanelRef.current?.getAuthHeaders?.() ?? {};
      parsedHeaders = { ...parsedHeaders, ...authHeaders };

      let parsedBody = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          alert('Invalid JSON in body');
          setLoading(false);
          return;
        }
      }

      const queryParams = authPanelRef.current?.getAuthQueryParams?.() ?? {};
      const finalUrl = appendQueryParams(url, queryParams);

      await runRequest({
        url: finalUrl,
        method,
        headers: parsedHeaders,
        body: parsedBody,
      });
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, runRequest]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSendRequest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSendRequest]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
          placeholder="https://api.example.com/endpoint"
          className="md:col-span-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />

        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              {authActive ? <span className="text-base leading-none" aria-hidden>🔒</span> : null}
              <Send className="w-4 h-4" />
              Send
            </>
          )}
        </button>
      </div>

      <AuthPanel
        ref={authPanelRef}
        onAuthChange={() => setAuthActive(authPanelRef.current?.isAuthActive?.() ?? false)}
      />

      <div className="space-y-3">
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition font-medium text-sm"
        >
          {showHeaders ? '▼' : '▶'} Headers
        </button>
        {showHeaders && (
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          />
        )}
      </div>

      {['POST', 'PUT', 'PATCH'].includes(method) && (
        <div className="space-y-3">
          <button
            onClick={() => setShowBody(!showBody)}
            className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition font-medium text-sm"
          >
            {showBody ? '▼' : '▶'} Body
          </button>
          {showBody && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">Tip: Press Ctrl+Enter to send request</p>
    </div>
  );
}
