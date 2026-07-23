// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Tenant {
  id: number;
  company_name: string;
  tenant_type: string;
  status: "active" | "frozen" | "deleted";
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State for Adding Tenant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [tenantType, setTenantType] = useState<"general" | "insurance" | "legal">("general");
  const [provisioning, setProvisioning] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTenants = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/admin/tenants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to load tenants list");

      const data = await res.json();
      setTenants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleStatusChange = async (companyName: string, newStatus: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setActionLoading(companyName);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/tenants/${companyName}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      await fetchTenants();
    } catch (err: any) {
      alert(err.message || "Failed to update tenant status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setProvisioning(true);
    setModalError(null);

    try {
      const res = await fetch("http://localhost:8000/api/admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: companyName,
          password: password,
          tenant_type: tenantType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to provision workspace");
      }

      // Reset Modal Form
      setCompanyName("");
      setPassword("");
      setTenantType("general");
      setIsModalOpen(false);

      // Refresh list
      await fetchTenants();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setProvisioning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading admin control panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white">System Admin Console</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage workspace lifecycles, health, and provisioning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              + Add Tenant
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              Tenant Portal
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tenant Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Registered Tenant Workspaces ({tenants.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 uppercase text-xs tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Vertical</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono">#{tenant.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{tenant.company_name}</td>
                    <td className="px-6 py-4 uppercase text-xs tracking-wider font-semibold text-indigo-400">
                      {tenant.tenant_type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tenant.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tenant.status === "frozen"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {tenant.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {tenant.status !== "active" && (
                        <button
                          onClick={() => handleStatusChange(tenant.company_name, "active")}
                          disabled={actionLoading === tenant.company_name}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-medium transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      {tenant.status !== "frozen" && (
                        <button
                          onClick={() => handleStatusChange(tenant.company_name, "frozen")}
                          disabled={actionLoading === tenant.company_name}
                          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-md text-xs font-medium transition-colors"
                        >
                          Freeze
                        </button>
                      )}
                      {tenant.status !== "deleted" && (
                        <button
                          onClick={() => handleStatusChange(tenant.company_name, "deleted")}
                          disabled={actionLoading === tenant.company_name}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-md text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No tenant accounts found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- Provision Tenant Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1">Provision New Tenant</h3>
            <p className="text-slate-400 text-xs mb-4">
              Create a schema-isolated database workspace for a new client.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Company Name / Workspace ID
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. company-e"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Workspace Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Vertical Industry Type
                </label>
                <select
                  value={tenantType}
                  onChange={(e: any) => setTenantType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">General (Standard CRM)</option>
                  <option value="insurance">Insurance (Policies & Coverage)</option>
                  <option value="legal">Legal (Cases & Court Tracking)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {provisioning ? "Provisioning..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}