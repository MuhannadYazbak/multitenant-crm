"use client";

import { useEffect, useState } from "react";
import { fetchClientPolicies, createPolicy, deletePolicy } from "@/app/lib/api";
import { InsurancePolicy } from "../types/insurancePolicy";

interface Props {
  tenant: string;
  clientId: number;
}

export default function InsurancePolicies({ tenant, clientId }: Props) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInsuranceTenant, setIsInsuranceTenant] = useState(true);

  // New policy form state
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchClientPolicies(tenant, clientId)
      .then((data) => {
        setPolicies(data);
        setIsInsuranceTenant(true);
      })
      .catch((err) => {
        console.warn("Not an insurance tenant or error fetching policies:", err);
        setIsInsuranceTenant(false);
      })
      .finally(() => setLoading(false));
  }, [tenant, clientId]);

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim() || !coverageAmount) return;

    setAdding(true);
    try {
      const newPolicy = await createPolicy(tenant, {
        policy_number: policyNumber.trim(),
        coverage_amount: parseFloat(coverageAmount),
        client_id: clientId,
      });
      setPolicies([...policies, newPolicy]);
      setPolicyNumber("");
      setCoverageAmount("");
    } catch (err: any) {
      alert(err.message || "Error adding policy");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (policyId: number) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      await deletePolicy(tenant, policyId);
      setPolicies(policies.filter((p) => p.id !== policyId));
    } catch (err: any) {
      alert(err.message || "Failed to delete policy");
    }
  };

  // If this tenant isn't an insurance agency, don't render this module
  if (!isInsuranceTenant) return null;

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm max-w-md space-y-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-200">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          🛡️ Insurance Policies
        </h3>
        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
          {policies.length} Active
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Loading policy records...</p>
      ) : (
        <div className="space-y-3">
          {/* Policy List */}
          {policies.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No insurance policies found for this client.</p>
          ) : (
            <ul className="space-y-2">
              {policies.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">Policy #: {p.policy_number}</p>
                    <p className="text-gray-500">Coverage: ${p.coverage_amount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-xs"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add New Policy Form */}
          <form onSubmit={handleAddPolicy} className="pt-3 border-t space-y-2">
            <p className="font-semibold text-xs text-gray-500 uppercase">Add New Policy</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Policy Number"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className="w-1/2 p-1.5 border rounded text-xs"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Coverage ($)"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(e.target.value)}
                className="w-1/2 p-1.5 border rounded text-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "+ Add Policy"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}