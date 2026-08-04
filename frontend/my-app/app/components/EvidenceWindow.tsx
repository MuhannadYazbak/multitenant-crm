'use client'
import React, { useState } from "react"
import { EvidenceData } from "@/app/types/evidence"

interface EvidenceModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (property: EvidenceData) => void
}

export default function EvidenceModal({ isOpen, onClose, onAdd }: EvidenceModalProps) {
    const [evidence, setEvidence] = useState<EvidenceData>({
        evidence_type: "",
        evidence_detail: ""
    })
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleChange = (field: keyof EvidenceData, value: string) => {
        setEvidence((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!evidence.evidence_detail.trim()) {
            setError(`Please fill out Evidence detail`)
            return
        }

        // Pass data up to parent
        onAdd(evidence)

        // Reset form state and close modal
        setEvidence({ evidence_type: "", evidence_detail: "" })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Add New Evidence
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Type
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Recording, Documents ..."
                            value={evidence.evidence_type}
                            onChange={(e) => handleChange("evidence_type", e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Detail
                        </label>
                        <input
                            type="text"
                            placeholder="Evidence details"
                            value={evidence.evidence_detail}
                            onChange={(e) => handleChange("evidence_detail", e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Evidence
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}