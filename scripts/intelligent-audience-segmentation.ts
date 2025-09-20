import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    emailDomain?: string[];
    businessType?: string[];
    location?: string[];
    engagementLevel?: 'high' | 'medium' | 'low';
    hasRsvp?: boolean;
    lastActivity?: Date;
    customFilters?: Record<string, any>;
  };
  estimatedSize: number;
  priority: 'high' | 'medium' | 'low';
  groupId: string;
}

interface SegmentationRule {
  name: string;
  description: string;
  criteria: any;
  priority: number;
  targetAudience: string[];
}

class IntelligentAudienceSegmentation {
  /**
   * Analyze audience data and create intelligent segments
   */
  async analyzeAudience(): Promise<{
    totalAudience: number;
    domainDistribution: Record<string, number>;
    businessTypeDistribution: Record<string, number>;
    locationDistribution: Record<string, number>;
    engagementDistribution: Record<string, number>;
  }> {
    console.log('📊 Analyzing audience data...');

    const members = await prisma.audienceMember.findMany({
      select: {
        primaryEmail: true,
        businessName: true,
        meta: true,
        unsubscribed: true
      }
    });

    const analysis = {
      totalAudience: members.length,
      domainDistribution: {} as Record<string, number>,
      businessTypeDistribution: {} as Record<string, number>,
      locationDistribution: {} as Record<string, number>,
      engagementDistribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    for (const member of members) {
      if (member.unsubscribed) continue;

      // Domain analysis
      const domain = member.primaryEmail.split('@')[1]?.toLowerCase();
      if (domain) {
        analysis.domainDistribution[domain] = (analysis.domainDistribution[domain] || 0) + 1;
      }

      // Business type analysis
      const meta = member.meta as any;
      const businessType = meta?.originalData?.businessType || 'Unknown';
      analysis.businessTypeDistribution[businessType] = (analysis.businessTypeDistribution[businessType] || 0) + 1;

      // Location analysis
      const location = meta?.originalData?.city || 'Terrace';
      analysis.locationDistribution[location] = (analysis.locationDistribution[location] || 0) + 1;

      // Engagement analysis (simplified - in real system, would track actual engagement)
      const hasCustomDomain = !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain);
      if (hasCustomDomain) {
        analysis.engagementDistribution.high++;
      } else if (['gmail.com', 'outlook.com'].includes(domain)) {
        analysis.engagementDistribution.medium++;
      } else {
        analysis.engagementDistribution.low++;
      }
    }

    console.log('✅ Audience analysis complete');
    console.log(`   Total active audience: ${analysis.totalAudience}`);
    console.log(`   Top domains: ${Object.entries(analysis.domainDistribution).slice(0, 3).map(([domain, count]) => `${domain} (${count})`).join(', ')}`);

    return analysis;
  }

  /**
   * Create intelligent segments based on data analysis
   */
  async createIntelligentSegments(analysis: any): Promise<AudienceSegment[]> {
    console.log('🧠 Creating intelligent audience segments...');

    const segments: AudienceSegment[] = [];

    // High-Value Custom Domain Segment
    const customDomainGroup = await prisma.audienceGroup.create({
      data: {
        name: 'High-Value Custom Domain Businesses',
        description: 'Businesses with custom email domains - typically decision makers with higher engagement',
        criteria: {
          segment: 'high-value-custom-domain',
          priority: 'high',
          filters: {
            excludeDomains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'],
            businessTypes: ['Technology', 'Consulting', 'Professional Services', 'Manufacturing']
          }
        }
      }
    });

    segments.push({
      id: 'high-value-custom-domain',
      name: 'High-Value Custom Domain Businesses',
      description: 'Businesses with custom email domains - typically decision makers with higher engagement',
      criteria: {
        emailDomain: ['custom'],
        businessType: ['Technology', 'Consulting', 'Professional Services', 'Manufacturing'],
        engagementLevel: 'high'
      },
      estimatedSize: Math.floor(analysis.totalAudience * 0.25),
      priority: 'high',
      groupId: customDomainGroup.id
    });

    // Gmail Business Owners Segment
    const gmailGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Gmail Business Owners',
        description: 'Tech-savvy business owners using Gmail - responsive to digital marketing',
        criteria: {
          segment: 'gmail-business-owners',
          priority: 'high',
          filters: {
            emailDomain: ['gmail.com'],
            engagementLevel: 'medium'
          }
        }
      }
    });

    segments.push({
      id: 'gmail-business-owners',
      name: 'Gmail Business Owners',
      description: 'Tech-savvy business owners using Gmail - responsive to digital marketing',
      criteria: {
        emailDomain: ['gmail.com'],
        engagementLevel: 'medium'
      },
      estimatedSize: Math.floor(analysis.domainDistribution['gmail.com'] || 0),
      priority: 'high',
      groupId: gmailGroup.id
    });

    // Resource Sector Segment
    const resourceGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Resource Sector (Mining/Forestry)',
        description: 'High-value prospects for predictive maintenance and AI optimization',
        criteria: {
          segment: 'resource-sector',
          priority: 'high',
          filters: {
            businessTypes: ['Mining', 'Forestry', 'Logging', 'Manufacturing', 'Construction'],
            location: ['Terrace', 'Kitimat', 'Prince Rupert']
          }
        }
      }
    });

    segments.push({
      id: 'resource-sector',
      name: 'Resource Sector (Mining/Forestry)',
      description: 'High-value prospects for predictive maintenance and AI optimization',
      criteria: {
        businessType: ['Mining', 'Forestry', 'Logging', 'Manufacturing', 'Construction'],
        location: ['Terrace', 'Kitimat', 'Prince Rupert'],
        engagementLevel: 'high'
      },
      estimatedSize: Math.floor(analysis.totalAudience * 0.15),
      priority: 'high',
      groupId: resourceGroup.id
    });

    // Retail & Hospitality Segment
    const retailGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Retail & Hospitality',
        description: 'Local businesses that could benefit from AI automation and customer insights',
        criteria: {
          segment: 'retail-hospitality',
          priority: 'medium',
          filters: {
            businessTypes: ['Retail', 'Hospitality', 'Restaurant', 'Tourism', 'Service'],
            location: ['Terrace', 'Kitimat', 'Prince Rupert']
          }
        }
      }
    });

    segments.push({
      id: 'retail-hospitality',
      name: 'Retail & Hospitality',
      description: 'Local businesses that could benefit from AI automation and customer insights',
      criteria: {
        businessType: ['Retail', 'Hospitality', 'Restaurant', 'Tourism', 'Service'],
        location: ['Terrace', 'Kitimat', 'Prince Rupert'],
        engagementLevel: 'medium'
      },
      estimatedSize: Math.floor(analysis.totalAudience * 0.20),
      priority: 'medium',
      groupId: retailGroup.id
    });

    // Low Engagement Reactivation Segment
    const reactivationGroup = await prisma.audienceGroup.create({
      data: {
        name: 'Low Engagement - Reactivation',
        description: 'Businesses that need special reactivation campaigns',
        criteria: {
          segment: 'low-engagement-reactivation',
          priority: 'low',
          filters: {
            emailDomains: ['yahoo.com', 'hotmail.com', 'icloud.com'],
            engagementLevel: 'low'
          }
        }
      }
    });

    segments.push({
      id: 'low-engagement-reactivation',
      name: 'Low Engagement - Reactivation',
      description: 'Businesses that need special reactivation campaigns',
      criteria: {
        emailDomain: ['yahoo.com', 'hotmail.com', 'icloud.com'],
        engagementLevel: 'low'
      },
      estimatedSize: Math.floor(analysis.totalAudience * 0.15),
      priority: 'low',
      groupId: reactivationGroup.id
    });

    console.log('✅ Intelligent segments created');
    console.log(`   Created ${segments.length} segments`);
    segments.forEach(segment => {
      console.log(`   - ${segment.name}: ~${segment.estimatedSize} members (${segment.priority} priority)`);
    });

    return segments;
  }

  /**
   * Populate segments with actual audience members
   */
  async populateSegments(segments: AudienceSegment[]): Promise<void> {
    console.log('👥 Populating segments with audience members...');

    const members = await prisma.audienceMember.findMany({
      where: {
        unsubscribed: false
      },
      select: {
        id: true,
        primaryEmail: true,
        businessName: true,
        meta: true
      }
    });

    let totalAssigned = 0;

    for (const segment of segments) {
      const matchingMembers = members.filter(member => {
        const meta = member.meta as any;
        const domain = member.primaryEmail.split('@')[1]?.toLowerCase();
        const businessType = meta?.originalData?.businessType || 'Unknown';
        const location = meta?.originalData?.city || 'Terrace';

        // Apply segment criteria
        if (segment.criteria.emailDomain) {
          if (segment.criteria.emailDomain.includes('custom')) {
            const isCustomDomain = !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain);
            if (!isCustomDomain) return false;
          } else if (!segment.criteria.emailDomain.includes(domain)) {
            return false;
          }
        }

        if (segment.criteria.businessType && !segment.criteria.businessType.includes(businessType)) {
          return false;
        }

        if (segment.criteria.location && !segment.criteria.location.includes(location)) {
          return false;
        }

        return true;
      });

      // Update members to be in this segment
      for (const member of matchingMembers) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: segment.groupId }
        });
      }

      totalAssigned += matchingMembers.length;
      console.log(`   ✅ ${segment.name}: ${matchingMembers.length} members assigned`);
    }

    console.log(`✅ Segment population complete: ${totalAssigned} total assignments`);
  }

  /**
   * Generate segmentation report
   */
  generateSegmentationReport(segments: AudienceSegment[]): string {
    let report = `
# Intelligent Audience Segmentation Report

## Overview
Created ${segments.length} intelligent audience segments based on data analysis and behavioral patterns.

## Segments

`;

    for (const segment of segments) {
      report += `
### ${segment.name} (${segment.priority.toUpperCase()} Priority)
- **Description**: ${segment.description}
- **Estimated Size**: ${segment.estimatedSize} members
- **Criteria**: 
  - Email Domains: ${segment.criteria.emailDomain?.join(', ') || 'Any'}
  - Business Types: ${segment.criteria.businessType?.join(', ') || 'Any'}
  - Locations: ${segment.criteria.location?.join(', ') || 'Any'}
  - Engagement Level: ${segment.criteria.engagementLevel || 'Any'}

`;
    }

    report += `
## Recommendations

### High Priority Segments (Target First)
Focus on custom domain businesses and Gmail users - these typically have:
- Higher engagement rates
- Better deliverability
- More decision-making authority
- Higher conversion potential

### Medium Priority Segments
Retail and hospitality businesses offer good opportunities for:
- AI automation tools
- Customer insights
- Inventory optimization
- Marketing automation

### Low Priority Segments
Low engagement segments require:
- Special reactivation campaigns
- Different messaging approach
- Patience with lower conversion rates

Generated: ${new Date().toISOString()}
`;

    return report;
  }
}

async function runIntelligentSegmentation() {
  try {
    console.log('🧠 Running Intelligent Audience Segmentation...');

    const segmentation = new IntelligentAudienceSegmentation();

    // Step 1: Analyze audience
    const analysis = await segmentation.analyzeAudience();

    // Step 2: Create intelligent segments
    const segments = await segmentation.createIntelligentSegments(analysis);

    // Step 3: Populate segments
    await segmentation.populateSegments(segments);

    // Step 4: Generate report
    const report = segmentation.generateSegmentationReport(segments);
    
    console.log('\n📊 SEGMENTATION REPORT');
    console.log('════════════════════════════════════════════════════════════');
    console.log(report);

    // Save report
    const fs = require('fs');
    const reportPath = `audience-segmentation-report-${Date.now()}.md`;
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error running intelligent segmentation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { IntelligentAudienceSegmentation };
export type { AudienceSegment };

// Run segmentation if called directly
if (require.main === module) {
  runIntelligentSegmentation();
}
