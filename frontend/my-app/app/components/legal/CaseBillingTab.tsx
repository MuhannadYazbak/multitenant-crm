'use client';

import { useState } from 'react';
import { CaseBillingEntry } from '@/app/types/legal';
import { createCaseBillingEntry, deleteCaseBillingEntry } from '@/app/lib/api';

interface CaseBillingTabProps {
    caseId: number;
    tenant: string;
    entries: CaseBillingEntry[];
    onEntryAdded: () => void;
}

export default function CaseBillingTab({ caseId, tenant, entries, onEntryAdded }: CaseBillingTabProps) {
    const [description, setDescription] = useState('');
    const [hours, setHours] = useState('');
    const [rate, setRate] = useState('200');
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(false);

    const totalBilled = entries.reduce((acc, item) => acc + Number(item.total_amount), 0);
    const totalPaid = entries.filter((e) => e.is_paid).reduce((acc, item) => acc + Number(item.total_amount), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hrs = parseFloat(hours);
        const rt = parseFloat(rate);
        if (!description || isNaN(hrs) || isNaN(rt)) return;

        try {
            setLoading(true);
            await createCaseBillingEntry(tenant, caseId, {
                description,
                hours: hrs,
                rate: rt,
                total_amount: hrs * rt,
                is_paid: isPaid,
            });
            setDescription('');
            setHours('');
            onEntryAdded();
        } catch (err) {
            alert('Failed to create billing entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Total Billed</p>
                    <p className="text-2xl font-bold text-blue-900">${totalBilled.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs text-emerald-600 font-semibold uppercase">Collected Revenue</p>
                    <p className="text-2xl font-bold text-emerald-900">${totalPaid.toFixed(2)}</p>
                </div>
            </div>

            {/* Log Billing Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Log Billing Entry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Service description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="sm:col-span-2 p-2 border rounded-md text-sm"
                        required
                    />
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Hours"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="p-2 border rounded-md text-sm"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Hourly Rate ($)"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="p-2 border rounded-md text-sm"
                        required
                    />
                </div>
                <div className="flex justify-between items-center">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                            className="rounded text-emerald-600"
                        />
                        <span>Mark as Paid immediately</span>
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging...' : 'Log Time'}
                    </button>
                </div>
            </form>

            {/* Billing Ledger */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                        <tr>
                            <th className="p-3">Description</th>
                            <th className="p-3">Hours</th>
                            <th className="p-3">Rate</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                                    No billing records logged.
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{entry.description}</td>
                                    <td className="p-3">{entry.hours} hrs</td>
                                    <td className="p-3">${entry.rate}/hr</td>
                                    <td className="p-3 font-semibold text-gray-900">${Number(entry.total_amount).toFixed(2)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-0.5 text-xs rounded font-medium ${entry.is_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                        >
                                            {entry.is_paid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={async () => {
                                                if (confirm("Void this billing entry?")) {
                                                    await deleteCaseBillingEntry(tenant, caseId, entry.id);
                                                    onEntryAdded();
                                                }
                                            }}
                                            className="text-xs text-gray-400 hover:text-red-600 transition"
                                        >
                                            🗑️ Delete
                                        </button>
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