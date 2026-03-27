'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tags, Settings, Plus, FileText,
  ShoppingBag, Users, X, MessageCircle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  liveChatCount: number;
}

export default function AdminSidebar({ isOpen, onClose, liveChatCount }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile-only backdrop + sidebar drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
            <Link href="/admin" onClick={onClose} className="flex items-center">
              <Image src="/aquador.webp" alt="Aquad'or" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}

            <Link
              href="/admin/live-chat"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin/live-chat')
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Live Chat
              {liveChatCount > 0 && (
                <span className="ml-auto bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                  {liveChatCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="px-3 py-3 border-t border-gray-800">
            <Link
              href="/admin/products/new"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
