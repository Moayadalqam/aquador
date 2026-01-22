import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AdminUser } from '@/lib/supabase/types';

export const metadata = {
  title: 'Admin Panel | Aquad\'or',
  description: 'Manage your Aquad\'or store',
};

// TEMPORARY: Auth disabled - using mock user data
// TODO: Re-enable authentication before production
const mockUser: SupabaseUser = {
  id: 'dev-user',
  email: 'admin@aquadorcy.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const mockAdminUser: AdminUser = {
  id: 'dev-user',
  email: 'admin@aquadorcy.com',
  role: 'super_admin',
  created_at: new Date().toISOString(),
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TEMPORARY: Auth disabled - allow all access
  // TODO: Re-enable authentication before production

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={mockUser} adminUser={mockAdminUser} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
