// lib/api.ts
import { InsurancePolicy } from "@/app/types/insurancePolicy";
import { DashboardStats } from "@/app/types/dashBoard";
import { LegalCase } from "@/app/types/legalCase";
import { CreateTenantPayload } from "@/app/types/tenant";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const fetchDashboardData = async (tenantName: string) => {
  const response = await fetch("http://127.0.0.1:8000/api/dashboard/clients", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenantName, 
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch client data");
  }

  return response.json();
};

export async function fetchClientDetails(tenant: string, clientName: string) {
    // Decode first to ensure clean raw string, then encode ONCE for URL path
    const cleanName = decodeURIComponent(clientName);
    const encodedName = encodeURIComponent(cleanName);

    const res = await fetch(`${API_BASE_URL}/api/clients/${encodedName}`, {
        headers: {
            "Content-Type": "application/json",
            "X-Tenant": tenant,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch client details (${res.status})`);
    }

    return await res.json();
}

export const fetchAllClients = async (tenantName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/clients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenantName,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch clients");
  return response.json();
};

export async function createClient(tenant: string, clientData: any) {
  const payload = {
    ...clientData,
    mail: clientData.email?.trim() || null,
    address: clientData.address?.trim() || null,
    status: clientData.status || "active",
    custom_fields: clientData.custom_fields || {},
  };

  const response = await fetch(`${API_BASE_URL}/api/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant, // CRITICAL
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.detail?.[0]?.msg || errorData?.detail || "Failed to create client";
    throw new Error(msg);
  }

  return await response.json();
}

export const loginTenant = async (companyName: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tenants/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_name: companyName, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Authentication failed");
  }

  return data;
};

export async function deleteClient(tenant: string, clientId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "DELETE",
    headers: {
      "X-Tenant": tenant,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to delete client");
  }
}

export const updateClient = async (tenantName: string, clientId: number, clientData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenantName,
    },
    body: JSON.stringify(clientData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail?.[0]?.msg || errorData?.detail || "Failed to update client");
  }

  return response.json();
};

// --- INSURANCE POLICY API HELPERS ---

export async function fetchClientPolicies(tenant: string, clientId: number) {
  const res = await fetch(`${API_BASE_URL}/api/insurance/clients/${clientId}/policies`, {
    headers: {
      "X-Tenant": tenant,
    },
  });

  if (!res.ok) {
    if (res.status === 403) return []; // Non-insurance tenant
    throw new Error("Failed to fetch policies");
  }
  return res.json();
}

export async function createPolicy(tenant: string, policy: { policy_number: string; coverage_amount: number; client_id: number }) {
  const res = await fetch(`${API_BASE_URL}/api/insurance/policies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant,
    },
    body: JSON.stringify(policy),
  });

  if (!res.ok) throw new Error("Failed to create policy");
  return res.json();
}

export async function deletePolicy(tenant: string, policyId: number) {
  const res = await fetch(`${API_BASE_URL}/api/insurance/policies/${policyId}`, {
    method: "DELETE",
    headers: {
      "X-Tenant": tenant,
    },
  });

  if (!res.ok) throw new Error("Failed to delete policy");
}

export async function fetchDashboardStats(tenant: string) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    headers: {
      "X-Tenant": tenant,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchClientCases(tenant: string, clientId: number): Promise<LegalCase[]> {
  const res = await fetch(`${API_BASE_URL}/api/legal/clients/${clientId}/cases`, {
    headers: { "X-Tenant": tenant },
  });

  if (!res.ok) {
    if (res.status === 403) return []; // Non-legal tenant
    throw new Error("Failed to fetch legal cases");
  }
  return res.json();
}

export async function createCase(
  tenant: string, 
  caseData: { case_number: string; case_type: string; court?: string; client_id: number }
) {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant,
    },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) throw new Error("Failed to create case");
  return res.json();
}

export async function deleteCase(tenant: string, caseId: number) {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}`, {
    method: "DELETE",
    headers: { "X-Tenant": tenant },
  });

  if (!res.ok) throw new Error("Failed to delete case");
}

export async function fetchLegalDashboardStats(tenant: string) {
  const res = await fetch(`${API_BASE_URL}/api/legal/dashboard/stats`, {
    headers: { "X-Tenant": tenant },
  });

  if (!res.ok) {
    if (res.status === 403) return null; // Graceful check for non-legal tenants
    throw new Error("Failed to fetch legal dashboard stats");
  }

  return res.json();
}

export async function createTenant(payload: CreateTenantPayload, adminSecret: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to provision tenant");
  }

  return await response.json();
}