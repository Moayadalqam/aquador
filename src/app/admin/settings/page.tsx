'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Shield, ShieldCheck } from 'lucide-react';
import type { AdminUser } from '@/lib/supabase/types';

export default function SettingsPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });

    setAdminUsers(data || []);
    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    const supabase = createClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (authError) {
      setError('Failed to create user: ' + authError.message);
      setCreating(false);
      return;
    }

    if (!authData.user) {
      setError('Failed to create user');
      setCreating(false);
      return;
    }

    // Add to admin_users table
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: newEmail,
        role: newRole,
      });

    if (insertError) {
      setError('Failed to add admin role: ' + insertError.message);
      setCreating(false);
      return;
    }

    setSuccess('Admin user created successfully! They can now log in.');
    setNewEmail('');
    setNewPassword('');
    setNewRole('admin');
    loadAdminUsers();
    setCreating(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage admin users and store settings</p>
      </div>

      {/* Create Admin User */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gold" />
          Add Admin User
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="admin@aquadorcy.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'super_admin')}
              className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Super Admins can manage other admin users
            </p>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Admin User'}
          </button>
        </form>
      </div>

      {/* Admin Users List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Admin Users</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400">Loading...</div>
        ) : adminUsers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            No admin users yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {adminUsers.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    {admin.role === 'super_admin' ? (
                      <ShieldCheck className="h-5 w-5 text-gold" />
                    ) : (
                      <Shield className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{admin.email}</p>
                    <p className="text-sm text-gray-400 capitalize">
                      {(admin.role || 'admin').replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Store Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Store URL</p>
            <p className="text-white">https://aquadorcy.com</p>
          </div>
          <div>
            <p className="text-gray-400">Supabase Project</p>
            <p className="text-white">aquador (hznpuxplqgszbacxzbhv)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
