import 'dotenv/config'
import prisma from '@/lib/prisma'

// Personal introduction content for Email 1 variants
const personalIntroVariants = {
  'Variant A': {
    approach: 'Direct & Local',
    subject: 'Quick hello from Terrace',
    content: `Hi there,

I'm Gabriel Lacroix from Evergreen Web Solutions here in Terrace. I'm reaching out because I'm hosting a free informational session on October 23rd about practical AI tools for Northern BC businesses.

As a local business owner myself, I know how time-consuming routine tasks can be. I've been testing some AI tools that can automate things like data entry, inventory tracking, and customer follow-ups - and the results have been pretty impressive.

I'm sharing what I've learned at a free session on October 23rd at the Sunshine Inn. It's completely free, includes coffee and networking, and you'll leave with tools you can start using immediately.

The session covers:
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
    approach: 'Problem-First & Curious',
    subject: 'Struggling with manual tasks in your business?',
    content: `Hi there,

I'm Gabriel Lacroix, and I run Evergreen Web Solutions here in Terrace. I'm guessing you're probably spending too much time on tasks that could be automated.

Are you manually updating spreadsheets, tracking inventory, or managing customer communications? I was in the same boat until I started experimenting with some practical AI tools.

What I've discovered is pretty exciting - there are tools that can handle these routine tasks while you focus on growing your business. I've been testing them with local businesses and the results speak for themselves.

I'm sharing everything I've learned at a free session on October 23rd at the Sunshine Inn. No sales pitch, just practical tools and real results from Northern BC businesses.

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
    approach: 'Local Connection & Story',
    subject: 'What I learned from local Northern BC businesses',
    content: `Hi there,

I'm Gabriel Lacroix from Evergreen Web Solutions, and I've been working with businesses across Northern BC to implement practical AI solutions.

What I've discovered is fascinating - local businesses are finding ways to automate tasks they never thought possible. From restaurants predicting food waste to construction companies optimizing material orders, the results are real.

I'm sharing these insights at a free session on October 23rd at the Sunshine Inn. You'll hear real stories from local businesses and see the tools they're using to work smarter, not harder.

This isn't about replacing people - it's about giving you more time for the work that matters. The session includes:

- Case studies from Northern BC businesses
- Live demonstrations of AI tools
- Q&A with local business owners
- Free coffee and networking

I'm keeping it focused on practical solutions that work in our Northern BC business environment.

Join us: {{rsvp_link}}

Gabriel Lacroix
Evergreen Web Solutions
Terrace, BC`
  }
}

async function fixEmail1PersonalIntro() {
  console.log('Fixing Email 1 templates with personal, local introductions...')
  
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
    if (personalIntroVariants[`Variant ${variantType}`]) {
      const variantContent = personalIntroVariants[`Variant ${variantType}`]
      
      // Create professional HTML with the personal content
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
      ${variantContent.content.replace(/\n\n/g, '</p><p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">').replace(/\n/g, '<br>')}
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
  
  console.log(`\n✅ Updated ${updated} Email 1 templates with personal, local introductions`)
  console.log('\nImprovements made:')
  console.log('- Personal introduction from Gabriel')
  console.log('- Local Terrace connection emphasized')
  console.log('- More conversational, less corporate tone')
  console.log('- Northern BC business focus')
  console.log('- Genuine local business owner perspective')
}

fixEmail1PersonalIntro().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
