'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminNavBar from './AdminNavBar';
import type { User } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const mountedRef = useRef(true);

  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        if (!mountedRef.current) return;
        if (authError || !currentUser) { router.replace('/admin/login'); return; }
        setUser(currentUser);

        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (!mountedRef.current) return;
        if (adminError || !adminData) { router.replace('/admin/login?error=unauthorized'); return; }
        setAdminUser(adminData);
        setLoading(false);
      } catch {
        if (mountedRef.current) router.replace('/admin/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) return;
        if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          setUser(null);
          setAdminUser(null);
          router.replace('/admin/login');
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="pt-[80px] md:pt-[90px]">
      {/* Admin Navigation Bar — horizontal on desktop, hamburger on mobile */}
      <AdminNavBar
        user={user}
        adminUser={adminUser}
        onMobileMenuToggle={toggleSidebar}
      />

      {/* Mobile sidebar drawer */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Admin content area — dark panel */}
      <div className="bg-gray-950 text-white min-h-[calc(100vh-160px)] rounded-t-2xl mx-2 sm:mx-4 md:mx-6 mb-0 overflow-hidden">
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
