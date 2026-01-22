import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint creates the initial admin user
// It should be removed or secured after first use
export async function POST(request: Request) {
  const { email, password, setupKey } = await request.json();

  // Simple security key to prevent unauthorized access
  if (setupKey !== 'aquador-setup-2024') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  // Use service role for admin operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if any admin users exist
  const { data: existingAdmins } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .limit(1);

  if (existingAdmins && existingAdmins.length > 0) {
    return NextResponse.json({ error: 'Admin user already exists. Use the admin panel to create more.' }, { status: 400 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: 'Failed to create user: ' + authError.message }, { status: 500 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  // Add to admin_users table as super_admin
  const { error: insertError } = await supabaseAdmin
    .from('admin_users')
    .insert({
      id: authData.user.id,
      email,
      role: 'super_admin',
    });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to add admin role: ' + insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Admin user created successfully',
    email
  });
}
