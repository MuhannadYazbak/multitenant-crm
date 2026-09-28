// // app/components/Navbar.tsx
// "use client";

// import { useRouter } from "next/navigation";

// interface NavbarProps {
//   tenantName: string;
// }

// export default function Navbar({ tenantName }: NavbarProps) {
//   const router = useRouter();

//   const handleLogout = () => {
//     document.cookie = "auth_token=; path=/; max-age=0;";
//     document.cookie = "user_tenant=; path=/; max-age=0;";
//     router.push("/");
//     router.refresh();
//   };

//   return (
//     <header className="w-full flex justify-between items-center px-6 py-4 bg-slate-800 text-white shadow-md relative z-10">
//       <div className="flex items-center gap-2">
//         <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">
//           Workspace
//         </span>
//         <h1 className="text-lg font-bold capitalize">{tenantName}</h1>
//       </div>
  
//       <button
//         suppressHydrationWarning
//         onClick={handleLogout}
//         className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition font-medium"
//       >
//         Log Out
//       </button>
//     </header>
//   );
// }

// app/components/Navbar.tsx

// app/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LastActivityWidget from "./LastActivityWidget";
import { User } from "@/app/types/auth";

interface NavbarProps {
  tenantName: string;
}

export default function Navbar({ tenantName }: NavbarProps) {
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;

  const [userRoleIds, setUserRoleIds] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userRaw = localStorage.getItem("user_data");
    if (userRaw) {
      try {
        const user: User = JSON.parse(userRaw);
        // Extract role IDs from user object
        const roles = user.roles?.map((r) => r.id) || [];
        setUserRoleIds(roles);
      } catch (err) {
        console.error("Failed to parse user_data from localStorage", err);
      }
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0;";
    document.cookie = "user_tenant=; path=/; max-age=0;";
    localStorage.removeItem("user_data");
    router.push("/");
    router.refresh();
  };

  const isManagementRole = userRoleIds.some((id) => [1, 2, 4].includes(id));

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-slate-800 text-white shadow-md relative z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">
            Workspace
          </span>
          <h1 className="text-lg font-bold capitalize">{tenantName}</h1>
        </div>

        {/* Link visible only for Admins (1, 4) and Managers (2) */}
        {mounted && isManagementRole && tenant && (
          <Link
            href={`/${tenant}/mypage/audit-logs`}
            className="text-sm text-slate-300 hover:text-sky-400 transition"
          >
            Audit Logs
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Render Last Activity Widget for Editors (5) and Viewers (3) */}
        {mounted && !isManagementRole && <LastActivityWidget tenant={tenant} />}

        <button
          suppressHydrationWarning
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition font-medium"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}