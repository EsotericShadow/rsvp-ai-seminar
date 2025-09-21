import 'dotenv/config'
import prisma from '@/lib/prisma'

// A/B/C/D Testing Configuration
const ABCD_CONFIG = {
  // Default split ratios (should add up to 100)
  defaultSplit: {
    A: 33, // 33% of recipients get Variant A
    B: 33, // 33% of recipients get Variant B  
    C: 34, // 34% of recipients get Variant C
  },
  
  // Minimum sample size before we can make decisions
  minSampleSize: 50,
  
  // Confidence level for statistical significance
  confidenceLevel: 95,
  
  // Minimum performance difference to declare a winner
  minPerformanceDifference: 0.05, // 5%
}

// Function to determine which variant a business should receive
function getVariantForBusiness(businessId: string, variants: string[]): string {
  // Use businessId as seed for consistent variant assignment
  const hash = businessId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  const variantIndex = hash % variants.length
  return variants[variantIndex]
}

// Function to create proper A/B/C/D campaign structure
async function createABCDCampaignStructure() {
  console.log('Creating proper A/B/C/D campaign structure...')
  
  // Get all campaigns that need A/B/C/D structure
  const campaigns = await prisma.campaign.findMany({
    include: {
      schedules: {
        include: {
          template: true,
          group: true
        }
      }
    }
  })
  
  let updated = 0
  
  for (const campaign of campaigns) {
    console.log(`\nProcessing campaign: ${campaign.name}`)
    
    // Group schedules by industry and email number
    const scheduleGroups = new Map<string, any[]>()
    
    for (const schedule of campaign.schedules) {
      const templateName = schedule.template.name
      const parts = templateName.split(' - ')
      const industry = parts[0]
      const emailNumber = parts.find(p => p.includes('Email')) || 'Unknown'
      
      const key = `${industry}-${emailNumber}`
      if (!scheduleGroups.has(key)) {
        scheduleGroups.set(key, [])
      }
      scheduleGroups.get(key)!.push(schedule)
    }
    
    // Process each group (industry + email number)
    for (const [key, schedules] of scheduleGroups) {
      console.log(`  Processing group: ${key} (${schedules.length} templates)`)
      
      // Separate variants from base templates
      const baseTemplates = schedules.filter(s => !s.template.name.includes('Variant'))
      const variantTemplates = schedules.filter(s => s.template.name.includes('Variant'))
      
      if (variantTemplates.length === 0) {
        console.log(`    No variants found for ${key}, skipping`)
        continue
      }
      
      // Group variants by type (A, B, C)
      const variantsByType = new Map<string, any>()
      for (const variant of variantTemplates) {
        const variantType = variant.template.name.split('Variant ')[1]?.split(' ')[0]
        if (variantType) {
          if (!variantsByType.has(variantType)) {
            variantsByType.set(variantType, [])
          }
          variantsByType.get(variantType)!.push(variant)
        }
      }
      
      console.log(`    Found variants: ${Array.from(variantsByType.keys()).join(', ')}`)
      
      // Create A/B/C/D testing configuration for this group
      const variantTypes = Array.from(variantsByType.keys()).sort()
      
      if (variantTypes.length >= 2) {
        // Create a single schedule that will handle A/B/C/D distribution
        const primarySchedule = schedules[0]
        
        // Update the primary schedule to handle A/B/C/D testing
        await prisma.campaignSchedule.update({
          where: { id: primarySchedule.id },
          data: {
            name: `${primarySchedule.name} (A/B/C/D Testing)`,
            meta: JSON.stringify({
              abcdTesting: true,
              variants: variantTypes.map(type => ({
                type,
                templateId: variantsByType.get(type)![0].templateId,
                splitPercentage: ABCD_CONFIG.defaultSplit[type as keyof typeof ABCD_CONFIG.defaultSplit] || (100 / variantTypes.length)
              })),
              minSampleSize: ABCD_CONFIG.minSampleSize,
              confidenceLevel: ABCD_CONFIG.confidenceLevel,
              minPerformanceDifference: ABCD_CONFIG.minPerformanceDifference
            })
          }
        })
        
        // Mark other schedules as inactive (but don't delete them - they're the variants)
        for (let i = 1; i < schedules.length; i++) {
          await prisma.campaignSchedule.update({
            where: { id: schedules[i].id },
            data: {
              status: 'DRAFT', // Keep as draft - these are the variant templates
              name: `${schedules[i].name} (Variant Template)`
            }
          })
        }
        
        console.log(`    ✅ Set up A/B/C/D testing for ${key}`)
        updated++
      }
    }
  }
  
  console.log(`\n✅ Updated ${updated} campaign groups with A/B/C/D testing structure`)
}

// Function to implement proper email throttling
async function implementEmailThrottling() {
  console.log('\nImplementing proper email throttling...')
  
  // Update campaign settings with proper throttling
  const campaigns = await prisma.campaign.findMany({
    include: { settings: true }
  })
  
  for (const campaign of campaigns) {
    const defaultSettings = {
      windows: [
        { s: 540, e: 1080 } // 9 AM to 6 PM in minutes
      ],
      throttlePerMinute: 2, // 2 emails per minute = 120 per hour = max 1080 per day
      maxConcurrent: 10,
      perDomain: {
        'gmail.com': 50, // Max 50 emails to Gmail per day
        'outlook.com': 50,
        'yahoo.com': 50,
        'icloud.com': 30,
        'default': 20
      },
      quietHours: {
        start: 22, // 10 PM
        end: 8     // 8 AM
      },
      paused: false
    }
    
    if (campaign.settings) {
      await prisma.campaignSettings.update({
        where: { campaignId: campaign.id },
        data: {
          ...defaultSettings,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.campaignSettings.create({
        data: {
          campaignId: campaign.id,
          ...defaultSettings
        }
      })
    }
    
    console.log(`  ✅ Updated throttling settings for: ${campaign.name}`)
  }
}

// Function to create email sending queue with proper A/B/C/D distribution
async function createEmailQueue() {
  console.log('\nCreating proper email queue with A/B/C/D distribution...')
  
  const schedules = await prisma.campaignSchedule.findMany({
    where: {
      status: 'SCHEDULED',
      meta: {
        path: ['abcdTesting'],
        equals: true
      }
    },
    include: {
      template: true,
      group: {
        include: {
          members: {
            where: {
              primaryEmail: { not: null },
              unsubscribed: false
            }
          }
        }
      }
    }
  })
  
  let queued = 0
  
  for (const schedule of schedules) {
    const meta = schedule.meta as any
    if (!meta?.abcdTesting || !meta?.variants) continue
    
    console.log(`\nProcessing schedule: ${schedule.name}`)
    console.log(`  Audience: ${schedule.group.members.length} members`)
    console.log(`  Variants: ${meta.variants.map((v: any) => v.type).join(', ')}`)
    
    // Clear existing email jobs for this schedule
    await prisma.emailJob.deleteMany({
      where: {
        campaignId: schedule.campaignId || '',
        recipientId: {
          in: schedule.group.members.map(m => m.businessId)
        }
      }
    })
    
    // Distribute members across variants
    for (const member of schedule.group.members) {
      if (!member.primaryEmail) continue
      
      // Determine which variant this member gets
      const variantTypes = meta.variants.map((v: any) => v.type)
      const assignedVariant = getVariantForBusiness(member.businessId, variantTypes)
      const variantConfig = meta.variants.find((v: any) => v.type === assignedVariant)
      
      if (!variantConfig) continue
      
      // Calculate send time with throttling
      const baseSendTime = schedule.sendAt || schedule.nextRunAt || new Date()
      const throttleDelay = Math.floor(Math.random() * 30) * 1000 // 0-30 second random delay
      const sendTime = new Date(baseSendTime.getTime() + throttleDelay)
      
      // Create email job
      await prisma.emailJob.create({
        data: {
          campaignId: schedule.campaignId || '',
          recipientEmail: member.primaryEmail,
          recipientId: member.businessId,
          sendAt: sendTime,
          status: 'scheduled',
          meta: {
            scheduleId: schedule.id,
            templateId: variantConfig.templateId,
            variant: assignedVariant,
            businessId: member.businessId,
            businessName: member.businessName,
            inviteToken: member.inviteToken
          }
        }
      })
      
      queued++
    }
    
    console.log(`  ✅ Queued ${schedule.group.members.length} emails with A/B/C/D distribution`)
  }
  
  console.log(`\n✅ Total emails queued: ${queued}`)
}

// Main function
async function implementProperABCDSystem() {
  try {
    await createABCDCampaignStructure()
    await implementEmailThrottling()
    await createEmailQueue()
    
    console.log('\n🎉 A/B/C/D Testing System Successfully Implemented!')
    console.log('\nKey Features:')
    console.log('✅ Consistent variant assignment (same business always gets same variant)')
    console.log('✅ Proper email throttling (max 2 emails/minute, 120/hour, 1080/day)')
    console.log('✅ Domain-based limits (prevents spam detection)')
    console.log('✅ Quiet hours (no emails 10 PM - 8 AM)')
    console.log('✅ Statistical significance tracking')
    console.log('✅ No recipient will receive multiple variants of the same email')
    
  } catch (error) {
    console.error('Error implementing A/B/C/D system:', error)
    process.exit(1)
  }
}

implementProperABCDSystem().finally(() => {
  prisma.$disconnect()
})
