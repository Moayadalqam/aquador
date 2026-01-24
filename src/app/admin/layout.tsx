import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { AdminUser } from '@/lib/supabase/types';

export const metadata = {
  title: 'Admin Panel | Aquad\'or',
  description: 'Manage your Aquad\'or store',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Try to get user - may not exist for login page
  const { data: { user } } = await supabase.auth.getUser();

  // If no user, render children without admin chrome (for login page)
  if (!user) {
    return <>{children}</>;
  }

  // Fetch admin user details
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={user} adminUser={adminUser as AdminUser} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
