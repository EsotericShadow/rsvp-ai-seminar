import { NextRequest, NextResponse } from 'next/server';
import { sendRSVPConfirmation, testSendGridConfiguration } from '@/lib/sendgrid-email';
import { z } from 'zod';

const TestEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Check if this is a test configuration request
    const url = new URL(req.url);
    if (url.searchParams.get('config') === 'true') {
      const isConfigured = await testSendGridConfiguration();
      return NextResponse.json({ 
        configured: isConfigured,
        message: isConfigured ? 'SendGrid configuration is working' : 'SendGrid configuration failed'
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const { email, name } = TestEmailSchema.parse(body);

    // Send test email
    const result = await sendRSVPConfirmation({
      to: email,
      name: name,
      rsvpId: 'test-rsvp-' + Date.now()
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Test email error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isConfigured = await testSendGridConfiguration();
    
    return NextResponse.json({
      configured: isConfigured,
      environment: {
        hasSendGridKey: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'Not configured',
        domain: process.env.SENDGRID_DOMAIN || 'Not configured',
      },
      message: isConfigured 
        ? 'SendGrid system is properly configured'
        : 'SendGrid system needs configuration'
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: 'Configuration check failed'
    }, { status: 500 });
  }
}
