#!/usr/bin/env node

/**
 * Delete All Campaigns Script
 * Actually deletes all campaigns from the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllCampaigns() {
  console.log('🗑️ Deleting all campaigns from database...\n');
  
  try {
    // Get initial count
    const initialCount = await prisma.campaign.count();
    console.log(`📊 Initial campaign count: ${initialCount}`);
    
    if (initialCount === 0) {
      console.log('✅ No campaigns to delete.');
      return;
    }
    
    // Delete all campaigns
    const result = await prisma.campaign.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} campaigns successfully!`);
    
    // Verify deletion
    const finalCount = await prisma.campaign.count();
    console.log(`📊 Final campaign count: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log('🎉 All campaigns deleted successfully!');
    } else {
      console.log(`⚠️ Warning: ${finalCount} campaigns still remain.`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting campaigns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCampaigns();
