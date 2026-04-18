'use client';

import { useState } from 'react';
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
  liveChatCount: number;
}

export default function AdminNavBar({ user, adminUser, onMobileMenuToggle, liveChatCount }: AdminNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const role = adminUser?.role || 'admin';

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
    <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gold/10 shadow-sm shadow-black/20">
      <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left: brand + mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="h-7 w-7 rounded-md bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-black text-xs font-bold font-playfair">A</span>
              <span className="hidden sm:block text-sm font-semibold text-white tracking-wide">
                Aquad&apos;or <span className="text-gold/80 font-normal">· Admin</span>
              </span>
            </Link>
          </div>

          {/* Desktop: horizontal nav links */}
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 justify-center mx-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gold/10 text-gold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.name === 'Live Chat' && liveChatCount > 0 && (
                    <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-px rounded-full min-w-[18px] text-center animate-pulse">
                      {liveChatCount}
                    </span>
                  )}
                  {active && (
                    <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="User menu"
              aria-expanded={showDropdown}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center">
                <User className="h-4 w-4 text-gold" />
              </div>
              <span className="hidden sm:block text-xs text-gray-300 max-w-[140px] truncate">{user.email}</span>
              <ChevronDown className={`h-3 w-3 text-gray-500 hidden sm:block transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
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
