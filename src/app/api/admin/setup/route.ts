import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { formatApiError } from '@/lib/api-utils';

const SetupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  setupKey: z.string().min(1),
});

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

function validateSetupKey(providedKey: string): boolean {
  const setupKey = process.env.ADMIN_SETUP_SECRET;
  if (!setupKey) return false;
  try {
    const a = Buffer.from(providedKey);
    const b = Buffer.from(setupKey);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// POST: Create initial admin user
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'checkout');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (process.env.ADMIN_SETUP_COMPLETE === 'true') {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 });
    }

    const body = await request.json();
  const parsed = SetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { email, password, setupKey } = parsed.data;

  if (!validateSetupKey(setupKey)) {
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
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Admin setup failed'),
      { status: 500 }
    );
  }
}

// PUT: Update existing admin password
export async function PUT(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'checkout');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (process.env.ADMIN_SETUP_COMPLETE === 'true') {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 });
    }

    const body = await request.json();
  const parsed = SetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { email, password, setupKey } = parsed.data;

  if (!validateSetupKey(setupKey)) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
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
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Password update failed'),
      { status: 500 }
    );
  }
}
