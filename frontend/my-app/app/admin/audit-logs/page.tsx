"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { AuditLog } from "@/app/types/auth";
import { PermissionGate } from "@/app/components/PermissionGate";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await apiFetch<AuditLog[]>("/api/admin/audit-logs");
        setLogs(data);
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">System Audit Logs</h1>

      <PermissionGate
        permission="audit:read"
        fallback={
          <div className="text-red-400 bg-red-950/30 border border-red-800 p-4 rounded-lg">
            You do not have permission to view audit logs. Ensure your administrative role includes the <code className="text-red-200 bg-red-900/50 px-1 py-0.5 rounded">audit:read</code> permission.
          </div>
        }
      >
        {loading && <p className="text-slate-400">Loading log events...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="text-slate-400">No system audit records found.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700/50 text-xs uppercase text-slate-300">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{log.user_email || "System"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{log.resource}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.ip_address || "N/A"}</td>
                    <td className="px-4 py-3 text-right">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <button
                          onClick={() => toggleExpand(Number(log.id))}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                          {expandedId === Number(log.id) ? "Hide Payload" : "View Payload"}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PermissionGate>
    </div>
  );
}