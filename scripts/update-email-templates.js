const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// New email templates with improved content
const newTemplates = [
  // Email 1 (September 25, 2025 - Awareness Introduction)
  {
    name: "Awareness Introduction A",
    subject: "Simple Ways AI Can Help Your Business",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Exploring AI Basics",
    main_content_body: "I see AI as a tool to make daily tasks easier, like handling invoices or spotting trends in data. At this event, you will discover straightforward steps to try these in your own setup.",
    button_text: "Learn More",
    additional_info_title: "What Makes It Worthwhile",
    additional_info_body: "You will hear about custom options that need a bit of code for a real advantage, all explained without technical terms.",
    closing_title: "Join the Discussion",
    closing_message: "Looking forward to sharing ideas that could save you time.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Awareness Introduction B",
    subject: "Get Started with AI for Everyday Business",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "AI Without the Complexity",
    main_content_body: "Think of AI as a helper for routine work, from payroll checks to maintenance alerts. This session covers easy starts and why custom builds can set you apart.",
    button_text: "Register Now",
    additional_info_title: "Focus on Practical Steps",
    additional_info_body: "No jargon, just clear examples on saving money through smart integrations.",
    closing_title: "See You There",
    closing_message: "Excited to help you find what fits your needs.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Awareness Introduction C",
    subject: "AI Tools to Simplify Your Operations",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Introducing AI Possibilities",
    main_content_body: "AI can automate basics like analytics and decisions, freeing up your day. Come learn simple implementations and when custom code adds that extra edge.",
    button_text: "Sign Up Today",
    additional_info_title: "Tailored for Ease",
    additional_info_body: "We will keep it relatable, showing how these changes lead to real efficiency.",
    closing_title: "Hope You Attend",
    closing_message: "This could be a useful step for your business.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 2 (October 1, 2025 - Benefits Highlight)
  {
    name: "Benefits Highlight A",
    subject: "How AI Saves Time in Business Tasks",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Time Saving with AI",
    main_content_body: "Following my first note, consider how AI handles repetitive jobs like invoicing. You will leave with ideas on easy setups that cut hours from your week.",
    button_text: "Discover Details",
    additional_info_title: "Added Value Through Custom Work",
    additional_info_body: "For deeper gains, we will touch on integrations that might involve code to match your unique setup.",
    closing_title: "Worth Exploring",
    closing_message: "These insights aim to make a noticeable difference.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Benefits Highlight B",
    subject: "Cut Costs Using Practical AI",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Cost Cutting Insights",
    main_content_body: "AI offers ways to trim expenses, such as through predictive checks. This event breaks it down into actionable parts you can apply right away.",
    button_text: "Join the Event",
    additional_info_title: "Edge with Personalization",
    additional_info_body: "Learn about custom AI that requires some coding for tailored results.",
    closing_title: "Ready to Try",
    closing_message: "Hope this sparks your interest in what is possible.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Benefits Highlight C",
    subject: "Better Decisions from AI Tools",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Smarter Choices Ahead",
    main_content_body: "Building on the intro, AI aids in quick analytics for informed moves. Expect guidance on simple starts and advanced custom options.",
    button_text: "Reserve Spot",
    additional_info_title: "Real Efficiency Boost",
    additional_info_body: "All shared in everyday language to help you implement without hassle.",
    closing_title: "Looking Ahead",
    closing_message: "This session is about practical progress.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 3 (October 7, 2025 - Value Proposition)
  {
    name: "Value Proposition A",
    subject: "Unlock Easy AI Wins for Your Business",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Value in AI Simplicity",
    main_content_body: "AI is not just tech, it is about easing your load with tools for automation. You will gain clear paths to these benefits, plus notes on custom edges.",
    button_text: "Get Insights",
    additional_info_title: "Why It Fits Any Business",
    additional_info_body: "From basics to coded solutions, everything explained plainly.",
    closing_title: "A Step Forward",
    closing_message: "Eager to show how this applies broadly.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Value Proposition B",
    subject: "Practical AI to Give Your Business an Edge",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Building an Advantage",
    main_content_body: "Focus on AI that saves resources through smart handling of data and tasks. This includes easy entries and when code creates unique value.",
    button_text: "Sign Up Here",
    additional_info_title: "Broad Appeal",
    additional_info_body: "Kept straightforward for owners in various fields.",
    closing_title: "Join for Clarity",
    closing_message: "This could open new doors for you.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Value Proposition C",
    subject: "AI Insights That Pay Off Quickly",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Quick Returns from AI",
    main_content_body: "Discover how AI streamlines operations for fast wins. We will cover simple tools and custom integrations that might need code for best results.",
    button_text: "Register Free",
    additional_info_title: "Universal Tools",
    additional_info_body: "No niche limits, just useful advice in clear terms.",
    closing_title: "Excited to Share",
    closing_message: "Hope you find it rewarding.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 4 (October 14, 2025 - Social Proof)
  {
    name: "Social Proof A",
    subject: "Hear from Others on Helpful Tech Support",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Real Feedback on Solutions",
    main_content_body: "Jack Cook shared: Gabriel built my company website. He did a fantastic job. I would not hesitate to recommend him and his abilities anytime. Have a look at his work http://KarmaTraining.ca. This event builds on that trust with AI tips.",
    button_text: "See More",
    additional_info_title: "Connecting the Dots",
    additional_info_body: "Learn easy AI steps and custom options for your edge.",
    closing_title: "Build Confidence",
    closing_message: "Come see what others value.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Social Proof B",
    subject: "A Recommendation Worth Noting",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Trusted Experiences",
    main_content_body: "From Jim Lynch: You sent me Gabriel Lacroix from evergreen web solutions. Thank you as not only did he get my computer problem solved, as a bonus he took care of getting my new iPhone connected. Would be pleased to recommend him for superb work. Ties into the AI guidance ahead.",
    button_text: "Join Based on This",
    additional_info_title: "Proven Approach",
    additional_info_body: "Simple implementations plus coded custom work explained.",
    closing_title: "Gain from It",
    closing_message: "This feedback highlights reliability.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Social Proof C",
    subject: "Positive Words on Digital Help",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Shared Success Stories",
    main_content_body: "Drawing from notes like Jack Cook's praise for website work and Jim Lynch's thanks for tech fixes. The event extends this with AI tools for your use.",
    button_text: "Explore Event",
    additional_info_title: "Reliable Insights",
    additional_info_body: "From basics to advanced integrations in plain speak.",
    closing_title: "Inspired to Attend",
    closing_message: "Hope these encourage you.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 5 (October 18, 2025 - Engagement Build)
  {
    name: "Engagement Build A",
    subject: "Questions AI Can Answer for You",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Engaging with AI Ideas",
    main_content_body: "What if AI could handle your daily analytics? This session invites you to explore such questions, with easy starts and custom code options.",
    button_text: "Find Answers",
    additional_info_title: "Interactive Angle",
    additional_info_body: "All in relatable terms for broad application.",
    closing_title: "Get Involved",
    closing_message: "Your thoughts could shape the talk.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Engagement Build B",
    subject: "Imagine AI Streamlining Your Day",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Picturing AI Benefits",
    main_content_body: "Envision less time on invoices through AI. We will discuss practical ways and when custom setups provide that advantage.",
    button_text: "Engage Now",
    additional_info_title: "Thought Provoking",
    additional_info_body: "Kept simple to spark your ideas.",
    closing_title: "Participate Soon",
    closing_message: "This builds connection before the date.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Engagement Build C",
    subject: "AI Possibilities to Consider",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Sparking Interest in AI",
    main_content_body: "Consider AI for maintenance predictions. The event offers clear guidance on implementations and tailored code for edges.",
    button_text: "Think About It",
    additional_info_title: "Inviting Reflection",
    additional_info_body: "No pressure, just useful concepts.",
    closing_title: "Join the Thought",
    closing_message: "Hope it resonates with you.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 6 (October 21, 2025 - Gentle Reminder)
  {
    name: "Gentle Reminder A",
    subject: "Event Nears: AI Tips Await",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Approaching AI Session",
    main_content_body: "With the date close, recall the focus on easy AI for tasks like payroll. Includes custom integration notes for unique needs.",
    button_text: "Confirm Attendance",
    additional_info_title: "Timely Check In",
    additional_info_body: "Plain advice to prepare you well.",
    closing_title: "Final Prep",
    closing_message: "Spots remain for those interested.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Gentle Reminder B",
    subject: "Quick Note on Upcoming AI Event",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Reminder of Value",
    main_content_body: "As October 23 draws near, think about AI for cost savings. We will cover simple tools and code based custom work.",
    button_text: "Secure Place",
    additional_info_title: "Gentle Nudge",
    additional_info_body: "Kept concise for your convenience.",
    closing_title: "Act If Keen",
    closing_message: "This could be timely for you.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Gentle Reminder C",
    subject: "AI Event This Week: Still Open",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Nearing the Date",
    main_content_body: "Event is almost here, offering insights on AI decisions and automations. With options for custom edges via code.",
    button_text: "RSVP Soon",
    additional_info_title: "Easy Access",
    additional_info_body: "All explained without complexity.",
    closing_title: "Consider Joining",
    closing_message: "Hope to welcome you.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },

  // Email 7 (October 23, 2025 - Day Of Prompt)
  {
    name: "Day Of Prompt A",
    subject: "Today: Dive into AI at 5 PM",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Event Starts Soon",
    main_content_body: "It is October 23. Come for practical AI on analytics and more, including custom ideas that may need code.",
    button_text: "Join Tonight",
    additional_info_title: "Last Minute Welcome",
    additional_info_body: "Straightforward content ready for you.",
    closing_title: "Arrive Ready",
    closing_message: "Excited if you can make it.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Day Of Prompt B",
    subject: "AI Session Tonight in Terrace",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Happening Today",
    main_content_body: "The day arrived. Explore easy AI implementations and custom integrations for your business.",
    button_text: "Attend Now",
    additional_info_title: "Immediate Insights",
    additional_info_body: "Kept engaging and clear.",
    closing_title: "See You Shortly",
    closing_message: "This is your moment to learn.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  },
  {
    name: "Day Of Prompt C",
    subject: "Free AI Event This Evening",
    greeting_title: "Hello",
    greeting_message: "I hope this finds you well.",
    main_content_title: "Prompt for Tonight",
    main_content_body: "Today at 5 PM, get tips on AI tools for efficiency, with notes on coded custom solutions.",
    button_text: "Come Along",
    additional_info_title: "Open Invitation",
    additional_info_body: "Simple and inviting for all.",
    closing_title: "Hope You Stop By",
    closing_message: "Looking forward to it.",
    signature_name: "Gabriel Lacroix",
    signature_title: "AI Solutions Specialist",
    signature_company: "Evergreen Web Solutions",
    signature_location: "Terrace, BC"
  }
];

async function updateTemplates() {
  try {
    console.log('Starting template update...');
    
    // First, delete all existing templates
    console.log('Deleting existing templates...');
    await prisma.campaignTemplate.deleteMany({});
    console.log('Existing templates deleted.');
    
    // Create all new templates
    console.log('Creating new templates...');
    for (const template of newTemplates) {
      await prisma.campaignTemplate.create({
        data: {
          ...template,
          htmlBody: template.main_content_body, // Use main content as htmlBody
          textBody: template.main_content_body.replace(/<[^>]*>/g, ''), // Plain text version
          meta: {}, // Add required meta field
        }
      });
      console.log(`Created template: ${template.name}`);
    }
    
    console.log(`Successfully updated ${newTemplates.length} email templates!`);
    
    // Verify the templates were created
    const count = await prisma.campaignTemplate.count();
    console.log(`Total templates in database: ${count}`);
    
  } catch (error) {
    console.error('Error updating templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateTemplates();
