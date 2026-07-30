'use client';

import { useState, useEffect, useCallback } from 'react';
import { LegalCase } from '@/app/types/legal';
import { fetchClientCases, fetchCaseDetails, archiveLegalCase, createLegalCase } from '@/app/lib/api';
import TabsSection from './TabsSections';
import NotesTab from './NotesTab'
import DocumentsTab from './DocumentsTab'
import BillingTab from './BillingTab'

interface LegalCasesProps {
  tenant: string;
  clientId: number;
}

export default function LegalCases({ tenant, clientId }: LegalCasesProps) {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  // New Case Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [caseType, setCaseType] = useState('Civil Litigation');
  const [court, setCourt] = useState('');
  const [creating, setCreating] = useState(false);

  // Drawer / Modal states
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [activeCase, setActiveCase] = useState<LegalCase | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'documents' | 'billing'>('notes');

  const loadCases = useCallback(async () => {
    try {
      setLoadingCases(true);
      const data = await fetchClientCases(tenant, clientId);
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch legal cases:', err);
    } finally {
      setLoadingCases(false);
    }
  }, [tenant, clientId]);

  useEffect(() => {
    if (clientId) loadCases();
  }, [clientId, loadCases]);

  // Handle New Case Creation
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await createLegalCase(tenant, {
        client_id: clientId,
        case_number: caseNumber,
        case_type: caseType,
        court: court || undefined,
        status: 'Open',
      });

      // Reset form and close modal
      setCaseNumber('');
      setCourt('');
      setIsCreateOpen(false);
      loadCases(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to create case');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCaseDrawer = async (caseId: number) => {
    setSelectedCaseId(caseId);
    setLoadingDetails(true);
    try {
      const data = await fetchCaseDetails(tenant, caseId);
      setActiveCase(data);
    } catch (err) {
      alert('Failed to load case details');
      setSelectedCaseId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedCaseId(null);
    setActiveCase(null);
    loadCases();
  };

  const refreshActiveCase = async () => {
    if (selectedCaseId) {
      const data = await fetchCaseDetails(tenant, selectedCaseId);
      setActiveCase(data);
    }
  };

  const handleArchiveCase = async (targetCase: LegalCase) => {
    if (confirm(`Are you sure you want to archive case ${targetCase.case_number}?`)) {
      try {
        await archiveLegalCase(tenant, targetCase.id);
        alert('Case archived successfully.');

        if (selectedCaseId === targetCase.id) {
          handleCloseDrawer();
        } else {
          loadCases();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to archive case');
      }
    }
  };

  const activeCases = cases.filter((c) => c.status !== 'Archived');

  return (
    <div className="space-y-4">
      {/* Top Header Bar with Add Case Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Client Legal Cases</h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add New Case
        </button>
      </div>

      {/* Cases Table */}
      <div className="flex bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
            <tr>
              <th className="p-3">Case Number</th>
              <th className="p-3">Type</th>
              <th className="p-3">Court</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loadingCases ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  Loading client cases...
                </td>
              </tr>
            ) : activeCases.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                  No active legal cases assigned to this client.
                </td>
              </tr>
            ) : (
              activeCases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-100 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{c.case_number}</td>
                  <td className="p-3">{c.case_type}</td>
                  <td className="p-3">{c.court || 'N/A'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex flex-col  items-start justify-center gap-2">
                      <button
                        onClick={() => handleOpenCaseDrawer(c.id)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Manage Case &rarr;
                      </button>
                      <button
                        onClick={() => handleArchiveCase(c)}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-medium transition"
                      >
                        🗑️ Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE CASE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Create New Legal Case</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Case Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAS-2026-001"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Case Type
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-white"
                >
                  <option value="Civil Litigation">Civil Litigation</option>
                  <option value="Commercial Dispute">Commercial Dispute</option>
                  <option value="Employment Law">Employment Law</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Court / Jurisdiction (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haifa District Court"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SLIDE-OVER DRAWER FOR CASE DETAILS & TABS --- */}
      {selectedCaseId !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  {activeCase ? activeCase.case_number : 'Loading...'}
                  {activeCase && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      {activeCase.status}
                    </span>
                  )}
                </h2>
                {activeCase && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeCase.case_type} — {activeCase.court || 'No Court Specified'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCase && activeCase.status !== 'Archived' && (
                  <button
                    onClick={() => handleArchiveCase(activeCase)}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-medium transition"
                  >
                    🗑️ Archive Case
                  </button>
                )}
                <button
                  onClick={handleCloseDrawer}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-semibold px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails || !activeCase ? (
                <div className="text-center py-12 text-gray-500">Loading details...</div>
              ) : (
                /* Replace the manual tabs & legacy tab components with the universal TabsSection */
                <TabsSection
                  tenant={tenant}
                  entityType="legal_case"
                  entityId={activeCase.id} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}