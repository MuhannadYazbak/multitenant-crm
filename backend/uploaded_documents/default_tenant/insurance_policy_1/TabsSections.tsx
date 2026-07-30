// app/components/TabsSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchEntityNotes,
    createEntityNote,
    fetchEntityDocuments,
    uploadEntityDocument,
    fetchEntityBilling,
    createEntityBilling,
    deleteEntityNote,
    archiveEntityDocument,
    deleteEntityBilling
} from "@/app/lib/api";

interface TabsSectionProps {
    tenant: string;
    entityType: "client" | "legal_case" | "insurance_policy";
    entityId: number;
}

export default function TabsSection({ tenant, entityType, entityId }: TabsSectionProps) {
    const [activeTab, setActiveTab] = useState<"notes" | "documents" | "billing">("notes");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [authorName, setAuthorName] = useState("");
    const [noteType, setNoteType] = useState("General");
    const [noteContent, setNoteContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileCategory, setFileCategory] = useState("General");
    const [showArchivedDocs, setShowArchivedDocs] = useState(false);

    const [billingDesc, setBillingDesc] = useState("");
    const [billingHours, setBillingHours] = useState("");
    const [billingRate, setBillingRate] = useState("200");
    const [isPaid, setIsPaid] = useState(false);

    // 1. Unified Tab Data Fetcher (Wrapped in useCallback so handlers can call it)
    const fetchTabData = useCallback(async () => {
        if (!tenant || !entityType || !entityId) return;

        try {
            setLoading(true);
            setError(null);
            let data: any[] = [];

            if (activeTab === "notes") {
                data = await fetchEntityNotes(tenant, entityType, entityId);
            } else if (activeTab === "documents") {
                data = await fetchEntityDocuments(tenant, entityType, entityId, showArchivedDocs);
            } else if (activeTab === "billing") {
                data = await fetchEntityBilling(tenant, entityType, entityId);
            }

            setItems(data || []);
        } catch (err: any) {
            console.error(`Error fetching ${activeTab}:`, err);
            setError(err.message || `Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    }, [tenant, entityType, entityId, activeTab, showArchivedDocs]);

    // 2. Fetch data automatically whenever dependencies change
    useEffect(() => {
        let isMounted = true;
        
        if (isMounted) {
            fetchTabData();
        }

        return () => {
            isMounted = false;
        };
    }, [fetchTabData]);

    // --- ACTIONS: NOTES ---
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim() || !authorName.trim()) return;

        try {
            await createEntityNote(tenant, entityType, entityId, {
                author_name: authorName.trim(),
                note_type: noteType,
                content: noteContent.trim(),
                is_pinned: isPinned,
            });
            setNoteContent("");
            fetchTabData();
        } catch (err) {
            console.error("Failed to add note:", err);
        }
    };

    // --- ACTIONS: DOCUMENTS ---
    const handleUploadDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            await uploadEntityDocument(tenant, entityType, entityId, selectedFile, fileCategory);
            setSelectedFile(null);
            fetchTabData();
        } catch (err) {
            console.error("Failed to upload document:", err);
        }
    };

    // --- ACTIONS: BILLING ---
    const handleAddBilling = async (e: React.FormEvent) => {
        e.preventDefault();
        const hrs = parseFloat(billingHours);
        const rt = parseFloat(billingRate);
        if (!billingDesc.trim() || isNaN(hrs) || isNaN(rt)) return;

        try {
            await createEntityBilling(tenant, entityType, entityId, {
                description: billingDesc.trim(),
                hours: hrs,
                rate: rt,
                total_amount: hrs * rt,
                is_paid: isPaid,
            });
            setBillingDesc("");
            setBillingHours("");
            fetchTabData();
        } catch (err) {
            console.error("Failed to add billing entry:", err);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteEntityNote(tenant, entityType, entityId, noteId);
            fetchTabData();
        } catch (err) {
            console.error("Failed to delete note:", err);
        }
    };

    const handleArchiveDocument = async (docId: number) => {
        try {
            await archiveEntityDocument(tenant, entityType, entityId, docId);
            fetchTabData();
        } catch (err) {
            console.error("Failed to archive document:", err);
        }
    };

    const handleDeleteBilling = async (billingId: number) => {
        if (!confirm("Void this billing entry?")) return;
        try {
            await deleteEntityBilling(tenant, entityType, entityId, billingId);
            fetchTabData();
        } catch (err) {
            console.error("Failed to delete billing entry:", err);
        }
    };

    const totalBilled = items.reduce((acc, item) => acc + Number(item.total_amount || 0), 0);
    const totalPaid = items.filter((e) => e.is_paid).reduce((acc, item) => acc + Number(item.total_amount || 0), 0);

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden mt-6">
            {/* TAB HEADERS */}
            <div className="flex border-b bg-slate-100 text-sm font-medium">
                <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 py-3 text-center transition ${activeTab === "notes" ? "bg-white border-b-2 border-sky-500 text-sky-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                    📝 Notes
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className={`flex-1 py-3 text-center transition ${activeTab === "documents" ? "bg-white border-b-2 border-sky-500 text-sky-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                    📁 Documents
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("billing")}
                    className={`flex-1 py-3 text-center transition ${activeTab === "billing" ? "bg-white border-b-2 border-sky-500 text-sky-600 font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                    💳 Billing Ledger
                </button>
            </div>

            <div className="p-4">
                {error && (
                    <div className="p-3 mb-4 text-xs text-red-700 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-xs text-slate-500 italic">Loading tab content...</p>
                ) : (
                    <>
                        {/* 1. NOTES TAB */}
                        {activeTab === "notes" && (
                            <div className="space-y-6">
                                <form onSubmit={handleAddNote} className="p-4 border rounded-lg bg-slate-50 space-y-3 text-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Author Name"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            className="p-2 border rounded bg-white"
                                            required
                                        />
                                        <select
                                            value={noteType}
                                            onChange={(e) => setNoteType(e.target.value)}
                                            className="p-2 border rounded bg-white"
                                        >
                                            <option value="General">General</option>
                                            <option value="Strategy">Strategy</option>
                                            <option value="Client Contact">Client Contact</option>
                                            <option value="Court Action">Court Action</option>
                                        </select>
                                        <label className="flex items-center space-x-2 text-gray-600 font-medium">
                                            <input
                                                type="checkbox"
                                                checked={isPinned}
                                                onChange={(e) => setIsPinned(e.target.checked)}
                                                className="rounded text-blue-600"
                                            />
                                            <span>Pin to top</span>
                                        </label>
                                    </div>
                                    <textarea
                                        placeholder="Type note details..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        rows={2}
                                        className="w-full p-2 border rounded bg-white"
                                        required
                                    />
                                    <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                                        Post Note
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {items.map((note) => (
                                        <div key={note.id} className={`p-3 rounded-lg border text-xs ${note.is_pinned ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-200'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{note.author_name}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{note.note_type}</span>
                                                    {note.is_pinned && <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-gray-400">{new Date(note.created_at).toLocaleString()}</span>
                                                    <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 font-bold">🗑️</button>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                    ))}
                                    {items.length === 0 && <p className="text-xs text-gray-400 italic">No notes recorded yet.</p>}
                                </div>
                            </div>
                        )}

                        {/* 2. DOCUMENTS TAB */}
                        {activeTab === "documents" && (
                            <div className="space-y-6">
                                <form onSubmit={handleUploadDocument} className="p-4 border rounded-lg bg-slate-50 space-y-3 text-xs">
                                    <div className="flex flex-col sm:flex-row gap-2 items-start">
                                        <input
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                                            required
                                        />
                                        <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)} className="p-1 border rounded bg-white">
                                            <option value="General">General</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Evidence">Evidence</option>
                                            <option value="Pleading">Pleading</option>
                                        </select>
                                        <button type="submit" disabled={!selectedFile} className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                                            Upload
                                        </button>
                                    </div>
                                </form>

                                <div className="border rounded-lg overflow-hidden text-xs">
                                    <div className="p-2.5 bg-gray-50 border-b flex justify-between items-center">
                                        <span className="font-semibold text-gray-500 uppercase">{showArchivedDocs ? 'Archived Documents' : 'Active Documents'} ({items.length})</span>
                                        <button onClick={() => setShowArchivedDocs(!showArchivedDocs)} className="text-blue-600 hover:underline font-medium">
                                            {showArchivedDocs ? 'Show Active' : 'Show Archived'}
                                        </button>
                                    </div>
                                    <table className="w-full text-left text-gray-600">
                                        <thead className="bg-gray-100 border-b font-semibold">
                                            <tr>
                                                <th className="p-2">File Name</th>
                                                <th className="p-2">Category</th>
                                                <th className="p-2">Size</th>
                                                <th className="p-2">Uploaded</th>
                                                <th className="p-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {items.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-gray-50">
                                                    <td className="p-2 font-medium text-gray-800">{doc.file_name}</td>
                                                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{doc.file_category}</span></td>
                                                    <td className="p-2">{(doc.file_size_bytes / 1024).toFixed(1)} KB</td>
                                                    <td className="p-2 text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                                    <td className="p-2 text-right">
                                                        {!doc.is_archived ? (
                                                            <button onClick={() => handleArchiveDocument(doc.id)} className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-0.5 rounded font-medium">
                                                                Archive
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Archived</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">No documents found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. BILLING TAB */}
                        {activeTab === "billing" && (
                            <div className="space-y-6 text-xs">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-[10px] text-blue-600 font-semibold uppercase">Total Billed</p>
                                        <p className="text-xl font-bold text-blue-900">${totalBilled.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-[10px] text-emerald-600 font-semibold uppercase">Collected Revenue</p>
                                        <p className="text-xl font-bold text-emerald-900">${totalPaid.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleAddBilling} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Service description"
                                            value={billingDesc}
                                            onChange={(e) => setBillingDesc(e.target.value)}
                                            className="sm:col-span-2 p-1.5 border rounded bg-white"
                                            required
                                        />
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Hours"
                                            value={billingHours}
                                            onChange={(e) => setBillingHours(e.target.value)}
                                            className="p-1.5 border rounded bg-white"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Hourly Rate ($)"
                                            value={billingRate}
                                            onChange={(e) => setBillingRate(e.target.value)}
                                            className="p-1.5 border rounded bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center space-x-2 text-gray-600">
                                            <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="rounded text-emerald-600" />
                                            <span>Mark as Paid immediately</span>
                                        </label>
                                        <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                                            Log Time
                                        </button>
                                    </div>
                                </form>

                                {/* Ledger */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-gray-600">
                                        <thead className="bg-gray-100 border-b font-semibold">
                                            <tr>
                                                <th className="p-2">Description</th>
                                                <th className="p-2">Hours</th>
                                                <th className="p-2">Rate</th>
                                                <th className="p-2">Total</th>
                                                <th className="p-2">Status</th>
                                                <th className="p-2 text-right">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {items.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="p-2 font-medium text-gray-800">{entry.description}</td>
                                                    <td className="p-2">{entry.hours} hrs</td>
                                                    <td className="p-2">${entry.rate}/hr</td>
                                                    <td className="p-2 font-bold text-gray-900">${Number(entry.total_amount).toFixed(2)}</td>
                                                    <td className="p-2">
                                                        <span className={`px-2 py-0.5 rounded font-medium ${entry.is_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                            {entry.is_paid ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <button onClick={() => handleDeleteBilling(entry.id)} className="text-red-500 hover:bg-red-500  font-bold">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-gray-400 italic">No billing records logged.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}