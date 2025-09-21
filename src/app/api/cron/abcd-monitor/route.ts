import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cron job endpoint that runs every 6 hours to monitor A/B/C tests
export async function GET(request: NextRequest) {
  try {
    console.log('🤖 Starting automated A/B/C test monitoring...');
    
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active A/B/C tests
    const activeTests = await prisma.campaignSchedule.findMany({
      where: {
        status: 'SCHEDULED',
        timeZone: {
          contains: 'A/B/C Test'
        }
      },
      include: {
        template: true,
        campaign: true,
        sends: true
      }
    });

    console.log(`📊 Found ${activeTests.length} active A/B/C test variants`);

    // Group by campaign and email
    const testGroups = groupTestsByCampaignAndEmail(activeTests);
    
    let adjustmentsMade = 0;
    
    for (const [key, tests] of testGroups.entries()) {
      const result = await analyzeTestGroup(key, tests);
      if (result.adjusted) {
        adjustmentsMade++;
      }
    }
    
    console.log(`✅ Monitoring complete. Made ${adjustmentsMade} split adjustments.`);

    return NextResponse.json({ 
      success: true,
      testsMonitored: activeTests.length,
      adjustmentsMade,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in A/B/C monitoring cron:', error);
    return NextResponse.json(
      { error: 'Monitoring failed' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

async function analyzeTestGroup(key: string, tests: any[]): Promise<{ adjusted: boolean }> {
  const [campaignName, emailNumber] = key.split('|');
  
  console.log(`🔍 Analyzing ${campaignName} Email ${emailNumber}...`);
  
  // Get performance metrics for each variant
  const metrics = await getPerformanceMetrics(tests);
  
  // Check if we have enough data
  const totalSends = metrics.reduce((sum, m) => sum + m.sends, 0);
  if (totalSends < 50) {
    console.log(`⏳ Not enough data for ${campaignName} Email ${emailNumber} (${totalSends} sends)`);
    return { adjusted: false };
  }
  
  // Check if enough time has passed
  const testStartTime = getTestStartTime(tests);
  const hoursElapsed = (Date.now() - testStartTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursElapsed < 48) {
    console.log(`⏳ Test running for ${hoursElapsed.toFixed(1)} hours, need 48 hours`);
    return { adjusted: false };
  }
  
  // Analyze performance
  const results = analyzePerformance(metrics);
  
  // Check for significant differences
  const winner = results.find(r => r.winner);
  if (winner) {
    console.log(`🏆 Winner found for ${campaignName} Email ${emailNumber}: Variant ${winner.variant}`);
    await adjustSplit(tests, winner.variant);
    return { adjusted: true };
  } else {
    console.log(`📊 No significant winner for ${campaignName} Email ${emailNumber}`);
    return { adjusted: false };
  }
}

async function getPerformanceMetrics(tests: any[]): Promise<any[]> {
  return tests.map(test => {
    const sends = test.sends || [];
    const opens = sends.filter((s: any) => s.openedAt).length;
    const clicks = sends.filter((s: any) => s.clickedAt).length;
    const rsvps = sends.filter((s: any) => s.rsvpedAt).length;
    
    return {
      variant: extractVariant(test.template.name),
      scheduleId: test.id,
      opens,
      clicks,
      rsvps,
      sends: sends.length,
      openRate: sends.length > 0 ? opens / sends.length : 0,
      clickRate: sends.length > 0 ? clicks / sends.length : 0,
      rsvpRate: sends.length > 0 ? rsvps / sends.length : 0,
      timestamp: new Date()
    };
  });
}

function analyzePerformance(metrics: any[]): any[] {
  // Statistical analysis to determine winners
  // Using RSVP rate as primary metric
  
  const results = metrics.map(metric => {
    const confidence = calculateConfidence(metric.sends, metric.rsvpRate);
    const isSignificant = confidence > 0.95;
    
    return {
      variant: metric.variant,
      metrics: metric,
      isSignificant,
      confidence,
      winner: false // Will be determined after comparison
    };
  });
  
  // Find winner (highest RSVP rate with statistical significance)
  const sortedResults = results.sort((a, b) => b.metrics.rsvpRate - a.metrics.rsvpRate);
  
  if (sortedResults.length > 0 && sortedResults[0].isSignificant) {
    const winner = sortedResults[0];
    const secondBest = sortedResults[1];
    
    if (secondBest) {
      // Check if winner is significantly better than second best
      const improvement = winner.metrics.rsvpRate - secondBest.metrics.rsvpRate;
      
      if (improvement > 0.05) { // 5% improvement threshold
        winner.winner = true;
      }
    } else {
      // Only one variant, mark as winner if significant
      winner.winner = true;
    }
  }
  
  return results;
}

async function adjustSplit(tests: any[], winnerVariant: string) {
  console.log(`🔄 Adjusting split to favor Variant ${winnerVariant}`);
  
  // New split: 70% winner, 15% each of others
  const newSplit: Record<string, number> = {
    [winnerVariant]: 70
  };
  
  // Assign 15% to each non-winner variant
  const otherVariants = tests
    .map(t => extractVariant(t.template.name))
    .filter(v => v !== winnerVariant);
  
  otherVariants.forEach(variant => {
    newSplit[variant] = 15;
  });
  
  // Update schedule statuses based on new split
  for (const test of tests) {
    const variant = extractVariant(test.template.name);
    const split = newSplit[variant] || 0;
    
    // Randomly assign based on split (in production, use proper random assignment)
    const shouldSend = Math.random() * 100 < split;
    
    await prisma.campaignSchedule.update({
      where: { id: test.id },
      data: {
        status: shouldSend ? 'SCHEDULED' : 'DRAFT',
        // Store A/B/C test info in meta field instead of timeZone
        meta: {
          abTest: {
            variant: variant,
            split: split,
            testGroup: test.id,
            lastUpdated: new Date().toISOString()
          }
        }
      }
    });
  }
  
  console.log(`✅ Split adjusted: ${Object.entries(newSplit).map(([v, s]) => `${v}: ${s}%`).join(', ')}`);
}

function extractVariant(templateName: string): string {
  const match = templateName.match(/Variant ([ABC])/);
  return match ? match[1] : 'Original';
}

function calculateConfidence(sampleSize: number, successRate: number): number {
  // Simplified confidence calculation
  // In reality, you'd use proper statistical tests (chi-square, t-test, etc.)
  const baseConfidence = Math.min(0.99, 0.5 + (sampleSize / 1000) * 0.4);
  const rateAdjustment = Math.min(0.1, successRate * 0.2);
  
  return Math.min(0.99, baseConfidence + rateAdjustment);
}

function getTestStartTime(tests: any[]): Date {
  // Get the earliest send time from the tests
  const sendTimes = tests.map(t => t.sendAt).filter(Boolean);
  return sendTimes.length > 0 ? new Date(Math.min(...sendTimes.map(d => new Date(d).getTime()))) : new Date();
}

function groupTestsByCampaignAndEmail(tests: any[]): Map<string, any[]> {
  const groups = new Map();
  
  for (const test of tests) {
    const key = `${test.campaign.name}|${test.stepOrder}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(test);
  }
  
  return groups;
}
