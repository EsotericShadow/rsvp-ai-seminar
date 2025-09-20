import { NextRequest, NextResponse } from 'next/server';
import { handleSendGridWebhook } from '@/lib/sendgrid-email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // SendGrid webhook events come in an array
    const events = Array.isArray(body) ? body : [body];
    
    for (const event of events) {
      const { event: eventType, ...data } = event;
      
      // Handle different event types
      await handleSendGridWebhook({ type: eventType, data });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
