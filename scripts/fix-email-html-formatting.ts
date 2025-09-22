import 'dotenv/config'
import prisma from '@/lib/prisma'

// Professional email template with consistent branding
const createProfessionalHTML = (content: string) => `
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
      ${content}
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

// Convert plain text content to properly formatted HTML
function convertTextToHTML(textContent: string): string {
  // Split content into paragraphs
  const paragraphs = textContent.split('\n\n').filter(p => p.trim())
  
  let htmlContent = ''
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue
    
    // Check if it's a greeting (starts with "Hi")
    if (trimmed.startsWith('Hi ')) {
      htmlContent += `<p style="color: #1e293b; margin: 0 0 24px 0; font-size: 16px; font-weight: 500;">${trimmed}</p>`
      continue
    }
    
    // Check if it's a CTA button/link
    if (trimmed.includes('RSVP here:') || trimmed.includes('RSVP:')) {
      const linkMatch = trimmed.match(/(RSVP here?:?\s*)(.*)/i)
      if (linkMatch) {
        htmlContent += `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${linkMatch[2].trim()}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s;">
              RSVP for Free Session
            </a>
          </div>`
      }
      continue
    }
    
    // Check if it's a signature
    if (trimmed.includes('Gabriel Lacroix') || trimmed.includes('Evergreen Web Solutions')) {
      htmlContent += `
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">Gabriel Lacroix</p>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Evergreen Web Solutions</p>
        </div>`
      continue
    }
    
    // Regular paragraph
    htmlContent += `<p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">${trimmed}</p>`
  }
  
  return htmlContent
}

async function fixEmailHTMLFormatting() {
  console.log('Fixing email HTML formatting across all templates...')
  
  // Get all templates
  const templates = await prisma.campaignTemplate.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`Found ${templates.length} templates to update`)
  
  let updated = 0
  
  for (const template of templates) {
    try {
      // Convert text content to proper HTML
      const htmlContent = convertTextToHTML(template.textBody || template.htmlBody)
      
      // Create professional HTML wrapper
      const professionalHTML = createProfessionalHTML(htmlContent)
      
      // Update the template
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          htmlBody: professionalHTML,
          // Keep the text body as is for plain text fallback
        }
      })
      
      console.log(`Updated: ${template.name}`)
      updated++
      
    } catch (error) {
      console.error(`Error updating ${template.name}:`, error)
    }
  }
  
  console.log(`\n✅ Updated ${updated} templates with professional HTML formatting`)
  console.log('\nImprovements made:')
  console.log('- Consistent Evergreen Web Solutions branding')
  console.log('- Professional gradient header with company colors')
  console.log('- Clean, readable typography with proper spacing')
  console.log('- Prominent RSVP button with hover effects')
  console.log('- Professional footer with contact information')
  console.log('- Mobile-responsive design')
  console.log('- Consistent color scheme (emerald green theme)')
}

fixEmailHTMLFormatting().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})

