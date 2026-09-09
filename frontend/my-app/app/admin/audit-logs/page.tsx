"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { AuditLog } from "@/app/types/auth";
import { PermissionGate } from "@/app/components/PermissionGate";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">System Audit Logs</h1>

      <PermissionGate
        permission="audit:read"
        fallback={<div className="text-red-400">You do not have permission to view audit logs.</div>}
      >
        {loading && <p className="text-slate-400">Loading log events...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700/50 text-xs uppercase text-slate-300">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{log.user_email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{log.resource}</td>
                    <td className="px-4 py-3 text-slate-400">{log.ip_address || "N/A"}</td>
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