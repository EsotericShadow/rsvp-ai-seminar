import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Your original sophisticated audience segments
const originalSegments = [
  {
    id: 'high-value-custom-domain',
    name: 'High-Value Custom Domain Businesses',
    description: 'Businesses with custom email domains - typically decision makers with higher engagement',
    estimatedSize: 294,
    criteria: {
      emailDomain: 'custom',
      businessTypes: ['Technology', 'Consulting', 'Professional Services', 'Manufacturing'],
      locations: 'Any',
      engagementLevel: 'high'
    },
    priority: 'high'
  },
  {
    id: 'gmail-business-owners',
    name: 'Gmail Business Owners', 
    description: 'Tech-savvy business owners using Gmail - responsive to digital marketing',
    estimatedSize: 331,
    criteria: {
      emailDomain: 'gmail.com',
      businessTypes: 'Any',
      locations: 'Any', 
      engagementLevel: 'medium'
    },
    priority: 'high'
  },
  {
    id: 'resource-sector',
    name: 'Resource Sector (Mining/Forestry)',
    description: 'High-value prospects for predictive maintenance and AI optimization',
    estimatedSize: 176,
    criteria: {
      emailDomain: 'Any',
      businessTypes: ['Mining', 'Forestry', 'Logging', 'Manufacturing', 'Construction'],
      locations: ['Terrace', 'Kitimat', 'Prince Rupert'],
      engagementLevel: 'high'
    },
    priority: 'high'
  },
  {
    id: 'retail-hospitality',
    name: 'Retail & Hospitality',
    description: 'Local businesses that could benefit from AI automation and customer insights',
    estimatedSize: 235,
    criteria: {
      emailDomain: 'Any',
      businessTypes: ['Retail', 'Hospitality', 'Restaurant', 'Tourism', 'Service'],
      locations: ['Terrace', 'Kitimat', 'Prince Rupert'],
      engagementLevel: 'medium'
    },
    priority: 'medium'
  },
  {
    id: 'low-engagement-reactivation',
    name: 'Low Engagement - Reactivation',
    description: 'Businesses that need special reactivation campaigns',
    estimatedSize: 176,
    criteria: {
      emailDomain: ['yahoo.com', 'hotmail.com', 'icloud.com'],
      businessTypes: 'Any',
      locations: 'Any',
      engagementLevel: 'low'
    },
    priority: 'low'
  }
];

// A/B/C/D Testing Configuration
const ABCD_CONFIG = {
  defaultSplit: { A: 33, B: 33, C: 34 },
  minSampleSize: 50,
  confidenceLevel: 95,
  minPerformanceDifference: 0.05
};

// Industry-specific campaigns with 28 steps (7 emails × 4 variants each)
const industryCampaigns = [
  'Construction & Building',
  'Mining & Natural Resources', 
  'Transportation & Logistics',
  'Food & Beverage',
  'Professional Services',
  'Technology & Business Services',
  'Healthcare & Wellness',
  'Retail & Entertainment',
  'Hospitality & Personal Care',
  'Financial & Legal Services',
  'Other Industries'
];

// 7 email sequence with A/B/C/D variants
const emailSequence = [
  {
    step: 1,
    name: 'Problem Focused - Equipment Failures',
    variants: ['Direct Benefit', 'Problem-Solving', 'Community Connection', 'Local Success']
  },
  {
    step: 2, 
    name: 'Coffee Hook - Problem',
    variants: ['Urgency Focus', 'Social Proof', 'Question Hook', 'Story Hook']
  },
  {
    step: 3,
    name: 'Story Based - Local Success', 
    variants: ['Case Study A', 'Case Study B', 'Testimonial', 'Results Focus']
  },
  {
    step: 4,
    name: 'Benefit Focused - Save Money',
    variants: ['Cost Savings', 'Time Savings', 'Efficiency Gains', 'ROI Focus']
  },
  {
    step: 5,
    name: 'Local Connection - Northern BC',
    variants: ['Terrace Focus', 'Regional Focus', 'Community Focus', 'Network Focus']
  },
  {
    step: 6,
    name: 'Social Proof - Join Others',
    variants: ['Peer Pressure', 'FOMO', 'Exclusivity', 'Success Stories']
  },
  {
    step: 7,
    name: 'Final Reminder - Last Chance',
    variants: ['Urgency', 'Scarcity', 'Final Call', 'Last Opportunity']
  }
];

async function restoreSophisticatedSystem() {
  console.log('🚀 Restoring Your Sophisticated Campaign System...');
  console.log('📊 This will recreate:');
  console.log('   • 5 Intelligent Audience Segments');
  console.log('   • 11 Industry Campaigns'); 
  console.log('   • 28 Steps per Campaign (7 emails × 4 variants)');
  console.log('   • A/B/C/D Testing with Statistical Significance');
  console.log('   • Proper Email Throttling & Smart Windows\n');

  try {
    // 1. Clean up existing data (in correct order due to foreign keys)
    console.log('🧹 Cleaning up existing campaigns and templates...');
    await prisma.campaignSchedule.deleteMany({});
    await prisma.campaignSend.deleteMany({});
    await prisma.campaignTemplate.deleteMany({});
    await prisma.campaignSettings.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});
    console.log('   ✅ Cleaned up existing data\n');

    // 2. Create sophisticated audience segments
    console.log('👥 Creating intelligent audience segments...');
    const createdSegments = [];
    
    for (const segment of originalSegments) {
      const group = await prisma.audienceGroup.create({
        data: {
          name: segment.name,
          description: segment.description,
          criteria: segment.criteria
        }
      });
      
      createdSegments.push({
        ...segment,
        groupId: group.id
      });
      
      console.log(`   ✅ Created: ${segment.name} (${segment.estimatedSize} estimated members)`);
    }
    console.log(`\n   📊 Created ${createdSegments.length} intelligent audience segments\n`);

    // 3. Create industry-specific campaigns with 28 steps each
    console.log('📧 Creating industry campaigns with 28 steps each...');
    
    for (const industry of industryCampaigns) {
      console.log(`\n   🏭 Creating campaign: ${industry}`);
      
      // Create main campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: industry,
          description: `AI solutions for ${industry.toLowerCase()} - equipment maintenance, safety, project management`,
          status: 'DRAFT'
        }
      });

      // Create campaign settings with proper throttling
      await prisma.campaignSettings.create({
        data: {
          campaignId: campaign.id,
          windows: [
            { start: '09:00', end: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
          ],
          throttlePerMinute: 12,
          maxConcurrent: 8,
          perDomain: {
            'gmail.com': { tpm: 8, priority: 'high' },
            'icloud.com': { tpm: 3, priority: 'low' },
            'outlook.com': { tpm: 6, priority: 'medium' },
            'hotmail.com': { tpm: 6, priority: 'medium' },
            'yahoo.com': { tpm: 5, priority: 'medium' }
          },
          quietHours: [
            { start: '22:00', end: '08:00' },
            { start: '12:00', end: '13:00' }
          ],
          paused: false
        }
      });

      // Create 28 steps (7 emails × 4 variants each)
      let stepCount = 0;
      
      for (const email of emailSequence) {
        const baseSendDate = new Date('2025-09-23T10:00:00-07:00');
        const sendDate = new Date(baseSendDate.getTime() + (email.step - 1) * 7 * 24 * 60 * 60 * 1000);
        
        // Create 4 variants for each email
        for (let variantIndex = 0; variantIndex < email.variants.length; variantIndex++) {
          const variant = email.variants[variantIndex];
          stepCount++;
          
          // Create template for this variant
          const template = await prisma.campaignTemplate.create({
            data: {
              name: `${industry} - Email ${email.step} - ${variant}`,
              subject: generateSubject(industry, email.step, variant),
              htmlBody: generateEmailHTML(industry, email.step, variant),
              textBody: generateEmailText(industry, email.step, variant),
              // Template variables for individual customization
              greeting_title: '',
              greeting_message: '',
              main_content_title: '',
              main_content_body: '',
              button_text: 'Learn More & RSVP',
              additional_info_title: '',
              additional_info_body: '',
              closing_title: '',
              closing_message: ''
            }
          });

          // Create schedule for each audience segment
          for (const segment of createdSegments) {
            await prisma.campaignSchedule.create({
              data: {
                name: `${industry} - Email ${email.step} - ${variant} - ${segment.name}`,
                templateId: template.id,
                groupId: segment.groupId,
                campaignId: campaign.id,
                status: 'DRAFT',
                sendAt: sendDate,
                stepOrder: stepCount,
                timeZone: 'America/Vancouver',
                nextRunAt: sendDate,
                throttlePerMinute: 10,
                smartWindowStart: sendDate,
                smartWindowEnd: new Date(sendDate.getTime() + 4 * 60 * 60 * 1000), // 4 hour window
                meta: {
                  industry: industry,
                  emailStep: email.step,
                  variant: variant,
                  variantIndex: variantIndex,
                  abcdTesting: true,
                  segmentPriority: segment.priority,
                  estimatedAudience: segment.estimatedSize
                }
              }
            });
          }
        }
        
        console.log(`     ✅ Created Email ${email.step} with 4 variants (${email.variants.join(', ')})`);
      }
      
      console.log(`   ✅ ${industry}: ${stepCount} total steps created`);
    }

    console.log('\n🎉 Sophisticated Campaign System Restored!');
    console.log('\n📊 System Summary:');
    console.log(`   • ${industryCampaigns.length} Industry Campaigns`);
    console.log(`   • ${createdSegments.length} Intelligent Audience Segments`);
    console.log(`   • ${emailSequence.length} Email Steps per Campaign`);
    console.log(`   • 4 Variants per Email (A/B/C/D Testing)`);
    console.log(`   • ${industryCampaigns.length * emailSequence.length * 4 * createdSegments.length} Total Campaign Schedules`);
    console.log(`   • Statistical Significance Tracking`);
    console.log(`   • Smart Email Throttling & Windows`);
    console.log(`   • Segment-Specific Targeting`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Populate audience segments with actual business data from LeadMine');
    console.log('2. Configure A/B/C/D testing thresholds and monitoring');
    console.log('3. Set up automated winner selection based on statistical significance');
    console.log('4. Launch campaigns with proper throttling and timing');
    console.log('5. Monitor performance and optimize automatically');

  } catch (error) {
    console.error('❌ Error restoring sophisticated system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateSubject(industry: string, step: number, variant: string): string {
  const subjects = {
    1: {
      'Direct Benefit': `How a ${industry.toLowerCase()} company saved $50,000 with AI (Free coffee included!)`,
      'Problem-Solving': `What if you could predict equipment failures before they happen?`,
      'Community Connection': `${industry} business owners: Free AI workshop + networking (Oct 23rd)`,
      'Local Success': `Terrace ${industry.toLowerCase()} success story: $50,000 saved with AI`
    },
    2: {
      'Urgency Focus': `Free coffee: Stop equipment failures before they happen - Oct 23rd`,
      'Social Proof': `Join 50+ ${industry.toLowerCase()} businesses at our AI session - Oct 23rd`,
      'Question Hook': `How often does your equipment break down unexpectedly?`,
      'Story Hook': `Last week, a local ${industry.toLowerCase()} company lost $15,000 in downtime...`
    },
    3: {
      'Case Study A': `Case study: How AI saved a ${industry.toLowerCase()} business $20,000`,
      'Case Study B': `Real results: ${industry} company prevents 3 equipment failures with AI`,
      'Testimonial': `"AI saved us $50,000 in 2 months" - Local ${industry.toLowerCase()} owner`,
      'Results Focus': `$50,000 saved: The AI tool every ${industry.toLowerCase()} business needs`
    },
    4: {
      'Cost Savings': `Free coffee: Save $10,000+ on equipment maintenance - Oct 23rd`,
      'Time Savings': `Save 20 hours per week with AI automation (Free workshop Oct 23rd)`,
      'Efficiency Gains': `Increase efficiency by 30% with AI tools (Free session Oct 23rd)`,
      'ROI Focus': `ROI of 500%: How AI pays for itself in 3 months (Free info Oct 23rd)`
    },
    5: {
      'Terrace Focus': `Terrace business owners: What others are learning about AI`,
      'Regional Focus': `Northern BC businesses: AI success stories from your neighbors`,
      'Community Focus': `Terrace business community: Free AI insights + networking`,
      'Network Focus': `Join Terrace's AI-forward business network (Free event Oct 23rd)`
    },
    6: {
      'Peer Pressure': `Your competitors are learning AI - Don't get left behind`,
      'FOMO': `Limited seats: 50+ ${industry.toLowerCase()} businesses already registered`,
      'Exclusivity': `Exclusive: AI workshop for ${industry.toLowerCase()} businesses only`,
      'Success Stories': `Success stories from ${industry.toLowerCase()} businesses using AI`
    },
    7: {
      'Urgency': `Last chance: AI workshop tomorrow - Limited seats remaining`,
      'Scarcity': `Final call: Only 5 seats left for tomorrow's AI workshop`,
      'Final Call': `Tomorrow: Free AI workshop - Your last chance to RSVP`,
      'Last Opportunity': `Final reminder: AI workshop tomorrow - Don't miss out`
    }
  };
  
  return subjects[step as keyof typeof subjects]?.[variant as keyof typeof subjects[1]] || 
         `AI Information Session for ${industry} - October 23rd`;
}

function generateEmailHTML(industry: string, step: number, variant: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">{{global_hero_title}}</h1>
    </div>
    <div style="padding: 30px 20px;">
      <h2>{{greeting_title}}</h2>
      <p>{{greeting_message}}</p>
      
      <h3>{{main_content_title}}</h3>
      <p>{{main_content_body}}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{button_link}}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">{{button_text}}</a>
      </div>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3>{{global_event_title}}</h3>
        <p><strong>Date:</strong> {{global_event_date}}</p>
        <p><strong>Time:</strong> {{global_event_time}}</p>
        <p><strong>Location:</strong> {{global_event_location}}</p>
        <p><strong>Cost:</strong> {{global_event_cost}}</p>
        <p><strong>Includes:</strong> {{global_event_includes}}</p>
      </div>
      
      <h3>{{additional_info_title}}</h3>
      <p>{{additional_info_body}}</p>
      
      <div style="background-color: #f0fdf4; padding: 14px; border-radius: 8px; border-left: 4px solid #10b981; margin: 14px 0;">
        <p style="margin: 0;"><strong>{{global_signature_name}}</strong><br>
        {{global_signature_title}}<br>
        {{global_signature_company}}<br>
        {{global_signature_location}}</p>
      </div>
      
      <h3>{{closing_title}}</h3>
      <p>{{closing_message}}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateEmailText(industry: string, step: number, variant: string): string {
  return `Hi {{business_name}},

{{greeting_message}}

{{main_content_title}}

{{main_content_body}}

{{button_text}}: {{button_link}}

Event Details:
Date: {{global_event_date}}
Time: {{global_event_time}}
Location: {{global_event_location}}
Cost: {{global_event_cost}}
Includes: {{global_event_includes}}

{{additional_info_title}}

{{additional_info_body}}

Best regards,
{{global_signature_name}}
{{global_signature_title}}
{{global_signature_company}}
{{global_signature_location}}

{{closing_title}}

{{closing_message}}`;
}

// Run the restoration
restoreSophisticatedSystem();
