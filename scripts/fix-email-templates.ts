import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmailTemplates() {
  try {
    console.log('🔧 Fixing email templates with proper styling and realistic content...');

    // Get all campaign templates
    const templates = await prisma.campaignTemplate.findMany({
      where: {
        name: {
          contains: 'AI Event'
        }
      }
    });

    console.log(`Found ${templates.length} templates to fix`);

    // Fix each template with proper styling and realistic content
    for (const template of templates) {
      let newHtmlBody = '';
      let newTextBody = '';
      let newSubject = '';

      if (template.name.includes('Direct Benefit Approach')) {
        newSubject = 'Free AI Workshop in Terrace - October 23rd (Coffee & snacks included!)';
        newHtmlBody = generateFixedEmailHTML('direct');
        newTextBody = generateFixedEmailText('direct');
      } else if (template.name.includes('Problem-Solving Approach')) {
        newSubject = 'What if AI could help your business run smoother?';
        newHtmlBody = generateFixedEmailHTML('problem-solving');
        newTextBody = generateFixedEmailText('problem-solving');
      } else if (template.name.includes('Community Connection')) {
        newSubject = 'Terrace Business Network: Free AI Info Session';
        newHtmlBody = generateFixedEmailHTML('community');
        newTextBody = generateFixedEmailText('community');
      } else if (template.name.includes('Email 2')) {
        newSubject = '5 AI Tools Every Business Should Know (Free Workshop)';
        newHtmlBody = generateFixedEmailHTML('tools');
        newTextBody = generateFixedEmailText('tools');
      } else if (template.name.includes('Email 3')) {
        newSubject = 'How AI is Being Used in Northern BC Businesses';
        newHtmlBody = generateFixedEmailHTML('examples');
        newTextBody = generateFixedEmailText('examples');
      } else if (template.name.includes('Email 4')) {
        newSubject = 'Your Free AI Starter Kit + Business Assessment';
        newHtmlBody = generateFixedEmailHTML('starter-kit');
        newTextBody = generateFixedEmailText('starter-kit');
      } else if (template.name.includes('Email 5')) {
        newSubject = 'What to Expect at Our Free AI Workshop';
        newHtmlBody = generateFixedEmailHTML('event-preview');
        newTextBody = generateFixedEmailText('event-preview');
      } else if (template.name.includes('Email 6')) {
        newSubject = 'Network with Other Terrace Business Owners';
        newHtmlBody = generateFixedEmailHTML('networking');
        newTextBody = generateFixedEmailText('networking');
      } else if (template.name.includes('Email 7')) {
        newSubject = 'Final Call: AI Workshop Tomorrow - Limited Seats';
        newHtmlBody = generateFixedEmailHTML('final-call');
        newTextBody = generateFixedEmailText('final-call');
      }

      // Update the template
      await prisma.campaignTemplate.update({
        where: { id: template.id },
        data: {
          subject: newSubject || template.subject,
          htmlBody: newHtmlBody || template.htmlBody,
          textBody: newTextBody || template.textBody
        }
      });

      console.log(`✅ Fixed template: ${template.name}`);
    }

    console.log('✅ All email templates fixed successfully!');
    console.log('');
    console.log('🎨 Fixed Issues:');
    console.log('   - Removed white text on white backgrounds');
    console.log('   - Added proper contrast and readability');
    console.log('   - Replaced hallucinated success stories with realistic content');
    console.log('   - Used honest, authentic messaging');
    console.log('   - Improved mobile responsiveness');
    console.log('   - Added proper email client compatibility');

  } catch (error) {
    console.error('❌ Error fixing email templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateFixedEmailHTML(type: string): string {
  const baseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Workshop Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1f2937; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">AI Workshop Invitation</h1>
            <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">Terrace, BC • October 23rd, 2025</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hi {{businessName}},</p>
            
            ${getEmailContent(type)}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{inviteLink}}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Learn More About AI
                </a>
            </div>
            
            <!-- Event Details -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px;">Event Details</h3>
                <p style="color: #166534; margin: 0 0 8px 0;"><strong>📅 Date:</strong> October 23rd, 2025</p>
                <p style="color: #166534; margin: 0 0 8px 0;"><strong>🕕 Time:</strong> 6:00 PM - 8:30 PM</p>
                <p style="color: #166534; margin: 0 0 8px 0;"><strong>📍 Location:</strong> Sunshine Inn Terrace - Jasmine Room</p>
                <p style="color: #166534; margin: 0 0 8px 0;"><strong>☕ Includes:</strong> Free coffee, refreshments, charcuterie boards</p>
                <p style="color: #166534; margin: 0;"><strong>🎁 Free:</strong> AI assessment worksheet + tools guide</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; margin: 24px 0 0 0;">
                Best regards,<br>
                <strong>Gabriel Lacroix</strong><br>
                Evergreen Web Solutions<br>
                <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #10b981; text-decoration: none;">gabriel@evergreenwebsolutions.ca</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                <strong>Evergreen Web Solutions</strong><br>
                4710 Lazelle Ave, Terrace, BC V8G 1T2
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="{{unsubscribeLink}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  return baseHTML;
}

function generateFixedEmailText(type: string): string {
  const content = getEmailContent(type, 'text');
  
  return `Hi {{businessName}},

${content}

Event Details:
📅 Date: October 23rd, 2025
🕕 Time: 6:00 PM - 8:30 PM
📍 Location: Sunshine Inn Terrace - Jasmine Room
☕ Includes: Free coffee, refreshments, charcuterie boards
🎁 Free: AI assessment worksheet + tools guide

Best regards,
Gabriel Lacroix
Evergreen Web Solutions
gabriel@evergreenwebsolutions.ca

Unsubscribe: {{unsubscribeLink}}`;
}

function getEmailContent(type: string, format: 'html' | 'text' = 'html'): string {
  const contents: Record<string, Record<string, string>> = {
    'direct': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                I'm hosting a free AI information session for Terrace business owners on October 23rd, and I'd love for you to join us.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                We'll cover practical AI tools that local businesses can actually use - no complex tech jargon, just real applications that can help your business run more efficiently.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                It's completely free, includes coffee and snacks, and you'll leave with a practical AI assessment for your business.
            </p>
      `,
      text: `I'm hosting a free AI information session for Terrace business owners on October 23rd, and I'd love for you to join us.

We'll cover practical AI tools that local businesses can actually use - no complex tech jargon, just real applications that can help your business run more efficiently.

It's completely free, includes coffee and snacks, and you'll leave with a practical AI assessment for your business.`
    },
    'problem-solving': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                What if AI could help your business run smoother without being complicated or expensive?
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                That's exactly what we'll explore at our free AI workshop on October 23rd. We'll look at simple AI tools that can help with customer service, inventory management, and business automation.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                No technical background needed - just bring your business challenges and we'll show you how AI might help solve them.
            </p>
      `,
      text: `What if AI could help your business run smoother without being complicated or expensive?

That's exactly what we'll explore at our free AI workshop on October 23rd. We'll look at simple AI tools that can help with customer service, inventory management, and business automation.

No technical background needed - just bring your business challenges and we'll show you how AI might help solve them.`
    },
    'community': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Terrace business owners are discovering that AI isn't just for big tech companies anymore.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Join us on October 23rd for a free networking event where we'll discuss practical AI applications for local businesses. You'll meet other Terrace entrepreneurs and learn about AI tools that can help your business.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                It's a great opportunity to network with other business owners while learning something new.
            </p>
      `,
      text: `Terrace business owners are discovering that AI isn't just for big tech companies anymore.

Join us on October 23rd for a free networking event where we'll discuss practical AI applications for local businesses. You'll meet other Terrace entrepreneurs and learn about AI tools that can help your business.

It's a great opportunity to network with other business owners while learning something new.`
    },
    'tools': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Here are 5 AI tools that any business can start using today:
            </p>
            <ul style="color: #374151; font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>ChatGPT for customer service:</strong> Answer common questions 24/7</li>
                <li style="margin-bottom: 8px;"><strong>Canva AI for marketing:</strong> Create professional graphics quickly</li>
                <li style="margin-bottom: 8px;"><strong>Google Analytics AI:</strong> Get insights about your website visitors</li>
                <li style="margin-bottom: 8px;"><strong>Grammarly for business:</strong> Improve your written communications</li>
                <li style="margin-bottom: 8px;"><strong>Calendar AI:</strong> Automate meeting scheduling</li>
            </ul>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                At our October 23rd workshop, we'll show you how to implement these tools in your business.
            </p>
      `,
      text: `Here are 5 AI tools that any business can start using today:

1. ChatGPT for customer service: Answer common questions 24/7
2. Canva AI for marketing: Create professional graphics quickly  
3. Google Analytics AI: Get insights about your website visitors
4. Grammarly for business: Improve your written communications
5. Calendar AI: Automate meeting scheduling

At our October 23rd workshop, we'll show you how to implement these tools in your business.`
    },
    'examples': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Here's how local businesses in Northern BC are using AI:
            </p>
            <ul style="color: #374151; font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Restaurants:</strong> Using AI to predict busy times and optimize staffing</li>
                <li style="margin-bottom: 8px;"><strong>Retail stores:</strong> AI-powered inventory management to reduce waste</li>
                <li style="margin-bottom: 8px;"><strong>Service businesses:</strong> Automated appointment scheduling and follow-ups</li>
                <li style="margin-bottom: 8px;"><strong>Manufacturing:</strong> Predictive maintenance to prevent equipment failures</li>
            </ul>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Learn how these applications could work for your business at our free workshop.
            </p>
      `,
      text: `Here's how local businesses in Northern BC are using AI:

• Restaurants: Using AI to predict busy times and optimize staffing
• Retail stores: AI-powered inventory management to reduce waste
• Service businesses: Automated appointment scheduling and follow-ups
• Manufacturing: Predictive maintenance to prevent equipment failures

Learn how these applications could work for your business at our free workshop.`
    },
    'starter-kit': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                I've prepared a free AI starter kit for you, including:
            </p>
            <ul style="color: #374151; font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">A practical AI assessment worksheet for your business</li>
                <li style="margin-bottom: 8px;">A guide to 10 free AI tools you can start using today</li>
                <li style="margin-bottom: 8px;">Templates for common business AI applications</li>
                <li style="margin-bottom: 8px;">A checklist for implementing AI in your business</li>
            </ul>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                You'll receive these resources at our October 23rd workshop, along with personalized guidance on how to apply them to your specific business.
            </p>
      `,
      text: `I've prepared a free AI starter kit for you, including:

• A practical AI assessment worksheet for your business
• A guide to 10 free AI tools you can start using today
• Templates for common business AI applications
• A checklist for implementing AI in your business

You'll receive these resources at our October 23rd workshop, along with personalized guidance on how to apply them to your specific business.`
    },
    'event-preview': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Here's what you can expect at our AI workshop:
            </p>
            <ul style="color: #374151; font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>6:00-6:30 PM:</strong> Welcome, coffee, and networking</li>
                <li style="margin-bottom: 8px;"><strong>6:30-7:30 PM:</strong> AI tools demonstration and Q&A</li>
                <li style="margin-bottom: 8px;"><strong>7:30-8:00 PM:</strong> Business assessment workshop</li>
                <li style="margin-bottom: 8px;"><strong>8:00-8:30 PM:</strong> Networking and individual consultations</li>
            </ul>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                It's designed to be practical and interactive - bring your questions and business challenges!
            </p>
      `,
      text: `Here's what you can expect at our AI workshop:

• 6:00-6:30 PM: Welcome, coffee, and networking
• 6:30-7:30 PM: AI tools demonstration and Q&A
• 7:30-8:00 PM: Business assessment workshop
• 8:00-8:30 PM: Networking and individual consultations

It's designed to be practical and interactive - bring your questions and business challenges!`
    },
    'networking': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                One of the best parts of our AI workshop is the networking opportunity.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                You'll meet other Terrace business owners who are exploring AI solutions for their businesses. It's a great chance to share experiences, learn from each other, and potentially find new business partnerships.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                We'll have dedicated networking time built into the schedule, plus coffee and snacks to keep the conversation flowing.
            </p>
      `,
      text: `One of the best parts of our AI workshop is the networking opportunity.

You'll meet other Terrace business owners who are exploring AI solutions for their businesses. It's a great chance to share experiences, learn from each other, and potentially find new business partnerships.

We'll have dedicated networking time built into the schedule, plus coffee and snacks to keep the conversation flowing.`
    },
    'final-call': {
      html: `
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                This is your final reminder about our free AI workshop tomorrow, October 23rd!
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                We have limited seating at the Sunshine Inn Terrace, so if you're planning to attend, please RSVP now to secure your spot.
            </p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                It's completely free and includes coffee, refreshments, networking, and practical AI tools you can use in your business immediately.
            </p>
      `,
      text: `This is your final reminder about our free AI workshop tomorrow, October 23rd!

We have limited seating at the Sunshine Inn Terrace, so if you're planning to attend, please RSVP now to secure your spot.

It's completely free and includes coffee, refreshments, networking, and practical AI tools you can use in your business immediately.`
    }
  };

  return contents[type]?.[format] || contents['direct'][format];
}

// Run the fix
fixEmailTemplates();
