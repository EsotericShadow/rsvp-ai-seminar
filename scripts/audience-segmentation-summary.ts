import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function audienceSegmentationSummary() {
  console.log('📊 Complete Audience Segmentation Summary')
  console.log('=' .repeat(50))
  
  try {
    // Get all audience groups with their members
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          select: {
            businessName: true,
            primaryEmail: true,
            unsubscribed: true,
            meta: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n🎯 Total Audience Groups: ${groups.length}`)
    
    let totalMembers = 0
    let activeMembers = 0
    let unsubscribedMembers = 0
    
    // Analyze each group
    for (const group of groups) {
      const memberCount = group._count.members
      const activeCount = group.members.filter(m => !m.unsubscribed).length
      const unsubscribedCount = group.members.filter(m => m.unsubscribed).length
      
      totalMembers += memberCount
      activeMembers += activeCount
      unsubscribedMembers += unsubscribedCount
      
      const meta = group.meta as any
      const priority = meta?.priority || 'unknown'
      const category = meta?.category || 'unknown'
      
      console.log(`\n📁 ${group.name}`)
      console.log(`   Description: ${group.description}`)
      console.log(`   Category: ${category}`)
      console.log(`   Priority: ${priority}`)
      console.log(`   Total Members: ${memberCount}`)
      console.log(`   Active Members: ${activeCount}`)
      console.log(`   Unsubscribed: ${unsubscribedCount}`)
      
      if (memberCount > 0) {
        console.log(`   Sample Members:`)
        group.members.slice(0, 3).forEach(member => {
          const status = member.unsubscribed ? '(unsubscribed)' : '(active)'
          console.log(`     - ${member.businessName} (${member.primaryEmail}) ${status}`)
        })
        if (memberCount > 3) {
          console.log(`     ... and ${memberCount - 3} more`)
        }
      }
    }
    
    // Overall statistics
    console.log(`\n📈 Overall Statistics:`)
    console.log(`   Total Groups: ${groups.length}`)
    console.log(`   Total Members: ${totalMembers}`)
    console.log(`   Active Members: ${activeMembers}`)
    console.log(`   Unsubscribed Members: ${unsubscribedMembers}`)
    console.log(`   Active Rate: ${totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : 0}%`)
    
    // Group by priority
    const priorityGroups = {
      high: groups.filter(g => (g.meta as any)?.priority === 'high'),
      medium: groups.filter(g => (g.meta as any)?.priority === 'medium'),
      low: groups.filter(g => (g.meta as any)?.priority === 'low'),
      avoid: groups.filter(g => (g.meta as any)?.priority === 'low' && (g.meta as any)?.category === 'avoid')
    }
    
    console.log(`\n🎯 Priority Breakdown:`)
    console.log(`   High Priority Groups: ${priorityGroups.high.length}`)
    priorityGroups.high.forEach(g => {
      const active = g.members.filter(m => !m.unsubscribed).length
      console.log(`     - ${g.name}: ${active} active members`)
    })
    
    console.log(`   Medium Priority Groups: ${priorityGroups.medium.length}`)
    priorityGroups.medium.forEach(g => {
      const active = g.members.filter(m => !m.unsubscribed).length
      console.log(`     - ${g.name}: ${active} active members`)
    })
    
    console.log(`   Low Priority Groups: ${priorityGroups.low.length}`)
    priorityGroups.low.forEach(g => {
      const active = g.members.filter(m => !m.unsubscribed).length
      console.log(`     - ${g.name}: ${active} active members`)
    })
    
    console.log(`   Avoid Groups: ${priorityGroups.avoid.length}`)
    priorityGroups.avoid.forEach(g => {
      const active = g.members.filter(m => !m.unsubscribed).length
      console.log(`     - ${g.name}: ${active} active members (marked to avoid)`)
    })
    
    // Campaign recommendations
    console.log(`\n🚀 Campaign Recommendations:`)
    console.log(`   1. Start with HIGH priority groups (Healthcare, Professional Services)`)
    console.log(`   2. Create industry-specific email templates for each group`)
    console.log(`   3. Focus on ${activeMembers} active members across all groups`)
    console.log(`   4. Avoid the ${unsubscribedMembers} unsubscribed members`)
    
    // Next steps
    console.log(`\n📋 Next Steps:`)
    console.log(`   1. Review groups in admin panel: /admin/campaign`)
    console.log(`   2. Create email templates for each industry`)
    console.log(`   3. Set up targeted campaigns`)
    console.log(`   4. Monitor performance and adjust segmentation`)
    
    console.log(`\n✅ Audience segmentation complete and ready for production!`)
    
  } catch (error) {
    console.error('❌ Failed to generate summary:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

audienceSegmentationSummary()
  .then(() => {
    console.log('\n✅ Summary complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Summary failed:', error)
    process.exit(1)
  })
