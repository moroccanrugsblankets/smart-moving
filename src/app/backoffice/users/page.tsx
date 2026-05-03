'use client';

import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' as 'admin' | 'manager' });
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/users');
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editUser) {
        const res = await fetch(`/api/backoffice/users/${editUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) }),
        });
        if (res.ok) { addToast('User updated'); await loadUsers(); closeModal(); }
        else { const e = await res.json(); addToast(e.error ?? 'Failed to update', 'error'); }
      } else {
        const res = await fetch('/api/backoffice/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) { addToast('User created'); await loadUsers(); closeModal(); }
        else { const e = await res.json(); addToast(e.error ?? 'Failed to create', 'error'); }
      }
    } catch {
      addToast('Error saving user', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/backoffice/users/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { addToast('User deleted'); await loadUsers(); }
      else { const e = await res.json(); addToast(e.error ?? 'Failed to delete', 'error'); }
    } catch {
      addToast('Error deleting user', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  function openCreate() {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'manager' });
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditUser(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
        >
          Create User
        </button>
      </div>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading users…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-slate-600 text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(user)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded">Edit</button>
                    <button onClick={() => setDeleteId(user.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white font-semibold mb-4">{editUser ? 'Edit User' : 'Create User'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-slate-400 text-sm mb-1">{editUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'manager' }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Delete User</h3>
            <p className="text-slate-400 text-sm mb-4">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
