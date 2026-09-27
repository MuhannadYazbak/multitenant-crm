"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAuditLogs, AuditLog } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
export default function TenantAuditLogsPage() {
  const params = useParams();
  const tenantSlug = params?.tenant as string;
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantSlug) return;

    fetchAuditLogs(tenantSlug)
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load tenant audit logs");
        setLoading(false);
      });
  }, [tenantSlug]);

  if (loading) return <div className="p-6">Loading audit logs...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-full">
      <Navbar tenantName={tenantSlug} />
      <h1 className="text-2xl font-bold mb-4">Workspace Audit Logs ({tenantSlug})</h1>
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Action</th>
              <th className="p-2">Resource</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{log.id}</td>
                <td className="p-2">{log.user_email || "System"}</td>
                <td className="p-2 font-mono text-sm">{log.action}</td>
                <td className="p-2">{log.resource || "-"}</td>
                <td className="p-2 text-sm text-gray-600">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No activity logs found for this tenant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center">
        <button className="bg-indigo-200 hover:bg-indigo-400" onClick={()=> router.back() }>Back</button>
      </div>
    </div>
  );
}