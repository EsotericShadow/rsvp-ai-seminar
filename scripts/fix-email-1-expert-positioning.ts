import 'dotenv/config'
import prisma from '@/lib/prisma'

// Expert positioning content for Email 1 variants - experienced AI expert, no false claims
const expertPositioningVariants = {
  'Variant A': {
    approach: 'Direct & Expert',
    subject: 'Quick hello from Terrace',
    content: `Hi there,

I'm Gabriel Lacroix from Evergreen Web Solutions here in Terrace. I'm hosting a free informational session on October 23rd about practical AI tools for Northern BC businesses.

As someone who's been building AI solutions for years, I know how time-consuming routine tasks can be for local businesses. I've developed systems that automate data entry, inventory tracking, and customer follow-ups - and the results speak for themselves.

I'd like to share what I've learned at a free session on October 23rd at the Sunshine Inn. It's completely free, includes coffee and networking, and you'll learn about tools you can start using immediately.

The session will cover:
- Spreadsheet automation and data analysis
- Inventory and resource planning
- Customer communication streamlining
- Real tools that actually work (no hype)

I'm keeping it small and focused on practical solutions for businesses like yours in Northern BC.

RSVP here: {{rsvp_link}}

Hope to see you there,

Gabriel Lacroix
Evergreen Web Solutions
Terrace, BC`
  },
  
  'Variant B': {
    approach: 'Problem-First & Expert',
    subject: 'Struggling with manual tasks in your business?',
    content: `Hi there,

I'm Gabriel Lacroix, and I run Evergreen Web Solutions here in Terrace. I'm guessing you're probably spending too much time on tasks that could be automated.

Are you manually updating spreadsheets, tracking inventory, or managing customer communications? I've been developing AI solutions for years, and I know exactly how these tools can transform your workflow.

What I've built and tested is pretty impressive - systems that handle routine tasks while you focus on growing your business. I've seen firsthand how AI can streamline operations without replacing people.

I'm sharing everything I've learned at a free session on October 23rd at the Sunshine Inn. No sales pitch, just practical tools and insights for Northern BC businesses.

You'll learn about:
- Automating repetitive data entry
- Predicting inventory needs
- Streamlining customer follow-ups
- Tools you can implement this week

Free coffee, networking, and actionable insights included.

Interested? RSVP here: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions
Terrace, BC`
  },
  
  'Variant C': {
    approach: 'Expert & Local',
    subject: 'What I learned building AI solutions for Northern BC',
    content: `Hi there,

I'm Gabriel Lacroix from Evergreen Web Solutions, and I've been building AI solutions that work for Northern BC businesses.

What I've discovered through years of development is fascinating - there are practical tools that can automate routine tasks without replacing people. From restaurants optimizing food orders to construction companies planning material deliveries, the applications are real.

I'm sharing these insights at a free session on October 23rd at the Sunshine Inn. You'll hear about real tools and see demonstrations of AI solutions that work in our Northern BC business environment.

This isn't about replacing people - it's about giving you more time for the work that matters. The session includes:

- Technical insights from years of AI development
- Live demonstrations of practical solutions
- Q&A about implementation challenges
- Free coffee and networking

I'm keeping it focused on solutions that work in our Northern BC business environment.

Join us: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions
Terrace, BC`
  }
}

async function fixEmail1ExpertPositioning() {
  console.log('Fixing Email 1 templates with expert positioning...')
  
  // Get all Email 1 templates
  const email1Templates = await prisma.campaignTemplate.findMany({
    where: {
      name: {
        contains: 'Email 1'
      }
    }
  })
  
  console.log(`Found ${email1Templates.length} Email 1 templates to update`)
  
  let updated = 0
  
  for (const template of email1Templates) {
    const nameParts = template.name.split(' - ')
    if (nameParts.length < 3) continue
    
    const variant = nameParts.find(part => part.includes('Variant'))
    if (!variant) continue
    
    const variantType = variant.split('Variant ')[1]?.split(' ')[0]
    if (!variantType) continue
    
    // Check if we have content for this variant
    if (expertPositioningVariants[`Variant ${variantType}`]) {
      const variantContent = expertPositioningVariants[`Variant ${variantType}`]
      
      // Create professional HTML with proper contrast
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Session Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
        Evergreen Web Solutions
      </h1>
      <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">
        AI Solutions for Northern BC
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        ${variantContent.content.replace(/\n\n/g, '</p><p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">').replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1e293b; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
          Gabriel Lacroix
        </h3>
        <p style="color: #64748b; margin: 0; font-size: 14px;">
          Founder & AI Solutions Specialist
        </p>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">
          Evergreen Web Solutions
        </p>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          📧 gabriel@evergreenwebsolutions.ca | 🌐 evergreenwebsolutions.ca
        </p>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 12px;">
          📍 Terrace, BC, Canada
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
      
      // Update the template
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          subject: variantContent.subject,
          htmlBody: htmlContent,
          textBody: variantContent.content
        }
      })
      
      console.log(`Updated: ${template.name} (${variantContent.approach})`)
      updated++
    }
  }
  
  console.log(`\n✅ Updated ${updated} Email 1 templates with expert positioning`)
  console.log('\nImprovements made:')
  console.log('- Positioned as experienced AI expert with years of development')
  console.log('- Emphasized building and developing AI solutions')
  console.log('- No false claims about working with other businesses')
  console.log('- Focused on technical expertise and knowledge')
  console.log('- Maintained honest, credible positioning')
}

fixEmail1ExpertPositioning().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
