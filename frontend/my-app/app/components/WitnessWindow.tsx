'use client'
import React, { useState } from "react"
import { WitnessData } from "@/app/types/witness"

interface WitnessModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (property: WitnessData) => void
}

export default function WitnessModal({ isOpen, onClose, onAdd }: WitnessModalProps) {
    const [witness, setWitness] = useState<WitnessData>({
        name: "",
        age: 16,
        phone: "",
        email: "",
        address: ""
    })
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleChange = (field: keyof WitnessData, value: string) => {
        setWitness((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if(witness.age < 5 || witness.age > 100){
            setError(`Please supply a valid age between 6 and 99`)
            return
        }
        if (!witness.name.trim()) {
            setError(`Please fill out Witness name`)
            return
        }
        if (!witness.phone.trim()) {
            setError(`Please fill out Witness phone number`)
            return
        }
        if (!witness.email.trim()) {
            setError(`Please fill out Witness email`)
            return
        }

        // Pass data up to parent
        onAdd(witness)

        // Reset form state and close modal
        setWitness({ name: "", age:16, phone:"", email:"", address: ""})
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Add New Witness
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
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="Witness Full Name"
                            value={witness.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Age
                        </label>
                        <input
                            type="number"
                            placeholder="Witness Age"
                            value={witness.age}
                            onChange={(e) => handleChange("age", e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Phone
                        </label>
                        <input
                            type="text"
                            placeholder="Witness Phone Number"
                            value={witness.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            placeholder="Witness Email"
                            value={witness.email}
                            onChange={(e) => handleChange("email", e.target.value)}
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
                            Add Witness
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}