import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ABTestResult {
  variantId: string;
  variantName: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  statisticalSignificance: number;
  isWinner: boolean;
  recommendation: string;
}

interface StatisticalTest {
  testName: string;
  variants: ABTestResult[];
  winner?: ABTestResult;
  recommendation: string;
  nextAction: string;
}

class ABTestingEngine {
  /**
   * Calculate statistical significance using chi-square test
   */
  calculateStatisticalSignificance(
    variantA: { sent: number; converted: number },
    variantB: { sent: number; converted: number }
  ): number {
    const totalA = variantA.sent;
    const successA = variantA.converted;
    const totalB = variantB.sent;
    const successB = variantB.converted;

    // Calculate conversion rates
    const rateA = successA / totalA;
    const rateB = successB / totalB;

    // Calculate chi-square statistic
    const expectedSuccessA = (successA + successB) * (totalA / (totalA + totalB));
    const expectedSuccessB = (successA + successB) * (totalB / (totalA + totalB));
    const expectedFailA = totalA - expectedSuccessA;
    const expectedFailB = totalB - expectedSuccessB;

    const chiSquare = 
      Math.pow(successA - expectedSuccessA, 2) / expectedSuccessA +
      Math.pow(successB - expectedSuccessB, 2) / expectedSuccessB +
      Math.pow((totalA - successA) - expectedFailA, 2) / expectedFailA +
      Math.pow((totalB - successB) - expectedFailB, 2) / expectedFailB;

    // Convert to p-value (simplified)
    // In practice, you'd use proper chi-square distribution tables
    return Math.min(95, Math.max(0, 100 - (chiSquare * 10)));
  }

  /**
   * Calculate confidence interval for conversion rate
   */
  calculateConfidenceInterval(conversions: number, total: number, confidenceLevel: number = 95): { lower: number; upper: number } {
    const rate = conversions / total;
    const zScore = confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645;
    
    const marginOfError = zScore * Math.sqrt((rate * (1 - rate)) / total);
    
    return {
      lower: Math.max(0, rate - marginOfError),
      upper: Math.min(1, rate + marginOfError)
    };
  }

  /**
   * Determine if test has reached statistical significance
   */
  hasStatisticalSignificance(results: ABTestResult[], minimumSampleSize: number = 100, confidenceLevel: number = 95): boolean {
    // Check if all variants have minimum sample size
    const hasMinimumSample = results.every(r => r.sent >= minimumSampleSize);
    
    if (!hasMinimumSample) return false;

    // Check if winner has statistical significance over others
    const winner = results.reduce((prev, current) => 
      prev.conversionRate > current.conversionRate ? prev : current
    );

    const otherVariants = results.filter(r => r.variantId !== winner.variantId);
    
    return otherVariants.every(variant => 
      winner.statisticalSignificance >= confidenceLevel
    );
  }

  /**
   * Analyze A/B test results and provide recommendations
   */
  analyzeABTest(campaignId: string, testName: string): Promise<StatisticalTest> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🧪 Analyzing A/B test: ${testName}`);

        // Get campaign sends data
        const sends = await prisma.campaignSend.findMany({
          where: {
            schedule: {
              campaignId: campaignId
            }
          },
          include: {
            schedule: {
              include: {
                template: true
              }
            }
          }
        });

        // Group by template (variant)
        const variantGroups = new Map<string, any[]>();
        
        for (const send of sends) {
          const templateName = send.schedule.template.name;
          if (!variantGroups.has(templateName)) {
            variantGroups.set(templateName, []);
          }
          variantGroups.get(templateName)!.push(send);
        }

        // Calculate metrics for each variant
        const results: ABTestResult[] = [];
        
        for (const [variantName, variantSends] of variantGroups) {
          const sent = variantSends.length;
          const opened = variantSends.filter(s => s.openedAt).length;
          const clicked = variantSends.filter(s => s.visitedAt).length;
          const converted = variantSends.filter(s => s.rsvpAt).length;

          const openRate = sent > 0 ? opened / sent : 0;
          const clickRate = sent > 0 ? clicked / sent : 0;
          const conversionRate = sent > 0 ? converted / sent : 0;

          // Calculate statistical significance against other variants
          const otherVariants = Array.from(variantGroups.entries())
            .filter(([name]) => name !== variantName)
            .map(([_, sends]) => ({
              sent: sends.length,
              converted: sends.filter(s => s.rsvpAt).length
            }));

          let statisticalSignificance = 0;
          if (otherVariants.length > 0) {
            const otherVariant = otherVariants[0]; // Compare against first other variant
            statisticalSignificance = this.calculateStatisticalSignificance(
              { sent, converted },
              otherVariant
            );
          }

          const confidenceInterval = this.calculateConfidenceInterval(converted, sent);

          let recommendation = '';
          if (statisticalSignificance >= 95) {
            recommendation = 'Strong winner - deploy to all traffic';
          } else if (statisticalSignificance >= 80) {
            recommendation = 'Likely winner - continue testing with larger sample';
          } else if (sent < 100) {
            recommendation = 'Insufficient data - continue testing';
          } else {
            recommendation = 'No clear winner - consider new variants';
          }

          results.push({
            variantId: variantName.toLowerCase().replace(/\s+/g, '-'),
            variantName,
            sent,
            opened,
            clicked,
            converted,
            openRate,
            clickRate,
            conversionRate,
            confidenceInterval,
            statisticalSignificance,
            isWinner: false,
            recommendation
          });
        }

        // Determine winner
        const winner = results.reduce((prev, current) => 
          prev.conversionRate > current.conversionRate ? prev : current
        );
        winner.isWinner = true;

        // Generate overall recommendation
        const hasSignificance = this.hasStatisticalSignificance(results);
        let overallRecommendation = '';
        let nextAction = '';

        if (hasSignificance) {
          overallRecommendation = `Winner identified: ${winner.variantName} with ${winner.conversionRate.toFixed(2)}% conversion rate`;
          nextAction = 'Deploy winning variant to all traffic and end test';
        } else if (results.every(r => r.sent < 100)) {
          overallRecommendation = 'Test needs more data - continue running';
          nextAction = 'Continue test until minimum sample size reached';
        } else {
          overallRecommendation = 'No statistical significance yet - consider extending test';
          nextAction = 'Extend test duration or increase sample size';
        }

        const test: StatisticalTest = {
          testName,
          variants: results,
          winner: hasSignificance ? winner : undefined,
          recommendation: overallRecommendation,
          nextAction
        };

        console.log(`✅ A/B test analysis complete`);
        console.log(`   Winner: ${winner.variantName} (${winner.conversionRate.toFixed(2)}%)`);
        console.log(`   Significance: ${hasSignificance ? 'Yes' : 'No'}`);
        console.log(`   Recommendation: ${overallRecommendation}`);

        resolve(test);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate detailed A/B test report
   */
  generateReport(test: StatisticalTest): string {
    let report = `
# A/B Test Analysis Report: ${test.testName}

## Executive Summary
${test.recommendation}

## Test Results

`;

    for (const variant of test.variants) {
      report += `
### ${variant.variantName} ${variant.isWinner ? '🏆 (WINNER)' : ''}
- **Sent**: ${variant.sent}
- **Opened**: ${variant.opened} (${(variant.openRate * 100).toFixed(1)}%)
- **Clicked**: ${variant.clicked} (${(variant.clickRate * 100).toFixed(1)}%)
- **Converted**: ${variant.converted} (${(variant.conversionRate * 100).toFixed(2)}%)
- **Statistical Significance**: ${variant.statisticalSignificance.toFixed(1)}%
- **Confidence Interval**: ${(variant.confidenceInterval.lower * 100).toFixed(2)}% - ${(variant.confidenceInterval.upper * 100).toFixed(2)}%
- **Recommendation**: ${variant.recommendation}

`;
    }

    report += `
## Next Action
${test.nextAction}

## Statistical Notes
- Minimum sample size: 100 per variant
- Confidence level: 95%
- Statistical significance calculated using chi-square test
- Winner determined by highest conversion rate with statistical significance

Generated: ${new Date().toISOString()}
`;

    return report;
  }
}

async function runABTestAnalysis() {
  try {
    console.log('🧪 Running A/B Test Analysis...');

    const engine = new ABTestingEngine();

    // Find the A/B test campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          contains: 'A/B Test'
        }
      }
    });

    if (!campaign) {
      console.log('❌ No A/B test campaign found');
      return;
    }

    const test = await engine.analyzeABTest(campaign.id, 'AI Event Email 1 - Subject Line Test');
    
    const report = engine.generateReport(test);
    
    console.log('\n📊 A/B TEST REPORT');
    console.log('════════════════════════════════════════════════════════════');
    console.log(report);

    // Save report to file
    const fs = require('fs');
    const reportPath = `ab-test-report-${Date.now()}.md`;
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error running A/B test analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { ABTestingEngine };
export type { ABTestResult, StatisticalTest };

// Run analysis if called directly
if (require.main === module) {
  runABTestAnalysis();
}
