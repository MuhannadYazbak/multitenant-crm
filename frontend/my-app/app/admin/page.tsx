"use client";

import { useState } from "react";
import { createTenant } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminProvisioningPage() {
  const router = useRouter();
  const [adminSecret, setAdminSecret] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [tenantType, setTenantType] = useState<"general" | "insurance" | "legal">("general");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await createTenant(
        { company_name: companyName, password, tenant_type: tenantType },
        adminSecret
      );
      setSuccessMsg(`Tenant "${companyName}" provisioned successfully!`);
      setCompanyName("");
      setPassword("");
      router.push('http://localhost:3000/')
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="mb-4">
        <Link 
          href="/" 
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
        >
          ← Back to Login
        </Link>
      </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Tenant Provisioning</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create schema-isolated workspaces with vertical configuration.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Admin Secret Key
            </label>
            <input
              type="password"
              required
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter super secret key"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Company Name / Workspace ID
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. company-e"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Workspace Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Vertical Industry Type
            </label>
            <select
              value={tenantType}
              onChange={(e: any) => setTenantType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="general">General (Standard CRM)</option>
              <option value="insurance">Insurance (Policies & Coverage)</option>
              <option value="legal">Legal (Cases & Court Tracking)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition text-sm disabled:opacity-50"
          >
            {loading ? "Provisioning Schema..." : "Provision New Tenant"}
          </button>
        </form>
      </div>
    </div>
  );
}