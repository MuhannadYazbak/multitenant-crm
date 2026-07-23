"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginTenant } from "@/app/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [companyInput, setCompanyInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyInput.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginTenant(companyInput.trim(), password);

      // Fall back to lowercased input if backend doesn't explicitly return tenant slug
      const tenantSlug = data.tenant || data.tenant_slug || companyInput.trim().toLowerCase();
      router.push(`/${tenantSlug}/mypage`);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 font-sans">
      <div className="p-8 bg-white border border-slate-200 rounded-lg w-[350px] shadow-md">
        <h2 className="text-xl font-bold text-center mb-6 text-slate-800">
          Company Workspace Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm text-slate-600 font-medium">
              Company Domain
            </label>
            <input
              suppressHydrationWarning
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="e.g. company-a"
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-600 font-medium">
              Password
            </label>
            <input
              suppressHydrationWarning
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            suppressHydrationWarning
            type="submit"
            disabled={loading}
            className={`p-2.5 rounded font-bold text-white text-sm transition ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Verifying..." : "Login to Workspace"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition underline underline-offset-4"
          >
            Admin Tenant Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}