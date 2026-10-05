// app/[tenant]/mypage/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TenantUserManagement from "@/app/components/TenantUserManagement";
import Navbar from "@/app/components/Navbar";

export default function TenantUsersPage() {
  const router = useRouter();
  const params = useParams();
  
  // Gracefully resolve tenant parameter from params (handles [tenant] or [slug])
  const rawTenant = params?.tenant || params?.slug;
  const tenantSlug = Array.isArray(rawTenant) ? rawTenant[0] : rawTenant;

  const [isManager, setIsManager] = useState<boolean | null>(null);

  useEffect(() => {
    if (!tenantSlug) return;

    const rawUserData = localStorage.getItem("user_data");
    if (rawUserData) {
      try {
        const user = JSON.parse(rawUserData);
        const roles: string[] = user.roles?.map((r: any) => r.name) || [];
        const hasManagerAccess = roles.includes("Manager") || roles.includes("Admin");

        if (!hasManagerAccess) {
          router.push(`/${tenantSlug}/mypage`);
        } else {
          setIsManager(true);
        }
      } catch (err) {
        console.error("Failed to parse user data", err);
        router.push(`/${tenantSlug}/mypage`);
      }
    } else {
      router.push(`/${tenantSlug}/mypage`);
    }
  }, [tenantSlug, router]);

  if (!tenantSlug || isManager === null) {
    return <div className="p-8 text-slate-500 font-medium">Loading workspace users...</div>;
  }

  return (
    // <div className="p-8 max-w-7xl mx-auto">
    <div className="min-h-screen bg-slate-50">
      <Navbar tenantName={tenantSlug}/>
      <TenantUserManagement tenantSlug={tenantSlug} />
      <div className="flex justify-center items-center font-semibold pt-3">
        <button className="bg-indigo-200 hover:bg-indigo-300" onClick={()=>router.back()}>Back</button>
        </div>
    </div>
  );
}