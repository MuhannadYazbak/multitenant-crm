"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client } from "@/app/types/client";
import {
    fetchClientDetails,
    createClientVehicle,
    createClientProperty,
    fetchClientVehicles,
    fetchClientProperties,
    deleteVehicle,
    deleteProperty,
    createClientEvidence,
    fetchClientEvidences,
    deleteEvidence,
    fetchClientWitnesses,
    createClientWitness,
    deleteWitness
} from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import InsurancePolicies from "@/app/components/InsurancePolicies";
import LegalCases from "@/app/components/LegalCases";
import TabsSection from "@/app/components/TabsSections";
import { VehicleData, VehicleResponse } from "@/app/types/vehicle";
import { PropertyData, PropertyResponse } from "@/app/types/property";
import { EvidenceData, EvidenceResponse } from "@/app/types/evidence";
import { WitnessData, WitnessResponse } from "@/app/types/witness";
import VehicleModal from "@/app/components/VehicleWindow";
import PropertyModal from "@/app/components/PropertyWindow";
import EvidenceModal from "@/app/components/EvidenceWindow";
import WitnessModal from "@/app/components/WitnessWindow";

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const rawClientName = params?.name as string;
    const clientName = rawClientName ? decodeURIComponent(rawClientName) : "";
    const tenant = params?.tenant as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Tab State
    const [activeTab, setActiveTab] = useState<string>("cases");

    // Insurance & Legal Assets State
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
    const [properties, setProperties] = useState<PropertyResponse[]>([]);
    const [evidences, setEvidences] = useState<EvidenceResponse[]>([]);
    const [witnesses, setWitnesses] = useState<WitnessResponse[]>([]);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [newFieldKey, setNewFieldKey] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const [saving, setSaving] = useState(false);

    // Modal controls
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [isWitnessModalOpen, setIsWitnessModalOpen] = useState(false);

    // Tenant vertical type
    const initialTenantType = tenant === "company-c" ? "legal" : tenant === "company-a" ? "insurance" : "general";
    const [tenantType, setTenantType] = useState<string | null>(initialTenantType);

    useEffect(() => {
        if (!tenant || !clientName) return;

        setLoading(true);
        setError(null);

        fetchClientDetails(tenant, clientName)
            .then(async (clientData) => {
                setClient(clientData);

                setEditForm({
                    name: clientData.name,
                    phone: clientData.phone,
                    email: clientData.email,
                    address: clientData.address || "",
                    custom_fields: clientData.custom_fields || {},
                });

                // Detect Tenant Type
                let currentTenantType = initialTenantType;
                try {
                    const res = await fetch(`http://localhost:8000/api/tenants/${tenant}`);
                    if (res.ok) {
                        const tenantData = await res.json();
                        if (tenantData?.tenant_type) currentTenantType = tenantData.tenant_type;
                    }
                } catch {
                    // Fall back to default URL check
                }
                setTenantType(currentTenantType);

                // Set default active tab according to vertical
                if (currentTenantType === "insurance") setActiveTab("policies");
                if (currentTenantType === "legal") setActiveTab("cases");

                // Fetch Insurance assets if applicable
                if (currentTenantType === "insurance" && clientData.id) {
                    try {
                        const [fetchedVehicles, fetchedProperties] = await Promise.all([
                            fetchClientVehicles(tenant, clientData.id),
                            fetchClientProperties(tenant, clientData.id)
                        ]);
                        setVehicles(fetchedVehicles);
                        setProperties(fetchedProperties);
                    } catch (assetErr) {
                        console.error("Error loading insurance sub-resources:", assetErr);
                    }
                }

                // Fetch Legal assets if applicable
                if (currentTenantType === "legal" && clientData.id) {
                    try {
                        const [fetchedEvidences, fetchedWitnesses] = await Promise.all([
                            fetchClientEvidences(tenant, clientData.id),
                            fetchClientWitnesses(tenant, clientData.id)
                        ]);
                        setEvidences(fetchedEvidences);
                        setWitnesses(fetchedWitnesses);
                    } catch (assetErr) {
                        console.error("Error loading legal sub-resources:", assetErr);
                    }
                }
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

    // VEHICLE HANDLERS
    const handleAddVehicle = async (newVehicle: VehicleData) => {
        if (!client?.id) return;
        try {
            const createdVehicle = await createClientVehicle(tenant, client.id, newVehicle);
            setVehicles((prev) => [...prev, createdVehicle]);
            setIsVehicleModalOpen(false);
        } catch (error: any) {
            console.error("Failed to add vehicle:", error);
            alert(error.message || "Failed to add vehicle");
        }
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await deleteVehicle(tenant, vehicleId);
            setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        } catch (error: any) {
            alert(error.message || "Failed to delete vehicle");
        }
    };

    // PROPERTY HANDLERS
    const handleAddProperty = async (newProperty: PropertyData) => {
        if (!client?.id) return;
        try {
            const createdProperty = await createClientProperty(tenant, client.id, newProperty);
            setProperties((prev) => [...prev, createdProperty]);
            setIsPropertyModalOpen(false);
        } catch (error: any) {
            console.error("Failed to add property:", error);
            alert(error.message || "Failed to add property");
        }
    };

    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm("Are you sure you want to delete this property?")) return;
        try {
            await deleteProperty(tenant, propertyId);
            setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } catch (error: any) {
            alert(error.message || "Failed to delete property");
        }
    };

    // WITNESS HANDLERS
    const handleAddWitness = async (newWitness: WitnessData) => {
        if (!client?.id) return;
        try {
            const createdWitness = await createClientWitness(tenant, client.id, newWitness);
            setWitnesses((prev) => [...prev, createdWitness]);
            setIsWitnessModalOpen(false);
        } catch (error: any) {
            console.error("Failed to add witness:", error);
            alert(error.message || "Failed to add witness");
        }
    };

    const handleDeleteWitness = async (witnessId: string) => {
        if (!confirm("Are you sure you want to delete this witness?")) return;
        try {
            await deleteWitness(tenant, witnessId);
            setWitnesses((prev) => prev.filter((w) => w.id !== witnessId));
        } catch (error: any) {
            alert(error.message || "Failed to delete witness");
        }
    };

    // EVIDENCE HANDLERS
    const handleAddEvidence = async (newEvidence: EvidenceData) => {
        if (!client?.id) return;
        try {
            const createdEvidence = await createClientEvidence(tenant, client.id, newEvidence);
            setEvidences((prev) => [...prev, createdEvidence]);
            setIsEvidenceModalOpen(false);
        } catch (error: any) {
            console.error("Failed to add evidence:", error);
            alert(error.message || "Failed to add evidence");
        }
    };

    const handleDeleteEvidence = async (evidenceId: string) => {
        if (!confirm("Are you sure you want to delete this evidence?")) return;
        try {
            await deleteEvidence(tenant, evidenceId);
            setEvidences((prev) => prev.filter((ev) => ev.id !== evidenceId));
        } catch (error: any) {
            alert(error.message || "Failed to delete evidence");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar tenantName={tenant} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* COLUMN 1: Client Details / Edit Form */}
                        <div className="lg:col-span-1 p-6 bg-white border rounded-xl shadow-sm space-y-4">
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

                        {/* COLUMN 2: TABBED MODULES */}
                        {client.id !== undefined && (
                            <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-6 space-y-4">

                                {/* TAB NAVIGATION HEADER */}
                                <div className="flex border-b gap-2 text-sm font-medium">
                                    {tenantType === "insurance" && (
                                        <>
                                            <button
                                                onClick={() => setActiveTab("policies")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "policies"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                📋 Policies
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("vehicles")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "vehicles"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                🚗 Vehicles ({vehicles.length})
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("properties")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "properties"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                🏠 Properties ({properties.length})
                                            </button>
                                        </>
                                    )}

                                    {tenantType === "legal" && (
                                        <>
                                            <button
                                                onClick={() => setActiveTab("cases")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "cases"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                ⚖️ Legal Cases
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("evidence")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "evidence"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                📁 Evidence ({evidences.length})
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("witnesses")}
                                                className={`pb-2 px-3 border-b-2 transition ${activeTab === "witnesses"
                                                        ? "border-blue-600 text-blue-600 font-semibold"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                👥 Witnesses ({witnesses.length})
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setActiveTab("activity")}
                                        className={`pb-2 px-3 border-b-2 transition ${activeTab === "activity"
                                                ? "border-blue-600 text-blue-600 font-semibold"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        📁 Notes & Billing
                                    </button>
                                </div>

                                {/* TAB CONTENTS */}
                                <div className="pt-2">
                                    {/* 1. INSURANCE POLICIES TAB */}
                                    {tenantType === "insurance" && activeTab === "policies" && (
                                        <InsurancePolicies tenant={tenant} clientId={client.id} />
                                    )}

                                    {/* 2. VEHICLES TAB */}
                                    {tenantType === "insurance" && activeTab === "vehicles" && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-800">Client Vehicles</h3>
                                                <button
                                                    onClick={() => setIsVehicleModalOpen(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                                                >
                                                    + Add Vehicle
                                                </button>
                                            </div>

                                            {vehicles.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">No vehicles registered for this client.</p>
                                            ) : (
                                                <div className="divide-y border rounded-lg overflow-hidden text-sm">
                                                    {vehicles.map((v) => (
                                                        <div key={v.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{v.manufacturer} {v.model} ({v.year})</p>
                                                                {v.plate_no && (
                                                                    <p className="text-xs text-gray-500">Plate: {v.plate_no}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteVehicle(v.id)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. PROPERTIES TAB */}
                                    {tenantType === "insurance" && activeTab === "properties" && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-800">Client Properties</h3>
                                                <button
                                                    onClick={() => setIsPropertyModalOpen(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                                                >
                                                    + Add Property
                                                </button>
                                            </div>

                                            {properties.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">No properties registered for this client.</p>
                                            ) : (
                                                <div className="divide-y border rounded-lg overflow-hidden text-sm">
                                                    {properties.map((p) => (
                                                        <div key={p.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{p.property_type} - {p.area} sq m</p>
                                                                {p.address && (
                                                                    <p className="text-xs text-gray-500">{p.address}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteProperty(p.id)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 4. LEGAL CASES TAB */}
                                    {tenantType === "legal" && activeTab === "cases" && (
                                        <LegalCases tenant={tenant} clientId={client.id} />
                                    )}

                                    {/* 5. EVIDENCE TAB */}
                                    {tenantType === "legal" && activeTab === "evidence" && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-800">Client Evidence</h3>
                                                <button
                                                    onClick={() => setIsEvidenceModalOpen(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                                                >
                                                    + Add Evidence
                                                </button>
                                            </div>

                                            {evidences.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">No evidence recorded for this client.</p>
                                            ) : (
                                                <div className="divide-y border rounded-lg overflow-hidden text-sm">
                                                    {evidences.map((ev) => (
                                                        <div key={ev.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{ev.evidence_type}: {ev.evidence_detail}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteEvidence(ev.id)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 6. WITNESSES TAB */}
                                    {tenantType === "legal" && activeTab === "witnesses" && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-800">Client Witnesses</h3>
                                                <button
                                                    onClick={() => setIsWitnessModalOpen(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                                                >
                                                    + Add Witness
                                                </button>
                                            </div>

                                            {witnesses.length === 0 ? (
                                                <p className="text-sm text-gray-500 py-4">No witnesses recorded for this client.</p>
                                            ) : (
                                                <div className="divide-y border rounded-lg overflow-hidden text-sm">
                                                    {witnesses.map((w) => (
                                                        <div key={w.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{w.name}</p>
                                                                {w.age && (
                                                                    <p className="text-xs text-gray-500">Contact: {w.phone} {w.email}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteWitness(w.id)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 7. NOTES & BILLING TAB */}
                                    {(activeTab === "activity" || (tenantType === "general")) && (
                                        <TabsSection
                                            tenant={tenant}
                                            entityType="client"
                                            entityId={client.id}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* MODALS */}
            <VehicleModal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                onAdd={handleAddVehicle}
            />

            <PropertyModal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
                onAdd={handleAddProperty}
            />

            <EvidenceModal
                isOpen={isEvidenceModalOpen}
                onClose={() => setIsEvidenceModalOpen(false)}
                onAdd={handleAddEvidence}
            />

            <WitnessModal
                isOpen={isWitnessModalOpen}
                onClose={() => setIsWitnessModalOpen(false)}
                onAdd={handleAddWitness}
            />
        </div>
    );
}