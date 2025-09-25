const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createProperAITemplates() {
  console.log('🔍 Creating AI Event templates with proper structure...');
  
  const templates = [
    // Email 1 - Initial Invitation (September 25, 2025)
    {
      name: 'AI Event - Email 1 - Variant A',
      subject: 'Discover AI Tools Tailored for Northern BC Businesses',
      content: `
        <h2>Excited to Share Practical AI Insights</h2>
        <p>Hello {{business_name}},</p>
        <p>I've been working with local businesses to integrate AI, and I've seen how it automates payroll and invoicing while providing real-time analytics. This event is my way of making these tools accessible without the jargon.</p>
        
        <h3>Why This Matters Now</h3>
        <p>With industries like forestry and mining evolving fast, I'll break down what AI can do—and what it can't—to help cut costs and improve decisions.</p>
        
        <h3>Hope to See You There</h3>
        <p>Looking forward to connecting and helping you get started with AI.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Now</a></p>
      `,
      buttonText: 'Register Now',
      emailNumber: 1,
      variant: 'A',
      sendDate: '2025-09-25'
    },
    {
      name: 'AI Event - Email 1 - Variant B',
      subject: 'Join Me for an Approachable AI Session in Terrace',
      content: `
        <h2>Making AI Practical for You</h2>
        <p>Hello {{business_name}},</p>
        <p>I founded Evergreen Web Solutions to help businesses like yours thrive digitally. At this event, I'll explain AI in plain language, focusing on automation and predictive maintenance that save time.</p>
        
        <h3>Real-World Focus</h3>
        <p>Drawing from sectors such as agriculture and hospitality, I'll share use cases that you can apply immediately to your operations.</p>
        
        <h3>Let's Connect Soon</h3>
        <p>I'm eager to show how AI fits into everyday business without overwhelming you.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Secure Your Spot</a></p>
      `,
      buttonText: 'Secure Your Spot',
      emailNumber: 1,
      variant: 'B',
      sendDate: '2025-09-25'
    },
    {
      name: 'AI Event - Email 1 - Variant C',
      subject: 'Unlock AI\'s Potential at Our Free Terrace Event',
      content: `
        <h2>Bringing AI Down to Earth</h2>
        <p>Hello {{business_name}},</p>
        <p>As an AI solutions expert here in Terrace, I'm hosting this to demystify AI for local owners. Expect straightforward talks on analytics and decision-making tools that boost efficiency.</p>
        
        <h3>Tailored for Northern BC</h3>
        <p>I'll cover examples from financial services to mining, ensuring you leave with a clear plan on starting small.</p>
        
        <h3>Eager to Meet You</h3>
        <p>This is about practical steps forward—hope you'll join me.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Today</a></p>
      `,
      buttonText: 'RSVP Today',
      emailNumber: 1,
      variant: 'C',
      sendDate: '2025-09-25'
    },

    // Email 2 - Benefits Follow-Up (October 3, 2025)
    {
      name: 'AI Event - Email 2 - Variant A',
      subject: 'How AI Can Cut Costs for Your Business – Terrace Event',
      content: `
        <h2>Diving Deeper into AI Benefits</h2>
        <p>Hello {{business_name}},</p>
        <p>Following up on my invitation, I want to highlight how AI handles payroll automation and real-time analytics. I've helped businesses save time, and I'll show you the same at the event.</p>
        
        <h3>What to Expect</h3>
        <p>Plain-language breakdowns of AI limits and strengths, with focus on industries like forestry where predictive maintenance makes a real difference.</p>
        
        <h3>Don't Miss Out</h3>
        <p>I'm committed to making this actionable—register and let's explore together.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Claim Your Seat</a></p>
      `,
      buttonText: 'Claim Your Seat',
      emailNumber: 2,
      variant: 'A',
      sendDate: '2025-10-03'
    },
    {
      name: 'AI Event - Email 2 - Variant B',
      subject: 'Save Time with AI: Insights from Terrace Expert',
      content: `
        <h2>Focusing on Time-Saving AI Tools</h2>
        <p>Hello {{business_name}},</p>
        <p>I reached out earlier about the event, and I'm excited to share how AI improves decision-making through invoicing automation. Based on my experience, it's transformative for local ops.</p>
        
        <h3>Industry Applications</h3>
        <p>From mining to hospitality, I'll provide examples that address common challenges without hype.</p>
        
        <h3>Ready to Learn More?</h3>
        <p>Hope this piques your interest—I'm here to help you harness AI effectively.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Here</a></p>
      `,
      buttonText: 'Register Here',
      emailNumber: 2,
      variant: 'B',
      sendDate: '2025-10-03'
    },
    {
      name: 'AI Event - Email 2 - Variant C',
      subject: 'AI for Better Decisions: Join Me October 23rd',
      content: `
        <h2>Emphasizing AI's Efficiency Gains</h2>
        <p>Hello {{business_name}},</p>
        <p>Building on my initial note, I'll cover how AI cuts costs via predictive tools. As founder of Evergreen, I've seen these changes firsthand and want to pass them on.</p>
        
        <h3>Practical Takeaways</h3>
        <p>Leave knowing exactly how to start, with insights for agriculture and financial services.</p>
        
        <h3>Looking Ahead</h3>
        <p>This event is designed for you—excited to share these insights soon.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign Up Now</a></p>
      `,
      buttonText: 'Sign Up Now',
      emailNumber: 2,
      variant: 'C',
      sendDate: '2025-10-03'
    },

    // Email 3 - Industry Examples (October 10, 2025)
    {
      name: 'AI Event - Email 3 - Variant A',
      subject: 'AI Use Cases for Forestry and Mining in Northern BC',
      content: `
        <h2>Tailored AI Examples for Your Sector</h2>
        <p>Hello {{business_name}},</p>
        <p>I thought you'd appreciate specifics: At the event, I'll demo AI for predictive maintenance in mining and analytics in forestry. It's all about real-world fit for Terrace businesses.</p>
        
        <h3>Beyond the Basics</h3>
        <p>We'll discuss what AI can't do too, ensuring a balanced view for hospitality and agriculture.</p>
        
        <h3>Join the Conversation</h3>
        <p>I'm passionate about this—hope to see you and discuss how it applies to you.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reserve Your Place</a></p>
      `,
      buttonText: 'Reserve Your Place',
      emailNumber: 3,
      variant: 'A',
      sendDate: '2025-10-10'
    },
    {
      name: 'AI Event - Email 3 - Variant B',
      subject: 'Real AI Applications for Agriculture and Hospitality',
      content: `
        <h2>Sector-Specific AI Insights</h2>
        <p>Hello {{business_name}},</p>
        <p>Reaching out again with examples in mind. I'll break down AI for invoicing in financial services and automation in agriculture, drawing from my local integrations.</p>
        
        <h3>Approachable Learning</h3>
        <p>Plain talk on starting small, with limits clearly outlined for all attendees.</p>
        
        <h3>Excited to Share</h3>
        <p>This is practical and local—let's connect at the Sunshine Inn.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Registered</a></p>
      `,
      buttonText: 'Get Registered',
      emailNumber: 3,
      variant: 'B',
      sendDate: '2025-10-10'
    },
    {
      name: 'AI Event - Email 3 - Variant C',
      subject: 'Explore AI for Financial Services and More',
      content: `
        <h2>Highlighting Industry Use Cases</h2>
        <p>Hello {{business_name}},</p>
        <p>As the event nears, I wanted to tease the content: Real scenarios for decision-making in hospitality and cost-cutting in mining, based on my expertise.</p>
        
        <h3>Clear and Actionable</h3>
        <p>You'll get a roadmap, including what to avoid, tailored for Northern BC.</p>
        
        <h3>See You Soon?</h3>
        <p>I'm gearing up to make this valuable—register and join me.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Quickly</a></p>
      `,
      buttonText: 'RSVP Quickly',
      emailNumber: 3,
      variant: 'C',
      sendDate: '2025-10-10'
    },

    // Email 4 - Quote Emphasis (October 17, 2025)
    {
      name: 'AI Event - Email 4 - Variant A',
      subject: 'Making AI Approachable: My Take on the Terrace Event',
      content: `
        <h2>Why I'm Hosting This Event</h2>
        <p>Hello {{business_name}},</p>
        <p>As I said, 'This event is about making AI approachable and practical for local businesses.' I'll ensure you leave understanding what AI can do for your operations.</p>
        
        <h3>Quote in Action</h3>
        <p>Focus on plain-language use cases for forestry, mining, and more, with honest limits discussed.</p>
        
        <h3>Personal Invitation</h3>
        <p>I'm invested in your success—hope you'll attend.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Secure Spot Now</a></p>
      `,
      buttonText: 'Secure Spot Now',
      emailNumber: 4,
      variant: 'A',
      sendDate: '2025-10-17'
    },
    {
      name: 'AI Event - Email 4 - Variant B',
      subject: '\'What AI Can Do, What It Can\'t\' – Join Me in Terrace',
      content: `
        <h2>Straight Talk on AI</h2>
        <p>Hello {{business_name}},</p>
        <p>My goal: 'Owners will leave with a clear understanding of what AI can do, what it can't do, and how to start.' Expect that from my session on automation and analytics.</p>
        
        <h3>From My Perspective</h3>
        <p>Tailored examples for agriculture, hospitality, and financial services to get you started.</p>
        
        <h3>Let's Make It Happen</h3>
        <p>This is straightforward help—excited for you to join.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Today</a></p>
      `,
      buttonText: 'Register Today',
      emailNumber: 4,
      variant: 'B',
      sendDate: '2025-10-17'
    },
    {
      name: 'AI Event - Email 4 - Variant C',
      subject: 'Practical AI for Local Businesses: My Event Vision',
      content: `
        <h2>Echoing My Commitment</h2>
        <p>Hello {{business_name}},</p>
        <p>I believe in 'making AI approachable'—that's why I'll cover real-world tools for predictive maintenance and decision-making in plain terms.</p>
        
        <h3>Balanced Insights</h3>
        <p>Honest discussion on strengths and limits, with sectors like mining in focus.</p>
        
        <h3>Hope to Connect</h3>
        <p>I'm here to guide—register and let's chat AI.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Claim Your Seat</a></p>
      `,
      buttonText: 'Claim Your Seat',
      emailNumber: 4,
      variant: 'C',
      sendDate: '2025-10-17'
    },

    // Email 5 - Urgency Reminder (October 21, 2025)
    {
      name: 'AI Event - Email 5 - Variant A',
      subject: 'Limited Seats Left for AI Event This Thursday',
      content: `
        <h2>Quick Reminder: Seats Filling Up</h2>
        <p>Hello {{business_name}},</p>
        <p>With the event just days away, I wanted to note seats are limited. I'll share AI for cost-cutting and efficiency in industries like forestry—don't miss it.</p>
        
        <h3>Last Chance Details</h3>
        <p>Plain breakdowns for mining and agriculture, ensuring you know how to implement.</p>
        
        <h3>Act Soon</h3>
        <p>I'm ready to help—secure your spot today.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Before It's Gone</a></p>
      `,
      buttonText: 'Register Before It\'s Gone',
      emailNumber: 5,
      variant: 'A',
      sendDate: '2025-10-21'
    },
    {
      name: 'AI Event - Email 5 - Variant B',
      subject: 'Only a Few Spots Remain for Terrace AI Session',
      content: `
        <h2>Urgency on AI Insights</h2>
        <p>Hello {{business_name}},</p>
        <p>As October 23 approaches, remember seats are going fast. I'm preparing practical talks on invoicing automation and analytics for local businesses.</p>
        
        <h3>Time-Sensitive Opportunity</h3>
        <p>Focus on hospitality and financial services with clear starting steps.</p>
        
        <h3>Don't Delay</h3>
        <p>This is your chance—hope to see you there.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Immediately</a></p>
      `,
      buttonText: 'RSVP Immediately',
      emailNumber: 5,
      variant: 'B',
      sendDate: '2025-10-21'
    },
    {
      name: 'AI Event - Email 5 - Variant C',
      subject: 'AI Event Approaching: Reserve Your Limited Seat',
      content: `
        <h2>Final Push for Registration</h2>
        <p>Hello {{business_name}},</p>
        <p>Just two days out, and spots are limited. I'll cover what AI can achieve in decision-making and maintenance for Northern BC sectors.</p>
        
        <h3>Urgent Insights</h3>
        <p>Balanced view on limits, with examples from agriculture to mining.</p>
        
        <h3>Join Before Full</h3>
        <p>I'm excited—register now to attend.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign Up Fast</a></p>
      `,
      buttonText: 'Sign Up Fast',
      emailNumber: 5,
      variant: 'C',
      sendDate: '2025-10-21'
    },

    // Email 6 - Day-Of Reminder (October 23, 2025)
    {
      name: 'AI Event - Email 6 - Variant A',
      subject: 'Tonight\'s AI Event in Terrace: Still Time to Join',
      content: `
        <h2>Happening Today: AI for Business</h2>
        <p>Hello {{business_name}},</p>
        <p>It's October 23—join me at 5 PM for practical AI talks on automation and analytics. Seats are limited, but there's still room if you act now.</p>
        
        <h3>Today's Highlights</h3>
        <p>Real cases for forestry, mining, and more, in plain language.</p>
        
        <h3>See You Soon</h3>
        <p>I'm set up and ready—hope you can make it.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Last Minute</a></p>
      `,
      buttonText: 'Register Last Minute',
      emailNumber: 6,
      variant: 'A',
      sendDate: '2025-10-23'
    },
    {
      name: 'AI Event - Email 6 - Variant B',
      subject: 'AI Session Starts at 5 PM: Quick RSVP',
      content: `
        <h2>Last-Minute Invite to Tonight's Event</h2>
        <p>Hello {{business_name}},</p>
        <p>The day is here! I'll demystify AI for local owners, covering invoicing and predictive tools starting at 5 PM.</p>
        
        <h3>Event Day Essentials</h3>
        <p>Focus on agriculture, hospitality, with honest limits and starts.</p>
        
        <h3>Excited for Today</h3>
        <p>This is practical—register and come by.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Us Tonight</a></p>
      `,
      buttonText: 'Join Us Tonight',
      emailNumber: 6,
      variant: 'B',
      sendDate: '2025-10-23'
    },
    {
      name: 'AI Event - Email 6 - Variant C',
      subject: 'Don\'t Miss Tonight\'s Free AI Insights in Terrace',
      content: `
        <h2>Reminder: Event Kicks Off Soon</h2>
        <p>Hello {{business_name}},</p>
        <p>October 23 is today—I'm hosting at the Sunshine Inn from 5 PM, sharing AI for efficiency in financial services and beyond.</p>
        
        <h3>Immediate Action</h3>
        <p>Tailored for Northern BC, with clear takeaways on what works.</p>
        
        <h3>Hope to Greet You</h3>
        <p>I'm looking forward to it—join if you can.</p>
        
        <p><a href="{{invite_link}}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Now</a></p>
      `,
      buttonText: 'RSVP Now',
      emailNumber: 6,
      variant: 'C',
      sendDate: '2025-10-23'
    }
  ];

  console.log('📧 Creating properly structured AI event templates...');
  
  for (const template of templates) {
    const newTemplate = await prisma.campaignTemplate.create({
      data: {
        name: template.name,
        subject: template.subject,
        htmlBody: template.content,
        textBody: template.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        meta: {
          aiEventTemplate: true,
          emailNumber: template.emailNumber,
          variant: template.variant,
          sendDate: template.sendDate,
          buttonText: template.buttonText,
          campaignType: 'ai-event-terrace-2025'
        }
      }
    });
    
    console.log(`✅ Created: ${newTemplate.name}`);
  }

  console.log('\n🎉 All AI event templates created with proper structure!');
  console.log('📊 Summary:');
  console.log('   - 18 templates created (6 emails × 3 variants each)');
  console.log('   - Proper naming structure: "AI Event - Email X - Variant Y"');
  console.log('   - Email 1: Initial Invitation (Sept 25)');
  console.log('   - Email 2: Benefits Follow-Up (Oct 3)');
  console.log('   - Email 3: Industry Examples (Oct 10)');
  console.log('   - Email 4: Quote Emphasis (Oct 17)');
  console.log('   - Email 5: Urgency Reminder (Oct 21)');
  console.log('   - Email 6: Day-Of Reminder (Oct 23)');
  console.log('\n🔗 All templates include {{business_name}} and {{invite_link}} placeholders');
  console.log('🎯 Templates will now group properly in the admin interface');
  console.log('📅 Ready for campaign creation and scheduling');
}

createProperAITemplates()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
