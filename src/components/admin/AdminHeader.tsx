'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, LogOut, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

interface AdminHeaderProps {
  user: SupabaseUser;
  adminUser: AdminUser | null;
}

export default function AdminHeader({ user, adminUser }: AdminHeaderProps) {
  const role = adminUser?.role || 'admin';
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Page Title - can be made dynamic */}
        <h1 className="text-lg font-semibold text-white lg:text-xl">
          Admin Panel
        </h1>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <User className="h-4 w-4 text-gold" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
