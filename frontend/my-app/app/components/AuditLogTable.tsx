"use client";

import { useState, useEffect } from "react";
import { fetchAuditLogs, AuditLog } from "@/app/lib/api";

export default function AuditLogTable({ tenantSlug }: { tenantSlug?: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAuditLogs(tenantSlug);
        setLogs(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [tenantSlug]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleString();
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Activity Audit Logs</h2>
        <p className="text-sm text-slate-500">Track actions and system activity across the workspace.</p>
      </div>

      {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

      {loading ? (
        <div className="p-6 text-center text-slate-400">Loading activity logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">IP Address</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {log.user_email || "System"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 capitalize">{log.resource || "-"}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{log.ip_address || "N/A"}</td>
                    <td className="p-3 text-right">
                      {log.details && Object.keys(log.details).length > 0 && (
                        <button
                          onClick={() => setSelectedDetails(log.details || {})}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View JSON
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-md font-bold text-slate-800 mb-3">Action Details</h3>
            <pre className="p-3 bg-slate-900 text-slate-100 text-xs rounded overflow-x-auto max-h-60 font-mono">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}