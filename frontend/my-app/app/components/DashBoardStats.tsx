"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/app/lib/api";
import { DashboardStats } from "@/app/types/dashBoard";

interface Props {
  tenant: string;
}

export default function DashboardStatsWidget({ tenant }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardStats(tenant)
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading dashboard stats:", err))
      .finally(() => setLoading(false));
  }, [tenant]);

  if (loading) return <div className="text-sm text-gray-500">Loading metrics...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-4">
      {/* Total Clients Card (Common across all verticals) */}
      <div className="p-5 bg-white border rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Clients</span>
        <div className="mt-2 flex justify-between items-baseline">
          <span className="text-3xl font-extrabold text-slate-800">{stats.total_clients}</span>
          <span className="text-xl">👥</span>
        </div>
      </div>

      {/* Conditional Insurance KPI 1: Active Policies */}
      {stats.tenant_type === "insurance" && (
        <div className="p-5 bg-white border rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active Policies</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-blue-900">
              {stats.vertical_stats?.total_policies || 0}
            </span>
            <span className="text-xl">🛡️</span>
          </div>
        </div>
      )}

      {/* Conditional Insurance KPI 2: Total Coverage ($) */}
      {stats.tenant_type === "insurance" && (
        <div className="p-5 bg-white border rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Portfolio Coverage</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-emerald-900">
              ${(stats.vertical_stats?.total_coverage || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xl">💵</span>
          </div>
        </div>
      )}

      {/* Conditional Legal KPI 1: Total Legal Cases */}
      {stats.tenant_type === "legal" && (
        <div className="p-5 bg-white border rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Active Cases</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-indigo-900">
              {stats.vertical_stats?.total_cases || 0}
            </span>
            <span className="text-xl">⚖️</span>
          </div>
        </div>
      )}

      {/* Conditional Legal KPI 2: Open / Pending Cases */}
      {stats.tenant_type === "legal" && (
        <div className="p-5 bg-white border rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Court / In Progress</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-amber-900">
              {stats.vertical_stats?.open_cases || 0}
            </span>
            <span className="text-xl">📂</span>
          </div>
        </div>
      )}
    </div>
  );
}