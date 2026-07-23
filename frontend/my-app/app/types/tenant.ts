export interface CreateTenantPayload {
  company_name: string;
  password: string;
  tenant_type: "general" | "insurance" | "legal";
}
export {}; // <--- Explicitly forces TypeScript to treat this file as a module