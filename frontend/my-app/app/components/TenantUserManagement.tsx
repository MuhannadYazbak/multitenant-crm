"use client";

import { useState, useEffect } from "react";
import { fetchTenantUsers, createTenantUser, updateTenantUser, deleteTenantUser } from "@/app/lib/api";

interface TenantUser {
  id: number;
  tenant_id?: number;
  full_name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  is_active: boolean;
  created_at: string;
  last_active?: string;
}

export default function TenantUserManagement({ tenantSlug: propTenantSlug }: { tenantSlug: string }) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 3, // Default to 3 (Viewer)
  });

  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    role_id: 3,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to retrieve active tenant slug from props, localStorage, or pathname
  const getActiveTenantSlug = () => {
    if (propTenantSlug) return propTenantSlug;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tenant_slug");
      if (stored) return stored;
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) return pathParts[0];
    }
    return "";
  };

  const activeTenantSlug = getActiveTenantSlug();

  const loadUsers = async () => {
    if (!activeTenantSlug) return;
    try {
      setError("");
      const data = await fetchTenantUsers(activeTenantSlug);
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load team members");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeTenantSlug]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenantSlug) {
      setError("Tenant identifier is missing. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createTenantUser(activeTenantSlug, {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role_id: Number(formData.role_id),
      });

      setShowModal(false);
      setFormData({ full_name: "", email: "", password: "", role_id: 3 });
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal on Row Click
  const handleRowClick = (user: TenantUser) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id || 3,
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  // Edit User Handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !activeTenantSlug) return;

    setLoading(true);
    setError("");

    try {
      await updateTenantUser(activeTenantSlug, selectedUser.id, editFormData);
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Soft Delete Handler (Toggles or Deactivates user)
  const handleSoftDelete = async (e: React.MouseEvent, user: TenantUser) => {
    e.stopPropagation(); // Stop row click event from opening edit modal
    if (!activeTenantSlug) return;

    const actionText = user.is_active ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${actionText} ${user.email}?`)) return;

    try {
      setError("");
      await deleteTenantUser(activeTenantSlug, user.id);
      loadUsers();
    } catch (err: any) {
      setError(err.message || `Failed to ${actionText} user`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-500">Manage user access and roles for your workspace.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition text-sm"
        >
          + Add New User
        </button>
      </div>

      {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

      <table className="w-full text-left text-sm text-slate-600 border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Last Active</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-slate-400">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr
                key={u.id}
                onClick={() => handleRowClick(u)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="p-3 font-medium text-slate-800">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-semibold text-slate-700">
                    {u.role_name || (u.role_id === 1 ? "Admin" : u.role_id === 2 ? "Manager" : "Viewer")}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-400">
                  {u.last_active
                    ? new Date(u.last_active).toLocaleString()
                    : u.created_at
                    ? new Date(u.created_at).toLocaleString()
                    : "Never"}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={(e) => handleSoftDelete(e, u)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                      u.is_active
                        ? "text-red-600 hover:bg-red-50 border border-red-200"
                        : "text-green-600 hover:bg-green-50 border border-green-200"
                    }`}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* CREATE USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add User to Workspace</h3>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3}>Viewer (Read-only)</option>
                  <option value={5}>Editor (Read/Write, No User Mgmt)</option>
                  <option value={2}>Manager (Read/Write)</option>
                  <option value={1}>Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Team Member</h3>
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select
                  value={editFormData.role_id}
                  onChange={(e) => setEditFormData({ ...editFormData, role_id: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3}>Viewer (Read-only)</option>
                  <option value={5}>Editor (Read/Write, No User Mgmt)</option>
                  <option value={2}>Manager (Read/Write)</option>
                  <option value={1}>Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit_is_active" className="text-sm text-slate-700">
                  Active Account
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

