import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  totalSends: number;
  totalOpens: number;
  totalClicks: number;
  totalConversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  segments: SegmentMetrics[];
  abTestResults?: ABTestMetrics[];
  recommendations: string[];
  status: 'performing_well' | 'needs_optimization' | 'underperforming';
}

interface SegmentMetrics {
  segmentId: string;
  segmentName: string;
  sends: number;
  opens: number;
  clicks: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface ABTestMetrics {
  testName: string;
  variants: {
    name: string;
    sends: number;
    opens: number;
    clicks: number;
    conversions: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    statisticalSignificance: number;
    isWinner: boolean;
  }[];
  winner?: string;
  recommendation: string;
}

class CampaignMonitoringSystem {
  /**
   * Get comprehensive campaign metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    console.log(`📊 Analyzing campaign metrics for: ${campaignId}`);

    // Get campaign info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        schedules: {
          include: {
            group: true,
            sends: true
          }
        }
      }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Calculate overall metrics
    const allSends = campaign.schedules.flatMap(s => s.sends);
    const totalSends = allSends.length;
    const totalOpens = allSends.filter(s => s.openedAt).length;
    const totalClicks = allSends.filter(s => s.visitedAt).length;
    const totalConversions = allSends.filter(s => s.rsvpAt).length;

    const openRate = totalSends > 0 ? totalOpens / totalSends : 0;
    const clickRate = totalSends > 0 ? totalClicks / totalSends : 0;
    const conversionRate = totalSends > 0 ? totalConversions / totalSends : 0;

    // Analyze segments
    const segmentMetrics: SegmentMetrics[] = [];
    const segmentGroups = new Map<string, any[]>();

    // Group sends by segment
    for (const schedule of campaign.schedules) {
      const segmentId = schedule.group.name;
      if (!segmentGroups.has(segmentId)) {
        segmentGroups.set(segmentId, []);
      }
      segmentGroups.get(segmentId)!.push(...schedule.sends);
    }

    // Calculate segment metrics
    for (const [segmentName, sends] of segmentGroups) {
      const segmentSends = sends.length;
      const segmentOpens = sends.filter(s => s.openedAt).length;
      const segmentClicks = sends.filter(s => s.visitedAt).length;
      const segmentConversions = sends.filter(s => s.rsvpAt).length;

      const segmentOpenRate = segmentSends > 0 ? segmentOpens / segmentSends : 0;
      const segmentClickRate = segmentSends > 0 ? segmentClicks / segmentSends : 0;
      const segmentConversionRate = segmentSends > 0 ? segmentConversions / segmentSends : 0;

      // Determine performance level
      let performance: 'excellent' | 'good' | 'average' | 'poor';
      if (segmentConversionRate >= 0.05) performance = 'excellent';
      else if (segmentConversionRate >= 0.03) performance = 'good';
      else if (segmentConversionRate >= 0.01) performance = 'average';
      else performance = 'poor';

      segmentMetrics.push({
        segmentId: segmentName.toLowerCase().replace(/\s+/g, '-'),
        segmentName,
        sends: segmentSends,
        opens: segmentOpens,
        clicks: segmentClicks,
        conversions: segmentConversions,
        openRate: segmentOpenRate,
        clickRate: segmentClickRate,
        conversionRate: segmentConversionRate,
        performance
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalSends,
      openRate,
      clickRate,
      conversionRate,
      segments: segmentMetrics
    });

    // Determine overall status
    let status: 'performing_well' | 'needs_optimization' | 'underperforming';
    if (conversionRate >= 0.03) status = 'performing_well';
    else if (conversionRate >= 0.01) status = 'needs_optimization';
    else status = 'underperforming';

    return {
      campaignId,
      campaignName: campaign.name,
      totalSends,
      totalOpens,
      totalClicks,
      totalConversions,
      openRate,
      clickRate,
      conversionRate,
      segments: segmentMetrics,
      recommendations,
      status
    };
  }

  /**
   * Generate intelligent recommendations
   */
  generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    // Overall performance recommendations
    if (metrics.conversionRate < 0.01) {
      recommendations.push('🚨 LOW CONVERSION: Consider revising email content and subject lines');
    }

    if (metrics.openRate < 0.20) {
      recommendations.push('📧 LOW OPEN RATE: Test different subject lines and send times');
    }

    if (metrics.clickRate < 0.02) {
      recommendations.push('🔗 LOW CLICK RATE: Improve call-to-action buttons and email content');
    }

    // Segment-specific recommendations
    for (const segment of metrics.segments) {
      if (segment.performance === 'poor') {
        recommendations.push(`📉 ${segment.segmentName} underperforming: Consider segment-specific content`);
      } else if (segment.performance === 'excellent') {
        recommendations.push(`📈 ${segment.segmentName} performing excellently: Scale up this segment`);
      }
    }

    // Sample size recommendations
    if (metrics.totalSends < 100) {
      recommendations.push('📊 INSUFFICIENT DATA: Need more sends for reliable metrics');
    }

    // A/B test recommendations
    recommendations.push('🧪 Run A/B tests on subject lines and content for optimization');

    return recommendations;
  }

  /**
   * Analyze A/B test results
   */
  async analyzeABTestResults(campaignId: string): Promise<ABTestMetrics[]> {
    console.log(`🧪 Analyzing A/B test results for campaign: ${campaignId}`);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        schedules: {
          include: {
            template: true,
            sends: true
          }
        }
      }
    });

    if (!campaign) return [];

    // Group schedules by test (assuming A/B tests are grouped by step order)
    const testGroups = new Map<number, any[]>();
    
    for (const schedule of campaign.schedules) {
      if (!testGroups.has(schedule.stepOrder)) {
        testGroups.set(schedule.stepOrder, []);
      }
      testGroups.get(schedule.stepOrder)!.push(schedule);
    }

    const abTestResults: ABTestMetrics[] = [];

    // Analyze each test group
    for (const [stepOrder, schedules] of testGroups) {
      if (schedules.length <= 1) continue; // Skip if not an A/B test

      const variants = schedules.map(schedule => {
        const sends = schedule.sends;
        const variantSends = sends.length;
        const variantOpens = sends.filter((s: any) => s.openedAt).length;
        const variantClicks = sends.filter((s: any) => s.visitedAt).length;
        const variantConversions = sends.filter((s: any) => s.rsvpAt).length;

        return {
          name: schedule.template.name,
          sends: variantSends,
          opens: variantOpens,
          clicks: variantClicks,
          conversions: variantConversions,
          openRate: variantSends > 0 ? variantOpens / variantSends : 0,
          clickRate: variantSends > 0 ? variantClicks / variantSends : 0,
          conversionRate: variantSends > 0 ? variantConversions / variantSends : 0,
          statisticalSignificance: 0, // Would calculate this
          isWinner: false
        };
      });

      // Determine winner
      const winner = variants.reduce((prev, current) => 
        prev.conversionRate > current.conversionRate ? prev : current
      );
      winner.isWinner = true;

      let recommendation = '';
      if (winner.conversionRate >= 0.05) {
        recommendation = 'Strong winner - deploy to all traffic';
      } else if (winner.conversionRate >= 0.03) {
        recommendation = 'Likely winner - continue testing';
      } else {
        recommendation = 'No clear winner - test new variants';
      }

      abTestResults.push({
        testName: `Email ${stepOrder} A/B Test`,
        variants,
        winner: winner.name,
        recommendation
      });
    }

    return abTestResults;
  }

  /**
   * Generate comprehensive campaign report
   */
  generateCampaignReport(metrics: CampaignMetrics, abTestResults?: ABTestMetrics[]): string {
    let report = `
# Campaign Performance Report: ${metrics.campaignName}

## Executive Summary
**Status**: ${metrics.status.toUpperCase().replace('_', ' ')}
**Overall Performance**: ${(metrics.conversionRate * 100).toFixed(2)}% conversion rate

## Key Metrics
- **Total Sends**: ${metrics.totalSends.toLocaleString()}
- **Open Rate**: ${(metrics.openRate * 100).toFixed(2)}%
- **Click Rate**: ${(metrics.clickRate * 100).toFixed(2)}%
- **Conversion Rate**: ${(metrics.conversionRate * 100).toFixed(2)}%

## Segment Performance

`;

    for (const segment of metrics.segments) {
      const performanceEmoji = {
        excellent: '🟢',
        good: '🟡',
        average: '🟠',
        poor: '🔴'
      }[segment.performance];

      report += `
### ${performanceEmoji} ${segment.segmentName}
- **Sends**: ${segment.sends}
- **Open Rate**: ${(segment.openRate * 100).toFixed(2)}%
- **Click Rate**: ${(segment.clickRate * 100).toFixed(2)}%
- **Conversion Rate**: ${(segment.conversionRate * 100).toFixed(2)}%
- **Performance**: ${segment.performance.toUpperCase()}

`;
    }

    if (abTestResults && abTestResults.length > 0) {
      report += `
## A/B Test Results

`;

      for (const test of abTestResults) {
        report += `
### ${test.testName}
**Winner**: ${test.winner}
**Recommendation**: ${test.recommendation}

#### Variants:
`;

        for (const variant of test.variants) {
          report += `
- **${variant.name}** ${variant.isWinner ? '🏆' : ''}
  - Conversion Rate: ${(variant.conversionRate * 100).toFixed(2)}%
  - Open Rate: ${(variant.openRate * 100).toFixed(2)}%
  - Click Rate: ${(variant.clickRate * 100).toFixed(2)}%
`;
        }
      }
    }

    report += `
## Recommendations

`;

    for (const recommendation of metrics.recommendations) {
      report += `- ${recommendation}\n`;
    }

    report += `
---
Generated: ${new Date().toISOString()}
Campaign ID: ${metrics.campaignId}
`;

    return report;
  }

  /**
   * Monitor all campaigns and generate alerts
   */
  async monitorAllCampaigns(): Promise<void> {
    console.log('🔍 Monitoring all active campaigns...');

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ['SCHEDULED', 'SENDING']
        }
      }
    });

    const alerts: string[] = [];

    for (const campaign of campaigns) {
      try {
        const metrics = await this.getCampaignMetrics(campaign.id);
        
        // Check for alerts
        if (metrics.status === 'underperforming') {
          alerts.push(`🚨 ${campaign.name}: Underperforming (${(metrics.conversionRate * 100).toFixed(2)}% conversion)`);
        }

        if (metrics.totalSends > 0 && metrics.openRate < 0.15) {
          alerts.push(`📧 ${campaign.name}: Low open rate (${(metrics.openRate * 100).toFixed(2)}%)`);
        }

        if (metrics.totalSends > 100 && metrics.clickRate < 0.01) {
          alerts.push(`🔗 ${campaign.name}: Low click rate (${(metrics.clickRate * 100).toFixed(2)}%)`);
        }

      } catch (error) {
        console.error(`Error monitoring campaign ${campaign.id}:`, error);
      }
    }

    if (alerts.length > 0) {
      console.log('\n🚨 CAMPAIGN ALERTS:');
      console.log('════════════════════════════════════════════════════════════');
      alerts.forEach(alert => console.log(alert));
    } else {
      console.log('✅ All campaigns performing within normal parameters');
    }
  }
}

async function runCampaignMonitoring() {
  try {
    console.log('📊 Running Campaign Monitoring System...');

    const monitoring = new CampaignMonitoringSystem();

    // Monitor all campaigns
    await monitoring.monitorAllCampaigns();

    // Get the intelligent campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          contains: 'Intelligent A/B Test Campaign'
        }
      }
    });

    if (campaign) {
      console.log('\n📈 Generating detailed campaign report...');
      
      const metrics = await monitoring.getCampaignMetrics(campaign.id);
      const abTestResults = await monitoring.analyzeABTestResults(campaign.id);
      const report = monitoring.generateCampaignReport(metrics, abTestResults);

      console.log('\n📊 CAMPAIGN REPORT');
      console.log('════════════════════════════════════════════════════════════');
      console.log(report);

      // Save report
      const fs = require('fs');
      const reportPath = `campaign-report-${Date.now()}.md`;
      fs.writeFileSync(reportPath, report);
      console.log(`\n📄 Report saved to: ${reportPath}`);
    }

  } catch (error) {
    console.error('❌ Error running campaign monitoring:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { CampaignMonitoringSystem };
export type { CampaignMetrics };

// Run monitoring if called directly
if (require.main === module) {
  runCampaignMonitoring();
}
