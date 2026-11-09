"use client";

import { useParams } from "next/navigation";
import AuditLogTable from "@/app/components/AuditLogTable";
import Navbar from "@/app/components/Navbar";
import { PermissionGate } from "@/app/components/PermissionGate";

export default function AuditLogsPage() {
  const params = useParams();
  const tenantSlug = params?.tenant as string;

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <Navbar tenantName={tenantSlug} />
      <div className="p-6">
        <PermissionGate
          permission="audit:read"
          fallback={
            <div className="text-red-400 bg-red-950/30 border border-red-800 p-4 rounded-lg">
              You do not have permission to view audit logs.
            </div>
          }
        >
          {/* Explicitly pass tenantSlug to the table component */}
          <AuditLogTable tenantSlug={tenantSlug} />
        </PermissionGate>
      </div>
    </div>
  );
}