import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    // Verify AI service API key
    const apiKey = request.headers.get('X-AI-API-Key');
    const expectedApiKey = process.env.AI_SERVICE_API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🗑️ Deleting all phony business entries...');
    
    // Delete audience members that contain "phony" or "test" in their name or email
    const deletedBusinesses = await prisma.audienceMember.deleteMany({
      where: {
        OR: [
          { businessName: { contains: 'phony', mode: 'insensitive' } },
          { businessName: { contains: 'test', mode: 'insensitive' } },
          { primaryEmail: { contains: 'phony', mode: 'insensitive' } },
          { primaryEmail: { contains: 'test', mode: 'insensitive' } },
          { businessName: { contains: 'fake', mode: 'insensitive' } },
          { primaryEmail: { contains: 'fake', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log(`Deleted ${deletedBusinesses.count} phony business entries`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedBusinesses.count} phony business entries`,
      deletedCount: deletedBusinesses.count
    });
    
  } catch (error) {
    console.error('❌ Error deleting phony business entries:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete phony business entries',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
