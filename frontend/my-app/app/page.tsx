"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import Link from "next/link";

interface UserAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    tenant_id: number;
    company_name: string;
    tenant_type: string;
    email: string;
    full_name: string;
    roles: Array<{ id: number; name: string; permissions: string[] }>;
    permissions: string[];
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Display notice if redirected from expired session
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setError("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      // Hit unified user authentication router
      const data = await apiFetch<UserAuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const token = data?.access_token;
      const tenantSlug = data?.user?.company_name;

      if (token && tenantSlug) {
        const userRoles = data.user.roles || [];
        const primaryRole = userRoles[0]?.name || "User";

        // 1. Store auth info in localStorage for apiFetch calls
        localStorage.setItem("access_token", token);
        localStorage.setItem("tenant_slug", tenantSlug);
        localStorage.setItem("user_data", JSON.stringify(data.user));

        // 2. Set cookies for middleware and client proxy routing
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `tenant_slug=${tenantSlug}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_role=${primaryRole}; path=/; max-age=86400; SameSite=Lax`;

        // 3. Redirect to workspace page
        router.push(`/${tenantSlug}/mypage`);
        router.refresh();
      } else {
        setError("Invalid response from server. Missing user credentials or tenant details.");
      }
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
          User Workspace Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm text-slate-600 font-medium">
              Email Address
            </label>
            <input
              suppressHydrationWarning
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
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
            className={`p-2.5 rounded font-bold text-white text-sm transition ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Sign In"}
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

        <div className="flex items-center justify-between text-sm mt-4">
          <span className="text-gray-500">Forgot credentials?</span>
          <Link
            href="/forgot-password"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
          >
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}