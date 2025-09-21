import { NextRequest, NextResponse } from 'next/server';

// Store global template settings in memory for now (in production, use database)
let globalTemplateSettings = {
  global_hero_title: 'Welcome to Evergreen AI',
  global_hero_message: 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
  global_signature_name: 'Gabriel Lacroix',
  global_signature_title: 'AI Solutions Specialist',
  global_signature_company: 'Evergreen Web Solutions',
  global_signature_location: 'Terrace, BC',
  global_event_title: 'Event Details',
  global_event_date: 'October 23rd, 2025',
  global_event_time: '6:00 PM - 8:00 PM',
  global_event_location: 'Terrace, BC',
  global_event_cost: 'Free',
  global_event_includes: 'Coffee, refreshments, networking, and actionable AI insights',
};

export async function GET() {
  try {
    return NextResponse.json(globalTemplateSettings);
  } catch (error) {
    console.error('Error fetching global template settings:', error);
    return NextResponse.json({ error: 'Failed to fetch global template settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 });
    }

    // Update global template settings
    globalTemplateSettings = { ...globalTemplateSettings, ...settings };

    return NextResponse.json({ 
      message: 'Global template settings updated successfully',
      settings: globalTemplateSettings 
    });
  } catch (error) {
    console.error('Error updating global template settings:', error);
    return NextResponse.json({ error: 'Failed to update global template settings' }, { status: 500 });
  }
}
