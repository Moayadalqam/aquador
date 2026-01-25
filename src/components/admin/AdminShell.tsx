'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import type { User } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

interface AdminShellProps {
  children: React.ReactNode;
}

// Helper to check if error is an AbortError (harmless)
function isAbortError(error: unknown): boolean {
  return error instanceof Error &&
    (error.name === 'AbortError' || error.message.includes('aborted'));
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const mountedRef = useRef(true);

  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);

  useEffect(() => {
    mountedRef.current = true;

    // Skip auth check on login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async (retryCount = 0) => {
      const supabase = createClient();

      try {
        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

        // Don't update state if unmounted
        if (!mountedRef.current) return;

        if (authError) {
          console.error('Auth error:', authError);
          setLoading(false);
          return;
        }

        if (currentUser) {
          setUser(currentUser);

          // Get admin user details
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (!mountedRef.current) return;

          if (adminError) {
            console.error('Admin user error:', adminError);
          }

          setAdminUser(adminData);
        }

        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (error) {
        // Retry on AbortError (up to 2 times) - happens due to React Strict Mode
        if (isAbortError(error) && retryCount < 2 && mountedRef.current) {
          setTimeout(() => checkAuth(retryCount + 1), 100);
          return;
        }

        if (!isAbortError(error)) {
          console.error('Auth check failed:', error);
        }
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        try {
          if (session?.user) {
            setUser(session.user);
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            if (mountedRef.current) {
              setAdminUser(adminData);
            }
          } else {
            setUser(null);
            setAdminUser(null);
          }
        } catch (error) {
          if (!isAbortError(error)) {
            console.error('Auth state change error:', error);
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage]);

  // Login page - render without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Not authenticated - middleware should redirect, but show loading just in case
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Redirecting to login...</div>
      </div>
    );
  }

  // Authenticated - render admin layout
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={user} adminUser={adminUser} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
