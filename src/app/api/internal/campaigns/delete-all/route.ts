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

    console.log('🗑️ Deleting all campaigns...');
    
    // Delete all campaign schedules first (foreign key constraint)
    const deletedSchedules = await prisma.campaignSchedule.deleteMany({});
    console.log(`Deleted ${deletedSchedules.count} campaign schedules`);
    
    // Delete all campaigns
    const deletedCampaigns = await prisma.campaign.deleteMany({});
    console.log(`Deleted ${deletedCampaigns.count} campaigns`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCampaigns.count} campaigns and ${deletedSchedules.count} schedules`,
      deletedCampaigns: deletedCampaigns.count,
      deletedSchedules: deletedSchedules.count
    });
    
  } catch (error) {
    console.error('❌ Error deleting all campaigns:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete campaigns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
