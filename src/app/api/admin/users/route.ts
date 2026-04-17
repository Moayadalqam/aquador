import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { formatApiError } from '@/lib/api-utils';

const CreateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['admin', 'super_admin']),
});

const DeleteAdminSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * Verify the caller is an authenticated super_admin.
 * Returns the caller's admin record on success, or a NextResponse error on failure.
 */
async function verifySuperAdmin(): Promise<
  | { admin: { id: string; email: string; role: string | null } }
  | { error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { data: callerAdmin, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (adminError || !callerAdmin) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: not an admin user' },
        { status: 403 }
      ),
    };
  }

  if (callerAdmin.role !== 'super_admin') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: only super_admin can manage admin users' },
        { status: 403 }
      ),
    };
  }

  return { admin: callerAdmin };
}

/**
 * POST /api/admin/users — Create a new admin user
 * Requires: caller must be super_admin
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Verify caller is super_admin
    const authResult = await verifySuperAdmin();
    if ('error' in authResult) return authResult.error;

    // Validate request body
    const body = await request.json();
    const parsed = CreateAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, role } = parsed.data;

    // Use service-role client for privileged operations
    const adminClient = createAdminClient();

    // Create the auth user via admin API (bypasses email confirmation)
    const { data: authData, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create user: ' + createError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user: no user returned' },
        { status: 500 }
      );
    }

    // Insert into admin_users table
    const { error: insertError } = await adminClient
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        role,
      });

    if (insertError) {
      // Attempt to clean up the auth user if admin_users insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id).catch((cleanupErr) => {
        console.error('Failed to clean up auth user after admin_users insert failure:', cleanupErr);
      });

      return NextResponse.json(
        { error: 'Failed to add admin role: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: authData.user.id,
        email,
        role,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to create admin user'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users — Remove an admin user
 * Requires: caller must be super_admin
 */
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Verify caller is super_admin
    const authResult = await verifySuperAdmin();
    if ('error' in authResult) return authResult.error;

    // Validate request body
    const body = await request.json();
    const parsed = DeleteAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Prevent self-deletion
    if (userId === authResult.admin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Delete from admin_users table first
    const { error: deleteError } = await adminClient
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to remove admin role: ' + deleteError.message },
        { status: 500 }
      );
    }

    // Also delete the auth user
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      // Log but don't fail — the admin_users record is already deleted
      console.error('Failed to delete auth user (admin_users already removed):', authDeleteError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user removed successfully',
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to remove admin user'),
      { status: 500 }
    );
  }
}
