import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { name, subject, htmlBody, textBody } = body;

    if (!name || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, htmlBody' },
        { status: 400 }
      );
    }

    const updatedTemplate = await prisma.campaignTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        htmlBody,
        textBody: textBody || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.campaignTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
