import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { fetchWithTimeout, formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0).optional(), // Spam protection - must be empty
});

// HTML-escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'contact');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Validate request body
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message, honeypot } = result.data;

    // Check honeypot (spam bot detection)
    // If honeypot field is filled, it's likely a bot - return fake success
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ success: true });
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmailTo = process.env.CONTACT_EMAIL_TO || 'info@aquadorcy.com';

    if (!resendApiKey) {
      // If no Resend key, log the message and return success
      console.log('Contact form submission (no email service configured):', {
        name: escapeHtml(name),
        email: escapeHtml(email),
        subject: escapeHtml(subject),
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Message received (email service not configured)',
      });
    }

    // Send email via Resend with timeout
    const emailResponse = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Aquad\'or Website <noreply@aquadorcy.com>',
        to: [contactEmailTo],
        subject: `[Contact Form] ${escapeHtml(subject)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
              <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            </div>

            <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              This message was sent via the contact form on aquadorcy.com at ${new Date().toLocaleString('en-CY', { timeZone: 'Europe/Nicosia' })}
            </p>
          </div>
        `,
        reply_to: email,
      }),
      timeout: 10000, // 10 second timeout
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    Sentry.captureException(error);

    const errorResponse = formatApiError(error, 'Failed to process your message. Please try again later.');

    return NextResponse.json({ error: errorResponse.error }, { status: 500 });
  }
}
