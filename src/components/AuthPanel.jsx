import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronDown, ChevronRight, Shield, KeyRound, Lock } from 'lucide-react';

const AUTH_STORAGE_KEY = 'apipulse_auth';

const defaultAuthState = () => ({
  type: 'none',
  bearerToken: '',
  apiKeyName: '',
  apiKeyValue: '',
  apiKeyLocation: 'header',
  basicUser: '',
  basicPass: '',
});

function loadAuthFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return defaultAuthState();
    const parsed = JSON.parse(raw);
    return { ...defaultAuthState(), ...parsed };
  } catch {
    return defaultAuthState();
  }
}

/** Build headers object from persisted or live auth config (plain object). */
export function getAuthHeaders(auth) {
  if (!auth || auth.type === 'none') return {};

  if (auth.type === 'bearer') {
    const t = (auth.bearerToken || '').trim();
    if (!t) return {};
    return { Authorization: `Bearer ${t}` };
  }

  if (auth.type === 'apiKey' && auth.apiKeyLocation === 'header') {
    const name = (auth.apiKeyName || '').trim();
    const value = (auth.apiKeyValue || '').trim();
    if (!name || !value) return {};
    return { [name]: value };
  }

  if (auth.type === 'basic') {
    const u = (auth.basicUser || '').trim();
    const p = auth.basicPass || '';
    if (!u) return {};
    const encoded = typeof btoa !== 'undefined' ? btoa(`${u}:${p}`) : '';
    if (!encoded) return {};
    return { Authorization: `Basic ${encoded}` };
  }

  return {};
}

/** Query params for API key mode when location is query. */
export function getAuthQueryParams(auth) {
  if (!auth || auth.type !== 'apiKey' || auth.apiKeyLocation !== 'query') return {};
  const name = (auth.apiKeyName || '').trim();
  const value = (auth.apiKeyValue || '').trim();
  if (!name || !value) return {};
  return { [name]: value };
}

export function isAuthConfigActive(auth) {
  if (!auth || auth.type === 'none') return false;
  if (auth.type === 'bearer') return !!(auth.bearerToken || '').trim();
  if (auth.type === 'apiKey')
    return !!(auth.apiKeyName || '').trim() && !!(auth.apiKeyValue || '').trim();
  if (auth.type === 'basic') return !!(auth.basicUser || '').trim();
  return false;
}

const AuthPanel = forwardRef(function AuthPanel({ onAuthChange }, ref) {
  const [open, setOpen] = useState(true);
  const [auth, setAuth] = useState(loadAuthFromStorage);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    onAuthChange?.();
  }, [auth, onAuthChange]);

  useImperativeHandle(
    ref,
    () => ({
      getAuthHeaders: () => getAuthHeaders(auth),
      getAuthQueryParams: () => getAuthQueryParams(auth),
      isAuthActive: () => isAuthConfigActive(auth),
    }),
    [auth]
  );

  const active = isAuthConfigActive(auth);

  const update = (partial) => setAuth((a) => ({ ...a, ...partial }));

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-800/60 hover:bg-gray-800 text-left transition"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Shield className="w-4 h-4 text-blue-400" />
          Authentication
        </span>
        {active ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900/50 text-green-300 border border-green-700">
            Auth Active
          </span>
        ) : (
          <span className="text-xs text-gray-500">None</span>
        )}
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
            <select
              value={auth.type}
              onChange={(e) => update({ type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>

          {auth.type === 'bearer' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Token
              </label>
              <input
                type="password"
                autoComplete="off"
                value={auth.bearerToken}
                onChange={(e) => update({ bearerToken: e.target.value })}
                placeholder="your-access-token"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {auth.type === 'apiKey' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Key name</label>
                <input
                  type="text"
                  value={auth.apiKeyName}
                  onChange={(e) => update({ apiKeyName: e.target.value })}
                  placeholder="X-API-Key"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Key value</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={auth.apiKeyValue}
                  onChange={(e) => update({ apiKeyValue: e.target.value })}
                  placeholder="secret"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Add to</label>
                <select
                  value={auth.apiKeyLocation}
                  onChange={(e) => update({ apiKeyLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="header">Header</option>
                  <option value="query">Query Params</option>
                </select>
              </div>
            </div>
          )}

          {auth.type === 'basic' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={auth.basicUser}
                  onChange={(e) => update({ basicUser: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={auth.basicPass}
                  onChange={(e) => update({ basicPass: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default AuthPanel;
