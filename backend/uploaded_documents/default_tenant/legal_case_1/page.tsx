// app/[tenant]/clients/[name]/page.tsx (or ClientDetailPage.tsx)
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client } from "@/app/types/client";
import { fetchClientDetails } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import InsurancePolicies from "@/app/components/InsurancePolicies";
import LegalCases from "@/app/components/LegalCases";
import TabsSection from "@/app/components/TabsSections";

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const rawClientName = params?.name as string;
    const clientName = rawClientName ? decodeURIComponent(rawClientName) : "";
    const tenant = params?.tenant as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [newFieldKey, setNewFieldKey] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const [saving, setSaving] = useState(false);

    // Derive initial tenantType
    const initialTenantType = tenant === "company-c" ? "legal" : tenant === "company-a" ? "insurance" : "general";
    const [tenantType, setTenantType] = useState<string | null>(initialTenantType);

    useEffect(() => {
        if (!tenant || !clientName) return;

        setLoading(true);
        setError(null);

        fetchClientDetails(tenant, clientName)
            .then((clientData) => {
                setClient(clientData);

                setEditForm({
                    name: clientData.name,
                    phone: clientData.phone,
                    email: clientData.email,
                    address: clientData.address || "",
                    custom_fields: clientData.custom_fields || {},
                });

                fetch(`http://localhost:8000/api/tenants/${tenant}`)
                    .then((res) => res.ok ? res.json() : null)
                    .then((tenantData) => {
                        if (tenantData && tenantData.tenant_type) {
                            setTenantType(tenantData.tenant_type);
                        } else {
                            setTenantType(
                                tenant === "company-a" ? "insurance" :
                                tenant === "company-c" ? "legal" : "general"
                            );
                        }
                    })
                    .catch(() => {
                        setTenantType(tenant === "company-c" ? "legal" : tenant === "company-a" ? "insurance" : "general");
                    });
            })
            .catch((err) => {
                console.error("Error loading client profile:", err);
                setError(`Could not find client details for "${clientName}".`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [tenant, clientName]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`http://localhost:8000/api/clients/${client?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Tenant": tenant,
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update client.");
            }

            const updatedClient = await response.json();
            setClient(updatedClient);
            setIsEditing(false);

        } catch (err: any) {
            console.error("Save error:", err);
            alert(err.message || "Failed to save client profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddCustomField = () => {
        if (!newFieldKey.trim()) return;

        setEditForm((prev: any) => ({
            ...prev,
            custom_fields: {
                ...(prev.custom_fields || {}),
                [newFieldKey.trim()]: newFieldValue.trim(),
            },
        }));

        setNewFieldKey("");
        setNewFieldValue("");
    };

    const handleRemoveCustomField = (keyToRemove: string) => {
        const updated = { ...editForm.custom_fields };
        delete updated[keyToRemove];
        setEditForm({ ...editForm, custom_fields: updated });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar tenantName={tenant} />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                {/* TOP BAR */}
                <div className="flex items-center gap-3">
                    <button
                        suppressHydrationWarning
                        onClick={() => router.back()}
                        className="bg-sky-500 text-white px-3 py-1.5 rounded hover:bg-sky-600 transition text-sm font-medium"
                    >
                        ← Back
                    </button>

                    {client && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                            {isEditing ? "Cancel" : "✏️ Edit Client"}
                        </button>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-800">Client Profile</h1>

                {loading ? (
                    <p className="text-gray-500">Loading profile details...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : client ? (
                    /* DYNAMIC GRID LAYOUT */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-5xl">

                        {/* COLUMN 1: Client Details / Edit Form */}
                        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
                            {!isEditing ? (
                                /* READ ONLY VIEW */
                                <div className="flex flex-col items-center space-y-3">
                                    <img
                                        alt="client profile"
                                        src="https://img.magnific.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                                        className="w-20 h-20 rounded-full"
                                    />
                                    <h2 className="text-xl font-bold text-gray-800">{client.name}</h2>
                                    <div className="w-full space-y-2 text-sm text-gray-700 pt-2 border-t">
                                        <p><strong>Phone:</strong> {client.phone}</p>
                                        <p><strong>Email:</strong> {client.email}</p>
                                        <p><strong>Address:</strong> {client.address || "N/A"}</p>
                                    </div>

                                    {client.custom_fields && Object.keys(client.custom_fields).length > 0 && (
                                        <div className="w-full pt-3 border-t text-left space-y-1">
                                            <p className="font-semibold text-xs text-gray-500 uppercase">
                                                Additional Fields
                                            </p>
                                            {Object.entries(client.custom_fields).map(([key, value]) => (
                                                <div key={key} className="text-sm flex justify-between py-0.5">
                                                    <span className="capitalize text-gray-600">{key}:</span>
                                                    <span className="font-medium text-gray-900">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* EDIT FORM VIEW */
                                <form onSubmit={handleSave} className="space-y-4 text-sm">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>

                                    {/* Custom Fields Editor */}
                                    <div className="pt-3 border-t space-y-2">
                                        <p className="font-semibold text-xs text-gray-500 uppercase">Custom Fields</p>
                                        {Object.entries(editForm.custom_fields || {}).map(([key, value]) => (
                                            <div key={key} className="flex gap-2 items-center">
                                                <span className="w-1/3 font-medium text-gray-600 truncate">{key}:</span>
                                                <input
                                                    type="text"
                                                    value={String(value)}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            custom_fields: {
                                                                ...editForm.custom_fields,
                                                                [key]: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="flex-1 p-1 border rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCustomField(key)}
                                                    className="text-red-500 hover:text-red-700 px-1 font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                placeholder="Field Name"
                                                value={newFieldKey}
                                                onChange={(e) => setNewFieldKey(e.target.value)}
                                                className="w-1/2 p-1 border rounded text-xs"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={newFieldValue}
                                                onChange={(e) => setNewFieldValue(e.target.value)}
                                                className="w-1/2 p-1 border rounded text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomField}
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold"
                                            >
                                                +Add
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm transition disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* COLUMN 2: Contextual Modules */}
                        {client.id !== undefined && (
                            <div className="space-y-6">
                                {/* Option A: Vertical Modules (Tabs handled inside their Drawers) */}
                                {tenantType === "insurance" && (
                                    <InsurancePolicies tenant={tenant} clientId={client.id} />
                                )}

                                {tenantType === "legal" && (
                                    <LegalCases tenant={tenant} clientId={client.id} />
                                )}

                                {/* Option B: General Tenants (Tabs rendered directly at Client level) */}
                                {tenantType !== "insurance" && tenantType !== "legal" && (
                                    <TabsSection
                                        tenant={tenant}
                                        entityType="client"
                                        entityId={client.id}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}