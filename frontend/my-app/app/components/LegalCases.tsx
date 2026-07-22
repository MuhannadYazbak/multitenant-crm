"use client";

import { useEffect, useState } from "react";
import { fetchClientCases, createCase, deleteCase } from "@/app/lib/api";
import { LegalCase } from "../types/legalCase";

interface Props {
  tenant: string;
  clientId: number;
}

export default function LegalCases({ tenant, clientId }: Props) {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLegalTenant, setIsLegalTenant] = useState(true);

  // Form state
  const [caseNumber, setCaseNumber] = useState("");
  const [caseType, setCaseType] = useState("Litigation");
  const [court, setCourt] = useState("");

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    fetchClientCases(tenant, clientId)
      .then((data) => {
        setCases(data);
        setIsLegalTenant(true);
      })
      .catch(() => setIsLegalTenant(false))
      .finally(() => setLoading(false));
  }, [tenant, clientId]);

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛑 DON'T DO THIS: if (clientId === undefined) return; 
    // ✅ DO THIS: Use client.id directly from props/parent state
    if (!clientId) {
        alert("Client ID is missing. Please wait for profile to load.");
        return;
    }

    const payload = {
        case_number: caseNumber.trim(),
        case_type: caseType.trim(),
        court: court.trim() || null,
        status: "Open",
        client_id: clientId, // Explicit synchronous reference
    };

    try {
        const res = await fetch("http://localhost:8000/api/legal/cases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant": tenant,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to create legal case");
        }

        const newCase = await res.json();
        
        // Instant state update for smooth UI
        setCases((prev) => [...prev, newCase]);
        setCaseNumber("");
        setCaseType("");
        setCourt("");
    } catch (err: any) {
        console.error("Error creating legal case:", err);
        alert(err.message || "Failed to add case.");
    }
};

  const handleDeleteCase = async (caseId: number) => {
    try {
      await deleteCase(tenant, caseId);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch (err) {
      console.error("Failed to delete case:", err);
    }
  };

  if (loading || !isLegalTenant) return null;

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 max-w-md w-full">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          ⚖️ Active Legal Cases
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
          {cases.length} Active
        </span>
      </div>

      {/* Case List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {cases.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No legal cases found for this client.</p>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center text-xs"
            >
              <div>
                <p className="font-bold text-slate-800">Case #: {c.case_number}</p>
                <p className="text-slate-500">{c.case_type} {c.court ? `• ${c.court}` : ""}</p>
              </div>
              <button
                onClick={() => handleDeleteCase(c.id)}
                className="text-red-500 hover:text-red-700 font-bold px-1"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Case Form */}
      <form onSubmit={handleAddCase} className="pt-3 border-t space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase">Add New Case</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Case #"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            className="p-1.5 border rounded text-xs"
            required
          />
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="p-1.5 border rounded text-xs bg-white"
          >
            <option value="Litigation">Litigation</option>
            <option value="Corporate">Corporate</option>
            <option value="Family">Family</option>
            <option value="Real Estate">Real Estate</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Court / Jurisdiction (Optional)"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          className="w-full p-1.5 border rounded text-xs"
        />
        <button
          type="submit"
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition"
        >
          + Add Case
        </button>
      </form>
    </div>
  );
}