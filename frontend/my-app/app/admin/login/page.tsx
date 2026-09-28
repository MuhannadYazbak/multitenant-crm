"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import { AuthResponse } from "@/app/types/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    // 1. Send request directly without swallowing errors in a .catch()
    const data = await apiFetch<AuthResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: email.trim(),
        password: password.trim(),
      }),
    });

    // 2. Safely extract token and roles
    const token = data?.access_token;
    if (!token) {
      throw new Error("No access token returned from server.");
    }

    const userRoles = data.user?.roles || [];
    const primaryRole = userRoles[0]?.name || "admin";

    // 3. Persist tokens and user details
    localStorage.setItem("access_token", token);
    localStorage.setItem("admin_token", token);
    if (data.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
    }

    // 4. Set cookies for proxy middleware
    document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `user_role=${primaryRole}; path=/; max-age=86400; SameSite=Lax`;

    // 5. Navigate to admin portal
    window.location.href = "/admin/dashboard";

  } catch (err: any) {
    // Catch error thrown by apiFetch (e.g. 401 "Invalid credentials", 403 "Forbidden", or network failure)
    setError(err.message || "An unexpected error occurred during login.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider rounded-full mb-2">
            System Administration
          </span>
          <h1 className="text-2xl font-bold text-white">Admin Console</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in with your unified user account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-150 flex items-center justify-center"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="flex flex-col items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-700/60 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tenant Login
          </Link>
        </div>
      </div>
    </div>
  );
}


// // app/admin/login/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const [usernameInput, setUsernameInput] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const cleanInput = usernameInput.trim();
      
//       // Extract username prefix if user typed an email address (e.g., admin@example.com -> admin)
//       const sanitizedUsername = cleanInput.includes("@")
//         ? cleanInput.split("@")[0]
//         : cleanInput;

//       const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: sanitizedUsername,
//           password: password.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         const message =
//           typeof data.detail === "object"
//             ? JSON.stringify(data.detail)
//             : data.detail;
//         throw new Error(message || "Authentication failed");
//       }

//       // Extract access token
//       const token = data.access_token || data.token;

//       if (token) {
//         localStorage.setItem("access_token", token);
//         localStorage.setItem("admin_token", token);

//         document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
//         document.cookie = `is_admin=true; path=/; max-age=86400; SameSite=Lax`;

//         router.refresh();
//         router.push("/admin/dashboard");
//       } else {
//         throw new Error("Invalid response from server. Missing access token.");
//       }
//     } catch (err: any) {
//       setError(err.message || "An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
//       <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">

//         {/* Header */}
//         <div className="mb-6 text-center">
//           <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider rounded-full mb-2">
//             System Administration
//           </span>
//           <h1 className="text-2xl font-bold text-white">Admin Console</h1>
//           <p className="text-sm text-slate-400 mt-1">
//             Sign in to manage workspaces & platform status
//           </p>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg break-words text-xs">
//             {error}
//           </div>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
//               Admin Username / Email
//             </label>
//             <input
//               type="text"
//               required
//               value={usernameInput}
//               onChange={(e) => setUsernameInput(e.target.value)}
//               placeholder="e.g. admin or admin@example.com"
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-150 flex items-center justify-center"
//           >
//             {loading ? "Authenticating..." : "Sign In to Admin Portal"}
//           </button>
//         </form>

//         {/* Links */}
//         <div className="flex flex-col items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-700/60 text-center">
//           <Link
//             href="/"
//             className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors gap-1.5"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M10 19l-7-7m0 0l7-7m-7 7h18"
//               />
//             </svg>
//             Back to Tenant Login
//           </Link>
//           <Link
//             href="/forgot-password"
//             className="text-xs text-blue-400 hover:underline font-medium"
//           >
//             Forgot Password?
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }