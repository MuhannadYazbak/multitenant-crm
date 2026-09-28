// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { fetchAuditLogs, AuditLog } from "@/app/lib/api";
// import Navbar from "@/app/components/Navbar";
// export default function TenantAuditLogsPage() {
//   const params = useParams();
//   const tenantSlug = params?.tenant as string;
//   const router = useRouter();
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!tenantSlug) return;

//     fetchAuditLogs(tenantSlug)
//       .then((data) => {
//         setLogs(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message || "Failed to load tenant audit logs");
//         setLoading(false);
//       });
//   }, [tenantSlug]);

//   if (loading) return <div className="p-6">Loading audit logs...</div>;
//   if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

//   return (
//     <div className="min-h-full">
//       <Navbar tenantName={tenantSlug} />
//       <h1 className="text-2xl font-bold mb-4">Workspace Audit Logs ({tenantSlug})</h1>
//       <div className="bg-white rounded shadow p-4 overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="border-b bg-gray-50">
//               <th className="p-2">ID</th>
//               <th className="p-2">User</th>
//               <th className="p-2">Action</th>
//               <th className="p-2">Resource</th>
//               <th className="p-2">Timestamp</th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.map((log) => (
//               <tr key={log.id} className="border-b hover:bg-gray-50">
//                 <td className="p-2">{log.id}</td>
//                 <td className="p-2">{log.user_email || "System"}</td>
//                 <td className="p-2 font-mono text-sm">{log.action}</td>
//                 <td className="p-2">{log.resource || "-"}</td>
//                 <td className="p-2 text-sm text-gray-600">
//                   {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
//                 </td>
//               </tr>
//             ))}
//             {logs.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="p-4 text-center text-gray-500">
//                   No activity logs found for this tenant.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex justify-center items-center">
//         <button className="bg-indigo-200 hover:bg-indigo-400" onClick={()=> router.back() }>Back</button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { AuditLog } from "@/app/types/auth";
import { PermissionGate } from "@/app/components/PermissionGate";
import Navbar from "@/app/components/Navbar";
import { useRouter, useParams } from "next/navigation";
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params?.tenant as string
  useEffect(() => {
    async function fetchLogs() {
      try {
        // Pointing to the unified audit log endpoint with trailing slash
        const data = await apiFetch<AuditLog[]>("/api/v1/audit-logs/");
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
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <Navbar tenantName={tenantSlug} />
      <h1 className="text-2xl font-bold mb-4">Workspace Audit Logs</h1>

      <PermissionGate
        permission="audit:read"
        fallback={
          <div className="text-red-400 bg-red-950/30 border border-red-800 p-4 rounded-lg">
            You do not have permission to view audit logs. Ensure your role includes the <code className="text-red-200 bg-red-900/50 px-1 py-0.5 rounded">audit:read</code> permission.
          </div>
        }
      >
        {loading && <p className="text-slate-400">Loading log events...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="text-slate-400">No audit records found for this workspace.</p>
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
                {logs.map((log) => {
                  const logId = Number(log.id);
                  const isExpanded = expandedId === logId;

                  return (
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
                          <div>
                            <button
                              onClick={() => toggleExpand(logId)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 underline mb-1"
                            >
                              {isExpanded ? "Hide Payload" : "View Payload"}
                            </button>
                            {isExpanded && (
                              <pre className="text-left bg-slate-950 text-slate-200 p-2 rounded text-xs font-mono border border-slate-800 max-w-xs ml-auto overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-center items-center pt-3">
              <button className="bg-indigo-400 hover:bg-indigo-700" onClick={()=>router.back()}>Back</button>
            </div>
          </div>
        )}
      </PermissionGate>

    </div>
  );
}