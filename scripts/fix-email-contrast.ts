import 'dotenv/config'
import prisma from '@/lib/prisma'

async function fixEmailContrast() {
  console.log('Fixing email template contrast issues...')
  
  // Get all email templates
  const templates = await prisma.campaignTemplate.findMany({
    where: {
      name: {
        contains: 'Email'
      }
    }
  })
  
  console.log(`Found ${templates.length} email templates to check`)
  
  let updated = 0
  
  for (const template of templates) {
    if (!template.htmlBody) continue
    
    // Check if the HTML has contrast issues (white text without proper styling)
    const hasContrastIssue = template.htmlBody.includes('color: #ffffff') || 
                           template.htmlBody.includes('color: white') ||
                           (!template.htmlBody.includes('color:') && template.htmlBody.includes('<p>'))
    
    if (hasContrastIssue) {
      // Fix the HTML by ensuring proper dark text on white background
      let fixedHtml = template.htmlBody
      
      // Replace white text with dark text
      fixedHtml = fixedHtml.replace(/color:\s*#ffffff/g, 'color: #374151')
      fixedHtml = fixedHtml.replace(/color:\s*white/g, 'color: #374151')
      
      // Add color to paragraphs that don't have it
      fixedHtml = fixedHtml.replace(/<p>/g, '<p style="color: #374151;">')
      fixedHtml = fixedHtml.replace(/<p\s+([^>]*?)>/g, (match, attrs) => {
        if (!attrs.includes('color')) {
          return `<p style="color: #374151;" ${attrs}>`
        }
        return match
      })
      
      // Ensure headers have proper contrast
      fixedHtml = fixedHtml.replace(/<h1>/g, '<h1 style="color: #1f2937;">')
      fixedHtml = fixedHtml.replace(/<h2>/g, '<h2 style="color: #1f2937;">')
      fixedHtml = fixedHtml.replace(/<h3>/g, '<h3 style="color: #1f2937;">')
      
      // Fix any remaining contrast issues in the content area
      if (fixedHtml.includes('padding: 40px 32px;')) {
        fixedHtml = fixedHtml.replace(
          /padding: 40px 32px;">([^<]*<p[^>]*>)/g, 
          'padding: 40px 32px;"><p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">'
        )
      }
      
      // Update the template
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          htmlBody: fixedHtml
        }
      })
      
      console.log(`Fixed contrast: ${template.name}`)
      updated++
    }
  }
  
  console.log(`\n✅ Fixed contrast issues in ${updated} email templates`)
  console.log('\nImprovements made:')
  console.log('- Changed white text to dark grey (#374151)')
  console.log('- Added proper color styling to all paragraphs')
  console.log('- Ensured headers have proper contrast')
  console.log('- Fixed content area text visibility')
}

fixEmailContrast().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
