// lib/api.ts
import type { InsurancePolicy } from "@/app/types/insurancePolicy";
import type { DashboardStats } from "@/app/types/dashBoard";
import type { LegalCase, CaseNote, CaseDocument, CaseBillingEntry } from "@/app/types/legal";
import type { CreateTenantPayload } from "@/app/types/tenant";
import { VehicleData, VehicleResponse } from "@/app/types/vehicle";
import { PropertyData, PropertyResponse } from "@/app/types/property";
import { EvidenceData, EvidenceResponse } from "../types/evidence";
import { WitnessData, WitnessResponse } from "../types/witness";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STRIPE_SERVICE_URL = process.env.NEXT_PUBLIC_STRIPE_SERVICE_URL || "https://paymentsmicroservice.onrender.com";

/**
 * Universal fetch wrapper injecting Bearer token, tenant header, and handling 401/403 responses.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  tenant?: string
): Promise<T> {
  // 1. Fall back to admin_token if access_token is empty
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("admin_token")
      : null;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (tenant) {
    headers["X-Tenant"] = tenant;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Check if current request is a login/auth endpoint
  const isAuthRoute =
    endpoint.includes("/login") || endpoint.includes("/auth");

  // 2. Handle Session Expiration (Skip redirect if hitting a login route)
  if (response.status === 401) {
    if (!isAuthRoute) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("user_data");
        window.location.href = "/?expired=true";
      }
      throw new Error("Session expired. Please log in again.");
    }

    // For login failures, parse the actual backend error message (e.g. "Invalid credentials")
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Invalid credentials.");
  }

  // Handle RBAC / Tenant Access Forbidden
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Forbidden: You lack permission to perform this action."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      typeof errorData?.detail === "object"
        ? JSON.stringify(errorData.detail)
        : errorData?.detail || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Return raw json or empty object for 204 No Content
  if (response.status === 204) return {} as T;
  return response.json();
}

// --- CLIENT APIS ---

export const fetchDashboardData = async (tenantName: string) => {
  return apiFetch("/api/dashboard/clients", { method: "GET" }, tenantName);
};

export async function fetchClientDetails(tenant: string, clientName: string) {
  const cleanName = decodeURIComponent(clientName);
  const encodedName = encodeURIComponent(cleanName);
  return apiFetch(`/api/clients/${encodedName}`, { method: "GET" }, tenant);
}

export const fetchAllClients = async (tenantName: string) => {
  return apiFetch("/api/clients", { method: "GET" }, tenantName);
};

export async function createClient(tenant: string, clientData: any) {
  const payload = {
    ...clientData,
    mail: clientData.email?.trim() || null,
    address: clientData.address?.trim() || null,
    status: clientData.status || "active",
    custom_fields: clientData.custom_fields || {},
  };

  return apiFetch("/api/clients", { method: "POST", body: JSON.stringify(payload) }, tenant);
}

export const loginTenant = async (companyName: string, password: string) => {
  return apiFetch("/api/tenants/login", {
    method: "POST",
    body: JSON.stringify({ company_name: companyName, password }),
  });
};

export async function deleteClient(tenant: string, clientId: number): Promise<void> {
  return apiFetch(`/api/clients/${clientId}`, { method: "DELETE" }, tenant);
}

export const updateClient = async (tenantName: string, clientId: number, clientData: any) => {
  return apiFetch(`/api/clients/${clientId}`, { method: "PUT", body: JSON.stringify(clientData) }, tenantName);
}

// --- INSURANCE POLICY API HELPERS ---

export async function fetchClientPolicies(tenant: string, clientId: number) {
  try {
    return await apiFetch(`/api/insurance/clients/${clientId}/policies`, { method: "GET" }, tenant);
  } catch (err: any) {
    if (err.message?.includes("Forbidden")) return []; // Graceful fallback for non-insurance tenants
    throw err;
  }
}

export async function createPolicy(tenant: string, policy: { policy_number: string; coverage_amount: number; client_id: number }) {
  return apiFetch("/api/insurance/policies", { method: "POST", body: JSON.stringify(policy) }, tenant);
}

export async function deletePolicy(tenant: string, policyId: number) {
  return apiFetch(`/api/insurance/policies/${policyId}`, { method: "DELETE" }, tenant);
}

export async function fetchDashboardStats(tenant: string) {
  return apiFetch("/api/dashboard/stats", { method: "GET" }, tenant);
}

export async function fetchClientCases(tenant: string, clientId: number): Promise<LegalCase[]> {
  try {
    return await apiFetch(`/api/legal/clients/${clientId}/cases`, { method: "GET" }, tenant);
  } catch (err: any) {
    if (err.message?.includes("Forbidden")) return []; // Graceful fallback for non-legal tenants
    throw err;
  }
}

export async function createCase(
  tenant: string,
  caseData: { case_number: string; case_type: string; court?: string; client_id: number }
) {
  return apiFetch("/api/legal/cases", { method: "POST", body: JSON.stringify(caseData) }, tenant);
}

export async function deleteCase(tenant: string, caseId: number) {
  return apiFetch(`/api/legal/cases/${caseId}`, { method: "DELETE" }, tenant);
}

export async function fetchLegalDashboardStats(tenant: string) {
  try {
    return await apiFetch("/api/legal/dashboard/stats", { method: "GET" }, tenant);
  } catch (err: any) {
    if (err.message?.includes("Forbidden")) return null;
    throw err;
  }
}

export async function createTenant(payload: CreateTenantPayload, adminSecret: string) {
  return apiFetch("/api/admin/tenants", {
    method: "POST",
    headers: { "x-admin-secret": adminSecret },
    body: JSON.stringify(payload),
  });
}

export async function createLegalCase(
  tenant: string,
  caseData: { client_id: number; case_number: string; case_type: string; court?: string; status?: string }
) {
  return apiFetch("/api/legal/cases", { method: "POST", body: JSON.stringify(caseData) }, tenant);
}

export async function fetchCaseDetails(tenant: string, caseId: number): Promise<LegalCase> {
  return apiFetch(`/api/legal/cases/${caseId}`, { method: "GET" }, tenant);
}

export async function createCaseNote(
  tenant: string,
  caseId: number,
  noteData: { author_name: string; note_type: string; content: string; is_pinned?: boolean }
): Promise<CaseNote> {
  return apiFetch(`/api/legal/cases/${caseId}/notes`, { method: "POST", body: JSON.stringify(noteData) }, tenant);
}

export async function uploadCaseDocument(
  tenant: string,
  caseId: number,
  file: File,
  fileCategory: string = "General"
): Promise<CaseDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_category", fileCategory);

  return apiFetch(`/api/legal/cases/${caseId}/documents`, { method: "POST", body: formData }, tenant);
}

export async function createCaseBillingEntry(
  tenant: string,
  caseId: number,
  billingData: { description: string; hours: number; rate: number; total_amount: number; is_paid?: boolean }
): Promise<CaseBillingEntry> {
  return apiFetch(`/api/legal/cases/${caseId}/billing`, { method: "POST", body: JSON.stringify(billingData) }, tenant);
}

export async function deleteCaseNote(tenant: string, caseId: number, noteId: number): Promise<void> {
  return apiFetch(`/api/legal/cases/${caseId}/notes/${noteId}`, { method: "DELETE" }, tenant);
}

export async function archiveCaseDocument(tenant: string, caseId: number, docId: number): Promise<void> {
  return apiFetch(`/api/legal/cases/${caseId}/documents/${docId}`, { method: "DELETE" }, tenant);
}

export async function deleteCaseBillingEntry(tenant: string, caseId: number, entryId: number): Promise<void> {
  return apiFetch(`/api/legal/cases/${caseId}/billing/${entryId}`, { method: "DELETE" }, tenant);
}

export async function archiveLegalCase(tenant: string, caseId: number): Promise<void> {
  return apiFetch(`/api/legal/cases/${caseId}`, { method: "DELETE" }, tenant);
}

// --- UNIVERSAL TABS API HELPERS ---

export async function fetchEntityNotes(tenant: string, entityType: string, entityId: number) {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/notes`, { method: "GET" }, tenant);
}

export async function createEntityNote(
  tenant: string,
  entityType: string,
  entityId: number,
  noteData: { author_name: string; note_type: string; content: string; is_pinned?: boolean }
) {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/notes`, { method: "POST", body: JSON.stringify(noteData) }, tenant);
}

export async function deleteEntityNote(
  tenant: string,
  entityType: string,
  entityId: number,
  noteId: number
): Promise<void> {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/notes/${noteId}`, { method: "DELETE" }, tenant);
}

export async function fetchEntityDocuments(
  tenant: string,
  entityType: string,
  entityId: number,
  showArchived: boolean = false
) {
  const url = `/api/tabs/${entityType}/${entityId}/documents${showArchived ? "?show_archived=true" : ""}`;
  return apiFetch(url, { method: "GET" }, tenant);
}

export async function uploadEntityDocument(
  tenant: string,
  entityType: string,
  entityId: number,
  file: File,
  fileCategory: string = "General"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_category", fileCategory);

  return apiFetch(`/api/tabs/${entityType}/${entityId}/documents`, { method: "POST", body: formData }, tenant);
}

export async function archiveEntityDocument(
  tenant: string,
  entityType: string,
  entityId: number,
  docId: number
): Promise<void> {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/documents/${docId}/archive`, { method: "PUT" }, tenant);
}

export async function fetchEntityBilling(tenant: string, entityType: string, entityId: number) {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/billing`, { method: "GET" }, tenant);
}

export async function createEntityBilling(
  tenant: string,
  entityType: string,
  entityId: number,
  billingData: { description: string; hours: number; rate: number; total_amount: number; is_paid?: boolean }
) {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/billing`, { method: "POST", body: JSON.stringify(billingData) }, tenant);
}

export async function deleteEntityBilling(
  tenant: string,
  entityType: string,
  entityId: number,
  billingId: number
): Promise<void> {
  return apiFetch(`/api/tabs/${entityType}/${entityId}/billing/${billingId}`, { method: "DELETE" }, tenant);
}

// --- VEHICLES ---

export async function fetchClientVehicles(tenant: string, clientId: number): Promise<VehicleResponse[]> {
  return apiFetch(`/api/insurance/clients/${clientId}/vehicles`, { method: "GET" }, tenant);
}

export async function createClientVehicle(tenant: string, clientId: number, vehicleData: VehicleData): Promise<VehicleResponse> {
  return apiFetch(`/api/insurance/clients/${clientId}/vehicles`, { method: "POST", body: JSON.stringify(vehicleData) }, tenant);
}

export async function updateVehicle(tenant: string, vehicleId: string, vehicleData: VehicleData): Promise<VehicleResponse> {
  return apiFetch(`/api/insurance/vehicles/${vehicleId}`, { method: "PUT", body: JSON.stringify(vehicleData) }, tenant);
}

export async function deleteVehicle(tenant: string, vehicleId: string): Promise<void> {
  return apiFetch(`/api/insurance/vehicles/${vehicleId}`, { method: "DELETE" }, tenant);
}

// --- PROPERTIES ---

export async function fetchClientProperties(tenant: string, clientId: number): Promise<PropertyResponse[]> {
  return apiFetch(`/api/insurance/clients/${clientId}/properties`, { method: "GET" }, tenant);
}

export async function createClientProperty(tenant: string, clientId: number, propertyData: PropertyData): Promise<PropertyResponse> {
  return apiFetch(`/api/insurance/clients/${clientId}/properties`, { method: "POST", body: JSON.stringify(propertyData) }, tenant);
}

export async function updateProperty(tenant: string, propertyId: string, propertyData: PropertyData): Promise<PropertyResponse> {
  return apiFetch(`/api/insurance/properties/${propertyId}`, { method: "PUT", body: JSON.stringify(propertyData) }, tenant);
}

export async function deleteProperty(tenant: string, propertyId: string): Promise<void> {
  return apiFetch(`/api/insurance/properties/${propertyId}`, { method: "DELETE" }, tenant);
}

// --- EVIDENCE ---

export async function fetchClientEvidences(tenant: string, clientId: number): Promise<EvidenceResponse[]> {
  return apiFetch(`/api/legal/clients/${clientId}/evidences`, { method: "GET" }, tenant);
}

export async function createClientEvidence(tenant: string, clientId: number, evidenceData: EvidenceData): Promise<EvidenceResponse> {
  return apiFetch(`/api/legal/clients/${clientId}/evidences`, { method: "POST", body: JSON.stringify(evidenceData) }, tenant);
}

export async function updateEvidence(tenant: string, evidenceId: string, evidenceData: EvidenceData): Promise<EvidenceResponse> {
  return apiFetch(`/api/legal/evidences/${evidenceId}`, { method: "PUT", body: JSON.stringify(evidenceData) }, tenant);
}

export async function deleteEvidence(tenant: string, evidenceId: string): Promise<void> {
  return apiFetch(`/api/legal/evidences/${evidenceId}`, { method: "DELETE" }, tenant);
}

// --- WITNESS ---

export async function fetchClientWitnesses(tenant: string, clientId: number): Promise<WitnessResponse[]> {
  return apiFetch(`/api/legal/clients/${clientId}/witnesses`, { method: "GET" }, tenant);
}

export async function createClientWitness(tenant: string, clientId: number, witnessData: WitnessData): Promise<WitnessResponse> {
  return apiFetch(`/api/legal/clients/${clientId}/witnesses`, { method: "POST", body: JSON.stringify(witnessData) }, tenant);
}

export async function updateWitness(tenant: string, witnessId: string, witnessData: WitnessData): Promise<WitnessResponse> {
  return apiFetch(`/api/legal/witnesses/${witnessId}`, { method: "PUT", body: JSON.stringify(witnessData) }, tenant);
}

export async function deleteWitness(tenant: string, witnessId: string): Promise<void> {
  return apiFetch(`/api/legal/witnesses/${witnessId}`, { method: "DELETE" }, tenant);
}

async function handleSubscribe(tenantId: string, priceId: string) {
  priceId = "";
  try {
    const response = await fetch(`${STRIPE_SERVICE_URL}/api/v1/subscriptions/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: `${window.location.origin}/`,
        cancel_url: `${window.location.origin}/dashboard?subscription=cancelled`,
      }),
    });

    const data = await response.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    }
  } catch (err) {
    console.error("Failed to initiate subscription:", err);
  }
}