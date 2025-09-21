import 'dotenv/config'
import prisma from '@/lib/prisma'

// Define distinct strategies for A/B/C variants
const variantStrategies = {
  // Email 1: Introduction variants
  'Email 1': {
    'Variant A': {
      approach: 'Direct & Professional',
      subject: 'Free AI tools session. October 23rd',
      content: `Hi there,

I'm Gabriel Lacroix from Evergreen Web Solutions. I'm hosting a free informational session on October 23rd about how businesses can make practical use of AI tools.

This isn't about chatbots or hype - it's about real tools that can save you time and money in your daily operations.

The session covers:
- Spreadsheet automation and data analysis
- Inventory and resource planning
- Customer communication streamlining
- Practical AI tools you can implement immediately

Free coffee, refreshments, and networking included.

RSVP here: {{rsvp_link}}

Best regards,
Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant B': {
      approach: 'Problem-First & Curious',
      subject: 'Struggling with manual tasks in your business?',
      content: `Hi there,

I'm Gabriel Lacroix, and I see businesses in Northern BC spending hours on tasks that could be automated.

Are you manually updating spreadsheets, tracking inventory, or managing customer communications? What if I told you there are AI tools that can handle these tasks while you focus on growing your business?

I'm hosting a free session on October 23rd to show local businesses exactly how to implement these tools. No hype, no complicated tech - just practical solutions that work.

You'll learn about:
- Automating repetitive data entry
- Predicting inventory needs
- Streamlining customer follow-ups
- Real tools you can start using this week

Free coffee and networking included.

Interested? RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant C': {
      approach: 'Local Connection & Story',
      subject: 'What I learned from local Northern BC businesses',
      content: `Hi there,

I'm Gabriel Lacroix, and I've been working with Northern BC businesses to implement practical AI solutions.

What I've discovered is fascinating - local businesses are finding ways to automate tasks they never thought possible. From restaurants predicting food waste to construction companies optimizing material orders.

I'm sharing these insights at a free session on October 23rd. You'll hear real stories from local businesses and see the tools they're using to work smarter, not harder.

The session includes:
- Case studies from Northern BC businesses
- Live demonstrations of AI tools
- Q&A with local business owners
- Free coffee and networking

This isn't about replacing people - it's about giving you more time for the work that matters.

Join us: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    }
  },
  
  // Email 2: Follow-up variants
  'Email 2': {
    'Variant A': {
      approach: 'Question-Based Engagement',
      subject: 'Quick question about your {{industry_name}} business',
      content: `Hi there,

Following up on my invitation to the free AI session on October 23rd.

I'm curious - what's your biggest time-consuming task in your {{industry_name}} business? Is it:
- Data entry and reporting?
- Inventory management?
- Customer follow-ups?
- Something else?

The AI tools I'll be demonstrating can help with most of these challenges. I've seen {{industry_name}} businesses save 5-10 hours per week by automating routine tasks.

The session is free, includes coffee and networking, and you'll leave with actionable tools you can implement immediately.

Still interested? RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant B': {
      approach: 'Results-Focused Follow-up',
      subject: 'Real results from local businesses like yours',
      content: `Hi there,

I wanted to share some results I'm seeing from local businesses using AI tools:

- A local restaurant reduced food waste by 30% using predictive ordering
- A construction company cut material costs by 15% with better inventory management
- A retail store increased customer engagement by 40% with automated follow-ups

These aren't promises - these are real results from businesses in our area.

I'm showing exactly how they did it at my free session on October 23rd. You'll see the tools, meet the business owners, and learn how to implement similar solutions in your {{industry_name}} business.

Free coffee, networking, and actionable insights included.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant C': {
      approach: 'Urgency & Scarcity',
      subject: 'Limited spots remaining for October 23rd',
      content: `Hi there,

Quick update on the free AI session - we're getting close to capacity for October 23rd.

I'm limiting the session to ensure everyone gets individual attention and can ask specific questions about their business. Right now, we have about 15 spots left.

If you're interested in learning how AI tools can help your {{industry_name}} business work more efficiently, I'd recommend securing your spot soon.

The session covers:
- Practical AI tools for {{industry_name}} businesses
- Live demonstrations and case studies
- Free coffee and networking
- Individual Q&A time

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    }
  },

  // Email 3: Social Proof variants
  'Email 3': {
    'Variant A': {
      approach: 'Peer Testimonials',
      subject: 'What other Northern BC {{industry_name}} businesses are doing',
      content: `Hi there,

I've been getting great feedback from {{industry_name}} businesses about the AI tools we'll be covering on October 23rd.

Here's what one local business owner told me:
"I was skeptical about AI, but these tools actually work. We're saving about 8 hours per week on data entry alone."

Another said:
"The inventory prediction tool has been a game-changer. We're ordering exactly what we need, when we need it."

These are real Northern BC businesses finding real value in practical AI tools.

The session on October 23rd will show you exactly what they're using and how you can implement similar solutions in your business.

Free coffee and networking included.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant B': {
      approach: 'Data & Statistics',
      subject: 'The numbers don\'t lie: significant time savings',
      content: `Hi there,

Here are some concrete numbers from local businesses using AI tools:

- Average time savings: 6-12 hours per week
- Cost reduction: 10-20% on routine operations
- Error reduction: 85% fewer data entry mistakes
- Customer response time: 70% faster follow-ups

These aren't marketing claims - these are real results from Northern BC businesses.

The free session on October 23rd will show you exactly how to achieve similar results in your {{industry_name}} business. You'll see the tools in action and meet business owners who are already seeing these benefits.

Free coffee, networking, and real-world examples included.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant C': {
      approach: 'Case Study Deep Dive',
      subject: 'How ABC Construction saved $20,000 with AI tools',
      content: `Hi there,

Let me share a detailed case study from a local construction company (name changed for privacy):

**Challenge:** Manual inventory tracking was costing them $2,000+ per month in over-ordering and waste.

**Solution:** AI-powered inventory prediction tool that analyzes historical data and seasonal patterns.

**Results:** 
- 30% reduction in material waste
- $20,000 annual savings
- 15 hours per week saved on inventory management
- Better project planning and scheduling

This isn't a one-off success story - similar results are possible for most {{industry_name}} businesses.

The free session on October 23rd will show you exactly how to implement these tools and achieve similar results in your business.

Free coffee, networking, and detailed implementation guides included.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    }
  },

  // Email 4: Final CTA variants
  'Email 4': {
    'Variant A': {
      approach: 'Soft Close',
      subject: 'Last chance to RSVP. October 23rd',
      content: `Hi there,

This is my final invitation for the free AI session on October 23rd.

I understand you're busy running your {{industry_name}} business. That's exactly why I think you'll find this session valuable - it's about giving you more time and reducing costs.

The session is completely free, includes coffee and networking, and you'll leave with practical tools you can implement immediately.

If you're interested but can't make it, just let me know and I can share the key insights via email.

Otherwise, RSVP here: {{rsvp_link}}

Hope to see you there.

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant B': {
      approach: 'Value Reinforcement',
      subject: 'Everything you\'ll get at the free session',
      content: `Hi there,

Here's exactly what you'll get at the free AI session on October 23rd:

**Value Package:**
- 2 hours of practical AI tool demonstrations
- Case studies from local Northern BC businesses
- Individual Q&A time for your specific needs
- Free coffee, refreshments, and networking
- Implementation guides you can take home
- Follow-up support after the session

**Cost:** Completely free

**Time Investment:** 2 hours

**Potential Return:** 5-10 hours saved per week, 10-20% cost reduction

This is the last chance to secure your spot for October 23rd.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    },
    'Variant C': {
      approach: 'Fear of Missing Out',
      subject: 'Don\'t let your competitors get ahead',
      content: `Hi there,

Here's what I'm seeing: smart Northern BC businesses are already implementing AI tools and gaining competitive advantages.

While some businesses are still doing everything manually, others are:
- Automating routine tasks
- Making data-driven decisions
- Reducing operational costs
- Improving customer service

The gap is widening. Businesses that adapt to practical AI tools are pulling ahead of those that don't.

The free session on October 23rd is your opportunity to see what your competitors might already be doing and how you can catch up or stay ahead.

Don't let your competitors get the advantage while you're stuck with manual processes.

RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions`
    }
  }
}

async function createRealABCDVariants() {
  console.log('Creating real A/B/C/D variants with distinct content...')
  
  // Get all existing templates
  const templates = await prisma.campaignTemplate.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`Found ${templates.length} templates to update`)
  
  let updated = 0
  
  for (const template of templates) {
    const nameParts = template.name.split(' - ')
    if (nameParts.length < 4) continue
    
    const industry = nameParts[0]
    const emailNumber = nameParts.find(part => part.includes('Email'))
    const variant = nameParts.find(part => part.includes('Variant'))
    
    if (!emailNumber || !variant) continue
    
    const emailType = emailNumber.trim()
    const variantType = variant.trim()
    
    // Check if we have content for this email type and variant
    if (variantStrategies[emailType] && variantStrategies[emailType][variantType]) {
      const strategy = variantStrategies[emailType][variantType]
      
      // Update the template with new content
      const newSubject = strategy.subject.replace('{{industry_name}}', industry.toLowerCase())
      const newContent = strategy.content.replace('{{industry_name}}', industry.toLowerCase())
      
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          subject: newSubject,
          htmlBody: `<p>${newContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
          textBody: newContent
        }
      })
      
      console.log(`Updated: ${template.name} (${strategy.approach})`)
      updated++
    }
  }
  
  console.log(`\n✅ Updated ${updated} templates with real A/B/C/D variants`)
  console.log('\nEach variant now has distinct:')
  console.log('- Psychological approach')
  console.log('- Subject line strategy') 
  console.log('- Content tone and structure')
  console.log('- Call-to-action style')
}

createRealABCDVariants().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
