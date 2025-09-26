const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Email templates data
const emailTemplates = [
  // Email 1 - September 25, 2025 - Awareness Introduction
  {
    name: "Awareness Introduction A",
    subject: "Simple Ways AI Can Help Your Business",
    button_text: "Learn More",
    main_content_title: "Exploring AI Basics",
    main_content_body: "I see AI as a tool to make daily tasks easier, like handling invoices or spotting trends in data. At this event, you will discover straightforward steps to try these in your own setup.",
    additional_info_title: "What Makes It Worthwhile",
    additional_info_body: "You will hear about custom options that need a bit of code for a real advantage, all explained without technical terms.",
    closing_title: "Join the Discussion",
    closing_message: "Looking forward to sharing ideas that could save you time."
  },
  {
    name: "Awareness Introduction B",
    subject: "Get Started with AI for Everyday Business",
    button_text: "Register Now",
    main_content_title: "AI Without the Complexity",
    main_content_body: "Think of AI as a helper for routine work, from payroll checks to maintenance alerts. This session covers easy starts and why custom builds can set you apart.",
    additional_info_title: "Focus on Practical Steps",
    additional_info_body: "No jargon, just clear examples on saving money through smart integrations.",
    closing_title: "See You There",
    closing_message: "Excited to help you find what fits your needs."
  },
  {
    name: "Awareness Introduction C",
    subject: "AI Tools to Simplify Your Operations",
    button_text: "Sign Up Today",
    main_content_title: "Introducing AI Possibilities",
    main_content_body: "AI can automate basics like analytics and decisions, freeing up your day. Come learn simple implementations and when custom code adds that extra edge.",
    additional_info_title: "Tailored for Ease",
    additional_info_body: "We will keep it relatable, showing how these changes lead to real efficiency.",
    closing_title: "Hope You Attend",
    closing_message: "This could be a useful step for your business."
  },

  // Email 2 - October 1, 2025 - Benefits Highlight
  {
    name: "Benefits Highlight A",
    subject: "How AI Saves Time in Business Tasks",
    button_text: "Discover Details",
    main_content_title: "Time Saving with AI",
    main_content_body: "Following my first note, consider how AI handles repetitive jobs like invoicing. You will leave with ideas on easy setups that cut hours from your week.",
    additional_info_title: "Added Value Through Custom Work",
    additional_info_body: "For deeper gains, we will touch on integrations that might involve code to match your unique setup.",
    closing_title: "Worth Exploring",
    closing_message: "These insights aim to make a noticeable difference."
  },
  {
    name: "Benefits Highlight B",
    subject: "Cut Costs Using Practical AI",
    button_text: "Join the Event",
    main_content_title: "Cost Cutting Insights",
    main_content_body: "AI offers ways to trim expenses, such as through predictive checks. This event breaks it down into actionable parts you can apply right away.",
    additional_info_title: "Edge with Personalization",
    additional_info_body: "Learn about custom AI that requires some coding for tailored results.",
    closing_title: "Ready to Try",
    closing_message: "Hope this sparks your interest in what is possible."
  },
  {
    name: "Benefits Highlight C",
    subject: "Better Decisions from AI Tools",
    button_text: "Reserve Spot",
    main_content_title: "Smarter Choices Ahead",
    main_content_body: "Building on the intro, AI aids in quick analytics for informed moves. Expect guidance on simple starts and advanced custom options.",
    additional_info_title: "Real Efficiency Boost",
    additional_info_body: "All shared in everyday language to help you implement without hassle.",
    closing_title: "Looking Ahead",
    closing_message: "This session is about practical progress."
  },

  // Email 3 - October 7, 2025 - Value Proposition
  {
    name: "Value Proposition A",
    subject: "Unlock Easy AI Wins for Your Business",
    button_text: "Get Insights",
    main_content_title: "Value in AI Simplicity",
    main_content_body: "AI is not just tech, it is about easing your load with tools for automation. You will gain clear paths to these benefits, plus notes on custom edges.",
    additional_info_title: "Why It Fits Any Business",
    additional_info_body: "From basics to coded solutions, everything explained plainly.",
    closing_title: "A Step Forward",
    closing_message: "Eager to show how this applies broadly."
  },
  {
    name: "Value Proposition B",
    subject: "Practical AI to Give Your Business an Edge",
    button_text: "Sign Up Here",
    main_content_title: "Building an Advantage",
    main_content_body: "Focus on AI that saves resources through smart handling of data and tasks. This includes easy entries and when code creates unique value.",
    additional_info_title: "Broad Appeal",
    additional_info_body: "Kept straightforward for owners in various fields.",
    closing_title: "Join for Clarity",
    closing_message: "This could open new doors for you."
  },
  {
    name: "Value Proposition C",
    subject: "AI Insights That Pay Off Quickly",
    button_text: "Register Free",
    main_content_title: "Quick Returns from AI",
    main_content_body: "Discover how AI streamlines operations for fast wins. We will cover simple tools and custom integrations that might need code for best results.",
    additional_info_title: "Universal Tools",
    additional_info_body: "No niche limits, just useful advice in clear terms.",
    closing_title: "Excited to Share",
    closing_message: "Hope you find it rewarding."
  },

  // Email 4 - October 14, 2025 - Social Proof
  {
    name: "Social Proof A",
    subject: "Hear from Others on Helpful Tech Support",
    button_text: "See More",
    main_content_title: "Real Feedback on Solutions",
    main_content_body: "Jack Cook shared: Gabriel built my company website. He did a fantastic job. I would not hesitate to recommend him and his abilities anytime. Have a look at his work http://KarmaTraining.ca. This event builds on that trust with AI tips.",
    additional_info_title: "Connecting the Dots",
    additional_info_body: "Learn easy AI steps and custom options for your edge.",
    closing_title: "Build Confidence",
    closing_message: "Come see what others value."
  },
  {
    name: "Social Proof B",
    subject: "A Recommendation Worth Noting",
    button_text: "Join Based on This",
    main_content_title: "Trusted Experiences",
    main_content_body: "From Jim Lynch: You sent me Gabriel Lacroix from evergreen web solutions. Thank you as not only did he get my computer problem solved, as a bonus he took care of getting my new iPhone connected. Would be pleased to recommend him for superb work. Ties into the AI guidance ahead.",
    additional_info_title: "Proven Approach",
    additional_info_body: "Simple implementations plus coded custom work explained.",
    closing_title: "Gain from It",
    closing_message: "This feedback highlights reliability."
  },
  {
    name: "Social Proof C",
    subject: "Positive Words on Digital Help",
    button_text: "Explore Event",
    main_content_title: "Shared Success Stories",
    main_content_body: "Drawing from notes like Jack Cook's praise for website work and Jim Lynch's thanks for tech fixes. The event extends this with AI tools for your use.",
    additional_info_title: "Reliable Insights",
    additional_info_body: "From basics to advanced integrations in plain speak.",
    closing_title: "Inspired to Attend",
    closing_message: "Hope these encourage you."
  },

  // Email 5 - October 18, 2025 - Engagement Build
  {
    name: "Engagement Build A",
    subject: "Questions AI Can Answer for You",
    button_text: "Find Answers",
    main_content_title: "Engaging with AI Ideas",
    main_content_body: "What if AI could handle your daily analytics? This session invites you to explore such questions, with easy starts and custom code options.",
    additional_info_title: "Interactive Angle",
    additional_info_body: "All in relatable terms for broad application.",
    closing_title: "Get Involved",
    closing_message: "Your thoughts could shape the talk."
  },
  {
    name: "Engagement Build B",
    subject: "Imagine AI Streamlining Your Day",
    button_text: "Engage Now",
    main_content_title: "Picturing AI Benefits",
    main_content_body: "Envision less time on invoices through AI. We will discuss practical ways and when custom setups provide that advantage.",
    additional_info_title: "Thought Provoking",
    additional_info_body: "Kept simple to spark your ideas.",
    closing_title: "Participate Soon",
    closing_message: "This builds connection before the date."
  },
  {
    name: "Engagement Build C",
    subject: "AI Possibilities to Consider",
    button_text: "Think About It",
    main_content_title: "Sparking Interest in AI",
    main_content_body: "Consider AI for maintenance predictions. The event offers clear guidance on implementations and tailored code for edges.",
    additional_info_title: "Inviting Reflection",
    additional_info_body: "No pressure, just useful concepts.",
    closing_title: "Join the Thought",
    closing_message: "Hope it resonates with you."
  },

  // Email 6 - October 21, 2025 - Gentle Reminder
  {
    name: "Gentle Reminder A",
    subject: "Event Nears: AI Tips Await",
    button_text: "Confirm Attendance",
    main_content_title: "Approaching AI Session",
    main_content_body: "With the date close, recall the focus on easy AI for tasks like payroll. Includes custom integration notes for unique needs.",
    additional_info_title: "Timely Check In",
    additional_info_body: "Plain advice to prepare you well.",
    closing_title: "Final Prep",
    closing_message: "Spots remain for those interested."
  },
  {
    name: "Gentle Reminder B",
    subject: "Quick Note on Upcoming AI Event",
    button_text: "Secure Place",
    main_content_title: "Reminder of Value",
    main_content_body: "As October 23 draws near, think about AI for cost savings. We will cover simple tools and code based custom work.",
    additional_info_title: "Gentle Nudge",
    additional_info_body: "Kept concise for your convenience.",
    closing_title: "Act If Keen",
    closing_message: "This could be timely for you."
  },
  {
    name: "Gentle Reminder C",
    subject: "AI Event This Week: Still Open",
    button_text: "RSVP Soon",
    main_content_title: "Nearing the Date",
    main_content_body: "Event is almost here, offering insights on AI decisions and automations. With options for custom edges via code.",
    additional_info_title: "Easy Access",
    additional_info_body: "All explained without complexity.",
    closing_title: "Consider Joining",
    closing_message: "Hope to welcome you."
  },

  // Email 7 - October 23, 2025 - Day Of Prompt
  {
    name: "Day Of Prompt A",
    subject: "Today: Dive into AI at 5 PM",
    button_text: "Join Tonight",
    main_content_title: "Event Starts Soon",
    main_content_body: "It is October 23. Come for practical AI on analytics and more, including custom ideas that may need code.",
    additional_info_title: "Last Minute Welcome",
    additional_info_body: "Straightforward content ready for you.",
    closing_title: "Arrive Ready",
    closing_message: "Excited if you can make it."
  },
  {
    name: "Day Of Prompt B",
    subject: "AI Session Tonight in Terrace",
    button_text: "Attend Now",
    main_content_title: "Happening Today",
    main_content_body: "The day arrived. Explore easy AI implementations and custom integrations for your business.",
    additional_info_title: "Immediate Insights",
    additional_info_body: "Kept engaging and clear.",
    closing_title: "See You Shortly",
    closing_message: "This is your moment to learn."
  },
  {
    name: "Day Of Prompt C",
    subject: "Free AI Event This Evening",
    button_text: "Come Along",
    main_content_title: "Prompt for Tonight",
    main_content_body: "Today at 5 PM, get tips on AI tools for efficiency, with notes on coded custom solutions.",
    additional_info_title: "Open Invitation",
    additional_info_body: "Simple and inviting for all.",
    closing_title: "Hope You Stop By",
    closing_message: "Looking forward to it."
  }
];

async function createEmailTemplates() {
  try {
    console.log('=== Creating Email Templates ===');
    
    const createdTemplates = [];
    
    for (const template of emailTemplates) {
      console.log(`Creating template: ${template.name}`);
      
      const created = await prisma.campaignTemplate.create({
        data: {
          name: template.name,
          subject: template.subject,
          htmlBody: '', // Will be populated by the template system
          textBody: `${template.main_content_title}\n\n${template.main_content_body}\n\n${template.additional_info_title}\n${template.additional_info_body}\n\n${template.closing_title}\n${template.closing_message}`,
          greeting_title: '',
          greeting_message: '',
          signature_name: '',
          signature_title: '',
          signature_company: '',
          signature_location: '',
          main_content_title: template.main_content_title,
          main_content_body: template.main_content_body,
          button_text: template.button_text,
          additional_info_title: template.additional_info_title,
          additional_info_body: template.additional_info_body,
          closing_title: template.closing_title,
          closing_message: template.closing_message,
          meta: { 
            campaign: 'AI Event Series 2025',
            created_by: 'comprehensive_script'
          }
        }
      });
      
      createdTemplates.push(created);
      console.log(`✅ Created: ${template.name} (ID: ${created.id})`);
    }
    
    console.log(`\n🎉 Successfully created ${createdTemplates.length} email templates!`);
    return createdTemplates;
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
    throw error;
  }
}

async function fetchLeadMineBusinesses() {
  try {
    console.log('\n=== Fetching LeadMine Businesses ===');
    
    const response = await fetch(`${process.env.LEADMINE_API_BASE}/api/businesses`, {
      headers: {
        'Authorization': `Bearer ${process.env.LEADMINE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`LeadMine API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`📊 Found ${data.businesses?.length || 0} businesses in LeadMine`);
    
    return data.businesses || [];
    
  } catch (error) {
    console.error('❌ Error fetching LeadMine businesses:', error);
    throw error;
  }
}

async function createAudienceGroup(businesses) {
  try {
    console.log('\n=== Creating Audience Group ===');
    
    // Create the audience group
    const group = await prisma.audienceGroup.create({
      data: {
        name: 'AI Event 2025 - All LeadMine Businesses',
        description: 'Complete list of 1122+ businesses from LeadMine for AI event campaign',
        meta: {
          source: 'leadmine',
          total_businesses: businesses.length,
          campaign: 'AI Event Series 2025'
        }
      }
    });
    
    console.log(`✅ Created audience group: ${group.name} (ID: ${group.id})`);
    
    // Add all businesses as members
    console.log('📝 Adding businesses as audience members...');
    
    const members = [];
    for (const business of businesses) {
      if (business.contact?.primaryEmail || business.contact?.alternateEmail) {
        const member = await prisma.audienceMember.create({
          data: {
            groupId: group.id,
            businessId: business.id,
            businessName: business.name,
            primaryEmail: business.contact?.primaryEmail || business.contact?.alternateEmail,
            secondaryEmail: business.contact?.alternateEmail || null,
            inviteToken: business.invite?.token || null,
            tags: business.contact?.tags || [],
            meta: {
              contactPerson: business.contact?.contactPerson,
              source: 'leadmine',
              lastEmailMeta: business.invite?.lastEmailMeta
            }
          }
        });
        
        members.push(member);
        
        if (members.length % 100 === 0) {
          console.log(`  Added ${members.length}/${businesses.length} members...`);
        }
      }
    }
    
    console.log(`✅ Added ${members.length} members to audience group`);
    
    return { group, members };
    
  } catch (error) {
    console.error('❌ Error creating audience group:', error);
    throw error;
  }
}

async function createCampaignWithSchedules(templates, audienceGroup) {
  try {
    console.log('\n=== Creating Campaign and Schedules ===');
    
    // Create the main campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: 'AI Event Series 2025 - Complete Campaign',
        description: '7-email sequence for AI event in Terrace, BC - targeting all LeadMine businesses',
        status: 'DRAFT',
        meta: {
          campaign_type: 'ai_event_series',
          total_emails: 7,
          total_recipients: audienceGroup.members.length,
          event_date: '2025-10-23',
          event_time: '17:00',
          event_location: 'Terrace, BC'
        }
      }
    });
    
    console.log(`✅ Created campaign: ${campaign.name} (ID: ${campaign.id})`);
    
    // Create schedules for each email date
    const emailDates = [
      { date: '2025-09-25', emailNumber: 1, templates: templates.slice(0, 3) },    // Awareness Introduction
      { date: '2025-10-01', emailNumber: 2, templates: templates.slice(3, 6) },    // Benefits Highlight
      { date: '2025-10-07', emailNumber: 3, templates: templates.slice(6, 9) },    // Value Proposition
      { date: '2025-10-14', emailNumber: 4, templates: templates.slice(9, 12) },   // Social Proof
      { date: '2025-10-18', emailNumber: 5, templates: templates.slice(12, 15) },  // Engagement Build
      { date: '2025-10-21', emailNumber: 6, templates: templates.slice(15, 18) },  // Gentle Reminder
      { date: '2025-10-23', emailNumber: 7, templates: templates.slice(18, 21) }   // Day Of Prompt
    ];
    
    const schedules = [];
    
    for (const emailData of emailDates) {
      // Use the first template for each email (we'll randomize later)
      const template = emailData.templates[0];
      
      const schedule = await prisma.campaignSchedule.create({
        data: {
          campaignId: campaign.id,
          name: `Email ${emailData.emailNumber} - ${template.name}`,
          templateId: template.id,
          groupId: audienceGroup.group.id,
          sendAt: new Date(`${emailData.date}T10:00:00Z`), // 10 AM UTC
          status: 'SCHEDULED',
          stepOrder: emailData.emailNumber,
          throttlePerMinute: 50, // Send 50 emails per minute
          timeZone: 'America/Vancouver',
          meta: {
            email_number: emailData.emailNumber,
            email_date: emailData.date,
            variants_available: emailData.templates.length
          }
        }
      });
      
      schedules.push(schedule);
      console.log(`✅ Created schedule: Email ${emailData.emailNumber} for ${emailData.date} (ID: ${schedule.id})`);
    }
    
    console.log(`\n🎉 Successfully created campaign with ${schedules.length} email schedules!`);
    
    return { campaign, schedules };
    
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Comprehensive Email Campaign Creation\n');
    
    // Step 1: Create all email templates
    const templates = await createEmailTemplates();
    
    // Step 2: Fetch businesses from LeadMine
    const businesses = await fetchLeadMineBusinesses();
    
    // Step 3: Create audience group
    const audienceGroup = await createAudienceGroup(businesses);
    
    // Step 4: Create campaign and schedules
    const campaignData = await createCampaignWithSchedules(templates, audienceGroup);
    
    console.log('\n🎉 COMPREHENSIVE CAMPAIGN CREATION COMPLETE!');
    console.log(`📧 Created ${templates.length} email templates`);
    console.log(`👥 Added ${audienceGroup.members.length} businesses to audience`);
    console.log(`📅 Created campaign with ${campaignData.schedules.length} scheduled emails`);
    console.log(`\n📊 Campaign Summary:`);
    console.log(`  - Campaign ID: ${campaignData.campaign.id}`);
    console.log(`  - Audience Group ID: ${audienceGroup.group.id}`);
    console.log(`  - Total Recipients: ${audienceGroup.members.length}`);
    console.log(`  - Email Schedule: Sept 25 → Oct 23, 2025`);
    
  } catch (error) {
    console.error('❌ Campaign creation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
