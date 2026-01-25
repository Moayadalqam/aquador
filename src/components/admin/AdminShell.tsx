'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import type { User } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

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

          if (adminError) {
            console.error('Admin user error:', adminError);
          }

          setAdminUser(adminData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            setAdminUser(adminData);
          } else {
            setUser(null);
            setAdminUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    );

    return () => {
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
