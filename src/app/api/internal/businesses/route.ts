import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify AI service API key
    const apiKey = request.headers.get('X-AI-API-Key');
    const expectedApiKey = process.env.AI_SERVICE_API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📋 Listing all businesses...');
    
    const businesses = await prisma.audienceMember.findMany({
      select: {
        id: true,
        businessName: true,
        primaryEmail: true,
        tagsSnapshot: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${businesses.length} businesses`);
    
    return NextResponse.json({
      success: true,
      businesses,
      count: businesses.length
    });
    
  } catch (error) {
    console.error('❌ Error listing businesses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list businesses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
