import { useMemo, useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, ChevronDown } from 'lucide-react';
import useAPIStore from '../store/useAPIStore';
import { exportAsJSON, exportAsCSV, exportAsPDF } from '../utils/exportUtils';

export default function DashboardPage() {
  const history = useAPIStore((state) => state.history);
  const slowThreshold = useAPIStore((state) => state.slowThreshold);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState('');
  const exportMenuRef = useRef(null);

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        successRate: 0,
        slowestEndpoint: 'N/A',
      };
    }

    const totalRequests = history.length;
    const avgResponseTime = Math.round(
      history.reduce((sum, item) => sum + item.responseTime, 0) / totalRequests
    );
    const successCount = history.filter((item) => item.status >= 200 && item.status < 300).length;
    const successRate = Math.round((successCount / totalRequests) * 100);

    const slowest = history.reduce((prev, current) =>
      prev.responseTime > current.responseTime ? prev : current
    );
    const slowestEndpoint = slowest.url ? slowest.url.split('/').slice(-1)[0] || 'endpoint' : 'N/A';

    return {
      totalRequests,
      avgResponseTime,
      successRate,
      slowestEndpoint,
    };
  }, [history]);

  useEffect(() => {
    if (!exportOpen) return;
    const close = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [exportOpen]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const runExport = (kind) => {
    if (history.length === 0) return;
    showToast('Downloading...');
    if (kind === 'json') exportAsJSON(history);
    else if (kind === 'csv') exportAsCSV(history);
    else exportAsPDF(history, stats);
    setExportOpen(false);
  };

  const timelineData = useMemo(() => {
    return [...history]
      .reverse()
      .slice(0, 50)
      .map((item, idx) => ({
        name: `#${history.length - idx}`,
        time: item.responseTime,
        url: item.url,
        status: item.status || 'Error',
      }));
  }, [history]);

  const statusData = useMemo(() => {
    const counts = { success: 0, redirect: 0, clientError: 0, serverError: 0, error: 0 };
    history.forEach((item) => {
      if (item.isError) counts.error++;
      else if (item.status >= 200 && item.status < 300) counts.success++;
      else if (item.status >= 300 && item.status < 400) counts.redirect++;
      else if (item.status >= 400 && item.status < 500) counts.clientError++;
      else if (item.status >= 500) counts.serverError++;
    });

    return [
      { name: '2xx', value: counts.success, fill: '#22c55e' },
      { name: '3xx', value: counts.redirect, fill: '#f59e0b' },
      { name: '4xx', value: counts.clientError, fill: '#ef4444' },
      { name: '5xx', value: counts.serverError, fill: '#dc2626' },
      { name: 'Error', value: counts.error, fill: '#6b7280' },
    ].filter((item) => item.value > 0);
  }, [history]);

  const slowestAPIs = useMemo(() => {
    return [...history]
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 5)
      .map((item, idx) => ({
        rank: idx + 1,
        url: item.url,
        method: item.method,
        time: item.responseTime,
        status: item.status || 'Error',
      }));
  }, [history]);

  const StatCard = ({ title, value, subtext }) => (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
    </div>
  );

  const exportDisabled = history.length === 0;

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm shadow-lg animate-fadeIn"
          role="status"
        >
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Request history and performance</p>
        </div>

        <div className="relative self-end sm:self-auto" ref={exportMenuRef}>
          <button
            type="button"
            disabled={exportDisabled}
            onClick={() => !exportDisabled && setExportOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            {exportDisabled ? 'No data' : 'Export'}
            {!exportDisabled && <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {exportOpen && !exportDisabled && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 shadow-xl z-50 py-1">
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition"
                onClick={() => runExport('json')}
              >
                Export JSON
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition"
                onClick={() => runExport('csv')}
              >
                Export CSV
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition"
                onClick={() => runExport('pdf')}
              >
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex items-center justify-center min-h-72 rounded-lg border border-gray-800 bg-gray-900/50">
          <div className="text-center px-4">
            <p className="text-gray-400 text-lg font-medium">No data yet</p>
            <p className="text-gray-500 text-sm mt-1">Make some API requests to see analytics</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Requests" value={stats.totalRequests} />
            <StatCard title="Avg Response Time" value={`${stats.avgResponseTime}ms`} />
            <StatCard title="Success Rate" value={`${stats.successRate}%`} />
            <StatCard title="Slowest Endpoint" value={stats.slowestEndpoint} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Response Time Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `${value}ms`}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#3b82f6"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => slowThreshold}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    name="Threshold"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Status Code Breakdown</h3>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={{ fill: '#fff', fontSize: 12 }}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-500">No data</div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Slowest APIs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">URL</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Method</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slowestAPIs.map((api) => (
                    <tr
                      key={`${api.url}-${api.time}`}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 px-4 text-gray-300">{api.rank}</td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-xs">{api.url}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs font-mono">
                          {api.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-yellow-400">{api.time}ms</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            api.status >= 200 && api.status < 300
                              ? 'bg-green-900/30 text-green-300'
                              : 'bg-red-900/30 text-red-300'
                          }`}
                        >
                          {api.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
