export interface VerticalStats {
  // Insurance fields
  total_policies?: number;
  total_coverage?: number;

  // Legal fields
  total_cases?: number;
  open_cases?: number;
}

export interface DashboardStats {
  tenant_type: "insurance" | "legal" | "general" | string;
  total_clients: number;
  vertical_stats?: VerticalStats;
}
export {}; // <--- Explicitly forces TypeScript to treat this file as a module