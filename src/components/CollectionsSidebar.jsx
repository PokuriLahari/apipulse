import { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookmarkPlus,
  Layers,
} from 'lucide-react';
import useAPIStore from '../store/useAPIStore';

function methodBadgeClass(method) {
  const m = (method || 'GET').toUpperCase();
  if (m === 'GET') return 'bg-emerald-900/50 text-emerald-300 border-emerald-700';
  if (m === 'POST') return 'bg-blue-900/50 text-blue-300 border-blue-700';
  if (m === 'PUT') return 'bg-amber-900/50 text-amber-300 border-amber-700';
  if (m === 'PATCH') return 'bg-violet-900/50 text-violet-300 border-violet-700';
  if (m === 'DELETE') return 'bg-red-900/50 text-red-300 border-red-700';
  return 'bg-gray-700 text-gray-300 border-gray-600';
}

function truncateUrl(url, max = 36) {
  if (!url) return '';
  return url.length <= max ? url : `${url.slice(0, max)}…`;
}

export default function CollectionsSidebar({ className = '', onMobileNavigate }) {
  const collections = useAPIStore((s) => s.collections);
  const draftRequest = useAPIStore((s) => s.draftRequest);
  const createCollection = useAPIStore((s) => s.createCollection);
  const deleteCollection = useAPIStore((s) => s.deleteCollection);
  const addRequestToCollection = useAPIStore((s) => s.addRequestToCollection);
  const deleteRequestFromCollection = useAPIStore((s) => s.deleteRequestFromCollection);
  const loadRequest = useAPIStore((s) => s.loadRequest);

  const [expanded, setExpanded] = useState({});
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [saveCollectionId, setSaveCollectionId] = useState('');
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);

  const toggleCollection = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !(prev[id] !== false),
    }));
  };

  const isCollectionOpen = (id) => expanded[id] !== false;

  const submitNewCollection = () => {
    const n = newCollectionName.trim();
    if (!n) return;
    createCollection(n);
    setNewCollectionName('');
    setCreating(false);
  };

  const handleSaveCurrentRequest = () => {
    if (!saveCollectionId || !saveRequestName.trim()) {
      alert('Choose a collection and enter a request name.');
      return;
    }
    const { url, method, headers: headersStr, body: bodyStr } = draftRequest;
    if (!url.trim()) {
      alert('Enter a URL before saving.');
      return;
    }

    let headersObj = {};
    if (headersStr.trim()) {
      try {
        headersObj = JSON.parse(headersStr);
      } catch {
        alert('Headers must be valid JSON to save.');
        return;
      }
    }

    let bodyObj = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyStr.trim()) {
      try {
        bodyObj = JSON.parse(bodyStr);
      } catch {
        alert('Body must be valid JSON to save.');
        return;
      }
    }

    addRequestToCollection(saveCollectionId, {
      id: crypto.randomUUID(),
      name: saveRequestName.trim(),
      url: url.trim(),
      method,
      headers: headersObj,
      body: bodyObj,
    });
    setSaveRequestName('');
    setSaveOpen(false);
    onMobileNavigate?.();
  };

  const handleLoadRequest = (req) => {
    loadRequest({
      id: req.id,
      name: req.name,
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    onMobileNavigate?.();
  };

  return (
    <aside
      className={`bg-gray-900 rounded-lg border border-gray-800 flex flex-col min-h-[280px] max-h-[70vh] lg:max-h-none lg:h-full ${className}`}
    >
      <div className="p-3 border-b border-gray-800 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Layers className="w-4 h-4 text-blue-400 flex-shrink-0" />
          Collections
        </div>

        {!creating ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium transition border border-gray-700"
          >
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNewCollection()}
              placeholder="Collection name"
              className="flex-1 min-w-0 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={submitNewCollection}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewCollectionName('');
              }}
              className="px-2 py-2 text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSaveOpen(!saveOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-200 text-sm font-medium transition border border-blue-800/50"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save Current Request
          </button>
          {saveOpen && (
            <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-3 space-y-2">
              <select
                value={saveCollectionId}
                onChange={(e) => setSaveCollectionId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select collection…</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={saveRequestName}
                onChange={(e) => setSaveRequestName(e.target.value)}
                placeholder="Request name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCurrentRequest}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                Save to collection
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {collections.length === 0 ? (
          <p className="text-gray-500 text-xs px-2 py-4 text-center">No collections yet</p>
        ) : (
          collections.map((col) => (
            <div key={col.id} className="rounded-lg border border-gray-800 bg-gray-800/30 overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-2">
                <button
                  type="button"
                  onClick={() => toggleCollection(col.id)}
                  className="flex-1 flex items-center gap-2 min-w-0 text-left text-gray-200 hover:text-white transition"
                >
                  {isCollectionOpen(col.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                  <FolderOpen className="w-4 h-4 text-amber-500/90 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{col.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">({col.requests.length})</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCollection(col.id);
                  }}
                  className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
                  title="Delete collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isCollectionOpen(col.id) && (
                <ul className="border-t border-gray-800/80 pb-1">
                  {col.requests.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-500">No saved requests</li>
                  ) : (
                    col.requests.map((req) => (
                      <li key={req.id} className="group flex items-stretch border-b border-gray-800/50 last:border-0">
                        <button
                          type="button"
                          onClick={() => handleLoadRequest(req)}
                          className="flex-1 min-w-0 text-left px-3 py-2 hover:bg-gray-800/80 transition flex items-center gap-2"
                        >
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${methodBadgeClass(req.method)}`}
                          >
                            {req.method}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-gray-200 truncate">{req.name}</span>
                            <span className="block text-[11px] text-gray-500 font-mono truncate">
                              {truncateUrl(req.url)}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRequestFromCollection(col.id, req.id);
                          }}
                          className="px-2 text-gray-500 hover:text-red-400 hover:bg-gray-800/80 transition flex-shrink-0"
                          title="Remove request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
