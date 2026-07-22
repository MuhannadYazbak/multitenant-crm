"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Client } from "../../types/client";
import { fetchAllClients, createClient, deleteClient } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar"
import DashboardStatsWidget from "@/app/components/DashBoardStats";

export default function Home() {
    const [client, setClient] = useState<Client>({
        name: "",
        phone: "",
        email: "",
        address: "",
    });
    const [clients, setClients] = useState<Client[]>([]);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const tenant = params.tenant as string;
    const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

    const addCustomField = () => {
        setCustomFields([...customFields, { key: "", value: "" }]);
    };

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleCustomFieldChange = (index: number, field: "key" | "value", text: string) => {
        const updated = [...customFields];
        updated[index][field] = text;
        setCustomFields(updated);
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Build key-value map for custom fields
        const customFieldsObject = customFields.reduce((acc, curr) => {
            if (curr.key.trim()) {
                acc[curr.key.trim()] = curr.value.trim();
            }
            return acc;
        }, {} as Record<string, string>);

        // 2. Format & Sanitize Payload for Pydantic Validation
        const payload = {
            name: client.name.trim(),
            phone: client.phone.trim(),
            email: client.email.trim(),
            address: client.address?.trim() || null, // Convert empty string "" to null or valid string
            status: "active",                       // Matches ClientBase schema requirement
            custom_fields: customFieldsObject,
        };

        try {
            // 3. Create Client via API
            await createClient(tenant, payload);

            // 4. Refresh List & Reset Form State
            const updatedClients = await fetchAllClients(tenant);
            setClients(updatedClients);

            // Reset form inputs
            setClient({ name: "", phone: "", email: "", address: "" });
            setCustomFields([]);
        } catch (error: any) {
            // Detailed logging to catch Pydantic 422 error details
            console.error("Failed to post new client:", error);
            alert(error.message || "Failed to create client. Please check the inputs.");
        }
    };

    const filteredClients = useMemo(() => {
        if (!searchQuery.trim()) return clients;

        const query = searchQuery.toLowerCase();

        return clients.filter((c) => {
            const matchesStandard =
                c.name?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.phone?.toLowerCase().includes(query) ||
                c.address?.toLowerCase().includes(query);

            if (matchesStandard) return true;
            if (c.custom_fields && typeof c.custom_fields === "object") {
                return Object.entries(c.custom_fields).some(
                    ([key, value]) =>
                        key.toLowerCase().includes(query) ||
                        String(value).toLowerCase().includes(query)
                );
            }

            return false;
        });
    }, [clients, searchQuery]);

    useEffect(() => {
        if (!tenant || tenant === "undefined" || tenant === "null") return;

        fetchAllClients(tenant)
            .then((data) => {
                setClients(data);
            })
            .catch((error) => {
                console.error("Error communicating with Python backend:", error);
            });
    }, [tenant]);

    useEffect(() => {
        setFormErrors({});
    }, [client]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex flex-col space-y-3">
                <Navbar tenantName={tenant} />
                <DashboardStatsWidget tenant={tenant} />
            </div>


            <div className="flex flex-row justify-center items-center gap-3 mb-2">

                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or custom field..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                    />
                </div>

                <button
                    onClick={() => setIsAddClientOpen(!isAddClientOpen)}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${isAddClientOpen
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {isAddClientOpen ? "✕ Close" : "➕ Add Client"}
                </button>
            </div>

            {isAddClientOpen && (
                <div className="flex flex-col justify-center items-center shadow hover:bg-gray-100">

                    <form
                        className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4"
                        onSubmit={handleAddClient}
                    >
                        <div className="flex flex-col">
                            <label>Name</label>
                            <input
                                suppressHydrationWarning
                                className={`text-s border rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                placeholder="Enter Your Name"
                                type="text"
                                value={client.name}
                                onChange={(e) => setClient({ ...client, name: e.target.value })}
                            />
                            {formErrors.name && (
                                <p className="text-[10px] text-red-500 text-right mt-0.5">
                                    {formErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label>Phone</label>
                            <input
                                suppressHydrationWarning
                                className={`text-s border rounded ${formErrors.phone ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                placeholder="Enter Your Phone Number"
                                type="text"
                                value={client.phone}
                                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                            />
                            {formErrors.phone && (
                                <p className="text-[10px] text-red-500 text-right mt-0.5">
                                    {formErrors.phone}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label>Email</label>
                            <input
                                suppressHydrationWarning
                                className={`text-s border rounded ${formErrors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                placeholder="Enter Your Email"
                                type="text"
                                value={client.email}
                                onChange={(e) => setClient({ ...client, email: e.target.value })}
                            />
                            {formErrors.email && (
                                <p className="text-[10px] text-red-500 text-right mt-0.5">
                                    {formErrors.email}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label>Address</label>
                            <input
                                suppressHydrationWarning
                                className={`text-s border rounded ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                placeholder="Enter Your Address"
                                type="text"
                                value={client.address}
                                onChange={(e) => setClient({ ...client, address: e.target.value })}
                            />
                            {formErrors.address && (
                                <p className="text-[10px] text-red-500 text-right mt-0.5">
                                    {formErrors.address}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-600 uppercase">
                                    Custom Fields (JSONB)
                                </label>
                                <button
                                    type="button"
                                    onClick={addCustomField}
                                    className="text-xs text-blue-600 hover:underline font-semibold"
                                >
                                    + Add Field
                                </button>
                            </div>

                            {customFields.map((field, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Field Name (e.g. VAT)"
                                        value={field.key}
                                        onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                                        className="w-1/2 text-xs border border-slate-300 rounded p-1.5"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                                        className="w-1/2 text-xs border border-slate-300 rounded p-1.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCustomField(index)}
                                        className="text-red-500 text-sm font-bold px-1 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col">
                            <button
                                suppressHydrationWarning
                                type="submit"
                                className="bg-blue-500 text-white hover:bg-blue-700 py-1 rounded"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                    <div className="mt-2">
                        <button
                            onClick={() => setIsAddClientOpen(false)}
                            className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg border border-gray-300 text-sm transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            )}
            <div className="flex justify-center items-center p-2">
                <div className="w-full max-w-4xl max-h-72 overflow-y-auto border rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-100 z-10 border-b">
                            <tr className="text-[11px] font-bold text-slate-600">
                                <th className="p-3 text-center">Actions</th>
                                <th className="p-3 text-center">Name</th>
                                <th className="p-3 text-center">Phone</th>
                                <th className="p-3 text-center">Email</th>
                                <th className="p-3 text-center">Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs">
                            {filteredClients?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-gray-400">
                                        No Clients to show
                                    </td>
                                </tr>
                            ) : (
                                filteredClients?.map((c, index) => (
                                    <tr
                                        key={c.id || c.email || index}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="text-center py-3 px-4 text-gray-700 flex justify-center gap-2">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-medium transition"
                                                onClick={() => router.push(`/${tenant}/mypage/${encodeURIComponent(c.name)}`)}
                                            >
                                                Show
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-medium transition"
                                                onClick={async () => {
                                                    if (!c.id) return; // Guarantees c.id is a number

                                                    if (confirm(`Are you sure you want to remove ${c.name}?`)) {
                                                        try {
                                                            await deleteClient(tenant, c.id);
                                                            setClients((prev) => prev.filter((client) => client.id !== c.id));
                                                        } catch (err) {
                                                            console.error("Failed to delete client:", err);
                                                            alert("Could not delete client. Please try again.");
                                                        }
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                        <td className="text-center py-3 px-4 text-gray-700">{c.name}</td>
                                        <td className="text-center py-3 px-4 text-gray-700">{c.phone}</td>
                                        <td className="text-center py-3 px-4 text-gray-700">{c.email}</td>
                                        <td className="text-center py-3 px-4 text-gray-700">{c.address}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}