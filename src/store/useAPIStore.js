import { create } from 'zustand';
import axios from 'axios';

const STORAGE_KEY = 'apipulse_history';
const THRESHOLD_KEY = 'apipulse_threshold';
const COLLECTIONS_KEY = 'apipulse_collections';

const defaultDraft = () => ({
  url: '',
  method: 'GET',
  headers: '{\n  "Content-Type": "application/json"\n}',
  body: '{\n  \n}',
});

const loadCollections = () => {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistCollections = (collections) => {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
};

const defaultPollingConfig = () => ({
  url: '',
  method: 'GET',
  headers: {},
  body: undefined,
  interval: 5000,
  enabled: false,
});

/** Avoid overlapping poll ticks when requests outlast the interval. */
let pollInFlight = false;

const useAPIStore = create((set, get) => ({
  currentResponse: null,
  history: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  slowThreshold: parseInt(localStorage.getItem(THRESHOLD_KEY) || '1000'),

  collections: loadCollections(),
  loadedRequest: null,
  draftRequest: defaultDraft(),

  setDraftRequest: (partial) =>
    set((state) => ({
      draftRequest: { ...state.draftRequest, ...partial },
    })),

  createCollection: (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const next = [...get().collections, { id, name: trimmed, requests: [] }];
    persistCollections(next);
    set({ collections: next });
  },

  deleteCollection: (id) => {
    const next = get().collections.filter((c) => c.id !== id);
    persistCollections(next);
    set({ collections: next });
  },

  addRequestToCollection: (collectionId, requestConfig) => {
    const next = get().collections.map((c) =>
      c.id === collectionId
        ? { ...c, requests: [...c.requests, { ...requestConfig }] }
        : c
    );
    persistCollections(next);
    set({ collections: next });
  },

  deleteRequestFromCollection: (collectionId, requestId) => {
    const next = get().collections.map((c) =>
      c.id === collectionId
        ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
        : c
    );
    persistCollections(next);
    set({ collections: next });
  },

  loadRequest: (requestConfig) => {
    set({ loadedRequest: { ...requestConfig } });
  },

  clearLoadedRequest: () => set({ loadedRequest: null }),

  pollingConfig: defaultPollingConfig(),
  pollingStats: {
    totalRuns: 0,
    lastRunAt: null,
    consecutiveErrors: 0,
  },
  pollingIntervalRef: null,

  stopPolling: () => {
    const id = get().pollingIntervalRef;
    if (id != null) {
      clearInterval(id);
    }
    set((state) => ({
      pollingIntervalRef: null,
      pollingConfig: { ...state.pollingConfig, enabled: false },
    }));
  },

  startPolling: (config) => {
    get().stopPolling();

    const interval = Math.max(250, Number(config.interval) || 5000);
    const pollingConfig = {
      url: config.url || '',
      method: config.method || 'GET',
      headers: config.headers && typeof config.headers === 'object' ? config.headers : {},
      body: config.body,
      interval,
      enabled: true,
    };

    if (!pollingConfig.url.trim()) {
      return;
    }

    const recordPollResult = (result) => {
      const err =
        result.isError || result.status == null || (result.status >= 400 && result.status < 600);
      set((state) => ({
        pollingStats: {
          totalRuns: state.pollingStats.totalRuns + 1,
          lastRunAt: new Date().toISOString(),
          consecutiveErrors: err ? state.pollingStats.consecutiveErrors + 1 : 0,
        },
      }));
    };

    const tick = async () => {
      if (!get().pollingConfig.enabled) return;
      if (pollInFlight) return;
      pollInFlight = true;
      try {
        const { url, method, headers, body } = get().pollingConfig;
        const result = await get().runRequest({ url, method, headers, body });
        recordPollResult(result);
      } finally {
        pollInFlight = false;
      }
    };

    const timerId = setInterval(tick, interval);
    set({
      pollingConfig,
      pollingIntervalRef: timerId,
      pollingStats: { totalRuns: 0, lastRunAt: null, consecutiveErrors: 0 },
    });
    tick();
  },

  setPollingInterval: (ms) => {
    const nextMs = Math.max(250, Number(ms) || 5000);
    const { enabled, url, method, headers, body } = get().pollingConfig;
    set((state) => ({
      pollingConfig: { ...state.pollingConfig, interval: nextMs },
    }));
    if (enabled) {
      get().stopPolling();
      get().startPolling({ url, method, headers, body, interval: nextMs });
    }
  },

  runRequest: async (config) => {
    const { url, method = 'GET', headers = {}, body } = config;
    const startTime = Date.now();

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        validateStatus: () => true,
      });

      const responseTime = Date.now() - startTime;
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      const newResponse = {
        id,
        url,
        method,
        status: response.status,
        responseTime,
        data: response.data,
        headers: response.headers,
        timestamp,
      };

      const currentHistory = get().history;
      const updatedHistory = [newResponse, ...currentHistory].slice(0, 100);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      set({
        currentResponse: newResponse,
        history: updatedHistory,
      });

      return { isError: false, status: response.status };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      let errorMessage = 'Unknown error';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network Error: Unable to reach the server';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorResponse = {
        id,
        url,
        method,
        status: null,
        responseTime,
        data: { error: errorMessage },
        headers: {},
        timestamp,
        isError: true,
      };

      const currentHistory = get().history;
      const updatedHistory = [errorResponse, ...currentHistory].slice(0, 100);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      set({
        currentResponse: errorResponse,
        history: updatedHistory,
      });

      return { isError: true, status: null };
    }
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ history: [], currentResponse: null });
  },

  deleteHistoryItem: (id) => {
    const updatedHistory = get().history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    set({ history: updatedHistory });
  },

  setSlowThreshold: (ms) => {
    localStorage.setItem(THRESHOLD_KEY, ms.toString());
    set({ slowThreshold: ms });
  },
}));

export default useAPIStore;
