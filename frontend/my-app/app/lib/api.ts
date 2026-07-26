// lib/api.ts
import type { InsurancePolicy } from "@/app/types/insurancePolicy";
import type { DashboardStats } from "@/app/types/dashBoard";
import type { LegalCase, CaseNote, CaseDocument, CaseBillingEntry } from "@/app/types/legal";
import type { CreateTenantPayload } from "@/app/types/tenant";
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

export async function createLegalCase(
  tenant: string, 
  caseData: { client_id: number; case_number: string; case_type: string; court?: string; status?: string }
) {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant,
    },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to create case");
  }

  return res.json();
}

export async function fetchCaseDetails(tenant: string, caseId: number): Promise<LegalCase> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}`, {
    headers: { "X-Tenant": tenant },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch case details");
  }
  return res.json();
}

/**
 * Add a new note to a case
 */
export async function createCaseNote(
  tenant: string,
  caseId: number,
  noteData: { author_name: string; note_type: string; content: string; is_pinned?: boolean }
): Promise<CaseNote> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant,
    },
    body: JSON.stringify(noteData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to create case note");
  }

  return res.json();
}

/**
 * Upload a document to a case (multipart/form-data)
 */
export async function uploadCaseDocument(
  tenant: string,
  caseId: number,
  file: File,
  fileCategory: string = "General"
): Promise<CaseDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_category", fileCategory);

  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/documents`, {
    method: "POST",
    headers: {
      "X-Tenant": tenant, // Do NOT set Content-Type header here; browser auto-sets boundary for FormData
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to upload document");
  }

  return res.json();
}

/**
 * Log a billing entry for a case
 */
export async function createCaseBillingEntry(
  tenant: string,
  caseId: number,
  billingData: { description: string; hours: number; rate: number; total_amount: number; is_paid?: boolean }
): Promise<CaseBillingEntry> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/billing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant": tenant,
    },
    body: JSON.stringify(billingData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to create billing entry");
  }

  return res.json();
}

// --- SOFT DELETE / ARCHIVE HELPERS ---

export async function deleteCaseNote(tenant: string, caseId: number, noteId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/notes/${noteId}`, {
    method: "DELETE",
    headers: { "X-Tenant": tenant },
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

export async function archiveCaseDocument(tenant: string, caseId: number, docId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/documents/${docId}`, {
    method: "DELETE", // Matches @router.delete in Python
    headers: {
      "X-Tenant": tenant,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to archive document");
  }
}

export async function deleteCaseBillingEntry(tenant: string, caseId: number, entryId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}/billing/${entryId}`, {
    method: "DELETE",
    headers: { "X-Tenant": tenant },
  });
  if (!res.ok) throw new Error("Failed to delete billing entry");
}

export async function archiveLegalCase(tenant: string, caseId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/legal/cases/${caseId}`, {
        method: "DELETE",
        headers: {
            "X-Tenant": tenant,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to archive case");
    }
}