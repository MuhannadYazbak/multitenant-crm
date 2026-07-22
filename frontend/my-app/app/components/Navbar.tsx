// app/components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";

interface NavbarProps {
  tenantName: string;
}

export default function Navbar({ tenantName }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any token or session storage if added later
    // localStorage.removeItem("token"); 

    // Redirect straight back to the login page
    router.push("/");
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-slate-800 text-white shadow-md relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">
          Workspace
        </span>
        <h1 className="text-lg font-bold capitalize">{tenantName}</h1>
      </div>

      <button
        suppressHydrationWarning
        onClick={() => router.push("/")}
        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition font-medium"
      >
        Log Out
      </button>
    </header>
  );
}

//   return (
//     <header className="flex justify-between items-center px-6 py-4 bg-slate-800 text-white shadow-md">
//       <div className="flex items-center gap-2">
//         <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">
//           Workspace
//         </span>
//         <h1 className="text-lg font-bold capitalize">{tenantName}</h1>
//       </div>

//       <button
//         onClick={handleLogout}
//         className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition font-medium"
//       >
//         Log Out
//       </button>
//     </header>
//   );
// }