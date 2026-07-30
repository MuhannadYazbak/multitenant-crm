// app/components/InsurancePolicies.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchClientPolicies, createPolicy, deletePolicy } from "@/app/lib/api";
import { InsurancePolicy } from "../types/insurancePolicy";
import TabsSection from "./TabsSections";

interface Props {
  tenant: string;
  clientId: number;
}

export default function InsurancePolicies({ tenant, clientId }: Props) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [isInsuranceTenant, setIsInsuranceTenant] = useState(true);

  // New policy modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [creating, setCreating] = useState(false);

  // Drawer states
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);

  // Track mounted state to prevent background state updates on unmounted component
  const isMountedRef = useRef(true);

  const loadPolicies = useCallback(async () => {
    if (!tenant || !clientId) return;

    try {
      setLoadingPolicies(true);
      const data = await fetchClientPolicies(tenant, clientId);
      if (isMountedRef.current) {
        setPolicies(data || []);
        setIsInsuranceTenant(true);
      }
    } catch (err) {
      console.warn("Not an insurance tenant or error fetching policies:", err);
      if (isMountedRef.current) {
        setIsInsuranceTenant(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPolicies(false);
      }
    }
  }, [tenant, clientId]);

  useEffect(() => {
    isMountedRef.current = true;
    loadPolicies();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadPolicies]);


  // Handle New Policy Creation
  // Handle New Policy Creation
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim() || !coverageAmount) return;

    setCreating(true);
    try {
      // 1. Capture the newly created policy returned by the API
      const newPolicy = await createPolicy(tenant, {
        policy_number: policyNumber.trim(),
        coverage_amount: parseFloat(coverageAmount),
        client_id: clientId,
      });

      // 2. Immediately update local state so the UI reflects it without waiting for re-fetch
      if (newPolicy && isMountedRef.current) {
        setPolicies((prevPolicies) => [newPolicy, ...prevPolicies]);
      }

      // 3. Reset form & close modal
      setPolicyNumber("");
      setCoverageAmount("");
      setIsCreateOpen(false);

      // 4. (Optional) Re-sync with backend in background to keep data completely consistent
      loadPolicies();
    } catch (err: any) {
      alert(err.message || "Error adding policy");
    } finally {
      if (isMountedRef.current) setCreating(false);
    }
  };

  const handleDelete = async (policyId: number) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      await deletePolicy(tenant, policyId);
      if (selectedPolicy?.id === policyId) {
        setSelectedPolicy(null);
      }
      await loadPolicies();
    } catch (err: any) {
      alert(err.message || "Failed to delete policy");
    }
  };

  const handleOpenDrawer = (policy: InsurancePolicy) => {
    setSelectedPolicy(policy);
  };

  const handleCloseDrawer = () => {
    setSelectedPolicy(null);
  };

  // Do not render component if tenant is not configured for insurance
  if (!isInsuranceTenant) return null;

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          🛡️ Insurance Policies
        </h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium transition"
        >
          + Add New Policy
        </button>
      </div>

      {/* Policies Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
            <tr>
              <th className="p-3">Policy Number</th>
              <th className="p-3">Coverage Amount</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loadingPolicies ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-400">
                  Loading policy records...
                </td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                  No insurance policies found for this client.
                </td>
              </tr>
            ) : (
              policies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-900">{p.policy_number}</td>
                  <td className="p-3 font-semibold text-slate-700">
                    ${p.coverage_amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDrawer(p)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      >
                        Manage Policy &rarr;
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-medium transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE POLICY MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Policy</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-2026-99"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Coverage Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500000"
                  value={coverageAmount}
                  onChange={(e) => setCoverageAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium disabled:opacity-50 transition"
                >
                  {creating ? "Creating..." : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SLIDE-OVER DRAWER FOR POLICY DETAILS & TABS --- */}
      {selectedPolicy !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  🛡️ Policy: {selectedPolicy.policy_number}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Coverage: ${selectedPolicy.coverage_amount.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(selectedPolicy.id)}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-medium transition"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={handleCloseDrawer}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-semibold px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsSection
                tenant={tenant}
                entityType="insurance_policy"
                entityId={selectedPolicy.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}