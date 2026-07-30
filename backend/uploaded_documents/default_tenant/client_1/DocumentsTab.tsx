'use client';

import { useState } from 'react';
import { CaseDocument } from '@/app/types/legal';
import { uploadCaseDocument, archiveCaseDocument } from '@/app/lib/api';

interface DocumentsTabProps {
    caseId: number;
    tenant: string;
    documents: CaseDocument[];
    onDocumentUploaded: () => void;
}

export default function DocumentsTab({ caseId, tenant, documents, onDocumentUploaded }: DocumentsTabProps) {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('General');
    const [uploading, setUploading] = useState(false);
    const [showArchived, setShowArchived] = useState(false); // Toggle state

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        try {
            setUploading(true);
            await uploadCaseDocument(tenant, caseId, file, category);
            setFile(null);
            onDocumentUploaded();
        } catch (err) {
            alert('Failed to upload document');
        } finally{
            setUploading(false);
        }
    };

    // Filter documents based on state
    const filteredDocuments = documents.filter(doc => showArchived ? doc.is_archived : !doc.is_archived);

    return (
        <div className="space-y-6">
            {/* Document Upload Zone */}
            <form onSubmit={handleUpload} className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload Case Document</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-2 border rounded-md text-sm bg-white"
                    >
                        <option value="General">General</option>
                        <option value="Pleading">Pleading</option>
                        <option value="Contract">Contract</option>
                        <option value="Evidence">Evidence</option>
                        <option value="Court Motion">Court Motion</option>
                    </select>
                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>

            {/* Documents Table Header Controls */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                        {showArchived ? 'Archived Documents' : 'Active Documents'} ({filteredDocuments.length})
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowArchived(!showArchived)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                        {showArchived ? 'Show Active Documents' : 'Show Archived Documents'}
                    </button>
                </div>

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                        <tr>
                            <th className="p-3">File Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Size</th>
                            <th className="p-3">Uploaded At</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredDocuments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                                    {showArchived 
                                        ? "No archived documents for this case." 
                                        : "No active documents uploaded for this case yet."}
                                </td>
                            </tr>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{doc.file_name}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 font-medium">
                                            {doc.file_category}
                                        </span>
                                    </td>
                                    <td className="p-3">{(doc.file_size_bytes / 1024).toFixed(1)} KB</td>
                                    <td className="p-3 text-xs text-gray-400">
                                        {new Date(doc.uploaded_at).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right">
                                        {!doc.is_archived ? (
                                            <button
                                                onClick={async () => {
                                                    await archiveCaseDocument(tenant, caseId, doc.id);
                                                    onDocumentUploaded();
                                                }}
                                                className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1 rounded font-medium transition"
                                            >
                                                Archive
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Archived</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}