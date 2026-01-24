import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin Panel | Aquad\'or',
  description: 'Manage your Aquad\'or store',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout - auth is handled by middleware and AdminShell client component
  return <AdminShell>{children}</AdminShell>;
}
