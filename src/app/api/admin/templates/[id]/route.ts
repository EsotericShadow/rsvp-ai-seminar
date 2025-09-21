import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.campaignTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { 
      name, 
      subject, 
      htmlBody, 
      textBody,
      // Template variables
      greeting_title,
      greeting_message,
      signature_name,
      signature_title,
      signature_company,
      signature_location,
      main_content_title,
      main_content_body,
      button_text,
      additional_info_title,
      additional_info_body,
      closing_title,
      closing_message
    } = body;

    const template = await prisma.campaignTemplate.update({
      where: { id: params.id },
      data: {
        name,
        subject,
        htmlBody,
        textBody,
        // Template variables
        greeting_title,
        greeting_message,
        signature_name,
        signature_title,
        signature_company,
        signature_location,
        main_content_title,
        main_content_body,
        button_text,
        additional_info_title,
        additional_info_body,
        closing_title,
        closing_message,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campaignTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
