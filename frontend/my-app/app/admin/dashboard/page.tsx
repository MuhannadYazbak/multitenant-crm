"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  email: string;
  roles: Role[];
  permissions: string[];
}

interface Tenant {
  id: number;
  company_name: string;
  tenant_type: string;
  status: "active" | "frozen" | "deleted";
  created_at: string;
}

// Fixed Interface to match SQLAlchemy AuditLog model & FastAPI Response Schema
interface AuditLog {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"tenants" | "audit">("tenants");
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Verify Admin Session & RBAC Permissions
  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data");
    const token = localStorage.getItem("admin_token") || localStorage.getItem("access_token");

    if (!token || !rawUserData) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(rawUserData);
      const isSuperAdminOrAdmin = parsedUser.roles?.some((r) =>
        ["super_admin", "admin"].includes(r.name)
      );

      if (!isSuperAdminOrAdmin) {
        setError("Access Denied: You do not have permission to view the Admin Console.");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      setCurrentUser(parsedUser);
      fetchTenants(token);
      fetchAuditLogs(token);
    } catch (err) {
      localStorage.clear();
      router.push("/admin/login");
    }
  }, [router]);

  const fetchTenants = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tenants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) throw new Error("Failed to load tenant workspace registry.");

      const data = await res.json();
      setTenants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/audit-logs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.warn("Audit logs endpoint unfulfilled or unreachable.");
    }
  };

  const handleStatusChange = async (companyName: string, newStatus: string) => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("access_token");
    if (!token) return;

    setActionLoading(companyName);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/tenants/${companyName}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.status === 403) {
        throw new Error("RBAC Error: Super Admin privileges required to alter tenant lifecycles.");
      }

      if (!res.ok) throw new Error("Failed to update workspace status.");

      await fetchTenants(token);
      await fetchAuditLogs(token);
    } catch (err: any) {
      alert(err.message || "Failed to update tenant status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token") || localStorage.getItem("access_token");
    if (!token) return;

    setProvisioning(true);
    setModalError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tenants`, {
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
        throw new Error(errData.detail || "Failed to provision workspace.");
      }

      setCompanyName("");
      setPassword("");
      setTenantType("general");
      setIsModalOpen(false);

      await fetchTenants(token);
      await fetchAuditLogs(token);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setProvisioning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("tenant_slug");

    document.cookie = "admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "user_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "tenant_slug=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-slate-400">Loading system administration console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">System Admin Console</h1>
              {currentUser && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentUser.roles[0]?.name.toUpperCase() || "ADMIN"}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Manage schema isolation, workspace status, and system audit logs
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

        {/* View Selection Tabs */}
        <div className="flex border-b border-slate-700 gap-4">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "tenants"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Tenant Workspaces ({tenants.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "audit"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            System Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* --- Tenants View --- */}
        {activeTab === "tenants" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
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
        )}

        {/* --- Audit Logs View --- */}
        {activeTab === "audit" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 uppercase text-xs tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Log ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-6 py-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono">#{log.id}</td>
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {log.user_email || "System Admin"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-900 rounded font-mono text-xs text-indigo-300 border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{log.resource}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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