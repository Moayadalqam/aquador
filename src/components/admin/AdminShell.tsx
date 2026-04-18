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
  const [liveChatCount, setLiveChatCount] = useState(0);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Single live chat count subscription — shared by NavBar + Sidebar
  useEffect(() => {
    if (isLoginPage) return;
    const supabase = supabaseRef.current;
    const loadCount = async () => {
      const { count } = await supabase
        .from('live_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['waiting', 'active']);
      setLiveChatCount(count ?? 0);
    };
    loadCount();
    const channel = supabase
      .channel('admin-live-chat-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_chat_sessions' }, () => loadCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isLoginPage]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Admin Navigation Bar — horizontal on desktop, hamburger on mobile */}
      <AdminNavBar
        user={user}
        adminUser={adminUser}
        onMobileMenuToggle={toggleSidebar}
        liveChatCount={liveChatCount}
      />

      {/* Mobile sidebar drawer */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} liveChatCount={liveChatCount} />

      {/* Admin content area */}
      <main className="text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  );
}
