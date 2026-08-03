'use client'
import React, { useState } from "react"
import { VehicleData} from "@/app/types/vehicle"

interface VehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (vehicle: VehicleData) => void
}

export default function VehicleModal({ isOpen, onClose, onAdd }: VehicleModalProps) {
  const [vehicle, setVehicle] = useState<VehicleData>({
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    plate_no: ""
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (field: keyof VehicleData, value: string | number) => {
    setVehicle((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation check
    const currentYear = new Date().getFullYear() + 1
    if (!vehicle.manufacturer.trim() || !vehicle.model.trim() || !vehicle.plate_no.trim()) {
      setError("Please fill out both manufacturer and model.")
      return
    }

    if (vehicle.year < 1970 || vehicle.year > currentYear) {
      setError(`Year must be between 1970 and ${currentYear}.`)
      return
    }

    // Pass data up to parent
    onAdd(vehicle)

    // Reset form state and close modal
    setVehicle({ manufacturer: "", model: "", year: new Date().getFullYear(), plate_no: "" })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Add New Vehicle
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
              Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Skoda, Toyota"
              value={vehicle.manufacturer}
              onChange={(e) => handleChange("manufacturer", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Model
            </label>
            <input
              type="text"
              placeholder="e.g. Rapid, Corolla"
              value={vehicle.model}
              onChange={(e) => handleChange("model", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Year
            </label>
            <input
              type="number"
              placeholder="e.g. 2017"
              value={vehicle.year || ""}
              onChange={(e) => handleChange("year", parseInt(e.target.value) || 0)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              placeholder="e.g. 1122233"
              value={vehicle.plate_no}
              onChange={(e) => handleChange("plate_no", e.target.value)}
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
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}