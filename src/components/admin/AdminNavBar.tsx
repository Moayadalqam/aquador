'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  Tags,
  Settings,
  MessageCircle,
  LogOut,
  User,
  Menu,
  ChevronDown,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Live Chat', href: '/admin/live-chat', icon: MessageCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminNavBarProps {
  user: SupabaseUser;
  adminUser: AdminUser | null;
  onMobileMenuToggle: () => void;
}

export default function AdminNavBar({ user, adminUser, onMobileMenuToggle }: AdminNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const supabaseRef = useRef(createClient());
  const role = adminUser?.role || 'admin';

  useEffect(() => {
    const supabase = supabaseRef.current;
    const loadCount = async () => {
      const { count } = await supabase
        .from('live_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['waiting', 'active']);
      setWaitingCount(count ?? 0);
    };
    loadCount();
    const channel = supabase
      .channel('navbar-live-chat-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_chat_sessions' }, () => loadCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-[60px] md:top-[70px] z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gold/10">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Mobile: hamburger */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop: horizontal nav links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gold/10 text-gold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                  {item.name === 'Live Chat' && waitingCount > 0 && (
                    <span className="bg-amber-500 text-black text-[9px] font-bold px-1 py-px rounded-full min-w-[16px] text-center animate-pulse">
                      {waitingCount}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile: page title */}
          <span className="md:hidden text-sm font-semibold text-white">
            Admin
          </span>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-gold" />
              </div>
              <span className="hidden sm:block text-xs text-gray-300 max-w-[120px] truncate">{user.email}</span>
              <ChevronDown className="h-3 w-3 text-gray-500 hidden sm:block" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-20">
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
      </div>
    </div>
  );
}
