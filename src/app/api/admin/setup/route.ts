import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// POST: Create initial admin user
export async function POST(request: Request) {
  const { email, password, setupKey } = await request.json();

  if (setupKey !== 'aquador-setup-2024') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Check if any admin users exist
  const { data: existingAdmins } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .limit(1);

  if (existingAdmins && existingAdmins.length > 0) {
    return NextResponse.json({ error: 'Admin user already exists. Use PUT to update password.' }, { status: 400 });
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

// PUT: Update existing admin password
export async function PUT(request: Request) {
  const { email, password, setupKey } = await request.json();

  if (setupKey !== 'aquador-setup-2024') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Find the admin user
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
  }

  // Update the auth user's password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    adminUser.id,
    { password }
  );

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update password: ' + updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Password updated successfully',
    email
  });
}
