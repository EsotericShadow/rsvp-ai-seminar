import { getClient } from './client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const knowledgeIngestion = {
  async ingestSystemKnowledge(): Promise<void> {
    console.log('📚 Ingesting system knowledge...')
    
    await Promise.all([
      this.ingestDatabaseSchema(),
      this.ingestAPIDocumentation(),
      this.ingestBusinessKnowledge(),
      this.ingestSystemCapabilities(),
      this.ingestUIKnowledge(),
      this.ingestComprehensiveUIKnowledge(),
      this.ingestBrandingAndEventData()
    ])
    
    console.log('✅ System knowledge ingestion complete')
  },

  async ingestDatabaseSchema(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const schemaData = {
      title: 'Database Schema',
      content: `
# Database Schema

## Core Models

### Campaign
- id: String (Primary Key)
- name: String
- status: CampaignStatus (DRAFT, SCHEDULED, SENDING, PAUSED, COMPLETED, CANCELLED)
- meta: Json (audienceGroup, templateId, scheduledAt)
- createdAt: DateTime
- updatedAt: DateTime

### CampaignTemplate
- id: String (Primary Key)
- name: String
- subject: String
- htmlBody: String
- textBody: String
- meta: Json (audienceGroup, isActive)
- createdAt: DateTime
- updatedAt: DateTime

### AudienceGroup
- id: String (Primary Key)
- name: String
- description: String
- criteria: Json
- createdAt: DateTime
- updatedAt: DateTime

### AudienceMember
- id: String (Primary Key)
- email: String
- businessName: String
- industry: String
- meta: Json (lastEmailSent, preferences)
- groupId: String (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime

### CampaignSend
- id: String (Primary Key)
- campaignId: String (Foreign Key)
- audienceMemberId: String (Foreign Key)
- status: CampaignSendStatus (PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, UNSUBSCRIBED)
- sentAt: DateTime
- deliveredAt: DateTime
      `,
      category: 'database',
      metadata: JSON.stringify({ type: 'schema', version: '1.0' }),
      source: 'prisma/schema.prisma',
      tags: ['database', 'schema', 'models', 'prisma']
    }

    await collection.data.insert(schemaData)
    console.log('✅ Database schema ingested')
  },

  async ingestAPIDocumentation(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const apiData = {
      title: 'API Endpoints',
      content: `
# API Endpoints

## Campaign Management
- GET /api/admin/campaign/campaigns - List all campaigns
- POST /api/admin/campaign/campaigns - Create new campaign
- GET /api/admin/campaign/campaigns/[id] - Get campaign details
- PUT /api/admin/campaign/campaigns/[id] - Update campaign
- DELETE /api/admin/campaign/campaigns/[id] - Delete campaign
- POST /api/admin/campaign/[id]/pause - Pause campaign
- POST /api/admin/campaign/[id]/resume - Resume campaign
- POST /api/admin/campaign/[id]/schedule - Schedule campaign

## Template Management
- GET /api/admin/campaign/templates - List templates
- POST /api/admin/campaign/templates - Create template
- GET /api/admin/campaign/templates/[id] - Get template
- PUT /api/admin/campaign/templates/[id] - Update template
- DELETE /api/admin/campaign/templates/[id] - Delete template

## Audience Management
- GET /api/admin/campaign/groups - List audience groups
- POST /api/admin/campaign/groups - Create group
- GET /api/admin/campaign/businesses - List businesses
- POST /api/admin/campaign/members/add-to-group - Add member to group

## Analytics
- GET /api/admin/analytics/visitors - Get visitor analytics
- GET /api/admin/analytics/tracking-links - Get tracking link analytics
- GET /api/admin/campaigns/analytics - Get campaign analytics
      `,
      category: 'api',
      metadata: JSON.stringify({ type: 'endpoints', version: '1.0' }),
      source: 'api-documentation',
      tags: ['api', 'endpoints', 'rest', 'documentation']
    }

    await collection.data.insert(apiData)
    console.log('✅ API documentation ingested')
  },

  async ingestBusinessKnowledge(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const businessData = {
      title: 'Business Knowledge',
      content: `
# Business Knowledge

## Industry Categories
- Healthcare: Medical practices, clinics, hospitals
- Construction: Contractors, builders, trades
- Technology: Software, IT services, tech companies
- Retail: Stores, e-commerce, shopping
- Hospitality: Restaurants, hotels, tourism
- Professional Services: Legal, accounting, consulting
- Manufacturing: Production, industrial, factories
- Education: Schools, training, educational services

## Email Marketing Best Practices
- Subject lines should be clear and compelling
- Use personalization tokens like {{businessName}}
- Include clear call-to-action buttons
- Mobile-responsive design is essential
- Test different send times for optimal engagement
- Segment audiences based on industry and behavior
- Monitor open rates, click rates, and RSVP rates

## Campaign Optimization
- A/B test subject lines and content
- Use data-driven audience segmentation
- Schedule campaigns for optimal times
- Monitor deliverability and bounce rates
- Clean email lists regularly
- Personalize content based on industry
      `,
      category: 'business',
      metadata: JSON.stringify({ type: 'knowledge', version: '1.0' }),
      source: 'business-knowledge',
      tags: ['business', 'marketing', 'best-practices', 'optimization']
    }

    await collection.data.insert(businessData)
    console.log('✅ Business knowledge ingested')
  },

  async ingestSystemCapabilities(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const capabilitiesData = {
      title: 'System Capabilities',
      content: `
# System Capabilities

## Campaign Management
- Create, edit, and delete campaigns
- Schedule campaigns for specific times
- Pause and resume campaigns
- Monitor campaign performance
- A/B testing capabilities

## Template Management
- Create and edit email templates
- HTML and text versions
- Personalization tokens
- Template testing and validation
- Template performance analytics

## Audience Management
- Create audience groups
- Segment by industry, behavior, demographics
- Import/export audience data
- Clean and validate email addresses
- Track audience engagement

## Analytics & Reporting
- Real-time campaign performance
- Open rates, click rates, RSVP rates
- Geographic distribution analysis
- ROI calculations
- Monthly and campaign-specific reports

## Automation
- Workflow automation rules
- Trigger-based campaigns
- Automated follow-ups
- Smart audience segmentation
- Performance-based optimization
      `,
      category: 'capabilities',
      metadata: JSON.stringify({ type: 'capabilities', version: '1.0' }),
      source: 'system-capabilities',
      tags: ['capabilities', 'features', 'automation', 'analytics']
    }

    await collection.data.insert(capabilitiesData)
    console.log('✅ System capabilities ingested')
  },

  async ingestUIKnowledge(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const uiData = {
      title: 'UI Components and Navigation',
      content: `
# UI Components and Navigation

## Admin Dashboard
- Campaign overview with key metrics
- Recent activity feed
- Quick action buttons
- Performance charts and graphs

## Campaign Management Interface
- Campaign list with filters and search
- Campaign creation wizard
- Campaign editing form with live preview
- Schedule management calendar
- Performance analytics dashboard

## Template Editor
- WYSIWYG HTML editor
- Text version editor
- Preview functionality
- Personalization token insertion
- Template testing tools

## Audience Management
- Audience group management
- Member list with search and filters
- Bulk operations (add, remove, move)
- Import/export functionality
- Audience analytics

## Navigation Structure
- Main navigation: Dashboard, Campaigns, Templates, Audience, Analytics
- Sidebar navigation with collapsible sections
- Breadcrumb navigation
- Quick access toolbar
- User profile and settings
      `,
      category: 'ui',
      metadata: JSON.stringify({ type: 'ui', version: '1.0' }),
      source: 'ui-knowledge',
      tags: ['ui', 'components', 'navigation', 'interface']
    }

    await collection.data.insert(uiData)
    console.log('✅ UI knowledge ingested')
  },

  async ingestComprehensiveUIKnowledge(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    const comprehensiveUIData = {
      title: 'Comprehensive UI Knowledge',
      content: `
# Comprehensive UI Knowledge

## Component Library
- Button variants: primary, secondary, success, error, warning
- Form components: inputs, selects, checkboxes, radio buttons
- Data display: tables, cards, lists, charts
- Feedback: toasts, modals, alerts, loading states
- Navigation: menus, tabs, pagination, breadcrumbs

## Layout System
- Responsive grid system
- Mobile-first design approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Container max-widths and padding
- Flexbox and CSS Grid layouts

## Color System
- Primary: Emerald (emerald-600, emerald-700)
- Secondary: Gray (gray-100, gray-200, gray-500)
- Success: Green (green-500, green-600)
- Error: Red (red-500, red-600)
- Warning: Yellow (yellow-500, yellow-600)

## Typography
- Font family: Inter (sans-serif)
- Font sizes: text-xs, text-sm, text-base, text-lg, text-xl
- Font weights: font-normal, font-medium, font-semibold, font-bold
- Line heights: leading-tight, leading-normal, leading-relaxed

## Interactive States
- Hover effects with smooth transitions
- Focus states for accessibility
- Active states for buttons and links
- Disabled states with reduced opacity
- Loading states with spinners and skeletons
      `,
      category: 'ui-comprehensive',
      metadata: JSON.stringify({ type: 'ui-comprehensive', version: '1.0' }),
      source: 'comprehensive-ui-knowledge',
      tags: ['ui', 'components', 'design-system', 'styling', 'interactions']
    }

    await collection.data.insert(comprehensiveUIData)
    console.log('✅ Comprehensive UI knowledge ingested')
  },

  async ingestBrandingAndEventData(): Promise<void> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    // Evergreen Web Solutions Branding Data
    const evergreenBrandingData = {
      title: 'Evergreen Web Solutions - Company Branding',
      content: `
# Evergreen Web Solutions - Company Branding

## Company Overview
- **Company Name**: Evergreen Web Solutions
- **Owner**: Gabe Lacroix
- **Business Type**: Web development and digital solutions company
- **Location**: Terrace, British Columbia, Canada

## Brand Identity
- **Logo**: Evergreen logo with professional design
- **Color Scheme**: Professional green and white branding
- **Brand Values**: Innovation, reliability, growth, sustainability

## Services Offered
- Web development and design
- Digital marketing solutions
- AI integration and automation
- Business intelligence and analytics
- Custom software development
- E-commerce solutions

## Target Market
- Local businesses in Terrace, BC
- Small to medium-sized businesses
- Companies looking for digital transformation
- Businesses needing web presence and online marketing

## Company Philosophy
- Focus on sustainable, long-term solutions
- Client-centered approach
- Innovation in web technologies
- Local community support and engagement
      `,
      category: 'branding',
      metadata: JSON.stringify({ type: 'company-branding', version: '1.0' }),
      source: 'evergreen-branding',
      tags: ['branding', 'company', 'evergreen', 'web-solutions', 'gabe-lacroix']
    }

    // AI in Terrace Event Information
    const aiEventData = {
      title: 'AI in Terrace - Business Event Information',
      content: `
# AI in Terrace - Business Event Information

## Event Overview
- **Event Name**: AI in Terrace
- **Event Type**: Business informational seminar
- **Target Audience**: Local business owners and professionals
- **Location**: Terrace, British Columbia
- **Organizer**: Evergreen Web Solutions (Gabe Lacroix)

## Event Purpose
- Educate local businesses about AI opportunities
- Demonstrate practical AI applications for business
- Provide AI needs assessment for attendees
- Showcase AI tools and solutions for small businesses

## Event Content
- AI seminar presentation
- Business needs assessment workshop
- Practical AI demonstrations
- Q&A sessions with AI experts
- Networking opportunities for local businesses

## Target Industries
- Healthcare practices
- Construction companies
- Retail businesses
- Professional services
- Manufacturing companies
- Technology companies
- Hospitality businesses

## Event Benefits for Attendees
- Understanding AI applications for their business
- Personalized AI needs assessment
- Access to AI tools and resources
- Networking with other business owners
- Follow-up consultation opportunities

## Marketing Approach
- Press release distribution
- Local business outreach
- Digital marketing campaigns
- Community engagement
- Professional networking
      `,
      category: 'events',
      metadata: JSON.stringify({ type: 'event-information', version: '1.0' }),
      source: 'ai-terrace-event',
      tags: ['event', 'ai', 'terrace', 'business', 'seminar', 'education']
    }

    // Strategic Intelligence and Business Development
    const strategicIntelligenceData = {
      title: 'Strategic Intelligence - Business Development',
      content: `
# Strategic Intelligence - Business Development

## Business Development Strategy
- **Focus Area**: AI integration for local businesses
- **Market Position**: Leading AI solutions provider in Terrace
- **Growth Strategy**: Community education and engagement
- **Service Expansion**: AI consulting and implementation

## Market Analysis
- **Primary Market**: Terrace, BC business community
- **Secondary Market**: Surrounding communities in Northern BC
- **Market Size**: Small to medium-sized businesses
- **Market Needs**: Digital transformation, AI adoption, web presence

## Competitive Advantages
- Local presence and community knowledge
- Specialized AI expertise
- Personalized service approach
- Comprehensive digital solutions
- Ongoing support and consultation

## Business Intelligence
- Customer relationship management
- Market trend analysis
- Competitive positioning
- Service optimization
- Revenue growth strategies

## Client Success Metrics
- Client satisfaction and retention
- Project completion rates
- Business growth for clients
- AI adoption success rates
- Community engagement levels
      `,
      category: 'strategy',
      metadata: JSON.stringify({ type: 'strategic-intelligence', version: '1.0' }),
      source: 'strategic-intelligence',
      tags: ['strategy', 'business-development', 'market-analysis', 'competitive-advantage']
    }

    // Portfolio and Capabilities
    const portfolioData = {
      title: 'Evergreen Web Solutions - Portfolio and Capabilities',
      content: `
# Evergreen Web Solutions - Portfolio and Capabilities

## Technical Capabilities
- **Web Development**: Modern, responsive websites
- **AI Integration**: Custom AI solutions for businesses
- **Digital Marketing**: SEO, social media, email campaigns
- **E-commerce**: Online stores and payment processing
- **Analytics**: Business intelligence and reporting
- **Automation**: Workflow optimization and efficiency

## Project Portfolio
- Custom web applications
- AI-powered business tools
- Digital marketing campaigns
- E-commerce platforms
- Business automation systems
- Data analytics dashboards

## Technology Stack
- **Frontend**: React, Next.js, TypeScript
- **Backend**: Node.js, Python, Prisma
- **Database**: PostgreSQL, Weaviate
- **AI/ML**: OpenAI, custom AI models
- **Cloud**: Vercel, Render, AWS
- **Tools**: Git, Docker, CI/CD

## Service Delivery
- **Consultation**: Initial needs assessment
- **Planning**: Project roadmap and timeline
- **Development**: Agile development process
- **Testing**: Quality assurance and testing
- **Deployment**: Production deployment and monitoring
- **Support**: Ongoing maintenance and updates

## Client Success Stories
- Improved business efficiency through AI automation
- Increased online presence and customer engagement
- Streamlined business processes and workflows
- Enhanced data-driven decision making
- Reduced operational costs through automation
      `,
      category: 'portfolio',
      metadata: JSON.stringify({ type: 'portfolio-capabilities', version: '1.0' }),
      source: 'portfolio-capabilities',
      tags: ['portfolio', 'capabilities', 'technology', 'services', 'success-stories']
    }

    // Insert all branding and event data
    await Promise.all([
      collection.data.insert(evergreenBrandingData),
      collection.data.insert(aiEventData),
      collection.data.insert(strategicIntelligenceData),
      collection.data.insert(portfolioData)
    ])

    console.log('✅ Branding and event data ingested')
  },

  async searchKnowledge(query: string, limit: number = 5): Promise<any[]> {
    const client = await getClient()
    const collection = client.collections.get('KnowledgeBase')

    try {
      const results = await collection.query.bm25(query, {
        limit: limit,
        returnProperties: ['title', 'content', 'category', 'metadata', 'source', 'tags']
      })

      return results.objects.map((obj: any) => ({
        title: obj.properties.title,
        content: obj.properties.content,
        category: obj.properties.category,
        metadata: obj.properties.metadata ? JSON.parse(obj.properties.metadata) : {},
        source: obj.properties.source,
        tags: obj.properties.tags || []
      }))
    } catch (error) {
      console.error('Knowledge search failed:', error)
      return []
    }
  },

  async searchBusinessData(query: string, limit: number = 5): Promise<any[]> {
    const client = await getClient()
    const collection = client.collections.get('BusinessData')

    try {
      const results = await collection.query.bm25(query, {
        limit: limit,
        returnProperties: ['businessName', 'industry', 'description', 'audienceGroup']
      })

      return results.objects.map((obj: any) => ({
        businessName: obj.properties.businessName,
        industry: obj.properties.industry,
        description: obj.properties.description,
        audienceGroup: obj.properties.audienceGroup
      }))
    } catch (error) {
      console.error('Business data search failed:', error)
      return []
    }
  }
}