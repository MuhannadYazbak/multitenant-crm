"use client";

import { ReactNode } from "react";
import { User } from "@/app/types/auth";

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  if (typeof window === "undefined") return null;

  const userRaw = localStorage.getItem("user_data");
  if (!userRaw) return <>{fallback}</>;

  try {
    const user: User = JSON.parse(userRaw);
    const userPermissions = user.roles.flatMap((role) => role.permissions);

    const hasPermission = userPermissions.includes(permission) || userPermissions.includes("*");

    return hasPermission ? <>{children}</> : <>{fallback}</>;
  } catch {
    return <>{fallback}</>;
  }
}