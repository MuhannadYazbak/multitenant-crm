"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { AuditLog } from "@/app/types/auth";

interface LastActivitiyWidgetProps {
    tenant: string
}
export default function LastActivityWidget({tenant}: LastActivitiyWidgetProps) {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    async function fetchLastLog() {
      try {
        const data = await apiFetch<AuditLog[]>("/api/v1/audit-logs/?limit=1", {
            headers: {
                "X-Tenant": tenant,
            }
        });
        if (data && data.length > 0) {
          setLog(data[0]);
        }
      } catch (err) {
        console.error("Failed to load last activity log:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLastLog();
  }, []);

  if (loading) {
    return <p className="text-xs text-slate-400">Loading activity...</p>;
  }

  if (!log) {
    return <p className="text-xs text-slate-400">No recent activity recorded.</p>;
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-lg text-sm text-slate-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400 uppercase font-semibold">Your Last Activity</span>
        <span className="text-xs text-slate-400" suppressHydrationWarning>
          {new Date(log.created_at).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded border border-indigo-500/30">
          {log.action}
        </span>
        <span className="text-xs text-slate-300 capitalize">
          Resource: <strong>{log.resource}</strong>
        </span>
      </div>
    </div>
  );
}