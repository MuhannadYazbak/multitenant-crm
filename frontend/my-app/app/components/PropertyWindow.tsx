'use client'
import React, { useState } from "react"
import { PropertyData } from "@/app/types/property"

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (property: PropertyData) => void
}

export default function PropertyModal({ isOpen, onClose, onAdd }: PropertyModalProps) {
  const [property, setProperty] = useState<PropertyData>({
    property_type: "",
    area: 50
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (field: keyof PropertyData, value: string | number) => {
    setProperty((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation check
    const currentYear = new Date().getFullYear() + 1
    if (!property.property_type.trim()) {
      setError("Please fill out Property type.")
      return
    }

    if (property.area < 0) {
      setError(`Area must be a positive number`)
      return
    }

    // Pass data up to parent
    onAdd(property)

    // Reset form state and close modal
    setProperty({ property_type: "", area: 50 })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Add New Property
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
              placeholder="e.g. Home, Office"
              value={property.property_type}
              onChange={(e) => handleChange("property_type", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Area
            </label>
            <input
              type="number"
              placeholder="Property Area"
              value={property.area}
              onChange={(e) => handleChange("area", e.target.value)}
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
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}